import { has } from '../../helpers';

export default class Budget extends React.Component {

    constructor(props) {
        has(props, 'budget');
        super(props);
    }

    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h5 className="panel-title">
                        { this.props.budget.title }
                        <i className="pull-right fa fa-cog"></i>
                    </h5>
                    {this.props.budget.startDate.toLocaleString()}
                </div>
            </div>
        );
    }

}
