import React from 'react';
import { Card, FormControl, Row, Container, Col, Spinner, } from 'react-bootstrap';
import { Async, AsyncProps } from 'react-async';
import update from 'immutability-helper';
import { Action, Section, AddButton, DisplayModal, } from '@innexgo/common-react-components';
import ErrorMessage from '../components/ErrorMessage';
import ExternalLayout from '../components/ExternalLayout';
import { getFirstOr, unwrap } from '@innexgo/frontend-common';
import AuthenticatedComponentProps from '@cosmicoptima/auth-react-components/lib/components/AuthenticatedComponentProps';
import CreateTournamentSubmission from '../components/CreateTournamentSubmission';
import { DefaultSidebarLayout } from '@cosmicoptima/auth-react-components';
import DashboardLayout from '../components/DashboardLayout';
import PythonEditor from '../components/PythonEditor';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { TournamentData, tournamentDataView } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash } from 'react-bootstrap-icons';
import { v4 as uuidv4 } from 'uuid';
import tar from 'tar-stream';
import concat from 'concat-stream';

type Testcase = {
  name: string;
  code: string;
  id: string;
}

type TestResults = {
  status: 'notests' | 'pending' | 'valid' | 'timeout' | 'error' | 'tcerror' | 'tctimeout';
  progress?: number;
  totalProgress?: number;
  error?: string;
  scores?: [string, number][];
}

const renderResults = (results: TestResults) => {
  switch (results.status) {
    case 'notests':
      return <em>You have not yet tested your bot.</em>;
    case 'pending':
      return <em>Please wait ({results.progress}/{results.totalProgress})</em>;
    case 'valid':
      return <>
        <span>Your bot <b className="text-success">passed</b>. It can now be submitted to the tournament. It scored against each testcase as follows:</span>
	<ul>
	  {results.scores?.map(([name, score]) => <li><b>{name}:</b> {score}</li>)}
	</ul>
      </>;
    case 'timeout':
      return <span>Your bot <b className="text-danger">failed</b> due to taking too long (&gt;1 second) to run.</span>;
    case 'error':
      return <>
        <p>Your bot <b className="text-danger">failed</b> due to throwing an exception:</p>
	<pre>{results.error}</pre>
      </>;
    case 'tcerror':
      return <>
        <p>Your bot <b className="text-danger">failed</b> due to a testcase throwing an exception:</p>
	<pre>{results.error}</pre>
      </>;
    case 'tctimeout':
      return <span>Your bot <b className="text-danger">failed</b> due to a testcase taking too long (&gt;1 second) to run.</span>;
  }
}

const runMatch = async (submissionCode: string, opponentCode: string, opponentDefectionHistory: boolean[]) => {
  const wrapperCode = `#!/usr/bin/env python3
import submission
import opponent
from sys import exit

opponent_defection_history = ${JSON.stringify(opponentDefectionHistory).replaceAll('true', 'True').replaceAll('false', 'False')}
defected = submission.should_defect(opponent.should_defect, opponent_defection_history)
exit(100 if defected else 101)
`;
  const files = {"submission.py": submissionCode, "opponent.py": opponentCode, "run": wrapperCode};

  return await fetch("/api/router", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(files),
  }).then(response => response.json()).then(data => {
    return { stdout: atob(data.stdout), stderr: atob(data.stderr), exitCode: data.exit_code };
  })
}

const defaultCode = `# Example of a Tit-For-Tat Bot:
def should_defect(opp_defection_function, opponent_defection_history):
    if len(opponent_defection_history) > 0:
        return opponent_defection_history[-1]
    else:
        return False
`

const defaultTestcases: Testcase[] = [
  { name: "cooperate", code: "def should_defect(opponent, history):\n    return False", id: uuidv4() },
  { name: "defect", code: "def should_defect(opponent, history):\n    return True", id: uuidv4() },
  { name: "tit-for-tat", code: defaultCode, id: uuidv4() },
]

type InnerCompetePageProps = {
  kind: ("VALIDATE" | "TESTCASE")
  apiKey: ApiKey,
  tournamentData: TournamentData,
}

function InnerCompetePage(props: InnerCompetePageProps) {
  const [code, setCode] = React.useState("");
  const [testcases, setTestcases] = React.useState<Testcase[]>(defaultTestcases);

  const [showEditTestcaseModal, setShowEditTestcaseModal] = React.useState(false);
  const [editTestcaseIndex, setEditTestcaseIndex] = React.useState(-1);

  const [showAddTestcaseModal, setShowAddTestcaseModal] = React.useState(false);
  const [pendingTestcaseCode, setPendingTestcaseCode] = React.useState("");

  const [results, setResults] = React.useState<TestResults>({ status: "notests" });

  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  const navigate = useNavigate();

  const title = props.kind === "VALIDATE"
    ? "Submit"
    : "Submit Testcase";

  function removeTestcase(id: string) {
    setTestcases(testcases.filter(t => t.id !== id));
  }

  function editTestcase(id: string) {
    const testcase = testcases.find(t => t.id === id);
    if (testcase === undefined) {
      return;
    }

    setEditTestcaseIndex(testcases.indexOf(testcase));
    setShowEditTestcaseModal(true);
  }

  async function runTests() {
    setResults({ status: "pending", progress: 0, totalProgress: testcases.length * 10 });
    let scores: [string, number][] = [];

    for (const testcase of testcases) {
        let history1 = [];
	let history2 = [];
	let totalScore = 0;

        for (let j = 0; j < 10; j++) {
	  setResults({ status: "pending", progress: testcases.indexOf(testcase) * 10 + j, totalProgress: testcases.length * 10 });

      	  const results1: any = await runMatch(code, testcase.code, history1);
	  const results2: any = await runMatch(testcase.code, code, history2);

	  const exitCode1 = results1.exitCode;
	  const exitCode2 = results2.exitCode;

	  if (exitCode1 === 1) {
	    setResults({ status: "error", error: results1.stderr });
	    return;
	  }
	  if (exitCode1 === 137) {
	    setResults({ status: "timeout" });
	    return;
	  }

	  if (exitCode2 === 1 ) {
	    setResults({ status: "tcerror", error: results2.stderr });
	    return;
	  }
	  if (exitCode2 === 137) {
	    setResults({ status: "tctimeout" });
	    return;
	  }

	  // score
	  if (exitCode1 === 100 && exitCode2 === 100)
	    totalScore += 5
	  else if (exitCode1 === 100 && exitCode2 === 101)
	    totalScore += 10
	  else if (exitCode1 === 101 && exitCode2 === 100)
	    totalScore += 0
	  else if (exitCode1 === 101 && exitCode2 === 101)
	    totalScore += 8

	  history1.push(exitCode2 === 100);
	  history2.push(exitCode1 === 100);
	}

      const tuple: [string, number] = [testcase.name, totalScore / 10];
      console.log(tuple);
      scores.push(tuple);
    }

    setResults({ status: "valid", scores });
  }

  function TestcaseItem(props: { testcase: Testcase }) {
    let name = props.testcase.name;
    let id = props.testcase.id;
    return <>
      <span className="me-2">{props.testcase.name}</span>
      <a className="me-1" href="#" onClick={() => editTestcase(id)}><Pencil/></a>
      {testcases.length > 1 ? <a href="#" onClick={() => removeTestcase(id)}><Trash/></a> : <></>}
    </>
  }

  let addTestcaseInputRef = React.createRef<HTMLInputElement>();

  return <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
    <div style={{ flexGrow: 1 }}>
      <PythonEditor
        initialCode={defaultCode}
        onChange={setCode}
      />
      <DisplayModal
        title={title}
        show={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      >
        <CreateTournamentSubmission
          code={code}
          kind={props.kind}
          apiKey={props.apiKey}
          tournamentData={props.tournamentData}
          postSubmit={ts => navigate(`/tournament_submission?tournamentId=${ts.tournament.tournamentId}&submissionId=${ts.submissionId}`)}
        />
      </DisplayModal>
      <DisplayModal
        title={`Edit Testcase: ${testcases[editTestcaseIndex]?.name ?? ""}`}
	show={showEditTestcaseModal}
	onClose={() => setShowEditTestcaseModal(false)}
      >
        <div style={{ height: "18em" }}><PythonEditor
	  initialCode={testcases[editTestcaseIndex]?.code ?? ""}
	  onChange={newCode => {
	    setTestcases(update(testcases, {
	      [editTestcaseIndex]: { code: { $set: newCode } }
	    }));
	  }}
	/></div>
      </DisplayModal>
      <DisplayModal
        title="New Testcase"
	show={showAddTestcaseModal}
	onClose={() => setShowAddTestcaseModal(false)}
      >
        <FormControl className="mb-3" placeholder="Name" ref={addTestcaseInputRef}/>
        <div className="mb-3" style={{ height: "18em" }}><PythonEditor
	  initialCode={defaultCode}
	  onChange={setPendingTestcaseCode}
	/></div>
	<button className="btn btn-primary" onClick={() => {
	  let name = addTestcaseInputRef.current?.value;
	  if (name === undefined || name === "") {
	    addTestcaseInputRef.current?.classList.add("is-invalid");
	    addTestcaseInputRef.current?.focus();
	    return;
	  }

	  setTestcases([...testcases, {
	    name,
	    code: pendingTestcaseCode,
	    id: uuidv4(),
	  }]);
	}}>Add</button>
      </DisplayModal>
    </div>

    <div style={{ backgroundColor: "#222", color: "#ddd", padding: "1em", width: "15em" }}>
      <h2>Testcases</h2>
      <p><em>Your bot will be tested against the following testcases:</em></p>

      <ul>
        {testcases.map((t, i) => <li><TestcaseItem testcase={t} /></li>)}
        <li><a href="#" onClick={() => setShowAddTestcaseModal(true)} style={{ textDecoration: "none" }}><Plus/> Add Testcase</a></li>
      </ul>

      <h2>Results</h2>
      <p>{renderResults(results)}</p>

      <button
        className='btn btn-primary mt-2'
	onClick={runTests}
      >
        Test
      </button>
      {results.status === "valid" ? <button
        className='btn btn-primary ms-2 mt-2'
        onClick={() => setShowSubmitModal(true)}
      >
        Submit
      </button> : <></>}
    </div>
  </div>
}

type CompetePageData = {
  tournamentData: TournamentData,
}

const loadCompetePageData = async (props: AsyncProps<CompetePageData>): Promise<CompetePageData> => {
  const tournamentData = await tournamentDataView({
    tournamentId: [props.tournamentId],
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap)
    .then(x => getFirstOr(x, "NOT_FOUND"))
    .then(unwrap);

  return {
    tournamentData,
  };
}


function CompetePage(props: AuthenticatedComponentProps) {
  const tournamentId = parseInt(new URLSearchParams(window.location.search).get("tournamentId") ?? "");
  const kind = new URLSearchParams(window.location.search).get("kind");

  if (kind !== "VALIDATE" && kind !== "TESTCASE") {
    return <ErrorMessage error={new Error("Unknown submission type")} />
  }

  return <DashboardLayout {...props} >
    <Async promiseFn={loadCompetePageData} apiKey={props.apiKey} tournamentId={tournamentId}>
      <Async.Pending>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Async.Pending>
      <Async.Rejected>{e => <ErrorMessage error={e} />}</Async.Rejected>
      <Async.Fulfilled<CompetePageData>>{d =>
        <InnerCompetePage apiKey={props.apiKey} tournamentData={d.tournamentData} kind={kind} />
      }</Async.Fulfilled>
    </Async>
  </DashboardLayout>
}

export default CompetePage;
