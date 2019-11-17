import React from 'react';
import PropsTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { setupTranslator } from '../../../shared/helpers';

export const LocaleContext = React.createContext();
LocaleContext.displayName = 'LocaleContext';

export class LocaleProvider extends React.Component {
    static defaultProps = {
        locale: 'fr'
    };

    constructor(props) {
        super(props);

        this.changeLocale = locale => {
            setupTranslator(locale);
            this.setState({ locale });
        };

        this.state = {
            locale: this.props.locale,
            changeLocale: this.changeLocale
        };
    }

    render() {
        return (
            <LocaleContext.Provider value={this.state}>
                {this.props.children}
            </LocaleContext.Provider>
        );
    }
}

export const LocaleConsumer = LocaleContext.Consumer;

class TranslatedText extends React.PureComponent {
    static contextType = LocaleContext;
    static propTypes = {
        translationKey: PropsTypes.string.isRequired
    };
    render() {
        return $t(this.props.translationKey, this.props.bindings);
    }
}

export default TranslatedText;
