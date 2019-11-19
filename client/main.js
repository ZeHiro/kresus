import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter,
    Route,
    Switch,
    Link,
    Redirect,
    useRouteMatch,
    useParams,
    useLocation
} from 'react-router-dom';
import { connect, Provider } from 'react-redux';
import throttle from 'lodash.throttle';
import { ToastContainer } from 'react-toastify';

// Global variables
import { get, init, rx, actions } from './store';
import { debug, computeIsSmallScreen } from './helpers';
import URL from './urls';

// Lazy loader
import LazyLoader from './components/lazyLoader';

// Components
import About from './components/about';
import loadCharts from 'bundle-loader?lazy!./components/charts';
import OperationList from './components/operations';
import Budget from './components/budget';
import DuplicatesList from './components/duplicates';
import Settings from './components/settings';

import AccountWizard from './components/init/account-wizard';

import Menu from './components/menu';
import DropdownMenu from './components/menu/dropdown';

import DemoButton from './components/header/demo-button';

import DisplayIf from './components/ui/display-if';
import ErrorReporter from './components/ui/error-reporter';
import { LoadingMessage, LoadingOverlay } from './components/ui/loading';
import Modal from './components/ui/modal';
import ThemeLoaderTag from './components/ui/theme-link';
import withCurrentAccountId from './components/withCurrentAccountId';
import TranslatedText, { LocaleProvider } from './components/ui/translated-text';

const RESIZE_THROTTLING = 100;

// Lazy-loaded components
const Charts = props => (
    <LazyLoader load={loadCharts}>
        {ChartsComp => {
            // Note: We have to put the loading element here and not in the
            // LazyLoader component to ensure we are not flickering the
            // loading screen on subsequent load of the component.
            return ChartsComp ? (
                <ChartsComp {...props} />
            ) : (
                <LoadingMessage
                    message={<TranslatedText translationKey="client.spinner.loading" />}
                />
            );
        }}
    </LazyLoader>
);

const SectionTitle = () => {
    let titleKey = URL.sections.title(useParams());
    if (titleKey === null) {
        return null;
    }
    return (
        <span className="section-title">
            &nbsp;/&nbsp;
            <TranslatedText translationKey={`client.menu.${titleKey}`} />
        </span>
    );
};

const RedirectIfUnknownAccount = withCurrentAccountId(
    connect((state, props) => {
        return {
            isUnknownAccount: get.accountById(state, props.currentAccountId) === null,
            initialAccountId: get.initialAccountId(state)
        };
    })(props => {
        let location = useLocation();
        let { isUnknownAccount } = props;

        if (isUnknownAccount) {
            let { currentAccountId, initialAccountId } = props;
            return (
                <Redirect
                    to={location.pathname.replace(currentAccountId, initialAccountId)}
                    push={false}
                />
            );
        }
        return props.children;
    })
);

class BaseApp extends React.Component {
    handleWindowResize = throttle(event => {
        let isSmallScreen = computeIsSmallScreen(event.target.innerWidth);
        if (isSmallScreen !== this.props.isSmallScreen) {
            this.props.setIsSmallScreen(isSmallScreen);
        }
    }, RESIZE_THROTTLING);

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);

        // Preload the components
        loadCharts(() => {
            // Do nothing, just preload
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
    }

    render() {
        let handleContentClick = this.props.isSmallScreen ? this.props.hideMenu : null;

        let { initialAccountId } = this.props;

        return (
            <React.Fragment>
                <Modal />
                <header>
                    <button className="menu-toggle" onClick={this.props.handleToggleMenu}>
                        <span className="fa fa-navicon" />
                    </button>
                    <h1>
                        <Link to="/">
                            <TranslatedText translationKey="client.KRESUS" />
                        </Link>
                    </h1>
                    <Route path={URL.sections.pattern}>
                        <SectionTitle />
                    </Route>

                    <DisplayIf condition={this.props.forcedDemoMode}>
                        <p className="disable-demo-mode">
                            <TranslatedText translationKey="client.demo.forced" />
                        </p>
                    </DisplayIf>
                    <DisplayIf condition={!this.props.forcedDemoMode}>
                        <DemoButton />
                    </DisplayIf>

                    <DropdownMenu />
                </header>

                <main>
                    <Route path={URL.sections.genericPattern}>
                        <Menu />
                    </Route>
                    <div id="content" onClick={handleContentClick}>
                        <Switch>
                            <Route path={URL.reports.pattern}>
                                <RedirectIfUnknownAccount>
                                    <OperationList />
                                </RedirectIfUnknownAccount>
                            </Route>
                            <Route path={URL.budgets.pattern}>
                                <RedirectIfUnknownAccount>
                                    <Budget />
                                </RedirectIfUnknownAccount>
                            </Route>
                            <Route path={URL.charts.pattern}>
                                <RedirectIfUnknownAccount>
                                    <Charts />
                                </RedirectIfUnknownAccount>
                            </Route>
                            <Route path={URL.duplicates.pattern}>
                                <DuplicatesList />
                            </Route>
                            <Route path={URL.settings.pattern}>
                                <Settings />
                            </Route>
                            <Route path={URL.about.pattern}>
                                <About />
                            </Route>
                            <Redirect to={URL.reports.url(initialAccountId)} push={false} />
                        </Switch>
                    </div>
                </main>
            </React.Fragment>
        );
    }
}

const Kresus = connect(
    state => {
        let initialAccountId = get.initialAccountId(state);
        return {
            forcedDemoMode: get.boolSetting(state, 'force-demo-mode'),
            initialAccountId,
            isSmallScreen: get.isSmallScreen(state)
        };
    },
    dispatch => {
        return {
            setIsSmallScreen(isSmallScreen) {
                actions.setIsSmallScreen(dispatch, isSmallScreen);
            },
            handleToggleMenu() {
                actions.toggleMenu(dispatch);
            },
            hideMenu() {
                actions.toggleMenu(dispatch, true);
            }
        };
    }
)(BaseApp);

const DisplayOrRedirectToInitialScreen = connect(state => {
    return {
        hasAccess: get.accessIds(state).length > 0,
        isWeboobInstalled: get.isWeboobInstalled(state)
    };
})(props => {
    let isWeboobReadmeDisplayed = useRouteMatch({ path: URL.weboobReadme.pattern });
    let isOnboardingDisplayed = useRouteMatch({ path: URL.initialize.pattern });
    if (!props.isWeboobInstalled && !isWeboobReadmeDisplayed) {
        return <Redirect to={URL.weboobReadme.url()} push={false} />;
    }
    if (!props.hasAccess && !isOnboardingDisplayed) {
        return <Redirect to={URL.initialize.url()} push={false} />;
    }
    if (
        (props.hasAccess && isOnboardingDisplayed) ||
        (props.isWeboobInstalled && isWeboobReadmeDisplayed)
    ) {
        return <Redirect to="/" push={false} />;
    }
    return props.children;
});

const makeOnLoadHandler = (initialState, resolve, reject) => loaded => {
    if (loaded) {
        resolve(initialState);
    } else if (get.setting(initialState, 'theme') === 'default') {
        reject();
    }
};

export default function runKresus() {
    init()
        .then(initialState => {
            Object.assign(rx.getState(), initialState);
            return new Promise((resolve, reject) => {
                ReactDOM.render(
                    <Provider store={rx}>
                        <ThemeLoaderTag onLoad={makeOnLoadHandler(initialState, resolve, reject)} />
                    </Provider>,
                    document.getElementById('postload')
                );
            });
        })
        .then(initialState => {
            let urlPrefix = get.setting(initialState, 'url-prefix');

            // Remove trailing '/'
            urlPrefix = urlPrefix.replace(/\/$/g, '');

            ReactDOM.render(
                <BrowserRouter basename={`${urlPrefix}/#`}>
                    <Provider store={rx}>
                        <LocaleProvider locale="en">
                            <ErrorReporter>
                                <Switch>
                                    <Route
                                        path={[URL.weboobReadme.pattern, URL.initialize.pattern]}>
                                        <DisplayOrRedirectToInitialScreen>
                                            <AccountWizard />
                                        </DisplayOrRedirectToInitialScreen>
                                    </Route>
                                    <Route path="/" exact={false}>
                                        <DisplayOrRedirectToInitialScreen>
                                            <Kresus />
                                        </DisplayOrRedirectToInitialScreen>
                                    </Route>
                                    <Redirect from="" to="/" push={false} />
                                </Switch>

                                <ToastContainer />
                                <LoadingOverlay />
                            </ErrorReporter>
                        </LocaleProvider>
                    </Provider>
                </BrowserRouter>,
                document.getElementById('app')
            );
        })
        .catch(err => {
            let errMessage = '';
            if (err) {
                debug(err);
                errMessage = `\n${err.shortMessage || JSON.stringify(err)}`;
            }
            window.alert(`Error when starting the app:${errMessage}\nCheck the console.`);
        });
}
