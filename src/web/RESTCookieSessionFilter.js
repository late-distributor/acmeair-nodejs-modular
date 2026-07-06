// com.acmeair.web.RESTCookieSessionFilter
import log4js from 'log4js';
import { settings } from '../../globals.js';
import { validateSession } from '../service/CustomerService.js';

var logger = log4js.getLogger('RESTCookieSessionFilter');
logger.level = settings.loggerLevel;

export async function checkForValidSessionCookieRest(params) {
    logger.debug('checkForValidCookie');
    var sessionid = params.sessionid;
    if (sessionid) {
        sessionid = sessionid.trim();
    }
    if (!sessionid || sessionid == '') {
        logger.debug('checkForValidCookie - no sessionid cookie so returning 403');
        return { status: 403 };
    }

    logger.debug("Validating session cookie. Sessionid="+sessionid);

    try {
        const customerid = await validateSession(sessionid);
        if (customerid) {
            logger.debug('checkForValidCookie - good session so allowing next route handler to be called');
            return { acmeair_login_user: customerid };
        }
        else {
            logger.debug('checkForValidCookie - bad session so returning 403');
            return { status: 403 };
        }
    } catch (err) {
        logger.debug('checkForValidCookie - system error validating session so returning 500');
        return { status: 500 };
    }
}

export async function checkForValidSessionCookie(req, res, next) {
    var result = await checkForValidSessionCookieRest({ sessionid: req.cookies.sessionid });
    if (result.status) {
        res.sendStatus(result.status);
        return;
    }
    req.acmeair_login_user = result.acmeair_login_user;
    next();
}
