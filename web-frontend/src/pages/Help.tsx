import { Container } from 'react-bootstrap';
import { Section } from '@innexgo/common-react-components';

import AuthenticatedComponentProps from '@cosmicoptima/auth-react-components/lib/components/AuthenticatedComponentProps';

import DashboardLayout from '../components/DashboardLayout';

const Help = (props: AuthenticatedComponentProps) =>
    <DashboardLayout {...props}>
    	<Container fluid className="py-4 px-4">
    	    <Section id="instructions" name="Instructions">
	    	<p><em>
		The following instructions assume you already have background on the iterated prisoner's dilemma.
		If you don't, read <a href="https://en.wikipedia.org/wiki/Prisoner%27s_dilemma">here up to "Strategy for the prisoner's dilemma"</a>.
		</em></p>

		<h4>Writing your bot</h4>
		<p>To submit a bot to the tournament, open the tournament from the dashboard, then click the <b>Compete!</b> button. You will then be taken to a code editor.</p>
		<p>Bots are written in Python. Your bot will need to define the function <code>should_defect</code>. Its first argument is your opponent's <code>should_defect</code> function—the function itself, not a string containing its source code—and its second argument is a list of booleans representing whether your opponent defected in each previous round, with the earliest round first. <code>should_defect</code> will be run each round; if the function returns <code>True</code>, your bot will defect, and if it returns <code>False</code> it will cooperate.</p>
		<p><code>should_defect</code> must return within one second. Your bot has filesystem access, but files don't persist across rounds. Your bot will be rerun in a new process rach round; this means, for instance, that global variables don't persist across rounds. Packages can't be installed in advance.</p>

		<h4>Payoffs</h4>
		<p>The scores in the following table are in the format <code>a / b</code>, where <code>a</code> is your score and <code>b</code> is your opponent's score.</p>
		<table className="table" style={{whiteSpace: 'nowrap', width: '1%'}}>
		    <thead>
		    	<tr>
			    <th scope="col"></th>
			    <th scope="col">You <em>cooperate</em></th>
			    <th scope="col">You <em>defect</em></th>
			</tr>
		    </thead>
		    <tbody>
		    	<tr>
			    <th scope="row">They <em>cooperate</em></th>
			    <td>8 / 8</td>
			    <td>10 / 0</td>
			</tr>
		    	<tr>
			    <th scope="row">They <em>defect</em></th>
			    <td>0 / 10</td>
			    <td>5 / 5</td>
			</tr>
		    </tbody>
		</table>

		<h4>Matchups and scoring</h4>
		<p>Each bot will, upon submission, be assigned <code>m</code> matchups with every bot that has previously been submitted and with itself. Each matchup will consist of <code>r</code> rounds. <code>m</code> and <code>r</code> are variables that can be customized per tournament.</p>
		<p>Each bot's total score is the average of its payoffs across all matches.</p>
	    </Section>
	</Container>
    </DashboardLayout>

export default Help;
