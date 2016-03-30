import { maybeHas, translate as $t } from '../../helpers';

export default class DatePicker extends React.Component {

    constructor(props) {
        super(props);
        this.pickadate = null;
    }

    componentDidMount() {
        let pickerOptions = this.generateLocalizationObject();
        pickerOptions = this.setMaxOrMin(pickerOptions, this.props);
        let input = this.refs.elem.getDOMNode();
        this.pickadate = $(input).pickadate(pickerOptions).pickadate('picker');
        // Set a default view and select
        if (maybeHas(this.props, 'defaultDate')) {
            this.pickadate.set('view', new Date(this.props.defaultDate));
            this.pickadate.set('select', new Date(this.props.defaultDate));
        } else {
            this.pickadate.set('view', new Date());
            this.pickadate.set('select', new Date());
        }
        this.pickadate.on('set', value => {
            if (maybeHas(value, 'clear') && this.props.onSelect) {
                this.props.onSelect(null);
            } else if (maybeHas(value, 'select')) {
                let actualDate = new Date(value.select);

                // pickadate returns UTC time, fix the timezone offset.
                actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());

                if (this.props.onSelect)
                    this.props.onSelect(+actualDate);
            }
        });
    }

    setMaxOrMin(pickerOptions, props) {
        // Maybe a minimum or maximum value is set
        pickerOptions.max = props.maxDate ? new Date(props.maxDate) : false;
        pickerOptions.min = props.minDate ? new Date(props.minDate) : false;
        return pickerOptions;
    }

    componentWillReceiveProps(newProps) {
        let pickerOptions = this.setMaxOrMin({}, newProps);
        this.pickadate.set(pickerOptions);
    }

    localizationTable(prefix, tableToLocalize) {
        return tableToLocalize.map(element => $t(`client.datepicker.${prefix}.${element}`));
    }

    generateLocalizationObject() {
        let monthTable = [
            'january',
            'february',
            'march',
            'april',
            'may',
            'june',
            'july',
            'august',
            'september',
            'october',
            'november',
            'december'
        ];
        let weekdaysTable = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];
        return {
            monthsFull: this.localizationTable('monthsFull', monthTable),
            monthsShort: this.localizationTable('monthsShort', monthTable),
            weekdaysFull: this.localizationTable('weekdaysFull', weekdaysTable),
            weekdaysShort: this.localizationTable('weekdaysShort', weekdaysTable),
            today: $t('client.datepicker.today'),
            clear: $t('client.datepicker.clear'),
            close: $t('client.datepicker.close'),
            firstDay: $t('client.datepicker.firstDay'),
            format: $t('client.datepicker.format'),
            formatSubmit: $t('client.datepicker.formatSubmit'),
            labelMonthNext: $t('client.datepicker.labelMonthNext'),
            labelMonthSelect: $t('client.datepicker.labelMonthSelect'),
            labelYearSelect: $t('client.datepicker.labelYearSelect')
        };
    }

    clear() {
        this.pickadate.clear();
    }

    render() {
        let placeholder= maybeHas(this.props, 'placeholder') ? this.props.placeholder : '';
        let defaultDate;
        if(maybeHas(this.props, 'defaultDate')) {
            defaultDate = new Date(this.props.defaultDate);
            defaultDate = `${defaultDate.getFullYear()}-0${defaultDate.getMonth()}-0${defaultDate.getDate()}`;
        } else {
            defaultDate = undefined;
        }
        return (
            <input className="form-control" type="date" ref="elem"
               placeholder={ placeholder } data-value={ defaultDate }/>
        );
    }

}
