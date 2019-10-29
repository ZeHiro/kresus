import { assert } from './helpers';

// The list of the available sections.
const SECTIONS = ['about', 'budget', 'categories', 'charts', 'duplicates', 'reports', 'settings'];
const SETTINGS_SUBSECTIONS = [
    'accounts',
    'backup',
    'categories',
    'customization',
    'emails',
    'logs',
    'weboob'
];

function getCurrentAccountId(match) {
    return match.params.currentAccountId;
}

const duplicates = {
    pattern: '/duplicates/:currentAccountId',
    url(accountId) {
        return `/duplicates/${accountId}`;
    },
    accountId: getCurrentAccountId
};

const reports = {
    pattern: '/reports/:currentAccountId',
    url(accountId) {
        return `/reports/${accountId}`;
    },
    accountId: getCurrentAccountId
};

const budgets = {
    pattern: '/budget/:currentAccountId',
    url(accountId) {
        return `/budget/${accountId}`;
    },
    accountId: getCurrentAccountId
};

const charts = {
    pattern: '/charts/:subsection?/:currentAccountId',
    url(subsection, accountId) {
        return `/charts/${subsection}/${accountId}`;
    },
    accountId: getCurrentAccountId
};

const settings = {
    pattern: '/settings/:subsection',
    url(subsection) {
        return `/settings/${subsection}`;
    },
    accountId: getCurrentAccountId
};

const about = {
    pattern: '/about',
    url() {
        return '/about';
    }
};

const weboobReadme = {
    pattern: '/weboob-readme',
    url() {
        return '/weboob-readme';
    }
};

const initialize = {
    pattern: '/initialize/:subsection?',
    url(subsection = null) {
        if (subsection === null) {
            return '/initialize/';
        }
        return `/initialize/${subsection}`;
    }
};

const URLs = {
    duplicates,
    reports,
    budgets,
    charts,
    settings,
    about,
    weboobReadme,
    initialize,

    sections: {
        pattern: '/:section/:subsection?',
        genericPattern: [
            duplicates.pattern,
            reports.pattern,
            budgets.pattern,
            charts.pattern,
            settings.pattern,
            about.pattern,
            weboobReadme.pattern,
            initialize.pattern
        ],
        sub(params, defaultValue) {
            if (params === null) {
                return defaultValue;
            }

            let { subsection: paramsSubsection } = params;
            return typeof paramsSubsection !== 'undefined' ? paramsSubsection : defaultValue;
        },
        title(match) {
            if (!match || !match.params) {
                return null;
            }
            if (SETTINGS_SUBSECTIONS.includes(match.params.subsection)) {
                return match.params.subsection;
            }
            if (SECTIONS.includes(match.params.section)) {
                return match.params.section;
            }
            return null;
        },
        accountId: getCurrentAccountId
    }
};

function allPatternsInGenericPattern() {
    for (let [key, obj] of Object.entries(URLs)) {
        if (key === 'sections') {
            continue;
        }
        if (!URLs.sections.genericPattern.includes(obj.pattern)) {
            return false;
        }
    }
    return true;
}

assert(allPatternsInGenericPattern(), 'Missing route pattern in URLs object');

export default URLs;
