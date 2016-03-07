import { has, translate as $t } from '../../helpers';

import { store } from '../../store';

import DatePicker from '../ui/date-picker';

export default class SearchComponent extends React.Component {
    constructor(props) {
        has(props, 'searchObject');
        has(props, 'updateSearchObject');
        super(props);
        this.state = {
            showDetails: false
        };

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

    handleToggleDetails() {
        this.setState({
            showDetails: !this.state.showDetails
        });
    }

    handleClearSearch(close, event) {
        this.setState({ showDetails: !close }, this.props.updateSearchObject({}));
        this.ref('searchForm').reset();

        event.preventDefault();
    }

    ref(name) {
        has(this.refs, name);
        return this.refs[name].getDOMNode();
    }

    handleSyncKeyword(e) {
        let keywords = e.target.value.split(' ').map(w => w.toLowerCase());
        let searchObject = this.props.searchObject;
        searchObject.keywords = keywords;
        this.props.updateSearchObject(searchObject);
    }

    updateSearchObjectUnique(field, event) {
        let value = event.target.value;
        let searchObject = this.props.searchObject;
        searchObject[field] = value;
        this.props.updateSearchObject(searchObject);
    }

    updateSearchObjectDate(field, value) {
        let searchObject = this.props.searchObject;
        searchObject[field] = value;
        this.props.updateSearchObject(searchObject);
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
                          defaultValue={ this.props.searchObject.keywords ?
                            this.props.searchObject.keywords.join(' ') : '' }
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
                                  defaultValue={ this.props.searchObject.category || '' }
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
                                  defaultValue={ this.props.searchObject.type || '' }
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
                                  defaultValue={ this.props.searchObject.amountLow || '' }
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
                                  defaultValue={ this.props.searchObject.amountHigh || '' }
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
                                  maxDate={ this.props.searchObject.dateHigh || '' }
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
                                  minDate={ this.props.searchObject.dateLow || '' }
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
