# lux-jwt
Middleware implementation of JWT for [Lux](https://github.com/postlight/lux).

[![Build Status](https://travis-ci.org/nickschot/lux-jwt.svg?branch=master)](https://travis-ci.org/nickschot/lux-jwt) [![Coverage Status](https://coveralls.io/repos/github/nickschot/lux-jwt/badge.svg?branch=master)](https://coveralls.io/github/nickschot/lux-jwt?branch=master) [![Dependency Status](https://david-dm.org/nickschot/lux-jwt.svg)](https://david-dm.org/nickschot/lux-jwt) [![npm version](https://badge.fury.io/js/lux-jwt.svg)](https://badge.fury.io/js/lux-jwt)

This module lets you authenticate HTTP requests using JWT tokens in your Lux
applications. JWTs are typically used to protect (stateless) API endpoints.

## Install

    $ npm i --save lux-jwt

## Usage
The JWT authentication middleware authenticates callers using a JWT.
If the token is valid, `request.user` will be set with the JSON object decoded
to be used by later middleware for authorization and access control.

An example usage of using lux-jwt is shown below.

Secret can also be an Array of multiple valid secrets. A good use case for this 
is when you use automatically refreshed secrets. This way the previous secret is 
still valid so the token isn't immediately invalidated when the secret is 
refreshed. See [Heroku Secure Key](https://securekey.heroku.com/) for more
 information.

```javascript
import {Controller} from 'lux-framework';
import jwt from 'lux-jwt';
import unless from 'lux-unless';

class ApplicationController extends Controller {
    beforeAction = [
        jwt({secret: 'shhhhhhared-secret'})
    ];
}
```

[lux-unless](https://github.com/nickschot/lux-unless) can be used to keep certain endpoints from being authorized by lux-jwt.

```javascript
import {Controller} from 'lux-framework';
import jwt from 'lux-jwt';
import unless from 'lux-unless';

class ApplicationController extends Controller {
    beforeAction = [
        unless({path: ['/users/login']}, jwt({secret: 'shhhhhhared-secret'}))
    ];
}
```

This module also exposes the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) API. Currently this means the following functions are exposed:
 - `sign(payload, secretOrPrivateKey, options)` - Create and sign a JWT.
 - `verify(token, secretOrPublicKey, [options])` - Verify whether or not the passed JWT is valid.
 - `decode(token, [options])` - Decode the contents of the JWT.
 
 For detailed documentation on these functions please refer to the jsonwebtoken README.
 
 ```javascript
 import {sign, verify, decode} from 'lux-jwt'
 ```

## Options
An object containing the following options must be passed:
- `secret` - A string or buffer containing either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA. Can also be an array with multiple valid secrets.
- `requestProperty` (optional) - The key on which the payload of the JWT will be made available.
- `isRevoked(request, decodedAccessToken)` (optional) - A function returning whether or not the token was revoked.
- `audience` (optional) - The expected audience (aud) to be present in the token.
- `issuer` (optional) - The expected issuer (iss) of the token.
- `clockTolerance` (optional) - Number of seconds to tolerate when checking the nbf and exp claims, to deal with small clock differences among different servers.
- `algorithms` (optional) - A list of strings with the names of the allowed algorithms. For instance, `["HS256", "HS384"]`.

## Related Modules

- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JSON Web Token sign and verification.
- [lux-unless](https://github.com/nickschot/lux-unless) - Conditionally skip a middleware.

## Tests

    $ npm install
    $ npm test

## License
This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
