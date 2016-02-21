import { store, State } from '../../store';

import Budget from './item';

export default class BudgetList extends React.Component {
    constructor(props) {
        super(props);
        this.listener = this.listener.bind(this);
    }

    listener() {
        this.render();
    }

    componentDidMount() {
        store.on(State.budgets, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.budgets, this.listener);
    }

    render() {
        let budgets = store.getBudgets().map(budget =>
            <Budget budget={ budget } key={ budget.id }/>
        );
        return (
            <div>
                { budgets };
            </div>
        );
    }
}
