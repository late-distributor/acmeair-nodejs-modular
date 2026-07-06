// com.acmeair.morphia.services.FlightServiceImpl
import log4js from 'log4js';
import { settings } from '../../globals.js';
import getDataAccess from '../../dataaccess/dataaccess.js';

var logger = log4js.getLogger('FlightServiceImpl');
logger.level = settings.loggerLevel;

export async function countFlightsDB() {
    const dataaccess = await getDataAccess();
    const count = await dataaccess.count(dataaccess.dbNames.flightName, {});
    return count;
};

export async function countFlightSegmentsDB() {
    const dataaccess = await getDataAccess();
    const count = await dataaccess.count(dataaccess.dbNames.flightSegmentName, {});
    return count;
};

export async function countAirportsDB() {
    const dataaccess = await getDataAccess();
    const count = await dataaccess.count(dataaccess.dbNames.airportCodeMappingName, {});
    return count;
};

// storeAirportMapping / storeFlightSegment / createNewFlight (used by the loader)
export async function insertAirportCodeMapping(airportCodeMapping) {
    const dataaccess = await getDataAccess();
    const airportCodeMappingInserted = await dataaccess.insertOne(dataaccess.dbNames.airportCodeMappingName, airportCodeMapping);
    logger.debug('airportCodeMapping inserted = ' + JSON.stringify(airportCodeMappingInserted));
}

export async function insertFlightSegment(flightSegment) {
    const dataaccess = await getDataAccess();
    const flightSegmentInserted = await dataaccess.insertOne(dataaccess.dbNames.flightSegmentName, flightSegment);
    logger.debug('flightSegment inserted = ' + JSON.stringify(flightSegmentInserted));
}

export async function insertFlight(flight) {
    const dataaccess = await getDataAccess();
    const flightInserted = await dataaccess.insertOne(dataaccess.dbNames.flightName, flight);
    logger.debug('flight inserted = ' + JSON.stringify(flightInserted));
}
