import { sign } from 'lux-jwt';

//NOTE: you should put this in an environment variable instead of the codebase
export const secret = 'shhhhhhared-secret';
const expiresIn = 60 * 60;

export function getNewToken(data) {
  return new Promise((resolve, reject) => {
    sign(data, secret, {expiresIn: expiresIn}, (err, token) => {
      if (err) {
        return reject(err);
      }

      resolve(token);
    });
  });
}
