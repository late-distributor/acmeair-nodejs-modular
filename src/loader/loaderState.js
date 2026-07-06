// Shared loader state: templates, helpers, arrays and the insert queues.
// (These are the "manter em todos os serviços" helpers + the Loader's internal pipeline.)
import log4js from 'log4js';
import async from 'async';
import fs from 'fs';
import { settings } from '../../globals.js';
import { insertCustomer } from '../morphia/CustomerServiceImpl.js';
import { insertAirportCodeMapping, insertFlightSegment, insertFlight } from '../morphia/FlightServiceImpl.js';

var logger = log4js.getLogger('loader');
logger.level = settings.loggerLevel;

export const loaderSettings = JSON.parse(fs.readFileSync('./loader/loader-settings.json', 'utf8'));

export const DATABASE_PARALLELISM = 5;

export function cloneObjectThroughSerialization(theObject) {
    return JSON.parse(JSON.stringify(theObject));
}

export function getDepartureTimeDaysFromDate(baseTime, days) {
    const milliseconds = days * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */;
    return new Date(baseTime.getTime() + milliseconds);
}

export function getArrivalTime(departureTime, mileage) {
    const averageSpeed = 600.0; // 600 miles/hours
    const hours = mileage / averageSpeed; // miles / miles/hour = hours
    const milliseconds = hours * 60 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */;
    return new Date(departureTime.getTime() + milliseconds);
}

export function getDateAtTwelveAM(theDate) {
    return new Date(theDate.getFullYear(), theDate.getMonth(), theDate.getDate(), 0, 0, 0, 0);
}

export const nowAtMidnight = getDateAtTwelveAM(new Date());

export const customerTemplate = {
    _id: undefined,
    password: "password",
    status: "GOLD",
    total_miles: 1000000,
    miles_ytd: 1000,
    address: {
        streetAddress1: "123 Main St.",
        city: "Anytown",
        stateProvince: "NC",
        country: "USA",
        postalCode: "27617"
    },
    phoneNumber: "919-123-4567",
    phoneNumberType: "BUSINESS"
};

export const airportCodeMappingTemplate = {
    _id: undefined,
    airportName: undefined
};

export const flightSegmentTemplate = {
    _id: undefined,
    originPort: undefined,
    destPort: undefined,
    miles: undefined
};

export const flightTemplate = {
    _id: undefined,
    flightSegmentId: undefined,
    scheduledDepartureTime: undefined,
    scheduledArrivalTime: undefined,
    firstClassBaseCost: 500,
    economyClassBaseCost: 200,
    numFirstClassSeats: 10,
    numEconomyClassSeats: 200,
    airplaneTypeId: "B747"
};

export const customers = new Array();
export const airportCodeMappings = new Array();
export const flightSegments = new Array();
export const flights = new Array();

export const customerQueue = async.queue(insertCustomer, DATABASE_PARALLELISM);
customerQueue.drain(function () {
    logger.info('all customers loaded');
    airportCodeMappingQueue.push(airportCodeMappings);
});

export const airportCodeMappingQueue = async.queue(insertAirportCodeMapping, DATABASE_PARALLELISM);
airportCodeMappingQueue.drain(function () {
    logger.info('all airportMappings loaded');
    flightSegmentsQueue.push(flightSegments);
});

export const flightSegmentsQueue = async.queue(insertFlightSegment, DATABASE_PARALLELISM);
flightSegmentsQueue.drain(function () {
    logger.info('all flightSegments loaded');
    flightQueue.push(flights);
});

export const flightQueue = async.queue(insertFlight, DATABASE_PARALLELISM);
