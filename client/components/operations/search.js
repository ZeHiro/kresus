import { has, translate as $t } from '../../helpers';
import { store } from '../../store';
import filter from '../../../shared/lib/filter_operation';

import DatePicker from '../ui/date-picker';

export default class SearchComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState();
        this.handleToggleDetails = this.handleToggleDetails.bind(this);

        this.handleSyncAmountHigh = this.updateSearchObjectUnique.bind(this, 'amountHigh');
        this.handleSyncAmountLow = this.updateSearchObjectUnique.bind(this, 'amountLow');
        this.handleChangeLowDate = this.updateSearchObjectDate.bind(this, 'lowDate');
        this.handleChangeHighDate = this.updateSearchObjectDate.bind(this, 'highDate');
        this.handleSyncKeyword = this.handleSyncKeyword.bind(this);
        this.handleSyncType = this.updateSearchObjectUnique.bind(this, 'type');
        this.handleSyncCategory = this.updateSearchObjectUnique.bind(this, 'category');

        this.handleClearSearchNoClose = this.handleClearSearch.bind(this, false);
        this.handleClearSearchAndClose = this.handleClearSearch.bind(this, true);
    }

    handleSyncKeyword(event) {
        let keywords = event.target.value.split(' ').map(w => w.toLowerCase());
        this.setState({ keywords: keywords }, this.filter);
        event.preventDefault();
    }

    updateSearchObjectUnique(field, event) {
        let value = event.target.value;
        let searchObject = {};
        searchObject[field] = value;
        this.setState(searchObject, this.filter);
        event.preventDefault();
    }

    updateSearchObjectDate(field, value) {
        let searchObject = {};
        searchObject[field] = value;
        this.setState(searchObject, this.filter);
    }

    initialState() {
        return {
            showDetails: false,

            keywords: [],
            category: '',
            type: '',
            amountLow: '',
            amountHigh: '',
            dateLow: null,
            dateHigh: null
        };
    }

    filterOperation(operation) {
        filter(operation, this.state);
    }

    handleClearSearch(close, event) {
        let initialState = this.initialState();
        initialState.showDetails = !close;
        this.setState(initialState, this.filter);
        this.ref('searchForm').reset();

        event.preventDefault();
    }

    handleToggleDetails() {
        this.setState({
            showDetails: !this.state.showDetails
        });
    }

    componentDidMount() {
        // Force search with empty query, to show all operations
        this.filter();
    }

    ref(name) {
        has(this.refs, name);
        return this.refs[name].getDOMNode();
    }

    filter() {
        this.props.setFilteredOperations(this.props.operations.filter(op => filter(op, this.state)));
    }

    render() {
        let details;
        if (!this.state.showDetails) {
            details = <div className="transition-expand" />;
        } else {
            let catOptions = [
                <option key="_" value="">
                    { $t('client.search.any_category') }
                </option>
            ].concat(
                store.getCategories().map(
                    c => <option key={ c.id } value={ c.id }>{ c.title }</option>
                )
            );

            let typeOptions = [
                <option key="_" value="">
                    { $t('client.search.any_type') }
                </option>
            ].concat(
                store.getOperationTypes()
                     .map(type =>
                         <option key={ type.id } value={ type.id }>
                             { store.operationTypeToLabel(type.id) }
                         </option>
                     )
            );

            details = (
                <form className="panel-body transition-expand" ref="searchForm">

                    <div className="form-group">
                        <label htmlFor="keywords">
                            { $t('client.search.keywords') }
                        </label>
                        <input type="text" className="form-control"
                          onKeyUp={ this.handleSyncKeyword }
                          defaultValue={ this.state.keywords.join(' ') }
                          id="keywords" ref="keywords"
                        />
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-2">
                                <label htmlFor="category-selector">
                                    { $t('client.search.category') }
                                </label>
                            </div>
                            <div className="col-xs-5">
                                <select className="form-control" id="category-selector"
                                  onChange={ this.handleSyncCategory }
                                  defaultValue={ this.state.category }
                                  ref="cat">
                                    { catOptions }
                                </select>
                            </div>
                            <div className="col-xs-1">
                                <label htmlFor="type-selector">
                                    { $t('client.search.type') }
                                </label>
                            </div>
                            <div className="col-xs-4">
                                <select className="form-control" id="type-selector"
                                  onChange={ this.handleSyncType }
                                  defaultValue={ this.state.type }
                                  ref="type">
                                    { typeOptions }
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-2">
                                <label className="control-label" htmlFor="amount-low">
                                    { $t('client.search.amount_low') }
                                </label>
                            </div>
                            <div className="col-xs-5">
                                <input type="number" className="form-control"
                                  onChange={ this.handleSyncAmountLow }
                                  defaultValue={ this.state.amountLow }
                                  id="amount-low"ref="amount_low"
                                />
                            </div>
                            <div className="col-xs-1">
                                <label className="control-label" htmlFor="amount-high">
                                    { $t('client.search.and') }
                                </label>
                            </div>
                            <div className="col-xs-4">
                                <input type="number" className="form-control"
                                  onChange={ this.handleSyncAmountHigh }
                                  defaultValue={ this.state.amountHigh }
                                  id="amount-high" ref="amount_high"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-horizontal">
                        <div className="form-group">
                            <div className="col-xs-2">
                                <label className="control-label" htmlFor="date-low">
                                    { $t('client.search.date_low') }
                                </label>
                            </div>
                            <div className="col-xs-5">
                                <DatePicker
                                  ref="date_low"
                                  id="date-low"
                                  key="date-low"
                                  onSelect={ this.handleChangeLowDate }
                                  maxDate={ this.state.dateHigh }
                                />
                            </div>
                            <div className="col-xs-1">
                                <label className="control-label" htmlFor="date-high">
                                    { $t('client.search.and') }
                                </label>
                            </div>
                            <div className="col-xs-4">
                                <DatePicker
                                  ref="date_high"
                                  id="date-high"
                                  key="date-high"
                                  onSelect={ this.handleChangeHighDate }
                                  minDate={ this.state.dateLow }
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button className="btn btn-warning pull-left" type="button"
                          onClick={ this.handleClearSearchAndClose }>
                            { $t('client.search.clearAndClose') }
                        </button>
                        <button className="btn btn-warning pull-right" type="button"
                          onClick={ this.handleClearSearchNoClose }>
                            { $t('client.search.clear') }
                        </button>
                    </div>

                </form>
            );
        }

        return (
            <div className="panel panel-default">
                <div className="panel-heading clickable" onClick={ this.handleToggleDetails }>
                    <h5 className="panel-title">
                        { $t('client.search.title') }
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
