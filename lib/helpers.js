/*
*  https://github.com/jaredhanson/passport-local/blob/master/lib/utils.js
* Extract props lookup method
*/
exports.lookup = function (obj, field) {
  if (!obj) { return null; }
  var chain = field.split(']').join('').split('[');
  for (var i = 0, len = chain.length; i < len; i++) {
    var prop = obj[chain[i]];
    if (typeof (prop) === 'undefined') { return null; }
    if (typeof (prop) !== 'object') { return prop; }
    obj = prop;
  }
  return null;
};

function parseId(idString) {
  var value = parseInt(idString, 10);
  return value.toString() === idString ? value : null;
}

exports.extractHeaders = function (req, headersArray) {
  var extractedHeaders = {};
  var hasReqHeaders = !!req.headers;

  for (var i = 0, len = headersArray.length; i < len; i++) {
    var value = hasReqHeaders ? req.headers[headersArray[i].name] : req.get(headersArray[i].name);
    if (headersArray[i].isId) {
      value = parseId(value);
    }
    if (!value) {
      value = null;
    }
    if (!value && !headersArray[i].canBeNull) {
      return null;
    }
    extractedHeaders[headersArray[i].name] = value;
  }

  return extractedHeaders;
};

exports.validateStrategyArgs = function (options, verify) {
  if (!options || typeof options == 'function') {
    throw new Error('You forgot to set validation options for Local Passport with headers strategy');
  }

  if (options.headersNames && !Array.isArray(options.headersNames)) {
    throw new Error('Local Passport with headers strategy headersNames property should be an array');
  }

  for (var i = 0, len = options.headersNames.length; i < len; i += 1) {
    if (typeof options.headersNames[i] == 'string') {
      options.headersNames[i] = {
        name: options.headersNames[i],
        isNumber: false,
      };
    }

    if (!options.headersNames[i].name || typeof options.headersNames[i].name !== 'string') {
      throw new Error('Incorrect header name property in Local Passport with headers strategy');
    }

    if (!options.headersNames[i].isNumber) {
      options.headersNames[i].isNumber = false;
    }
  }

  if (typeof verify != 'function') {
    throw new Error('Local Passport with headers strategy requires a verify function');
  }
};
