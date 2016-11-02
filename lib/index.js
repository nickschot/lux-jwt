import {isFunction} from 'util';
import {sign, decode, verify} from 'jsonwebtoken';
import UnauthorizedError from './errors/unauthorized-error';

export default function (options) {
  let opts = options || {};

  if (!opts.secret) {
    throw new Error('Secret must be passed!');
  }

  if (opts.checkRevoked && !isFunction(opts.checkRevoked)) {
    throw new Error('Token revocation must be a function!');
  }

  const {
    secret,
    key = "user",
    checkRevoked = false
  } = opts;

  const middleware = async(request, response) => {
    const accessToken = getTokenFromHeader(request);

    try {
      const decodedAccessToken = verify(accessToken, secret);

      if (checkRevoked) {
        await checkRevoked(decodedAccessToken);
      }

      request[key] = decodedAccessToken;
    } catch (e) {
      return new UnauthorizedError(e.message);
    }
  };

  return middleware;
}

function getTokenFromHeader(request) {
  if (!request.headers || !request.headers.has('authorization')) {
    throw new UnauthorizedError('No authorization header present');
  }

  const parts = request.headers.get('authorization').split(" ");

  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    } else {
      throw new UnauthorizedError('Bad Authorization header format. Format is "Authorization: Bearer token"');
    }
  } else {
    throw new UnauthorizedError('Bad Authorization header format. Format is "Authorization: Bearer token"');
  }
}

export {sign, decode, verify};
