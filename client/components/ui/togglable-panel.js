import { has } from '../../helpers';

export default class TogglablePanel extends React.Component {

    constructor(props) {
        has(props, 'title');
        has(props, 'details');
        super(props);
        this.state = {
            showDetails: false
        };
        this.handleShowDetails = this.handleShowDetails.bind(this);
    }

    handleShowDetails() {
        this.setState({
            showDetails: !this.state.showDetails
        });
    }

    render() {
        let details;
        if (!this.state.showDetails) {
            details = <div className="transition-expand"/>;
        } else {
            details = this.props.details;
        }
        return (
            <div className="panel panel-default">
                <div className= "panel-heading clickable" onClick= { this.handleShowDetails }>
                    <h5 className="panel-title">
                        { this.props.title }
                        <span
                          className={ `pull-right fa fa-${this.state.showDetails ?
                          'minus' : 'plus'}-square` }
                          aria-hidden="true"></span>
                    </h5>
                </div>
                { details }
            </div>
        );
    }
}
