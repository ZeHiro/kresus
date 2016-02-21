import { has, translate as $t } from '../../helpers';
import { store, Actions } from '../../store';

import TogglablePanel from '../ui/togglable-panel';
import ValidableInputText from '../ui/ValidableInputText';
import ValidableInputDate from '../ui/ValidableInputDate';
import DatePicker from '../ui/DatePicker';

export default class CreateBudget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            budgetTitle: '',
            budgetType: store.getBudgetTypes()[0],
            budgetStartDate: '',
            budgetEndDate: '',
            isBudgetTitleValid: false,
            isBudgetStartDateValid: false
        };
        this.getTitleValue = this.getTitleValue.bind(this);
        this.getStartDate = this.getStartDate.bind(this);
        this.handleEndDate = this.handleEndDate.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnChangeBudgetType = this.handleOnChangeBudgetType.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        // Only rerender if the button status has to be updated
        return this.isSubmitDisabled() !==
               !(nextState.isBudgetTitleValid && nextState.isBudgetStartDateValid);
    }

    getTitleValue(title) {
        if (title && title.trim().length > 0) {
            this.setState({
                budgetTitle: title,
                isBudgetTitleValid: true
            });
        } else {
            this.setState({
                budgetTitle: '',
                isBudgetTitleValid: false
            });
        }
    }

    getStartDate(date) {
        if (date) {
            this.setState({
                budgetStartDate: date,
                isBudgetStartDateValid: true
            });
        } else {
            this.setState({
                budgetStartDate: '',
                isBudgetStartDateValid: false
            });
        }
    }

    handleEndDate(date) {
        this.setState({
            budgetEndDate: date
        });
    }

    handleSubmit() {
        let budget = {};
        // We get all the parameters of the budget
        budget.title = this.state.budgetTitle;
        budget.startDate = new Date(this.state.budgetStartDate);
        if (this.state.budgetEndDate) {
            budget.endDate = new Date(this.state.budgetEndDate);
        }
        budget.type = this.state.budgetType;
        budget.budgetItemsIds = [];
        console.log(budget);
        Actions.createBudget(budget);
    }

    handleOnChangeBudgetType() {
        let type = this.refs.budgetTypeSelect.getDOMNode().value;
        this.setState({
            budgetType: type
        });
    }

    isSubmitDisabled() {
        return !(this.state.isBudgetTitleValid && this.state.isBudgetStartDateValid);
    }

    render() {
        let budgetTypeOptions = store.getBudgetTypes().map(type =>
            <option key={ `budgetType${type}` } value={ type } className="label-button">
                { $t(`client.budget.types.${type}`) }
            </option>
        );
        let details = (
            <div className="panel-body transition-expand">
                <form>
                    <ValidableInputText
                      returnInputValue={ this.getTitleValue }
                      inputID="create_budget_title"
                      label={ $t('client.budget.budget_title') }
                      ref = "budget_title"
                    />
                    <div className="form-group">
                        <label htmlFor="budgetTypeSelect">
                            { $t('client.budget.budget_type') }
                        </label>
                        <select
                          className="form-control"
                          ref="budgetTypeSelect"
                          id="budgetTypeSelect"
                          onChange={ this.handleOnChangeBudgetType }>
                            { budgetTypeOptions }
                        </select>
                    </div>
                    <ValidableInputDate
                      returnInputValue={ this.getStartDate }
                      inputID="create_budget_start_date"
                      label={ $t('client.budget.start_date') }
                    />
                    <div className="form-group">
                        <label htmlFor="budgetTypeEndDate">
                            { $t('client.budget.end_date') }
                        </label>
                        <DatePicker id="budgetTypeEndDate" onSelect={ this.handleEndDate }/>
                    </div>
                </form>
                <input type="submit"
                  className="btn btn-save pull-right"
                  onClick={ this.handleSubmit }
                  value={ $t('client.budget.submit') }
                  disabled={ this.isSubmitDisabled() }
                />
            </div>
        );
        return (
            <TogglablePanel
              title={ $t('client.budget.create_budget') }
              details={ details }
            />
        );
    }
}
