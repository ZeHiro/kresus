import moment from 'moment';
import http from 'http';

import Category from '../models/category';
import Operation from '../models/operation';
import OperationType from '../models/operationtype';

import { KError, asyncErr } from '../helpers';

async function preload(varName, req, res, next, operationID) {
    try {
        let operation = await Operation.find(operationID);
        if (!operation) {
            throw new KError('bank operation not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded[varName] = operation;
        next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading an operation');
    }
}

export function preloadOperation(req, res, next, operationID) {
    preload('operation', req, res, next, operationID);
}

export function preloadOtherOperation(req, res, next, otherOperationID) {
    preload('otherOperation', req, res, next, otherOperationID);
}

export async function update(req, res) {
    try {
        let attr = req.body;

        // We can only update the category id, operation type or custom label
        // of an operation.
        if (typeof attr.categoryId === 'undefined' &&
            typeof attr.operationTypeID === 'undefined' &&
            typeof attr.customLabel === 'undefined') {
            throw new KError('Missing parameter', 400);
        }

        if (typeof attr.categoryId !== 'undefined') {
            if (attr.categoryId === '') {
                delete req.preloaded.operation.categoryId;
            } else {
                let newCategory = await Category.find(attr.categoryId);
                if (!newCategory) {
                    throw new KError('Category not found', 404);
                } else {
                    req.preloaded.operation.categoryId = attr.categoryId;
                }
            }
        }

        if (typeof attr.operationTypeID !== 'undefined') {
            let newType = await OperationType.find(attr.operationTypeID);
            if (!newType) {
                throw new KError('Type not found', 404);
            } else {
                req.preloaded.operation.operationTypeID = attr.operationTypeID;
            }
        }

        if (typeof attr.customLabel !== 'undefined') {
            if (attr.customLabel === '') {
                delete req.preloaded.operation.customLabel;
            } else {
                req.preloaded.operation.customLabel = attr.customLabel;
            }
        }

        await req.preloaded.operation.save();
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when upadting attributes of operation');
    }
}

export async function merge(req, res) {
    try {
        // @operation is the one to keep, @otherOperation is the one to delete.
        let otherOp = req.preloaded.otherOperation;
        let op = req.preloaded.operation;

        // Transfer various fields upon deletion
        let needsSave = op.mergeWith(otherOp);

        if (needsSave) {
            op = await op.save();
        }
        await otherOp.destroy();
        res.status(200).send(op);
    } catch (err) {
        return asyncErr(res, err, 'when merging two operations');
    }
}


export async function file(req, res) {
    try {
        let operationId  = req.preloaded.operation.id;
        let binaryPath = `/data/${operationId}/binaries/file`;

        let id = process.env.NAME;
        let pwd = process.env.TOKEN;
        let basic = `${id}:${pwd}`;
        basic = `Basic ${new Buffer(basic).toString('base64')}`;

        let options = {
            host: 'localhost',
            port: 9101,
            path: binaryPath,
            headers: {
                Authorization: basic
            }
        };

        let operation = await Operation.find(operationId);
        let request = http.get(options, stream => {
            if (stream.statusCode === 200) {
                let fileMime = operation.binary.fileMime || 'application/pdf';
                res.set('Content-Type', fileMime);
                res.on('close', request.abort.bind(request));
                stream.pipe(res);
            } else if (stream.statusCode === 404) {
                throw new KError('File not found', 404);
            } else {
                throw new KError('Unknown error', stream.statusCode);
            }
        });
    } catch (err) {
        return asyncErr(res, err, "when getting an operation's attachment");
    }
}

// Create a new operation
export async function create(req, res) {
    try {
        let operation = req.body;
        if (!Operation.isOperation(operation)) {
            throw new KError('Not an operation', 400);
        }
        // We fill the missing fields
        operation.raw = operation.title;
        operation.dateImport = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');
        operation.createdByUser = true;
        let op = await Operation.create(operation);
        res.status(201).send(op);
    } catch (err) {
        return asyncErr(res, err, 'when creating operation for a bank account');
    }
}

// Split an operation into sub operations
export async function split(req, res) {
    let createdOperations = [];
    try {
        // This should be a table
        let suboperations = req.body;
        let operation = req.preloaded.operation;
        console.log(suboperations);
        if (suboperations && suboperations.length > 0) {
            let now = moment().format('YYYY-MM-DDTHH:mm:ss.000Z');
            for (let suboperation of suboperations) {
                console.log(suboperation);
                if ( !suboperation.hasOwnProperty('amount') ||
                    !suboperation.hasOwnProperty('title')) {
                    throw new KError('Not an operation', 400);
                }
                suboperation.operationTypeID = operation.operationTypeID;
                suboperation.bankAccount = operation.bankAccount;
                suboperation.raw = suboperation.title;
                suboperation.dateImport = now;
                suboperation.createdByUser = true;
                console.log(suboperation);
                let op = await Operation.create(suboperation);
                createdOperations.push(op);
            }
            let opIds = createdOperations.map(oper => oper.id);
            console.log(opIds);
            operation.subOperationIds = operation.subOperationIds.concat(opIds) ||
                                      opIds;
            await operation.save();
            res.status(201).send(createdOperations);
        } else {
            throw new KError('Wrong request format', 400);
        }
    } catch (err) {
        // We delete the operations we just created.
        console.log(createdOperations);
        for (let opToDelete of createdOperations) {
            await opToDelete.destroy();
        }
        return asyncErr(res, err, 'when splitting an operation');
    }
}
