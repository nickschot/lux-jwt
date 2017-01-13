export default function routes() {
  this.resource('actions', {
    only: ['show', 'index']
  });

  this.resource('comments');

  this.resource('friendships', {
    only: ['create', 'destroy']
  });

  this.resource('notifications', {
    only: ['show', 'index']
  });

  this.resource('posts');
  this.resource('reactions');
  this.resource('tags');

  this.resource('users');

  this.resource('auth', {
    only: []
  }, function () {
    this.post('/login', 'login');
    this.post('/token-refresh', 'tokenRefresh');
  });

  this.namespace('admin', function () {
    this.resource('actions');
    this.resource('comments');
    this.resource('friendships');
    this.resource('notifications');
    this.resource('posts');
    this.resource('reactions');
    this.resource('tags');
    this.resource('users');
  });
}
