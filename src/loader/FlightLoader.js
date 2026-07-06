// com.acmeair.loader.FlightLoader
import log4js from 'log4js';
import { parse } from 'csv-parse';
import fs from 'fs';
import { settings } from '../../globals.js';
import { generateUUID } from '../service/KeyGenerator.js';
import {
    loaderSettings, nowAtMidnight,
    airportCodeMappings, flightSegments, flights,
    airportCodeMappingTemplate, flightSegmentTemplate, flightTemplate,
    cloneObjectThroughSerialization, getDepartureTimeDaysFromDate, getArrivalTime
} from './loaderState.js';

var logger = log4js.getLogger('loader');
logger.level = settings.loggerLevel;

export async function createFlightRelatedData() {
    return new Promise((resolve, reject) => {
        var rows = new Array();
        let index = 0;

        fs.createReadStream('./loader/mileage.csv')
            .pipe(parse({
                delimiter: ',',
                from_line: 1,
                relax_column_count: true
            }))
            .on('data', (row) => {
                rows.push(row);
                logger.debug('#' + index + ' ' + JSON.stringify(row));
                index++;
            })
            .on('end', () => {
                logger.debug('rows.length = ' + rows.length);
                logger.debug('rows = ' + rows);
                for (var ii = 0; ii < rows[0].length; ii++) {
                    var airportCodeMapping = cloneObjectThroughSerialization(airportCodeMappingTemplate);
                    airportCodeMapping._id = rows[1][ii];
                    airportCodeMapping.airportName = rows[0][ii];
                    airportCodeMappings.push(airportCodeMapping);
                    logger.debug("Pushed to airportCodeMappings: " + JSON.stringify(airportCodeMapping));
                }

                var flightSegmentId = 0;
                // actual mileages start on the third (2) row
                for (var ii = 2; ii < rows.length; ii++) {
                    var fromAirportCode = rows[ii][1];
                    // format of the row is "long airport name name" (0), "airport code" (1), mileage to first airport in rows 0/1 (2), mileage to second airport in rows 0/1 (3), ... mileage to last airport in rows 0/1 (length)
                    for (var jj = 2; jj < rows[ii].length; jj++) {
                        const toAirportCode = rows[1][jj - 2];
                        const mileage = rows[ii][jj];
                        if (mileage != 'NA') {
                            var flightSegment = cloneObjectThroughSerialization(flightSegmentTemplate);
                            flightSegment._id = 'AA' + flightSegmentId++;
                            flightSegment.originPort = fromAirportCode;
                            flightSegment.destPort = toAirportCode;
                            flightSegment.miles = mileage;
                            flightSegments.push(flightSegment);

                            for (var kk = 0; kk < loaderSettings.MAX_DAYS_TO_SCHEDULE_FLIGHTS; kk++) {
                                for (var ll = 0; ll < loaderSettings.MAX_FLIGHTS_PER_DAY; ll++) {
                                    var flight = cloneObjectThroughSerialization(flightTemplate);
                                    flight._id = generateUUID();
                                    flight.flightSegmentId = flightSegment._id;
                                    // Not using random data to match Java behavior
                                    flight.scheduledDepartureTime = getDepartureTimeDaysFromDate(nowAtMidnight, kk);
                                    flight.scheduledArrivalTime = getArrivalTime(flight.scheduledDepartureTime, mileage);
                                    flights.push(flight);
                                }
                            }
                        }
                    }
                }
                resolve();
            })
            .on('error', (err) => {
                logger.error("Error reading CSV: " + err.message);
                reject(err);
            });
    });
}
