/*
 import jwt from 'jsonwebtoken';
 import assert from 'assert';
 import expressjwt from '../dist';
 import UnauthorizedError from '../dist/errors/unauthorized-error';

 describe('multitenancy', function () {
 var req = {};
 var res = {};

 var tenants = {
 'a': {
 secret: 'secret-a'
 }
 };

 var secretCallback = function (req, payload, cb) {
 var issuer = payload.iss;
 if (tenants[issuer]) {
 return cb(null, tenants[issuer].secret);
 }

 return cb(new UnauthorizedError('missing_secret',
 {message: 'Could not find secret for issuer.'}));
 };

 var middleware = expressjwt({
 secret: secretCallback
 });

 it('should retrieve secret using callback', function () {
 var token = jwt.sign({iss: 'a', foo: 'bar'}, tenants.a.secret);

 req.headers = new Map([
 ['authorization', 'Bearer ' + token]
 ]);

 middleware(req, res, function () {
 assert.equal('bar', req.user.foo);
 });
 });

 it('should throw if an error ocurred when retrieving the token', function () {
 var secret = 'shhhhhh';
 var token = jwt.sign({iss: 'inexistent', foo: 'bar'}, secret);

 req.headers = new Map([
 ['authorization', 'Bearer ' + token]
 ]);

 middleware(req, res, function (err) {
 assert.ok(err);
 assert.equal(err.code, 'missing_secret');
 assert.equal(err.message, 'Could not find secret for issuer.');
 });
 });

 it('should fail if token is revoked', async function () {
 var token = jwt.sign({iss: 'a', foo: 'bar'}, tenants.a.secret);

 req.headers = new Map([
 ['authorization', 'Bearer ' + token]
 ]);

 var middleware = expressjwt({
 secret: secretCallback,
 isRevoked: function (req, payload, done) {
 done(null, true);
 }
 });

 let e;

 try {
 await middleware(req, res);
 } catch (err){
 e = err;
 }

 assert.ok(e);
 assert.equal(e.message, 'The token has been revoked.');
 });
 });

 */
