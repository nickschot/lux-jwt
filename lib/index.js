import {isFunction} from 'util';
import {sign, decode, verify} from 'jsonwebtoken';
import set from 'lodash.set';
import UnauthorizedError from './errors/unauthorized-error';

export default function (options) {
  let opts = options || {};

  if (!opts.secret) {
    throw new Error('Secret must be passed!');
  }

  if (opts.isRevoked && !isFunction(opts.isRevoked)) {
    throw new Error('Token revocation must be a function!');
  }

  const {
    secret,
    requestProperty = 'user',
    isRevoked = false,
    audience = false,
    issuer = false,
    clockTolerance = 0,
    algorithms = false
  } = opts;

  return async(request, response) => {
    if (!validCorsPreflight(request)) {
      const accessToken = getTokenFromHeader(request);

      try {
        const decodedAccessToken = verify(accessToken, secret, opts);

        if (isRevoked) {
          if (await isRevoked(request, decodedAccessToken)) {
            throw new UnauthorizedError('Token has been revoked');
          }
        }

        set(request, requestProperty, decodedAccessToken);
      } catch (e) {
        throw new UnauthorizedError(e.message);
      }
    }
  };
}

/**
 * Checks if an OPTIONS request with the access-control-request-headers containing authorization is being made
 * @param request
 * @returns {boolean}
 */
function validCorsPreflight(request) {
  if (request.method === 'OPTIONS' && request.headers.has('access-control-request-headers')) {
    return request.headers.get('access-control-request-headers').split(',').map(function (header) {
      return header.trim();
    }).includes('authorization');
  } else {
    return false;
  }
}

/**
 * Retrieves the JWT from the authorization header
 * @param request
 * @returns {string} The JWT
 */
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
