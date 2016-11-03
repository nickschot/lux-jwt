import jwt from 'jsonwebtoken';
import assert from 'assert';
import expressjwt from '../dist';
import UnauthorizedError from '../dist/errors/unauthorized-error';

describe('string tokens', function () {
  var req = {};
  var res = {};

  it('should work with a valid string token', async function () {
    var secret = 'shhhhhh';
    var token = jwt.sign('foo', secret);

    req.headers = new Map([
      ['authorization', 'Bearer ' + token]
    ]);

    let e;

    try {
      await expressjwt({secret: secret})(req, res);
    } catch (err){
      e = err;
    }

    assert.ok(!e);
    assert.equal('foo', req.user);
  });

});
