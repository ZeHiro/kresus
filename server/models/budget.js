import * as americano from 'cozydb';
import { promisifyModel } from '../helpers';

let Budget = americano.getModel('budget', {
    title: String,
    startDate: Date,
    endDate: Date,
    // Budget Type can be :
    // unique, weekly, monthly or yearly
    type: String,
    budgetItems: [
        String
    ]
});

Budget = promisifyModel(Budget);

module.exports = Budget;
