import jwt from 'jsonwebtoken';
import assert from 'assert';
import luxjwt from '../dist';
import UnauthorizedError from '../dist/errors/unauthorized-error';

describe('failure tests', function () {
  let req = {};
  let res = {};

  it('should throw if options not sent', async function () {
    let e;

    try {
      await luxjwt();
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'Secret must be passed!');
  });

  it('should not work if secret is missing', async function () {
    let e;

    try {
      let token = jwt.sign({foo: 'bar'});
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal('Error: secretOrPrivateKey must have a value', e);
  });

  it('should not work if secret is an empty array', async function () {
    let secretArr = [];

    let e;

    try {
      await luxjwt({secret: secretArr});
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal('Error: Secret must be passed!', e);
  });

  it('should not work if secret is an array with an invalid secret', async function () {
    let secret = 'shhhhhh';
    let secretArr = ['InvalidSecret'];

    let token = jwt.sign({foo: 'bar'}, secret);
    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secretArr
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal('JsonWebTokenError: invalid signature', e.message);
  });

  it('should skip on CORS preflight', async function () {
    let corsReq = {
      method: 'OPTIONS',
      headers: new Map([
        ['access-control-request-headers', 'sasa, sras,  authorization']
      ])
    };

    let e;

    try {
      await luxjwt({secret: 'shhhh'})(corsReq, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
  });

  it('should throw if authorization header is malformed', async function () {
    req.headers = new Map([
      ['authorization', 'wrong']
    ]);

    let e;

    try {
      await luxjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'Bad Authorization header format. Format is "Authorization: Bearer token"');
  });

  it('should throw if authorization header is not Bearer', async function () {
    req.headers = new Map([
      ['authorization', 'Basic foobar']
    ]);

    let e;

    try {
      await luxjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'Bad Authorization header format. Format is "Authorization: Bearer token"');
  });

  it('should throw if authorization header is not well-formatted jwt', async function () {
    req.headers = new Map([
      ['authorization', 'Bearer wrongjwt']
    ]);

    let e = null;

    try {
      await luxjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'JsonWebTokenError: jwt malformed');
  });

  it('should throw if jwt is an invalid json', async function () {
    req.headers = new Map([
      ['authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yJ1c2VybmFtZSI6InNhZ3VpYXIiLCJpYXQiOjE0NzEwMTg2MzUsImV4cCI6MTQ3MzYxMDYzNX0.foo']
    ]);

    let e;

    try {
      await luxjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'SyntaxError: Unexpected token ȝ in JSON at position 0');
  });

  it('should throw if authorization header is not valid jwt', async function () {
    let secret = 'shhhhhh';
    let token = jwt.sign({foo: 'bar'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({secret: 'different-shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'JsonWebTokenError: invalid signature');
  });

  //TODO: implement aud support
  /*  it('should throw if audience is not expected', function () {
   let secret = 'shhhhhh';
   let token = jwt.sign({foo: 'bar', aud: 'expected-audience'}, secret);

   req.headers = new Map([
   ['authorization', 'Bearer ' + token]
   ]);
   luxjwt({secret: 'shhhhhh', audience: 'not-expected-audience'})(req, res, function (err) {
   assert.ok(err);
   assert.equal(err.code, 'invalid_token');
   assert.equal(err.message, 'jwt audience invalid. expected: not-expected-audience');
   });
   });*/

  it('should throw if token is expired', async function () {
    let secret = 'shhhhhh';
    let token = jwt.sign({foo: 'bar', exp: 1382412921}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({secret: 'shhhhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'TokenExpiredError: jwt expired');
  });

  //TODO: add iss support
  /*it('should throw if token issuer is wrong', function () {
   let secret = 'shhhhhh';
   let token = jwt.sign({foo: 'bar', iss: 'http://foo'}, secret);

   req.headers = new Map([
   ['authorization', 'Bearer ' + token]
   ]);
   luxjwt({secret: 'shhhhhh', issuer: 'http://wrong'})(req, res, function (err) {
   assert.ok(err);
   assert.equal(err.code, 'invalid_token');
   assert.equal(err.message, 'jwt issuer invalid. expected: http://wrong');
   });
   });*/


  it('should throw error when signature is wrong', async function () {
    let secret = "shhh";
    let token = jwt.sign({foo: 'bar', iss: 'http://www'}, secret);
    // manipulate the token
    let newContent = new Buffer("{foo: 'bar', edg: 'ar'}").toString('base64');
    let splitetToken = token.split(".");
    splitetToken[1] = newContent;
    let newToken = splitetToken.join(".");

    // build request
    req.headers = new Map([
      ['authorization', 'Bearer ' + newToken]
    ]);

    let e;

    try {
      await luxjwt({secret: secret})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'JsonWebTokenError: invalid token');
  });

  it('should throw an error if audience is invalid', async function () {
    let secret = 'shhhhhh';
    let audience = 'test-audience';
    let token = jwt.sign({foo: 'bar', aud: 'wrong-audience'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secret,
        audience: audience
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal('JsonWebTokenError: jwt audience invalid. expected: '+audience, e.message);
  });

  it('should throw an error if audience is not present in the (valid) token', async function () {
    let secret = 'shhhhhh';
    let audience = 'test-audience';
    let token = jwt.sign({foo: 'bar'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secret,
        audience: audience
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal('JsonWebTokenError: jwt audience invalid. expected: '+audience, e.message);
  });

  it('should throw an error if issuer is invalid', async function () {
    let secret = 'shhhhhh';
    let issuer = 'test-issuer';
    let token = jwt.sign({foo: 'bar', iss: 'wrong-issuer'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secret,
        issuer: issuer
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal('JsonWebTokenError: jwt issuer invalid. expected: '+issuer, e.message);
  });

  it('should throw an error if issuer is not present in the (valid) token', async function () {
    let secret = 'shhhhhh';
    let issuer = 'test-issuer';
    let token = jwt.sign({foo: 'bar'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secret,
        issuer: issuer
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal('JsonWebTokenError: jwt issuer invalid. expected: '+issuer, e.message);
  });
});

describe('work tests', function () {
  let req = {};
  let res = {};

  it('should work if authorization header is valid jwt', async function () {
    let secret = 'shhhhhh';
    let token = jwt.sign({foo: 'bar'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({secret: secret})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
    assert.equal('bar', req.user.foo);
  });

  it('should work with nested properties', async function () {
    let secret = 'shhhhhh';
    let token = jwt.sign({foo: 'bar'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({secret: secret, requestProperty: 'auth.token'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
    assert.equal('bar', req.auth.token.foo);
  });

  it('should work if authorization header is valid with a buffer secret', async function () {
    let secret = new Buffer('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
    let token = jwt.sign({foo: 'bar'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({secret: secret})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
    assert.equal('bar', req.user.foo);
  });

  it('should not work if no authorization header', async function () {
    req = {};

    let e;

    try {
      await luxjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert(typeof e !== 'undefined');
  });

  it('should work if audience is valid', async function () {
    let secret = 'shhhhhh';
    let audience = 'test-audience';
    let token = jwt.sign({foo: 'bar', aud: audience}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secret,
        audience: audience
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
    assert.equal('bar', req.user.foo);
  });

  it('should work if issuer is valid', async function () {
    let secret = 'shhhhhh';
    let issuer = 'test-issuer';
    let token = jwt.sign({foo: 'bar', iss: issuer}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secret,
        issuer: issuer
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
    assert.equal('bar', req.user.foo);
  });

  it('should work if secret is a string', async function () {
    let secret = 'shhhhhh';
    let e;

    try {
      let token = jwt.sign({foo: 'bar'}, secret);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
  });

  it('should work if secret is an array with a string', async function () {
    let secret = 'shhhhhh';
    let secretArr = [secret];

    let token = jwt.sign({foo: 'bar'}, secret);
    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secretArr
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
  });

  it('should work if secret is an array with an invalid and a valid string', async function () {
    let secret = 'shhhhhh';
    let secretArr = ['InvalidSecret', secret];

    let token = jwt.sign({foo: 'bar'}, secret);
    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secretArr
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
  });

  it('should work if secret is an array with a valid and an invalid string', async function () {
    let secret = 'shhhhhh';
    let secretArr = [secret, 'InvalidSecret'];

    let token = jwt.sign({foo: 'bar'}, secret);
    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await luxjwt({
        secret: secretArr
      })(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(!e);
  });
});
