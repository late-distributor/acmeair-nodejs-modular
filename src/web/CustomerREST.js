// com.acmeair.web.CustomerREST
import log4js from 'log4js';
import { settings } from '../../globals.js';
import { getCustomer, updateCustomer } from '../morphia/CustomerServiceImpl.js';

var logger = log4js.getLogger('CustomerREST');
logger.level = settings.loggerLevel;

export async function getCustomerByIdRest(params) {
    logger.debug('getting customer by user ' + params.user);

    try {
        const customer = await getCustomer(params.user);
        return { customer: customer };
    } catch (err) {
        return { status: 500 };
    }
};

export async function getCustomerById(req, res) {
    var result = await getCustomerByIdRest({ user: req.params.user });
    if (result.status) {
        res.sendStatus(result.status);
        return;
    }
    res.send(result.customer);
};

export async function putCustomerByIdRest(params) {
    logger.debug('putting customer by user ' + params.user);

    try {
        const customer = await updateCustomer(params.user, params.body);
        return { customer: customer };
    } catch (err) {
        return { status: 500 };
    }
};

export async function putCustomerById(req, res) {
    var result = await putCustomerByIdRest({ user: req.params.user, body: req.body });
    if (result.status) {
        res.sendStatus(result.status);
        return;
    }
    res.send(result.customer);
};
