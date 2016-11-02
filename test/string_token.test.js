import jwt from 'jsonwebtoken';
import assert from 'assert';
import expressjwt from '../dist';
import UnauthorizedError from '../dist/errors/UnauthorizedError';

describe('string tokens', function () {
  var req = {};
  var res = {};

  it('should work with a valid string token', function() {
    var secret = 'shhhhhh';
    var token = jwt.sign('foo', secret);

    req.headers = {};
    req.headers.authorization = 'Bearer ' + token;
    expressjwt({secret: secret})(req, res, function() {
      assert.equal('foo', req.user);
    });
  });

});
