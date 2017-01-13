import { Controller } from 'lux-framework';
import { verify } from 'lux-jwt';

import User from 'app/models/user';
import { getNewToken, secret } from "../utils/token";

class AuthController extends Controller {
    query = [
        'data'
    ];

    login({
        params: {
            data: {
                attributes: {
                    username,
                    password
                }
            }
        }
    }) {
        return User.authenticate(username, password);
    }

    async tokenRefresh ({
        params: {
            data: {
                attributes: {
                    token
                }
            }
        }
    }) {
        try {
            const oldPayload = verify(token, secret);

            const newToken = await getNewToken({
                user: oldPayload.user
            });

            if (newToken) {
                return {
                    token: newToken
                };
            }
        } catch (e) {
            return 401;
        }
    }
}

export default AuthController;
