
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })
  .config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {
    $stateProvider
    .state('app', {
        url: '/app/public',
        abstract: true,
        templateUrl: 'templates/public/menu.html',
        controller: 'AppCtrl'
      })
      .state('app.welcome', {
        url: '/welcome',
        views: {
          'menuContent': {
            templateUrl: 'templates/welcome.html',
            controller: 'WelcomeCtrl'
          }
        }
      })
      .state('app.login', {
        url: '/login',
        views: {
          'menuContent': {
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
          }
        }
      })
      .state('app.register', {
        url: '/register',
        views: {
          'menuContent': {
            templateUrl: 'templates/register.html',
            controller: 'RegisterCtrl'
          }
        }
      })
      .state('app.polls', {
        url: '/polls',
        views: {
          'menuContent': {
            templateUrl: 'templates/public/polls.html',
            controller: 'PublicPollsCtrl'
          }
        }
      })
      .state('private', {
        url: '/app/private',
        abstract: true,
        templateUrl: 'templates/private/menu.html',
        controller: 'AppCtrl'
      })
      .state('private.profile', {
        url: '/profile',
        views: {
          'menuPrivateContent': {
            'templateUrl': 'templates/private/profile.html',
            'controller': 'ProfilesCtrl'
          }
        }
      })
      .state('private.feed', {
        url: '/feed',
        views: {
          'menuPrivateContent': {
            'templateUrl': 'templates/private/feed.html',
            controller: 'FeedsCtrl'
          }
        }
      })
      .state('private.activity', {
        url: '/activity',
        views: {
          'menuPrivateContent': {
            'templateUrl': 'templates/private/activity.html',
            controller: 'ActivitiesCtrl'
          }
        }
      })
      .state('private.friends', {
        url: '/friends',
        views: {
          'menuPrivateContent': {
            'templateUrl': 'templates/private/friends.html',
            controller: 'FriendsCtrl'
          }
        }
      })
      .state('private.gallery', {
        url: '/gallery',
        views: {
          'menuPrivateContent': {
            'templateUrl': 'templates/private/gallery.html',
            controller: 'GalleriesCtrl'
          }
        }
      })
      .state('private.polls', {
        url: '/polls',
        views: {
          'menuPrivateContent': {
            templateUrl: 'templates/polls.html',
            controller: 'PollsCtrl'
          }
        }
      })
      .state('private.poll_page', {
        url: '/polls/:poll_id',
        views: {
          'menuPrivateContent': {
            templateUrl: 'templates/poll_page.html',
            controller: 'PollPageCtrl'
          }
        }
      })
      .state('main', {
        url: '/',
        abstract: true,
        templateUrl: 'templates/main.html'
      })
      .state('main.dash', {
        url: 'main/dash',
        views: {
          'dash-tab': {
            templateUrl: 'templates/dashboard.html',
            controller: 'DashCtrl'
          }
        }
      })
      .state('main.polls', {
        url: 'main/polls',
        views: {
          'polls-tab': {
            templateUrl: 'templates/polls.html',
            controller: 'PollsCtrl'
          }
        }
      })
      .state('main.admin', {
        url: 'main/admin',
        views: {
          'admin-tab': {
            templateUrl: 'templates/admin.html'
          }
        },
        data: {
          authorizedRoles: [USER_ROLES.admin]
        }
      });

    // Thanks to Ben Noblet!
    $urlRouterProvider.otherwise(function ($injector, $location) {
      var $state = $injector.get("$state");
      $state.go("main.dash");
    });
  })

  //.run(function($httpBackend){
  //  $httpBackend.whenGET('http://localhost:8100/valid')
  //    .respond({message: 'This is my valid response!'});
  //  $httpBackend.whenGET('http://localhost:8100/notauthenticated')
  //    .respond(401, {message: "Not Authenticated"});
  //  $httpBackend.whenGET('http://localhost:8100/notauthorized')
  //    .respond(403, {message: "Not Authorized"});
  //
  //  $httpBackend.whenGET(/templates\/\w+.*/).passThrough();
  //})

  //.run(function($httpBackend){
  //  $httpBackend.whenGET(/templates\/\w+.*/).passThrough();
  //})
  .run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
    $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
      if ('data' in next && 'authorizedRoles' in next.data) {
        var authorizedRoles = next.data.authorizedRoles;
        if (!AuthService.isAuthorized(authorizedRoles)) {
          event.preventDefault();
          $state.go($state.current, {}, {reload: true});
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        }
      }
      if (!AuthService.isAuthenticated()) {
        if ((next.name === 'app.login') || (next.name === 'app.register') || (next.name === 'app.polls') || (next.name === 'app.welcome')) {
          $state.go(next.name, {}, {notify: false});
        }
        else if (next.name !== 'app.welcome') {
          event.preventDefault();
          $state.go('app.welcome');
        }
      }
    });
  });
