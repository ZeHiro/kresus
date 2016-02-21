import * as americano from 'cozydb';
import { promisifyModel } from '../helpers';

let BudgetItem = americano.getModel('budgetitem', {
    title: String,
    categoriesId: [String],
    amount: Number
});

BudgetItem = promisifyModel(BudgetItem);

module.exports = BudgetItem;
