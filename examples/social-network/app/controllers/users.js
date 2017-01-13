import {Controller} from 'lux-framework';

import User from 'app/models/user';

class UsersController extends Controller {
  params = [
    'name',
    'email',
    'password'
  ];
}

export default UsersController;
