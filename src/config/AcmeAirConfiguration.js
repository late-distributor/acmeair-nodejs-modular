// com.acmeair.config.AcmeAirConfiguration
import { dbtype } from '../../globals.js';
import { countBookingsDB } from '../morphia/BookingServiceImpl.js';
import { countCustomersDB, countCustomerSessionsDB } from '../morphia/CustomerServiceImpl.js';
import { countFlightsDB, countFlightSegmentsDB, countAirportsDB } from '../morphia/FlightServiceImpl.js';

export async function getRuntimeInfoRest(params) {
    var runtimeInfo = [];
    runtimeInfo.push({ "name": "Runtime", "description": "NodeJS" });
    var versions = process.versions;
    for (var key in versions) {
        runtimeInfo.push({ "name": key, "description": versions[key] });
    }
    return runtimeInfo;
};

export async function getRuntimeInfo(req, res) {
    var runtimeInfo = await getRuntimeInfoRest({});
    res.contentType('application/json');
    res.send(JSON.stringify(runtimeInfo));
};

export async function getDataServiceInfoRest(params) {
    var dataServices = [{ "name": "cassandra", "description": "Apache Cassandra NoSQL DB" },
    { "name": "cloudant", "description": "IBM Distributed DBaaS" },
    { "name": "mongo", "description": "MongoDB NoSQL DB" }];
    return dataServices;
};

export async function getDataServiceInfo(req, res) {
    var dataServices = await getDataServiceInfoRest({});
    res.send(JSON.stringify(dataServices));
};

export function getActiveDataServiceInfoRest(params) {
    return dbtype;
};

export async function getActiveDataServiceInfo(req, res) {
    var dbtype = getActiveDataServiceInfoRest({});
    res.send(dbtype);
};

export async function countBookingsRest(params) {
    try {
        const count = await countBookingsDB();
        return count.toString();
    } catch (error) {
        return "-1";
    }
};

export async function countBookings(req, res) {
    var count = await countBookingsRest({});
    res.send(count);
};

export async function countCustomerRest(params) {
    try {
        const count = await countCustomersDB();
        return count.toString();
    } catch (error) {
        return "-1";
    }
};

export async function countCustomer(req, res) {
    var count = await countCustomerRest({});
    res.send(count);
};

export async function countCustomerSessionsRest(params) {
    try {
        const count = await countCustomerSessionsDB();
        return count.toString();
    } catch (error) {
        return "-1";
    }
};

export async function countCustomerSessions(req, res) {
    var count = await countCustomerSessionsRest({});
    res.send(count);
};

export async function countFlightsRest(params) {
    try {
        const count = await countFlightsDB();
        return count.toString();
    } catch (error) {
        return "-1";
    }
};

export async function countFlights(req, res) {
    var count = await countFlightsRest({});
    res.send(count);
};

export async function countFlightSegmentsRest(params) {
    try {
        const count = await countFlightSegmentsDB();
        return count.toString();
    } catch (error) {
        return "-1";
    }
};

export async function countFlightSegments(req, res) {
    var count = await countFlightSegmentsRest({});
    res.send(count);
};

export async function countAirportsRest(params) {
    try {
        const count = await countAirportsDB();
        return count.toString();
    } catch (error) {
        console.log(error);
        return "-1";
    }
};

export async function countAirports(req, res) {
    var count = await countAirportsRest({});
    res.send(count);
};
