angular.module('starter')
  .service('UserService', function() {
    // For the purpose of this example I will store user data on ionic local storage but you should save it on a database

    var setUser = function(user_data) {
      window.localStorage.starter_google_user = JSON.stringify(user_data);
    };

    var getUser = function(){
      return JSON.parse(window.localStorage.starter_google_user || '{}');
    };

    return {
      getUser: getUser,
      setUser: setUser
    };
  })
  .service('AuthService', function($q, $http, USER_ROLES) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var email = '';
    var isAuthenticated = false;
    var role = '';
    var authToken;

    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }

    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }

    function useCredentials(token) {
      email = token.split('.')[0];
      isAuthenticated = true;
      authToken = token;

      if (email == 'admin') {
        role = USER_ROLES.admin
      }
      if (email == 'user') {
        role = USER_ROLES.public
      }

      // Set the token as header for your requests!
      $http.defaults.headers.common['X-Auth-Token'] = token;
    }

    function destroyUserCredentials() {
      authToken = undefined;
      email = '';
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var login = function(email, pw) {
      return $q(function(resolve, reject) {
        // make call to allpolls and get response

        if ((email == 'admin' && pw == '1') || (email == 'user' && pw == '1')) {
          // Make a request and receive your auth token from your server
          storeUserCredentials(email + '.yourServerToken');
          resolve('Login success.');
        } else {
          reject('Login Failed.');
        }
      });
    };

    var logout = function() {
      destroyUserCredentials();
    };

    var isAuthorized = function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };

    loadUserCredentials();

    return {
      login: login,
      logout: logout,
      isAuthorized: isAuthorized,
      isAuthenticated: function() {return isAuthenticated;},
      email: function() {return email;},
      role: function() {return role;}
    };
  })
  .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized
        }[response.status], response);
        return $q.reject(response);
      }
    };
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
