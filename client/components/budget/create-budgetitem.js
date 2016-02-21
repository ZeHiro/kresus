import { has, translate as $t } from '../../helpers';
import { store } from '../../store';

import Modal from '../ui/Modal';
import ValidableInputText '../ui/ValidableInputText'
export default class CreateBudgetItemModal extends React.Component {
    constructor(props) {
        has(props, 'budgetId');
        has(props, 'budgetTitle');
        super(props);
        this.retrieveTitle = this.retrieveTitle.bind(this);
    }

    retrieveTitle(title) {
        //Do something here
    }

    render() {
        let modalId = `createBudgetItem${this.props.budgetId}`;
        let modalTitle=$t('client.budget.creat_budget_item', { budget_title: this.props.budgetTitle });

        let modalBody=(
            <ValidableInputText
              label=$t('client.budget.budget_item_title')
              inputId=`budget_item${this.props.budgetId}`
              returnInputValue={ this.retrieveTitle }
            />
            
        );
        
        return (
            <Modal
              modalId={ modalId }
              modalTitle={ modalTitle }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
            />
        );
    }
}
