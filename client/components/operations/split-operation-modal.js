import { has, translate as $t, NONE_CATEGORY_ID } from '../../helpers';

import Modal from '../ui/modal';
import ValidableInputNumber from '../ui/checked-number';
import ValidableInputText from '../ui/checked-text';
import CategorySelect from '../ui/category-select';
import DatePicker from '../ui/date-picker';

class SubOpForm extends React.Component {
    constructor(props) {
        has(props, 'id');
        has(props, 'minDate');
        super(props);
        this.state = {
            operation: {
                categoryId: NONE_CATEGORY_ID
            },
            isAmountOK: false,
            isLabelOK: false
        };
        this.handleChangeValue = this.handleChangeValue.bind(this);
        this.handleSelectCategory = this.handleSelectCategory.bind(this);
    }

    handleChangeValue(value) {
        //this.setState
    }

    handleSelectCategory(value) {
        let state = this.state;
        state.operation.categoryId = value;
        this.setState(state);
    }

    render() {
        return (

            <li className="list-group-item">
                <div className="row">
                    <div className="form-group col-sm-12">
                        <div className="input-group">
                            <span className="input-group-addon">
                                <i className="fa fa-pencil"></i>
                            </span>
                            <input className="form-control" type="text" placeholder="Label"/>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="form-group col-sm-4" aria-label={ $t('client.split_operation.amount') }>
                        <div className="input-group">

                            <input className="form-control" type="number" step="0.01" placeholder="Amount"/>
                            <span className="input-group-addon">
                                <i className="fa fa-euro"></i>
                            </span>
                        </div>
                    </div>
                    <div className="form-group col-sm-4">
                        <div className="input-group">
                            <span className="input-group-addon">
                                <i className="fa fa-calendar-o"></i>
                            </span>
                            <DatePicker
                              minDate={ this.props.minDate }
                              placeholder= "Date"
                            />
                        </div>
                    </div>
                    <div className="form-group col-sm-4">
                        <CategorySelect
                        operation={this.state.operation}
                        onSelectId={ this.handleSelectCategory }
                        />
                    </div>
                </div>
            </li>
        );
    }

}


export default class SplitOperationModal extends React.Component {
    constructor(props) {
        has(props, 'operation');
        super(props);
        
        this.state = { 
            subOpsNumber: 2,
            changeDate: false
        };
        
        this.handleChangeOfSubOps = this.handleChangeOfSubOps.bind(this);
    }
    
    handleChangeOfSubOps(e) {
        this.setState({ subOpsNumber: e.target.value });
    }
    
    render() {
        let modalId = `splitOperationModal${this.props.operation.id}`;
        let modalTitle = $t('client.split_operations.title');
        let subOps = [];
        for (let i = 1; i <= this.state.subOpsNumber; i++) {
            subOps.push(<SubOpForm id={ i } key={ `subOp${i}` } minDate={this.props.operation.date}/>);
        }
        
        let modalBody = (
            <div>
                <span>{ $t('client.split_operations.text') }</span>
                <div className="row">

                    <div className="col-sm-4"> 
                        <input className="form-control"
                          type="number" step="1" defaultValue="2" min="2"
                          onChange={ this.handleChangeOfSubOps }/>
                      </div>
                </div>
                { "Sous-operations" }
                <ul className="list-group">
                    { subOps }
                </ul>
            </div>

        );
        let modalFooter = (
            <div />
        );
        return (
            <Modal
              size="large"
              modalId={ modalId }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
              modalTitle={ modalTitle }
            />
        );
    }
}
