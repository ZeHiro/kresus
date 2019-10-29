import React from 'react';
import { connect } from 'react-redux';
import { NavLink, useParams, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import URL from '../../urls';
import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';
import { findRedundantPairs } from '../duplicates';

import About from './about';
import BankList from './banks';
import DisplayIf from '../ui/display-if';

const Entry = connect(
    state => ({ isSmallScreen: get.isSmallScreen(state) }),
    dispatch => {
        return {
            hideMenu() {
                actions.toggleMenu(dispatch, true);
            }
        };
    }
)(props => {
    let { className = '', isSmallScreen } = props;
    let handeHideMenu = isSmallScreen ? props.hideMenu : null;
    return (
        <li className={className} onClick={handeHideMenu}>
            <NavLink to={props.path} activeClassName="active">
                <i className={`fa fa-${props.icon}`} />
                {props.children}
            </NavLink>
        </li>
    );
});

Entry.propTypes = {
    // The path to which the link directs.
    path: PropTypes.string.isRequired,

    // Icon to be displayed.
    icon: PropTypes.string.isRequired,

    // The class name to apply to the li.
    className: PropTypes.string
};

const DuplicatesEntry = connect((state, props) => {
    const { currentAccountId } = props;
    return {
        numDuplicates: findRedundantPairs(state, currentAccountId).length
    };
})(props => {
    let { currentAccountId, numDuplicates } = props;
    // Do not display the badge if
    // - there are no duplicates
    // - and if we are not in the context of an account.

    return (
        <Entry path={URL.duplicates.url(currentAccountId)} icon="clone" className="duplicates">
            <span>{$t('client.menu.duplicates')}</span>
            <Route
                path={[
                    URL.reports.pattern,
                    URL.budgets.pattern,
                    URL.charts.pattern,
                    URL.duplicates.pattern
                ]}>
                <DisplayIf condition={numDuplicates > 0}>
                    <span className="badge">{numDuplicates}</span>
                </DisplayIf>
            </Route>
        </Entry>
    );
});

const Menu = props => {
    let params = useParams();
    let { currentAccountId = props.initialAccountId } = params;
    // Update the subsection in the links of the menu
    const chartsSubsection = URL.sections.sub(params, props.defaultChart);
    return (
        <nav className={props.isHidden ? 'menu-hidden' : ''}>
           {/* <BankList
                currentAccountId={currentAccountId}
                location={props.location}
                match={props.match}
           />*/}

            <ul className="sidebar-section-list">
                <Entry path={URL.reports.url(currentAccountId)} icon="briefcase">
                    <span>{$t('client.menu.reports')}</span>
                </Entry>
                <Entry path={URL.budgets.url(currentAccountId)} icon="heartbeat">
                    <span>{$t('client.menu.budget')}</span>
                </Entry>
                <Entry path={URL.charts.url(chartsSubsection, currentAccountId)} icon="line-chart">
                    <span>{$t('client.menu.charts')}</span>
                </Entry>
                <DuplicatesEntry currentAccountId={currentAccountId} />
            </ul>

            <div className="sidebar-about">
                <About />
            </div>
        </nav>
    );
};

Menu.propTypes = {
    // The kind of chart to display: by categories, balance, or in and outs for all accounts.
    defaultChart: PropTypes.string.isRequired,
    // Tells whether the menu shall be shown or not
    isHidden: PropTypes.bool.isRequired
};

const Export = connect(state => {
    return {
        defaultChart: get.setting(state, 'default-chart-display-type'),
        isHidden: get.isMenuHidden(state),
        initialAccountId: get.initialAccountId(state)
    };
})(Menu);

export default Export;
