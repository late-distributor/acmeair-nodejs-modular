// com.acmeair.morphia.services.BookingServiceImpl
import log4js from 'log4js';
import { settings } from '../../globals.js';
import { generateUUID } from '../service/KeyGenerator.js';
import getDataAccess from '../../dataaccess/dataaccess.js';

var logger = log4js.getLogger('BookingServiceImpl');
logger.level = settings.loggerLevel;

export async function countBookingsDB() {
    const dataaccess = await getDataAccess();
    const count = await dataaccess.count(dataaccess.dbNames.bookingName, {});
    return count;
};

export async function getBookingsByUser(username) {
    const dataaccess = await getDataAccess();
    return await dataaccess.findBy(dataaccess.dbNames.bookingName, { 'customerId': username });
}

export async function bookFlight(flightId, userid) {

    var now = new Date();
    var docId = generateUUID();

    var document = { "_id": docId, "customerId": userid, "flightId": flightId, "dateOfBooking": now };

    const dataaccess = await getDataAccess();
    await dataaccess.insertOne(dataaccess.dbNames.bookingName, document);
    return docId;
}

export async function cancelBookingInDB(bookingid, userid) {
    const dataaccess = await getDataAccess();
    await dataaccess.remove(dataaccess.dbNames.bookingName, { '_id': bookingid, 'customerId': userid })
}
