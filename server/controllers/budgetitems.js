import BudgetItem from '../models/budgetitem';
import Category from '../models/category';
import { asyncErr, KError } from '../helpers';

export async function preloadBudgetItem(req, res, next, budgetItemId) {
    try {
        let budgetItem = await BudgetItem.find(budgetItemId);
        if (!budgetItem) {
            throw new KError('budget not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded.budgetItem = budgetItem;
        next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading budgetItem');
    }
}

function isBudgetItem(item) {
    // Test if item is a budgetitem as defined in the model
    // Returns true if the type is right
    // endDate is optional
    return typeof item.title === 'string' &&
            item.hasOwnProperty('categoriesId') &&
            Array.isArray(item.categoriesId) &&
            item.categoriesId.every(catId => typeof catId === 'string') &&
            typeof item.amount === 'number';
}

async function testCategoriesOfBudgetItem(item) {
    for (let catId of item.categoriesId) {
        let category = await Category.find(catId);
        if (!category) {
            throw new KError('category not found', 404);
        }
    }
}

export async function create(req, res) {
    try {
        let newBudgetItem = req.body;
        if (!newBudgetItem ||
            !isBudgetItem(newBudgetItem)) {
            throw new KError('missing parameters', 400);
        }

        // We test each category is defined
        await testCategoriesOfBudgetItem(newBudgetItem);
        let budgetItem = await BudgetItem.create(newBudgetItem);
        res.status(201).send(budgetItem);
    } catch (err) {
        return asyncErr(res, err, 'when creating a budgetItem');
    }
}
