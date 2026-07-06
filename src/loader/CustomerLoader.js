// com.acmeair.loader.CustomerLoader
import { customers, customerTemplate, cloneObjectThroughSerialization } from './loaderState.js';

export function createCustomers(numCustomers) {
    for (var ii = 0; ii < numCustomers; ii++) {
        var customer = cloneObjectThroughSerialization(customerTemplate);
        customer._id = "uid" + ii + "@email.com";
        customers.push(customer);
    };
}
