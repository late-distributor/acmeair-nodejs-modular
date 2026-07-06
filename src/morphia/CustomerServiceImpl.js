// com.acmeair.morphia.services.CustomerServiceImpl
import log4js from 'log4js';
import { settings } from '../../globals.js';
import getDataAccess from '../../dataaccess/dataaccess.js';

var logger = log4js.getLogger('CustomerServiceImpl');
logger.level = settings.loggerLevel;

export async function countCustomersDB() {
    const dataaccess = await getDataAccess();
    const count = await dataaccess.count(dataaccess.dbNames.customerName, {});
    return count;
};

export async function countCustomerSessionsDB() {
    const dataaccess = await getDataAccess();
    const count = await dataaccess.count(dataaccess.dbNames.customerSessionName, {});
    return count;
};

export async function getCustomer(username) {
    const dataaccess = await getDataAccess();
    return await dataaccess.findOne(dataaccess.dbNames.customerName, username);
}

export async function updateCustomer(login, customer) {
    const dataaccess = await getDataAccess();
    return await dataaccess.update(dataaccess.dbNames.customerName, customer);
}

export async function invalidateSession(sessionid) {
    const dataaccess = await getDataAccess();
    await dataaccess.remove(dataaccess.dbNames.customerSessionName, { '_id': sessionid });
}

// com.acmeair.morphia.services.CustomerServiceImpl.createCustomer (used by the loader)
export async function insertCustomer(customer) {
    logger.debug('customer to insert = ' + JSON.stringify(customer));
    const dataaccess = await getDataAccess();
    const customerInserted = await dataaccess.insertOne(dataaccess.dbNames.customerName, customer);
    logger.debug('customer inserted = ' + JSON.stringify(customerInserted));
}
