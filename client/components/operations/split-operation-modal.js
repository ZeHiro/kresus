import { has, maybeHas, translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { Actions } from '../../store';

import Modal from '../ui/modal';
import ValidableInputNumber from '../ui/checked-number';
import ValidableInputText from '../ui/checked-text';
import CategorySelect from '../ui/category-select';
import DatePicker from '../ui/date-picker';

class SubOpForm extends React.Component {
    constructor(props) {
        has(props, 'id');
        has(props, 'minDate');
        has(props, 'amount');
        has(props, 'label');
        super(props);
        this.state = {
            operation: {
                categoryId: NONE_CATEGORY_ID,
                amount: this.props.amount,
                title: this.props.label,
                date: this.props.date || ''
            },
            isAmountOK: false,
            isLabelOK: false
        };
        this.handleChangeLabel = this.handleChangeLabel.bind(this);
        this.handleSelectCategory = this.handleSelectCategory.bind(this);
        this.handleChangeAmount = this.handleChangeAmount.bind(this);
    }

    handleChangeLabel(event) {
        let title = event.target.value;
        let operation = this.state.operation;
        operation.title = title;
        this.setState({ operation });
        //this.setState
        
    }

    handleChangeAmount(event) {
        let amount = event.target.value;
        let operation = this.state.operation;
        operation.amount = amount;
        this.setState({ operation }, this.props.checkAmount);
    }

    handleSelectCategory(value) {
        let state = this.state;
        state.operation.categoryId = value;
        this.setState(state);
    }

    getOperationAmount() {
        return this.state.operation.amount;
    }

    getOperation() {
        return this.state.operation;
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
                            <input className="form-control" type="text" placeholder={ $t('client.split_operation.placeholders.label') } defaultValue={ this.state.title }
                              onChange={ this.handleChangeLabel }
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="form-group col-sm-4" aria-label={ $t('client.split_operation.amount') }>
                        <div className="input-group">

                            <input className="form-control" type="number" step="0.01" placeholder={ $t('client.split_operation.placeholders.amount') }
                              onChange={ this.handleChangeAmount } defaultValue={ this.props.amount }/>
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
                              placeholder={ $t('client.split_operation.placeholders.date') }
                              defaultDate={ this.props.date }
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
        console.log(this.props.operation);
        this.state = { 
            subOpsNumber: Math.max(this.props.operation.subOperationIds.length, 2),
            sumOfAmounts: null
        };

        this.handleChangeOfSubOps = this.handleChangeOfSubOps.bind(this);
        this.handleSplitOperation = this.handleSplitOperation.bind(this);
        this.handleSumOfAmounts = this.handleSumOfAmounts.bind(this);
    }
    
    handleChangeOfSubOps(e) {
        this.setState({ subOpsNumber: e.target.value });
    }
    

    handleSplitOperation(event) {
        // Subimitting the form should not reload the page
        event.preventDefault();
        let operations = this.getSubOperations();
        Actions.splitOperation(this.props.operation.id, operations);
    }

    getSubOperation(index) {
        let ref = `${this.props.operation.id}subOp${index}`;
        return this.refs[ref].getOperation();
    }

    getSubOperations() {
        let operations = [];
        for (let i = 1; i <= this.state.subOpsNumber; i++) {
            operations.push(this.getSubOperation(i));
        }
        return operations;
    }

    getSubOperationAmount(index) {
        let ref = `${this.props.operation.id}subOp${index}`;
        return this.refs[ref].getOperationAmount();
    }

    handleSumOfAmounts() {
        let sumOfAmounts = 0;
        for (let i = 1; i <= this.state.subOpsNumber; i++) {
            sumOfAmounts += parseFloat(this.getSubOperationAmount(i));
        }
        this.setState({ sumOfAmounts: sumOfAmounts }); 
    }

    render() {
        let operationToSplit = this.props.operation;
        let modalId = `splitOperationModal${operationToSplit.id}`;
        let modalTitle = $t('client.split_operations.title');
        let subOps = [];
        if (this.props.operation.hasSubOperations) {
            subOps = this.props.operation.subOperationIds.map(id => store.getOperationFromId(id))
.map((op, index) => <SubOpForm ref={ op.id } id={ index } key={ op.id } minDate={ operationToSplit.date } amount={ op.amount }
                  label={ op.customLabel ? op.customLabel : op.title } date={ op.date } checkAmount={ this.handleSumOfAmounts }/>);

        } else {
            for (let i = 1; i <= this.state.subOpsNumber; i++) {
                subOps.push(<SubOpForm ref={ `${operationToSplit.id}subOp${i}` } id={ i } key={ `${operationToSplit.id}subOp${i}` } minDate={operationToSplit.date} amount={ i === 1 ? operationToSplit.amount : 0 }
                  label={ operationToSplit.customLabel ? operationToSplit.customLabel : operationToSplit.title } date={operationToSplit.date} checkAmount={ this.handleSumOfAmounts }/>);
            }
        }
        let modalBody = (
            <div>
                <span>{ $t('client.split_operations.text') }</span>
                <span>{ this.props.operation.amount }</span>
                <div className="row">

                    <div className="col-sm-2"> 
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
            <div>
                <input type="submit" value={ $t('client.split_operation.split') }
                  className="btn btn-warning pull-right"
                  onClick={ this.handleSplitOperation }
                  disabled={ this.state.sumOfAmounts !== operationToSplit.amount }
                  />
            </div>
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
