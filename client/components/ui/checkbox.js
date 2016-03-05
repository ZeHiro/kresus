import { has } from '../../helpers';

export default class CheckBox extends React.Component {
    constructor(props) {
        has(props, 'label');
        has(props, 'checked');
        has(props, 'onChange');
        super(props);
        this.handleOnChange = this.props.onChange.bind(this);
    }

    render() {
        return (
            <div className="form-group clearfix">
                <label htmlFor={ this.props.label }
                  className="col-xs-4 control-label">
                    { this.props.label }
                </label>
                <div className="col-xs-8">
                    <input
                      type="checkbox"
                      id={ this.props.label }
                      ref={ this.props.label }
                      onChange={ this.handleOnChange }
                      defaultChecked={ this.props.checked }
                    />
                </div>
            </div>
        );
    }
}
