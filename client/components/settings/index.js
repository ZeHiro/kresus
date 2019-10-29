import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import URL from '../../urls';

import BackupParameters from './backup';
import BankAccountsList from './bank-accesses';
import CategoryList from '../categories';
import CustomizationParameters from './customization';
import EmailsParameters from './emails';
import LogsSection from './logs';
import WeboobParameters from './weboob';

const SettingsComponents = () => {
    return (
        <Switch>
            <Route path={URL.settings.url('accounts')}>
                <BankAccountsList />
            </Route>
            <Route path={URL.settings.url('backup')}>
                <BackupParameters />
            </Route>
            <Route path={URL.settings.url('categories')}>
                <CategoryList />
            </Route>
            <Route path={URL.settings.url('customization')}>
                <CustomizationParameters />{' '}
            </Route>
            <Route path={URL.settings.url('emails')}>
                <EmailsParameters />
            </Route>
            <Route path={URL.settings.url('logs')}>
                <LogsSection />
            </Route>
            <Route path={URL.settings.url('weboob')}>
                <WeboobParameters />
            </Route>

            <Redirect to={URL.settings.url('accounts')} push={false} />
        </Switch>
    );
};

export default SettingsComponents;
