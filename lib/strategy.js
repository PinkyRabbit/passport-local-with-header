var passport = require('passport-strategy');
var util = require('util');

var helpers = require('./helpers');

function Strategy(options, verify) {
  helpers.validateStrategyArgs(options, verify);
  this._usernameField = options.usernameField || 'username';
  this._passwordField = options.passwordField || 'password';
  this._headersNames = options.headersNames || [{ name: 'companyid', isId: true, canBeNull: true }];
  this._getCredsFromQuery = !!options.getCredentialsFromQuery || false;

  passport.Strategy.call(this);
  this.name = 'local-with-headers';
  this._verify = verify;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function authenticate(req, options) {
  var that = this;

  var username = this._getCredsFromQuery ?
    helpers.lookup(req.body, this._usernameField) :
    helpers.lookup(req.query, this._usernameField);

  var password = this._getCredsFromQuery ?
    helpers.lookup(req.body, this._passwordField) :
    helpers.lookup(req.query, this._passwordField);

  if (!username || !password) {
    return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
  }

  var headers = helpers.extractHeaders(req, this._headersNames);
  if (!headers && this._headersNames.length) {
    return this.fail({ message: options.badRequestMessage || 'Missing headers' }, 400);
  }

  var verified = function verified(err, user) {
    if (err) { return that.error(err); }
    if (!user) { return that.fail(); }
    that.success(user);
  };

  try {
    this._verify(username, password, headers, verified);
  } catch (ex) {
    return that.error(ex);
  }
};

module.exports = Strategy;
