// com.acmeair.service.CustomerService (abstract: validate / session lifecycle)
import { generateUUID } from './KeyGenerator.js';
import getDataAccess from '../../dataaccess/dataaccess.js';

export async function validateCustomer(username, password) {
    const dataaccess = await getDataAccess();
    const customer = await dataaccess.findOne(dataaccess.dbNames.customerName, username);
    if (customer) {
        return customer.password == password;
    }
    return false;
};

export async function createSession(customerId) {
    var now = new Date();
    var later = new Date(now.getTime() + 1000 * 60 * 60 * 24);

    var document = { "_id": generateUUID(), "customerid": customerId, "lastAccessedTime": now, "timeoutTime": later };

    const dataaccess = await getDataAccess();
    await dataaccess.insertOne(dataaccess.dbNames.customerSessionName, document);
    return document._id;
}

export async function validateSession(sessionId) {
    var now = new Date();

    const dataaccess = await getDataAccess();
    const session = await dataaccess.findOne(dataaccess.dbNames.customerSessionName, sessionId);
    if (now > session.timeoutTime) {
        await dataaccess.remove(dataaccess.dbNames.customerSessionName, { '_id': sessionId });
        return null;
    }
    else {
        return session.customerid;
    }
}
