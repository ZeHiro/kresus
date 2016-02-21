import { has, translate as $t } from '../../helpers';

import CreateBudget from './create-budget';
import BudgetList from './budget-list';
export default class Budget extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.budget.title') }
                        </h3>
                    </div>
                    <div className="panel-body">
                        <CreateBudget/>
                    </div>
                </div>
                <BudgetList/>
            </div>
        );
    }
}
