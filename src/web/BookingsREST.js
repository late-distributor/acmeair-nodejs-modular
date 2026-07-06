// com.acmeair.web.BookingsREST
import log4js from 'log4js';
import { settings } from '../../globals.js';
import { bookFlight, cancelBookingInDB, getBookingsByUser } from '../morphia/BookingServiceImpl.js';

var logger = log4js.getLogger('BookingsREST');
logger.level = settings.loggerLevel;

export async function bookflightsRest(params) {
    logger.debug('booking flights');

    var userid = params.userid;
    var toFlight = params.toFlightId;
    var retFlight = params.retFlightId;
    var oneWay = (params.oneWayFlight == 'true');

    logger.debug("toFlight:" + toFlight + ",retFlight:" + retFlight);

    const toBookingId = await bookFlight(toFlight, userid);

    if (!oneWay) {
        const retBookingId = await bookFlight(retFlight, userid);
        var bookingInfo = { "oneWay": false, "returnBookingId": retBookingId, "departBookingId": toBookingId };
        return bookingInfo;
    } else {
        var bookingInfo = { "oneWay": true, "departBookingId": toBookingId };
        return bookingInfo;
    }
};

export async function bookflights(req, res) {
    var result = await bookflightsRest({
        userid: req.body.userid,
        toFlightId: req.body.toFlightId,
        retFlightId: req.body.retFlightId,
        oneWayFlight: req.body.oneWayFlight
    });
    res.header('Cache-Control', 'no-cache');
    res.send(result);
};

export async function cancelBookingRest(params) {
    logger.debug('canceling booking');

    var number = params.number;
    var userid = params.userid;

    try {
        await cancelBookingInDB(number, userid);
        return { 'status': 'success' };
    } catch (error) {
        return { 'status': 'error' };
    }
};

export async function cancelBooking(req, res) {
    var result = await cancelBookingRest({
        number: req.body.number,
        userid: req.body.userid
    });
    res.send(result);
};

export async function bookingsByUserRest(params) {
    logger.debug('listing booked flights by user ' + params.user);

    try {
        const bookings = await getBookingsByUser(params.user);
        return { bookings: bookings };
    } catch (err) {
        return { status: 500 };
    }
};

export async function bookingsByUser(req, res) {
    var result = await bookingsByUserRest({ user: req.params.user });
    if (result.status) {
        res.sendStatus(result.status);
        return;
    }
    res.send(result.bookings);
}
