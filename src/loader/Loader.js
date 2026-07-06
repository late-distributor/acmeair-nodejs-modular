// com.acmeair.loader.Loader
import log4js from 'log4js';
import { settings } from '../../globals.js';
import {
    loaderSettings,
    customers, airportCodeMappings, flightSegments, flights,
    customerQueue, flightQueue
} from './loaderState.js';
import { createCustomers } from './CustomerLoader.js';
import { createFlightRelatedData } from './FlightLoader.js';

var logger = log4js.getLogger('loader');
logger.level = settings.loggerLevel;

export async function startLoadDatabase(numCustomers) {
    return await new Promise(async (resolve, reject) => {
        try {
            if (customers.length >= 1) {
                resolve('Already loaded');
                return;
            }
            if (numCustomers === undefined) {
                numCustomers = loaderSettings.MAX_CUSTOMERS;
            }
            logger.info('starting loading database');
            createCustomers(numCustomers);
            await createFlightRelatedData();
            logger.info('number of customers = ' + customers.length);
            logger.info('number of airportCodeMappings = ' + airportCodeMappings.length);
            logger.info('number of flightSegments = ' + flightSegments.length);
            logger.info('number of flights = ' + flights.length);
            flightQueue.drain(function () {
                logger.info('all flights loaded');
                logger.info('ending loading database');
                resolve('Database Finished Loading');
            });
            customerQueue.push(customers);
        } catch (error) {
            reject(error);
        }
    });
}
