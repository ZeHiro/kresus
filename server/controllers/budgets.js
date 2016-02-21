import Budget from '../models/budget';
import BudgetItem from '../models/budgetitem';
import { asyncErr, KError } from '../helpers';

import BudgetTypes from '../shared/budget-types.json';

export async function preloadBudget(req, res, next, budgetId) {
    try {
        let budget = await Budget.find(budgetId);
        if (!budget) {
            throw new KError('budget not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded.budget = budget;
        next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading budget');
    }
}

function checkBudgetType(type) {
    return BudgetTypes.indexOf(type) !== -1;
}

async function checkBudgetItemId(budgetItemsIds) {
    for (let itemId of budgetItemsIds) {
        let budgetitem = await BudgetItem.find(itemId);
        if (!budgetitem) {
            throw new KError('budgetItem not found', 404);
        }
    }
}

export async function create(req, res) {
    try {
        let newBudget = req.body;
        if (!newBudget ||
            typeof newBudget.title !== 'string' ||
            typeof newBudget.startDate !== 'string' ||
            typeof newBudget.type !== 'string' ||
            !checkBudgetType(newBudget.type)) {
            throw new KError('missing/wrong parameter', 400);
        }

        // We test each budgetitem is defined
        let budget = await Budget.create(newBudget);
        res.status(201).send(budget);
    } catch (err) {
        return asyncErr(res, err, 'when creating a budget');
    }
}

function updateField(fieldName, oldBudget, newBudget) {
    if (newBudget.hasOwnProperty(fieldName)) {
        oldBudget.title = newBudget.title;
    }
    return oldBudget;
}

export async function update(req, res) {
    try {
        let oldBudget = req.preloaded.budget;
        let newBudget = req.body;
        if (!newBudget ||
            (!newBudget.hasOwnProperty('title') &&
            !newBudget.hasOwnProperty('startDate') &&
            !newBudget.hasOwnProperty('endDate') &&
            !newBudget.hasOwnProperty('type') &&
            !newBudget.hasOwnProperty('budgetItems'))) {
            throw new KError('missing/wrong parameter', 400);
        }
        // We check the budgetType is correct
        if (newBudget.hasOwnProperty('type') &&
            checkBudgetType(newBudget.type)) {
            throw new KError('wrong type', 400);
        }
        // We check all the budgetItems exist
        if (newBudget.hasOwnProperty('budgetItemsIds')) {
            await checkBudgetItemId(newBudget.budgetItemsIds);
        }
        for (let field in newBudget) {
            oldBudget = updateField(field, oldBudget, newBudget);
        }

        await oldBudget.save();
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when updating a budget');
    }
}
