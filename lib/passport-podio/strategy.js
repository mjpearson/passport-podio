/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


/**
 * `Strategy` constructor.
 *
 * The Podio authentication strategy authenticates requests by delegating
 * to Podio using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Podio application's client id
 *   - `clientSecret`  your Podio application's client secret
 *   - `callbackURL`   URL to which Podio will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new PodioStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/podio/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://podio.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://podio.com/oauth/token';
  this.profileUrl = options.profileUrl || "https://podio.com/user/profile";
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'podio';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Podio.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `podio`
 *   - `id`               the user's ID
 *   - `displayName`      the user's username
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this.get(this.profileUrl, accessToken, function (err, body, res) {
    if (err) { return done(err); }

    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'Podio' };
      profile.id = json.id;
      profile.displayName = json.username;
      
      profile._raw = body;
      profile._json = json;
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

/** The default oauth2 strategy puts the access_token into Authorization: header AND query string
  * witch is a violation of the RFC so lets override and not add the header and supply only the token for qs.
  */
Strategy.prototype.get = function(url, access_token, callback) {
  this._oauth2._request("GET", url, {}, "", access_token, callback );
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
