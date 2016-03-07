import { maybeHas, translate as $t } from '../../helpers';
import { store, State } from '../../store';
import filter from '../../../shared/lib/filter_operation';

import { AmountWell, FilteredAmountWell } from './amount-well';
import SearchComponent from './search';
import Operation from './operation';
import SyncButton from './sync-button';

// Number of elements
const SHOW_ITEMS_INITIAL = 30;
// Number of elements
const SHOW_ITEMS_MORE = 50;
// Number of ms
const SHOW_ITEMS_TIMEOUT = 300;

// Filter functions used in amount wells.
function noFilter() {
    return true;
}
function isPositive(op) {
    return op.amount > 0;
}
function isNegative(op) {
    return op.amount < 0;
}

export default class OperationsComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchObject: {},
            lastItemShown: SHOW_ITEMS_INITIAL
        };
        this.showMoreTimer = null;
        this.listener = this._listener.bind(this);
        this.updateSearchObject = this.updateSearchObject.bind(this);
    }

    _listener() {
        this.setState({
            lastItemShown: SHOW_ITEMS_INITIAL
        });
    }

    updateSearchObject(searchObject) {
        this.setState({ searchObject });
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
        store.on(State.accounts, this.listener);
        store.on(State.operations, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.operations, this.listener);
        store.removeListener(State.accounts, this.listener);

        if (this.showMoreTimer) {
            clearTimeout(this.showMoreTimer);
            this.showMoreTimer = null;
        }
    }

    render() {
        let currentAccount = store.getCurrentAccount();
        let operations = store.getCurrentOperations();
        let filteredOperations = operations.filter(op => filter(op, this.state.searchObject));
        let hasFilteredOperations = filteredOperations.length < operations.length;

        let ops = filteredOperations
                    .filter((op, i) => i <= this.state.lastItemShown)
                    .map(o => <Operation key={ o.id } operation={ o } />);

        let maybeShowMore = () => {

            if (this.showMoreTimer) {
                clearTimeout(this.showMoreTimer);
            }

            this.showMoreTimer = setTimeout(() => {
                let newLastItemShown = Math.min(this.state.lastItemShown + SHOW_ITEMS_MORE,
                                                filteredOperations.length);
                if (newLastItemShown > this.state.lastItemShown) {
                    this.setState({
                        lastItemShown: newLastItemShown
                    }, maybeShowMore);
                }
            }, SHOW_ITEMS_TIMEOUT);
        };

        maybeShowMore();

        let asOf = $t('client.operations.as_of');
        let lastCheckedDate = new Date(currentAccount.lastChecked).toLocaleDateString();
        let lastCheckDate = `${asOf} ${lastCheckedDate}`;

        return (
            <div>
                <div className="row operation-wells">

                    <AmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-lightblue"
                      icon="balance-scale"
                      title={ $t('client.operations.current_balance') }
                      subtitle={ lastCheckDate }
                      operations={ operations }
                      initialAmount={ currentAccount.initialAmount }
                      filterFunction={ noFilter }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-green"
                      icon="arrow-down"
                      title={ $t('client.operations.received') }
                      hasFilteredOperations={ hasFilteredOperations }
                      operations={ operations }
                      filteredOperations={ filteredOperations }
                      initialAmount={ 0 }
                      filterFunction={ isPositive }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-orange"
                      icon="arrow-up"
                      title={ $t('client.operations.spent') }
                      hasFilteredOperations={ hasFilteredOperations }
                      operations={ operations }
                      filteredOperations={ filteredOperations }
                      initialAmount={ 0 }
                      filterFunction={ isNegative }
                    />

                    <FilteredAmountWell
                      size="col-xs-12 col-md-3"
                      backgroundColor="background-darkblue"
                      icon="database"
                      title={ $t('client.operations.saved') }
                      hasFilteredOperations={ hasFilteredOperations }
                      operations={ operations }
                      filteredOperations={ filteredOperations }
                      initialAmount={ 0 }
                      filterFunction={ noFilter }
                    />
                </div>

                <div className="operation-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.operations.title') }
                        </h3>
                        <SyncButton account={ currentAccount } />
                    </div>

                    <div className="panel-body">
                        <SearchComponent
                          updateSearchObject = { this.updateSearchObject }
                          searchObject = { this.state.searchObject }
                          ref="search"
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="col-sm-1">
                                        { $t('client.operations.column_date') }
                                    </th>
                                    <th className="col-sm-2">
                                        { $t('client.operations.column_type') }
                                    </th>
                                    <th className="col-sm-6">
                                        { $t('client.operations.column_name') }
                                    </th>
                                    <th className="col-sm-1">
                                        { $t('client.operations.column_amount') }
                                    </th>
                                    <th className="col-sm-2">
                                        { $t('client.operations.column_category') }
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                { ops }
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        );
    }
}
