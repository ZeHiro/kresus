import React from 'react';
import { NavLink } from 'react-router-dom';

import URL from '../../urls';

import DisplayIf from '../ui/display-if';
import TranslatedText from '../ui/translated-text';

class DropdownContent extends React.PureComponent {
    componentDidMount() {
        document.addEventListener('keydown', this.props.onKeydown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.props.onKeydown);
    }

    render() {
        return (
            <div id={this.props.id} onClick={this.props.onClick}>
                {this.props.children}
            </div>
        );
    }
}

export default class DropdownMenu extends React.PureComponent {
    state = {
        show: false
    };

    handleHide = () => {
        this.setState({ show: false });
    };

    handleToggle = () => {
        this.setState({ show: !this.state.show });
    };

    handleKeydown = event => {
        if (event.key === 'Escape') {
            this.handleHide();
        }
    };

    render() {
        return (
            <div className="settings-dropdown">
                <button className="fa fa-cogs" onClick={this.handleToggle} />
                <DisplayIf condition={this.state.show}>
                    <DropdownContent
                        id="overlay"
                        onKeydown={this.handleKeydown}
                        onClick={this.handleHide}>
                        <nav className="settings-dropdown-menu">
                            <ul>
                                <li>
                                    <NavLink to={URL.settings.url('categories')}>
                                        <span className="fa fa-list-ul" />
                                        <TranslatedText translationKey="client.menu.categories" />
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={URL.settings.url('accounts')}>
                                        <span className="fa fa-bank" />
                                        <TranslatedText translationKey="client.settings.tab_accounts" />
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={URL.settings.url('emails')}>
                                        <span className="fa fa-envelope" />
                                        <TranslatedText translationKey="client.settings.tab_alerts" />
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={URL.settings.url('backup')}>
                                        <span className="fa fa-save" />
                                        <TranslatedText translationKey="client.settings.tab_backup" />
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={URL.settings.url('admin')}>
                                        <span className="fa fa-sliders" />
                                        <TranslatedText translationKey="client.settings.tab_admin" />
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={URL.settings.url('customization')}>
                                        <span className="fa fa-paint-brush" />
                                        <TranslatedText translationKey="client.settings.tab_customization" />
                                    </NavLink>
                                </li>
                            </ul>
                            <ul>
                                <li>
                                    <NavLink to={URL.about.url()}>
                                        <span className="fa fa-question" />
                                        <TranslatedText translationKey="client.menu.about" />
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>
                    </DropdownContent>
                </DisplayIf>
            </div>
        );
    }
}
