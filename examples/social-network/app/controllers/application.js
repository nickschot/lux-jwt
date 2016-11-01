import { Controller, luxify } from 'lux-framework';

import luxjwt from 'lux-jwt';
import { getNewToken, secret } from 'app/utils/token';

class ApplicationController extends Controller {
    beforeAction = [
        luxify(luxjwt({secret: secret}).unless({path: ['/users/login']}))
    ];

    static async token(request) {
        let data = {
            user: request.user.user
        };

        const token = await getNewToken(data);

        if(token){
            return {
                token: token
            };
        }
    }
}

export default ApplicationController;
