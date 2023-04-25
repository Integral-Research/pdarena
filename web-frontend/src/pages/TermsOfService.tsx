import { Container } from 'react-bootstrap';

import ExternalLayout from '../components/ExternalLayout';
import { Section, BrandedComponentProps } from '@innexgo/common-react-components';

function TermsOfService(props: BrandedComponentProps) {

  return (
    <ExternalLayout branding={props.branding} fixed={true} transparentTop={true}>
    	<Container style={{marginTop: "6.5rem"}}>
	    <Section id="terms_of_service" name="Terms of Service"><p>Eligibility: The Contest is open to individuals who are at least 13 years of age or older at the time of entry. Participants under the age of 18 must have the consent of a parent or legal guardian to participate.</p>

		<p>Intellectual Property: By submitting code to the Contest, you grant Integral Research a non-exclusive, perpetual, irrevocable, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display the code for any purpose, including without limitation, for marketing and promotional purposes.</p>

		<p>Judging Criteria: Entries will be evaluated based on the criteria set forth in the contest rules. All decisions of the judges are final and binding.</p>

		<p>Prizes: The prize(s) for the Contest will be as set forth in the contest rules. Winners are solely responsible for all taxes and fees associated with receipt of the prize(s).</p>

		<p>Disqualification: Integral Research reserves the right to disqualify any participant in the Contest for any reason, including without limitation, for violating the contest rules or for any other reason deemed appropriate by Integral Research in its sole discretion. However, Integral Research will not disqualify any participant based on race, gender, religion, sexual orientation, or any other characteristic protected by law. All decisions regarding disqualification are final and binding.</p>

		<p>Liability: Integral Research is not responsible for any damages or losses incurred as a result of participation in the Contest.</p>

		<p>Modifications: Integral Research reserves the right to modify or cancel the Contest at any time for any reason.</p>

		<p>Governing Law: The Contest and these Terms of Service are governed by the laws of the state of California, without regard to its conflict of laws principles. Any dispute arising out of or in connection with the Contest shall be resolved exclusively by state or federal courts located in Berkeley, California.</p>

		<p>Entire Agreement: These Terms of Service constitute the entire agreement between you and Integral Research with respect to the Contest.</p>

		<p>Information Collected: We may collect personal information, such as your name, email address, and other information that may be necessary for the administration of the Contest.</p>

		<p>Use of Information: We may use the personal information collected for purposes such as verifying eligibility, notifying winners, and for marketing and promotional purposes. We will not sell or share your personal information with third parties without your consent, except as required by law.</p>

		<p>Children's Information: If you are under the age of 18, you must have the consent of a parent or legal guardian to participate in the Contest. We will not knowingly collect personal information from children under the age of 13 without the consent of a parent or legal guardian.</p>
	    </Section>
	</Container>
    </ExternalLayout>
  )
}

export default TermsOfService;
