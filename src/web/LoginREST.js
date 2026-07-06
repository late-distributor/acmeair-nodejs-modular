// com.acmeair.web.LoginREST
import log4js from 'log4js';
import { settings } from '../../globals.js';
import { validateCustomer, createSession } from '../service/CustomerService.js';
import { invalidateSession } from '../morphia/CustomerServiceImpl.js';

var logger = log4js.getLogger('LoginREST');
logger.level = settings.loggerLevel;

export async function loginRest(params) {
    logger.debug('logging in user');
    var login = params.login;
    var password = params.password;

    // replace eventually with call to business logic to validate customer
    const customerValid = await validateCustomer(login, password);
    try {
        if (!customerValid) {
            return { status: 403 };
        }
        else {
            try {
                const sessionid = await createSession(login);
                logger.debug("Logged in. Session id="+sessionid);
                return { sessionid: sessionid };
            } catch (error) {
                logger.info(error);
                return { status: 500, error: error };
            }
        }
    } catch (err) {
        return { status: 500, error: err };
    }
}

export async function login(req, res) {
    res.cookie('sessionid', '');

    var result = await loginRest({ login: req.body.login, password: req.body.password });
    if (result.status) {
        res.sendStatus(result.status);
        return;
    }
    res.cookie('sessionid', result.sessionid);
    res.send('logged in');
}

export async function logoutRest(params) {
    logger.debug('logging out user');
    var sessionid = params.sessionid;
    await invalidateSession(sessionid);
    return { sessionid: '' };
}

export async function logout(req, res) {
    var result = await logoutRest({ sessionid: req.cookies.sessionid });
    res.cookie('sessionid', result.sessionid);
    res.send('logged out');
};
