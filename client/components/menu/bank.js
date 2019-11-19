import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { displayLabel, FETCH_STATUS_SUCCESS } from '../../helpers';
import { get as getErrorCode } from '../../errors';

import AccountListItem from './account';
import ColoredAmount from './colored-amount';
import DisplayIf from '../ui/display-if';
import TranslatedText from '../ui/translated-text';

function fetchStatusToLabel(fetchStatus) {
    let errCode = getErrorCode(fetchStatus);
    switch (errCode) {
        case 'UNKNOWN_WEBOOB_MODULE':
        case 'NO_ACCOUNTS':
        case 'NO_PASSWORD':
        case 'INVALID_PASSWORD':
        case 'EXPIRED_PASSWORD':
        case 'INVALID_PARAMETERS':
        case 'ACTION_NEEDED':
        case 'AUTH_METHOD_NYI':
        case 'CONNECTION_ERROR':
            return `client.fetch_error.short.${fetchStatus}`;
        default:
            return 'client.fetch_error.short.GENERIC_EXCEPTION';
    }
}

class BankListItemComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAccounts: this.props.active
        };
    }

    handleClick = () => {
        this.setState({
            showAccounts: !this.state.showAccounts
        });
    };

    render() {
        let { totals, access } = this.props;
        let totalEntries = Object.entries(totals);
        let totalElement;
        if (totalEntries.length) {
            totalElement = totalEntries
                .map(([key, value]) => (
                    <ColoredAmount
                        key={key}
                        amount={value.total}
                        formatCurrency={value.formatCurrency}
                    />
                ))
                .reduce((prev, curr) => [prev, ' | ', curr]);
        } else {
            totalElement = 'N/A';
        }

        let accountsElements;
        if (this.state.showAccounts) {
            accountsElements = access.accountIds.map(id => (
                <AccountListItem
                    key={id}
                    accountId={id}
                    currentAccountId={this.props.currentAccountId}
                />
            ));
        }

        let stateLabel = this.state.showAccounts ? 'minus' : 'plus';

        let { fetchStatus, isBankVendorDeprecated, enabled } = access;

        let statusLabel =
            fetchStatus !== FETCH_STATUS_SUCCESS ? (
                <TranslatedText translationKey={fetchStatusToLabel(fetchStatus)} />
            ) : null;

        return (
            <li
                key={`bank-details bank-list-item-${this.props.access.id}`}
                className={this.props.active ? 'active' : ''}>
                <div className={`icon icon-${this.props.access.vendorId}`} />
                <div className="bank-name">
                    <div>
                        <DisplayIf
                            condition={
                                !isBankVendorDeprecated &&
                                enabled &&
                                fetchStatus !== FETCH_STATUS_SUCCESS
                            }>
                            <span
                                className="tooltipped tooltipped-se tooltipped-multiline
                                           tooltipped-small"
                                aria-label={statusLabel}>
                                <span className="fa fa-exclamation-triangle status fail" />
                            </span>
                        </DisplayIf>

                        <button className="btn transparent" onClick={this.handleClick}>
                            <span className="name">{displayLabel(this.props.access)}</span>
                            <span className={`fa fa-${stateLabel}-square`} />
                        </button>
                    </div>
                    <p className="bank-sum">
                        <span>
                            <TranslatedText translationKey="client.menu.total" />
                        </span>
                        &ensp;
                        {totalElement}
                    </p>
                </div>
                <ul className={'accounts'}>{accountsElements}</ul>
            </li>
        );
    }
}

BankListItemComponent.propTypes = {
    // the bank object
    access: PropTypes.object.isRequired,

    // Whether the bank is the current bank selected
    active: PropTypes.bool.isRequired
};

const Export = connect((state, props) => {
    let accountIds = get.accountIdsByAccessId(state, props.accessId);

    let totals = {};
    for (let accountId of accountIds) {
        let acc = get.accountById(state, accountId);
        if (!acc.excludeFromBalance && acc.currency) {
            if (!(acc.currency in totals)) {
                totals[acc.currency] = { total: acc.balance, formatCurrency: acc.formatCurrency };
            } else {
                totals[acc.currency].total += acc.balance;
            }
        }
    }

    return {
        access: get.accessById(state, props.accessId),
        totals
    };
})(BankListItemComponent);

export default Export;
