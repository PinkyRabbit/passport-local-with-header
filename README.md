# passport-local-with-headers

Extended [Passport-Local](https://github.com/jaredhanson/passport-local) strategy for [Passport](http://passportjs.org/) to validate user's request headers for SaaS solutions.

The reasone for this strategy is that in some cases users in one database can has two or more parameters for user selection.

Example:
We have one main domain for SaaS solution, an different subdomains for clients companies. Clients companies can have user with the same `username`. So we need to select user with `username` and `companyId`. User enter login and password as in standard Passport-Local strategy. But `companyId` we extract from subdomain, and send with headers. So this solution is clear and secure.

This module lets you authenticate using a username, headers and password in your Node.js
applications.  By plugging into Passport, this strategy can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

---

## Install

```bash
$ npm i @pinkyrabbit/passport-local-with-header
```

## Usage

#### Configure Strategy

First of all, import passport and strategy

```js
const passport = require('passport');
const LocalStrategyWithHeaders = require('@pinkyrabbit/passport-local-with-header').Strategy;
```

The local authentication strategy authenticates users using a username and
password.  Also we need headers to detect user's `origin`. The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

```js
passport.use(new LocalStrategyWithHeaders(
  (username, password, headers, done) => {
    User.findOne({ username, ...headers }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));
```

##### Available Options

This strategy takes an optional options hash before the function, e.g. `new LocalStrategyWithHeaders({/* options */, callback})`.

The available options are:

* `usernameField` - Optional, defaults to 'username'
* `passwordField` - Optional, defaults to 'password'

Both fields define the name of the properties in the POST body that are sent to the server.

* `getCredsFromQuery` - Boolean. Optional, defaults to 'false'

Sometimes we got cases, when creds can be send throught GET `query`.

* `headersNames` - Array of objects. This objects represents headers that we need.

`headersNames` objects has three properties: 
1. `name` - Required, string. Headers property name that we looking for.
2. `isId` - Optional, boolean. Represents option "if header is id" to convert it from string to integer. If string wasn't an integer in real - will return `null` as value.
Default to 'false'.
3. `canBeNull` - Optional, boolean. Represents option "if header can missing". If this option is `true` and header is missing - just return `null` as value. If option is `false` and header is missing - throw an error.
Default to 'false'.

Default value for `headersNames` is:
```js
[{ name: 'companyid', isId: true, canBeNull: true }]
```


#### Setup options

As you read above, all options has default values. So, you don't need to setup it if you want to use defaults:
* `getCredsFromQuery` = `false` - we read credentials from POST body
* `usernameField` = `username` - we looking for `username` field name in POST body
* `passwordField` = `password` - we looking for `password` field name in POST body
* `headersNames` = `[{ name: 'companyid', isId: true, canBeNull: true }]` - we looking for `companyid` in headers and convert it to integer. If it is not integer - we get `null`.

But you can set your own rules. For example, login with `email`, and looking for header `companyname` as string.


    passport.use(new LocalStrategy({
        getCredsFromQuery: false,
        usernameField: 'email',
        passwordField: 'passwd',
        headersNames: [{ name: 'companyname' }],
      },
      function(username, password, headers done) {
        // ...
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `local-with-headers` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.post('/login', 
  passport.authenticate('local-with-headers', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
```

## Examples

Examples can be found on the [wiki](https://github.com/PinkyRabbit/passport-local-with-header/wiki/Example-of-usage).

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2019 Mikita Melnikau
