import {Controller, luxify} from 'lux-framework';

import jwt from 'lux-jwt';
import unless from 'lux-unless';
import {getNewToken, secret} from 'app/utils/token';

class ApplicationController extends Controller {
  beforeAction = [
    //Run the JWT middleware except on the the auth routes and OPTIONS requests
    unless({path: ['/auth/login', '/auth/token-refresh'], method: ['OPTIONS']}, jwt({secret: secret}))
  ];
}

export default ApplicationController;
