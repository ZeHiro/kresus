import React from 'react';

import ExternalLink from '../ui/external-link';
import { version, repository, license } from '../../../package.json';
import TranslatedText from '../ui/translated-text';

const AboutComponent = () => (
    <React.Fragment>
        <ExternalLink href="https://kresus.org">KRESUS</ExternalLink>&nbsp;
        {version}&nbsp;
        <ExternalLink href={`${repository.url}/blob/master/LICENSE`}>
            <TranslatedText translationKey="client.about.license" bindings={{ license }} />
        </ExternalLink>
    </React.Fragment>
);

export default AboutComponent;
