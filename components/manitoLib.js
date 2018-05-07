const debug = require('debug')('dev');

/**
 *  Check body has all properties in propertyArray
 *  If body doesn't have property, throw 400 Error with 'Body property Exception' message.
 */
const checkProperty = (body, propertyArray) => {
  propertyArray.forEach((property) => {
    if (body[property] === undefined) {
      const err = new Error('Body property Exception');
      err.status = 400;
      debug('Body property Exception');
      throw err;
    }
  });
};

module.exports = {
  checkProperty,
};
