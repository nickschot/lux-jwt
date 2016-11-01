import jwt from 'jsonwebtoken';

//NOTE: you should put this in an environment variable instead of the codebase
export const secret = 'shhhhhhared-secret';
export const expiresIn = 60 * 60;

export function getNewToken(data){
    return new Promise((resolve, reject) => {
        jwt.sign(data, secret, { expiresIn: expiresIn }, (err, token) => {
            if(err) {
                return reject(err);
            }

            resolve(token);
        });
    });
}