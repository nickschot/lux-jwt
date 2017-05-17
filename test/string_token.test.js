import jwt from 'jsonwebtoken';
import assert from 'assert';
import luxjwt from '../dist';
import UnauthorizedError from '../dist/errors/unauthorized-error';

describe('string tokens', function () {
  let req = {};
  let res = {};

  it('should work with a valid string token', async function () {
    let secret = 'shhhhhh';
    let token = jwt.sign('foo', secret);

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
    assert.equal('foo', req.user);
  });

});
