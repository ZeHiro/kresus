import { maybeHas } from '../helpers';

export default function filter(operation, searchObject) {
    /*
    This function aims to be used as a filter function.
    operation : an instance of Operation class. 
    searchObject : the 'filter object' containing the parameters to compare 
    the operation to.
        fields of searchObject: 
            category: id of the category the operation must have
            type: id of the operation type the operation must have
            amountHigh: maximum value of the amount of the operation
            amountLow: minimum value of the amount of the operation
            lowDate: minimum value of the date of the operation
            highDate: maximum value of the date of the operation
            keywords: array of strings to be contained in the label, raw label 
            or customLabel of the operation.
    returns true if the operation matches all the criteria contained in searchObject.
    returns false if at least one of the criteria is not matched.
    */

    function contains(where, substring) {
        return where.toLowerCase().indexOf(substring) !== -1;
    }

    if (maybeHas(searchObject, 'category') && searchObject.category  && operation.categoryId !== searchObject.category) {
        return false;
    }

    if (maybeHas(searchObject, 'type') && searchObject.type  && operation.operationTypeID !== searchObject.type) {
        return false;
    }

    if (maybeHas(searchObject, 'amountHigh') && searchObject.amountHigh && operation.amount > searchObject.amountHigh) {
        return false;
    }

    if (maybeHas(searchObject, 'amountLow') && searchObject.amountLow && operation.amount < searchObject.amountLow) {
        return false;
    }

    if (maybeHas(searchObject, 'lowDate') && searchObject.lowDate && new Date(operation.date) < new Date(searchObject.lowDate)) {
        return false;
    }

    if (maybeHas(searchObject, 'highDate') && searchObject.highDate && new Date(operation.date) > new Date(searchObject.highDate)) {
        return false;
    }

    if (maybeHas(searchObject, 'keywords') && searchObject.keywords) {
        for (let keyword of searchObject.keywords) {
            if (!contains(operation.raw, keyword) &&
                !contains(operation.title, keyword) &&
                (operation.customLabel === null || !contains(operation.customLabel, keyword))) {
                return false;
            }
        }
    }

    return true;
}
