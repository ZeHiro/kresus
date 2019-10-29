import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { displayLabel, FETCH_STATUS_SUCCESS, translate as $t } from '../../helpers';
import { get as getErrorCode } from '../../errors';

import AccountListItem from './account';
import ColoredAmount from './colored-amount';
import DisplayIf from '../ui/display-if';

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
            return $t(`client.fetch_error.short.${fetchStatus}`);
        default:
            return $t('client.fetch_error.short.GENERIC_EXCEPTION');
    }
}

class BankListItemComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAccounts: this.props.active
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({
            showAccounts: !this.state.showAccounts
        });
    }

    render() {
        let { total, formatCurrency, access } = this.props;

        let totalElement =
            total === null ? (
                <span title={$t('client.menu.different_currencies')}>N/A</span>
            ) : (
                <ColoredAmount amount={total} formatCurrency={formatCurrency} />
            );

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
            fetchStatus !== FETCH_STATUS_SUCCESS ? fetchStatusToLabel(fetchStatus) : null;

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
                        <span>{$t('client.menu.total')}</span>
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
    active: PropTypes.bool.isRequired,

    // The location object containing the current path.
    // Needed to rerender the accounts links on route change
    location: PropTypes.object.isRequired
};

const Export = connect((state, props) => {
    let accountIds = get.accountIdsByAccessId(state, props.accessId);

    let currency = null;
    let sameCurrency = true;
    let formatCurrency;
    let total = 0;
    for (let accountId of accountIds) {
        let acc = get.accountById(state, accountId);
        if (!acc.excludeFromBalance) {
            total += acc.balance;

            if (sameCurrency) {
                sameCurrency = !currency || currency === acc.currency;
            }

            currency = currency || acc.currency;
            formatCurrency = formatCurrency || acc.formatCurrency;
        }
    }

    if (!sameCurrency || !formatCurrency) {
        total = null;
    }

    return {
        access: get.accessById(state, props.accessId),
        total,
        formatCurrency
    };
})(BankListItemComponent);

export default Export;
