// com.acmeair.config.LoaderREST
import log4js from 'log4js';
import fs from 'fs';
import { settings } from '../../globals.js';
import { startLoadDatabase } from '../loader/Loader.js';

var logger = log4js.getLogger('LoaderREST');
logger.level = settings.loggerLevel;

var loaderSettings = JSON.parse(fs.readFileSync('./loader/loader-settings.json', 'utf8'));

export async function loadDatabaseRest(params) {
    logger.info("Started to load database...");
    const result = await startLoadDatabase(params.numCustomers);
    return result;
}

export async function loadDatabase(req, res) {
    var result = await loadDatabaseRest({ numCustomers: req.query.numCustomers });
    res.send(result);
}

export function getNumConfiguredCustomersRest(params) {
    return loaderSettings.MAX_CUSTOMERS.toString();
}

export function getNumConfiguredCustomers(req, res) {
    var maxCustomers = getNumConfiguredCustomersRest({});

    res.contentType("text/plain");
    res.send(maxCustomers);
}
