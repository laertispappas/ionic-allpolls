angular.module('starter')
  .controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
    $scope.email = AuthService.email();

    $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
      var alertPopup = $ionicPopup.alert({
        title: 'Unauthorized!',
        template: 'You are not allowed to access this resource.'
      });
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
      AuthService.logout();
      $state.go('login');
      var alertPopup = $ionicPopup.alert({
        title: 'Session Lost!',
        template: 'Sorry, You have to login again.'
      });
    });

    $scope.setCurrentEmail = function(name) {
      $scope.email = name;
    };
  })
  .controller('WelcomeCtrl', function($scope, $state, UserService, $ionicLoading, $ionicModal) {
    // allpolls sign in
    $scope.allpollsSignIn = function(){
      $ionicLoading.hide();
      $state.go('login', {}, {reload: true});
    };

    // This method is executed when the user press the "Sign in with Google" button
    $scope.googleSignIn = function() {
      $ionicLoading.show({
        template: 'Logging in...'
      });
      window.plugins.googleplus.login(
        {},
        function (user_data) {
          // For the purpose of this example I will store user data on local storage
          UserService.setUser({
            userID: user_data.userId,
            name: user_data.displayName,
            email: user_data.email,
            picture: user_data.imageUrl,
            accessToken: user_data.accessToken,
            idToken: user_data.idToken
          });

          $ionicLoading.hide();
          $state.go('main.dash', {}, {reload: true});
        },
        function (msg) {
          $ionicLoading.hide();
        }
      );
    };
  })
  .controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService) {
    $scope.data = {};

    $scope.login = function(data) {
      AuthService.login(data.email, data.password).then(function(authenticated) {
        $state.go('main.dash', {}, {reload: true});
        $scope.setCurrentEmail(data.email);
      }, function(err) {
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: 'Please check your credentials!'
        });
      });
    };
  })
  .controller('RegisterCtrl', function($scope, $state, $ionicPopup, AuthService) {
    $scope.data = {};

    $scope.register = function(data) {

    };
  })
  .controller('DashCtrl', function($scope, $state, $http, $ionicPopup, AuthService) {
    $scope.logout = function() {
      AuthService.logout();
      $state.go('login');
    };

    $scope.performValidRequest = function() {
      $http.get('http://localhost:8100/valid').then(
        function(result) {
          $scope.response = result;
        });
    };

    $scope.performUnauthorizedRequest = function() {
      $http.get('http://localhost:8100/notauthorized').then(
        function(result) {
          // No result here..
        }, function(err) {
          $scope.response = err;
        });
    };

    $scope.performInvalidRequest = function() {
      $http.get('http://localhost:8100/notauthenticated').then(
        function(result) {
          // No result here..
        }, function(err) {
          $scope.response = err;
        });
    };
  });
