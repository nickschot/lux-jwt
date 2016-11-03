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

## Related Modules

- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JSON Web Token sign and verification

## Tests

    $ npm install
    $ npm test
