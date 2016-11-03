import jwt from 'jsonwebtoken';
import assert from 'assert';
import expressjwt from '../dist';
import UnauthorizedError from '../dist/errors/unauthorized-error';

describe('failure tests', function () {
  let req = {};
  let res = {};

  it('should throw if options not sent', async function () {
    let e;

    try {
      await expressjwt();
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'Secret must be passed!');
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
      await expressjwt({secret: 'shhhh'})(corsReq, res);
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
      await expressjwt({secret: 'shhhh'})(req, res);
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
      await expressjwt({secret: 'shhhh'})(req, res);
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
      await expressjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'jwt malformed');
  });

  it('should throw if jwt is an invalid json', async function () {
    req.headers = new Map([
      ['authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yJ1c2VybmFtZSI6InNhZ3VpYXIiLCJpYXQiOjE0NzEwMTg2MzUsImV4cCI6MTQ3MzYxMDYzNX0.foo']
    ]);

    let e;

    try {
      await expressjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'invalid token');
  });

  it('should throw if authorization header is not valid jwt', async function () {
    let secret = 'shhhhhh';
    let token = jwt.sign({foo: 'bar'}, secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await expressjwt({secret: 'different-shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'invalid signature');
  });

  //TODO: implement aud support
  /*  it('should throw if audience is not expected', function () {
   let secret = 'shhhhhh';
   let token = jwt.sign({foo: 'bar', aud: 'expected-audience'}, secret);

   req.headers = new Map([
   ['authorization', 'Bearer ' + token]
   ]);
   expressjwt({secret: 'shhhhhh', audience: 'not-expected-audience'})(req, res, function (err) {
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
      await expressjwt({secret: 'shhhhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'jwt expired');
  });

  //TODO: add iss support
  /*it('should throw if token issuer is wrong', function () {
   let secret = 'shhhhhh';
   let token = jwt.sign({foo: 'bar', iss: 'http://foo'}, secret);

   req.headers = new Map([
   ['authorization', 'Bearer ' + token]
   ]);
   expressjwt({secret: 'shhhhhh', issuer: 'http://wrong'})(req, res, function (err) {
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
      await expressjwt({secret: secret})(req, res);
    } catch (err) {
      e = err;
    }

    assert.ok(e);
    assert.equal(e.message, 'invalid token');
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
      await expressjwt({secret: secret})(req, res);
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
      await expressjwt({secret: secret, requestProperty: 'auth.token'})(req, res);
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
      await expressjwt({secret: secret})(req, res);
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
      await expressjwt({secret: 'shhhh'})(req, res);
    } catch (err) {
      e = err;
    }

    assert(typeof e !== 'undefined');
  });
});
