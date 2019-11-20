import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { displayLabel } from '../../helpers';
import URL from '../../urls';

import ColoredAmount from './colored-amount';
import DisplayIf from '../ui/display-if';
import TranslatedText from '../ui/translated-text';

const AccountListItem = connect(
    state => {
        return {
            isSmallScreen: get.isSmallScreen(state)
        };
    },
    dispatch => {
        return {
            hideMenu() {
                actions.toggleMenu(dispatch, true);
            }
        };
    }
)(props => {
    let { pathname } = useLocation();
    let { currentAccountId = null } = useParams();
    let { isSmallScreen, accountId, hideMenu } = props;
    let newPathname =
        currentAccountId !== null
            ? pathname.replace(currentAccountId, accountId)
            : URL.reports.url(accountId);

    let handleHideMenu = isSmallScreen ? hideMenu : null;

    return (
        <li key={`account-details-account-list-item-${accountId}`} onClick={handleHideMenu}>
            <NavLink to={newPathname} activeClassName="active">
                <AccountElement accountId={accountId} />
            </NavLink>
        </li>
    );
});

const AccountElement = connect((state, props) => {
    return {
        account: get.accountById(state, props.accountId)
    };
})(props => {
    let { account } = props;
    let { balance, outstandingSum, formatCurrency } = account;
    return (
        <React.Fragment>
            <span>{displayLabel(account)}</span>
            &ensp;
            <ColoredAmount amount={balance} formatCurrency={formatCurrency} />
            <DisplayIf condition={outstandingSum !== 0}>
                &ensp;
                {'('}
                <TranslatedText translationKey="client.menu.outstanding_balance" />
                <ColoredAmount amount={outstandingSum} formatCurrency={formatCurrency} />
                {')'}
            </DisplayIf>
        </React.Fragment>
    );
});

AccountListItem.propTypes = {
    // the account unique id.
    accountId: PropTypes.string.isRequired
};

export default AccountListItem;
