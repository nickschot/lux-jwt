import {Controller, luxify} from 'lux-framework';

import jwt from 'lux-jwt';
import unless from 'lux-unless';
import {getNewToken, secret} from 'app/utils/token';

class ApplicationController extends Controller {
  beforeAction = [
    //Run the JWT middleware except on the /users/login route
    unless({path: ['/users/login']}, jwt({secret: secret}))
  ];

  token = async(request) => {
    let data = {
      user: request.user.user
    };

    const token = await getNewToken(data);

    if (token) {
      return {
        token: token
      };
    }
  }
}

export default ApplicationController;
