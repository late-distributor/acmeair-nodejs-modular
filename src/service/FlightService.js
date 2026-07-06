// com.acmeair.service.FlightService (abstract: flight search + cache)
import log4js from 'log4js';
import ttlLruCache from 'ttl-lru-cache';
import { settings } from '../../globals.js';
import getDataAccess from '../../dataaccess/dataaccess.js';

const flightCache = ttlLruCache({ maxLength: settings.flightDataCacheMaxSize });
const flightSegmentCache = ttlLruCache({ maxLength: settings.flightDataCacheMaxSize });
var flightDataCacheTTL = settings.flightDataCacheTTL == -1 ? null : settings.flightDataCacheTTL;

var logger = log4js.getLogger('FlightService');
logger.level = settings.loggerLevel;

export async function getFlightByAirportsAndDepartureDate(fromAirport, toAirport, flightDateYear, flightDateMonth, flightDateDate) {
    logger.debug("getFlightByAirportsAndDepartureDate " + fromAirport + " " + toAirport + " " + flightDateMonth+"/"+flightDateDate+"/"+flightDateYear);

    const flightsegment = await getFlightSegmentByOriginPortAndDestPort(fromAirport, toAirport);
    logger.debug("flightsegment = " + JSON.stringify(flightsegment));
    if (!flightsegment) {
        return [null, null];
    }

    var date = new Date(flightDateYear, flightDateMonth, flightDateDate, 0, 0, 0, 0);

    var cacheKey = flightsegment._id + "-" + date.getTime();
    if (settings.useFlightDataRelatedCaching) {
        var flights = flightCache.get(cacheKey);
        if (flights) {
            logger.debug("cache hit - flight search, key = " + cacheKey);
            return [flightsegment, (flights == "NULL" ? null : flights)];
        }
        logger.debug("cache miss - flight search, key = " + cacheKey + " flightCache size = " + flightCache.size());
    }
    var searchCriteria = { flightSegmentId: flightsegment._id, scheduledDepartureTime: date };
    const dataaccess = await getDataAccess();
    const docs = await dataaccess.findBy(dataaccess.dbNames.flightName, searchCriteria);
    ("after cache miss - key = " + cacheKey + ", docs = " + JSON.stringify(docs));

    var docsEmpty = !docs || docs.length == 0;

    if (settings.useFlightDataRelatedCaching) {
        var cacheValue = (docsEmpty ? "NULL" : docs);
        ("about to populate the cache with flights key = " + cacheKey + " with value of " + JSON.stringify(cacheValue));
        flightCache.set(cacheKey, cacheValue, flightDataCacheTTL);
        ("after cache populate with key = " + cacheKey + ", flightCacheSize = " + flightCache.size())
    }
    return [flightsegment, docs];
}

export async function getFlightSegmentByOriginPortAndDestPort(fromAirport, toAirport) {
    var segment;

    if (settings.useFlightDataRelatedCaching) {
        segment = flightSegmentCache.get(fromAirport + toAirport);
        if (segment) {
            ("cache hit - flightsegment search, key = " + fromAirport + toAirport);
            return (segment == "NULL" ? null : segment);
        }
        ("cache miss - flightsegment search, key = " + fromAirport + toAirport + ", flightSegmentCache size = " + flightSegmentCache.size());
    }
    const dataaccess = await getDataAccess();
    const docs = await dataaccess.findBy(
        dataaccess.dbNames.flightSegmentName,
        { originPort: fromAirport, destPort: toAirport });
    segment = docs[0];
    if (segment == undefined) {
        segment = null;
    }
    if (settings.useFlightDataRelatedCaching) {
        ("about to populate the cache with flightsegment key = " + fromAirport + toAirport + " with value of " + JSON.stringify(segment));
        flightSegmentCache.set(fromAirport + toAirport, (segment == null ? "NULL" : segment), flightDataCacheTTL);
        ("after cache populate with key = " + fromAirport + toAirport + ", flightSegmentCacheSize = " + flightSegmentCache.size())
    }
    return segment;
}
