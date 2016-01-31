angular.module('starter')
  .constant('API_ENDPOINTS', {
    sessions: 'http://localhost:3000/api/v1/users/sessions/',
    polls: 'http://localhost:3000/api/v1/polls/',
    public_polls: 'http://localhost:3000/api/v1/polls/public/',
    categories: 'http://localhost:3000/api/v1/categories/',
    polls_for_category: 'http://localhost:3000/api/v1/categories/:category_id/polls',
    feed: 'http://localhost:3000/api/v1/feed/',
    registrations: 'http://localhost:3000/api/v1/users/registrations/',
    poll_path: 'http://localhost:3000/api/v1/polls/',
    update_vote: 'http://localhost:3000/api/v1/polls/:poll_id/poll_options/:poll_option_id/user_answers'
  })
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest',
    user: 'user'
  });
