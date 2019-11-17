import React from 'react';

import Weboob from './weboob';
import Logs from './logs';

import TranslatedText from '../../ui/translated-text';

export default function() {
    return (
        <React.Fragment>
            <div>
                <h2>
                    <TranslatedText translationKey="client.settings.admin_connectors" />
                </h2>
                <Weboob />
            </div>
            <hr />
            <div>
                <h2>
                    <TranslatedText translationKey="client.settings.admin_logs" />
                </h2>
                <Logs />
            </div>
        </React.Fragment>
    );
}
