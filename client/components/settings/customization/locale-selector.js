import React from 'react';

import { LocaleContext } from '../../ui/translated-text';

class LocaleSelector extends React.PureComponent {
    static contextType = LocaleContext;
    static defaultProps = {
        className: '',
        id: ''
    };

    handleChange = e => {
        this.context.changeLocale(e.target.value);
    };

    render() {
        return (
            <select
                id={this.props.id}
                className={`locale-selector ${this.props.className}`}
                onChange={this.handleChange}
                value={this.context.locale}>
                <option value="fr">Français</option>
                <option value="en">English</option>
            </select>
        );
    }
}

export default LocaleSelector;
