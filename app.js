/*******************************************************************************
* Copyright (c) 2015 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*******************************************************************************/

import express from 'express';
import log4js from 'log4js';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import { settings } from './globals.js';

// One module per Java class (com.acmeair.*)
import { checkForValidSessionCookie } from './src/web/RESTCookieSessionFilter.js';
import { login, logout } from './src/web/LoginREST.js';
import { queryflights } from './src/web/FlightsREST.js';
import { bookflights, cancelBooking, bookingsByUser } from './src/web/BookingsREST.js';
import { getCustomerById, putCustomerById } from './src/web/CustomerREST.js';
import {
    getRuntimeInfo, getDataServiceInfo, getActiveDataServiceInfo,
    countBookings, countCustomer, countCustomerSessions,
    countFlights, countFlightSegments, countAirports
} from './src/config/AcmeAirConfiguration.js';
import { loadDatabase, getNumConfiguredCustomers } from './src/config/LoaderREST.js';

var logger = log4js.getLogger('app');
logger.level = settings.loggerLevel;

var port = (process.env.VMC_APP_PORT || process.env.VCAP_APP_PORT || settings.port);
var host = (process.env.VCAP_APP_HOST || 'localhost');

logger.info("host:port==" + host + ":" + port);

var app = express();

app.use(express.static('public'));     	// set the static files location /public/img will be /img for users
if (settings.useDevLogger)
    app.use(morgan('dev'));                     		// log every request to the console

//create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodedParser);
//parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }));

app.use(methodOverride());                  			// simulate DELETE and PUT
app.use(cookieParser());                  				// parse cookie

var router = express.Router();

router.post('/login', login);
router.get('/login/logout', logout);
router.post('/flights/queryflights', checkForValidSessionCookie, queryflights);
router.post('/bookings/bookflights', checkForValidSessionCookie, bookflights);
router.post('/bookings/cancelbooking', checkForValidSessionCookie, cancelBooking);
router.get('/bookings/byuser/:user', checkForValidSessionCookie, bookingsByUser);
router.get('/customer/byid/:user', checkForValidSessionCookie, getCustomerById);
router.post('/customer/byid/:user', checkForValidSessionCookie, putCustomerById);
router.get('/config/runtime', getRuntimeInfo);
router.get('/config/dataServices', getDataServiceInfo);
router.get('/config/activeDataService', getActiveDataServiceInfo);
router.get('/config/countBookings', countBookings);
router.get('/config/countCustomers', countCustomer);
router.get('/config/countSessions', countCustomerSessions);
router.get('/config/countFlights', countFlights);
router.get('/config/countFlightSegments', countFlightSegments);
router.get('/config/countAirports', countAirports);
router.get('/loader/load', loadDatabase);
router.get('/loader/query', getNumConfiguredCustomers);
router.get('/checkstatus', checkStatus);


//REGISTER OUR ROUTES so that all of routes will have prefix
app.use(settings.contextRoot, router);

function checkStatus(req, res) {
    res.sendStatus(200);
}

app.listen(port);
logger.info("Express server listening on port " + port);
