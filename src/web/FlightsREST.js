// com.acmeair.web.FlightsREST
import log4js from 'log4js';
import { settings } from '../../globals.js';
import { getFlightByAirportsAndDepartureDate } from '../service/FlightService.js';

var logger = log4js.getLogger('FlightsREST');
logger.level = settings.loggerLevel;

export async function queryflightsRest(params) {
    logger.debug('querying flights');

    var fromAirport = params.fromAirport;
    var toAirport = params.toAirport;
    var fromDateWeb = new Date(params.fromDate);
    var fromDate = new Date(fromDateWeb.getFullYear(), fromDateWeb.getMonth(), fromDateWeb.getDate()); // convert date to local timezone
    var oneWay = (params.oneWay == 'true');
    var returnDateWeb = new Date(params.returnDate);
    var returnDate;
    if (!oneWay) {
        returnDate = new Date(returnDateWeb.getFullYear(), returnDateWeb.getMonth(), returnDateWeb.getDate()); // convert date to local timezone
    }

    let [flightSegmentOutbound, flightsOutbound] = await getFlightByAirportsAndDepartureDate(fromAirport, toAirport, fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    logger.debug('flightsOutbound = ' + JSON.stringify(flightsOutbound));
    if (flightsOutbound) {
        for (let ii = 0; ii < flightsOutbound.length; ii++) {
            flightsOutbound[ii].flightSegment = flightSegmentOutbound;
        }
    }
    else {
        flightsOutbound = [];
    }
    if (!oneWay) {
        let [flightSegmentReturn, flightsReturn] = await getFlightByAirportsAndDepartureDate(toAirport, fromAirport, returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());
        logger.debug('flightsReturn = ' + JSON.stringify(flightsReturn));
        if (flightsReturn) {
            for (let ii = 0; ii < flightsReturn.length; ii++) {
                flightsReturn[ii].flightSegment = flightSegmentReturn;
            }
        }
        else {
            flightsReturn = [];
        }
        var options = {
            "tripFlights":
                [
                    { "numPages": 1, "flightsOptions": flightsOutbound, "currentPage": 0, "hasMoreOptions": false, "pageSize": 10 },
                    { "numPages": 1, "flightsOptions": flightsReturn, "currentPage": 0, "hasMoreOptions": false, "pageSize": 10 }
                ], "tripLegs": 2
        };
        return { options: options };
    }
    else {
        var options = {
            "tripFlights":
                [
                    { "numPages": 1, "flightsOptions": flightsOutbound, "currentPage": 0, "hasMoreOptions": false, "pageSize": 10 }
                ], "tripLegs": 1
        };
        return { options: options };
    }
}

export async function queryflights(req, res) {
    var result = await queryflightsRest({
        fromAirport: req.body.fromAirport,
        toAirport: req.body.toAirport,
        fromDate: req.body.fromDate,
        oneWay: req.body.oneWay,
        returnDate: req.body.returnDate
    });
    res.send(result.options);
};
