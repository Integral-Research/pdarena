import { Container } from 'react-bootstrap';

import ExternalLayout from '../components/ExternalLayout';
import { Section, BrandedComponentProps } from '@innexgo/common-react-components';

function TermsOfService(props: BrandedComponentProps) {

  return (
    <ExternalLayout branding={props.branding} fixed={true} transparentTop={true}>
    	<Container style={{marginTop: "6.5rem"}}>
	    <Section id="terms_of_service" name="Terms of Service">
	    	<p>Maecenas blandit finibus risus, dapibus sagittis nibh auctor a. Vestibulum vitae magna gravida, commodo magna vitae, laoreet elit. Proin tincidunt, nulla vel lacinia condimentum, lectus ex luctus eros, id tristique mi ex in velit. Sed molestie nisl at dolor lobortis dapibus. Aliquam malesuada ornare odio, quis vulputate est volutpat nec. Phasellus eu metus porttitor, viverra leo id, lacinia magna. Donec porttitor urna non rhoncus vehicula. Vivamus ut feugiat leo. Vivamus nibh augue, bibendum ut placerat eget, tristique ac felis. Cras porta dapibus aliquet. Praesent ut porta neque, id elementum sem.</p>
		<p>Sed imperdiet ullamcorper nisi, sed malesuada ante rutrum quis. Cras dolor sapien, convallis a nisi quis, faucibus dapibus ante. Integer pharetra justo arcu, quis venenatis felis dapibus nec. Duis sagittis in arcu at euismod. Integer tempor purus eget sem faucibus, vel rutrum erat tempus. Sed est diam, varius vehicula sapien vel, facilisis volutpat orci. Integer efficitur metus at pulvinar eleifend. Sed vel pulvinar turpis. Vestibulum vel mattis lectus. Mauris tempor ultrices euismod. Donec venenatis dictum justo, sed feugiat massa convallis bibendum. Nunc dapibus felis et finibus gravida. Integer vel consequat velit.</p>
	    </Section>
	</Container>
    </ExternalLayout>
  )
}

export default TermsOfService;
