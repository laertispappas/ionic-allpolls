angular.module('starter')
  .controller('AppCtrl', function($scope, $state, $ionicPopup, $ionicModal, AuthService, AllPollsService, AUTH_EVENTS) {
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

    $scope.email = AuthService.email();

    $scope.logout = function() {
      AuthService.logout();
      $state.go('app.welcome');
    };

    $scope.setCurrentEmail = function(name) {
      $scope.email = name;
    };

    $scope.newPoll = {
      poll_options: [
      ]
    };

    $scope.createPoll = function (newPollData) {
      AllPollsService.createPoll(newPollData).then(function(response){
        console.log(response);
        $scope.closeNewPollModal();
      }, function(err){
        console.log(err);
      });
    };

    $ionicModal.fromTemplateUrl('templates/polls/new.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal
    });

    $scope.openNewPollModal = function() {
      $scope.modal.show()
    };

    $scope.closeNewPollModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  })
  .controller('WelcomeCtrl', function($scope, $state, UserService, $ionicLoading, $ionicModal) {
    // allpolls sign in
    $scope.allpollsSignIn = function(){
      $ionicLoading.hide();
      $state.go('app.login', {}, {reload: true});
    };

    // This method is executed when the user press the "Sign in with Google" button
    $scope.googleSignIn = function() {
      $ionicLoading.show({
        template: 'Logging in...'
      });

      // this causes an exception
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
  .controller('PublicPollsCtrl', function($scope, $state, $ionicLoading, AllPollsService) {
    // show hide loading functions
    //$scope.show = function() {
    //  $ionicLoading.show({
    //    template: 'Loading...'
    //  });
    //};
    //$scope.hide = function(){
    //  $ionicLoading.hide();
    //};

    AllPollsService.getPublicPolls(null).then(function(polls) {
      $ionicLoading.show({
        template: 'Loading...'
      });
      $scope.polls = polls;
      $ionicLoading.hide();
    });

    $scope.loginAndRedirect = function(){
      $state.go('app.welcome', {}, {reload: true});
    };

    $scope.nextPage = function(pageNumber) {
      AllPollsService.getPublicPolls(pageNumber).then(function(polls) {
        $scope.polls = polls;
        console.log(polls);
      });
    };
  })
  .controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService) {
    $scope.data = {};

    $scope.login = function(data) {
      AuthService.login(data.email, data.password).then(function(authenticated) {
        $state.go('private.polls', {}, {reload: true});
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
      AuthService.register(data.email, data.username, data.password, data.password_confirmation).then(function(authenticated) {
        $scope.setCurrentEmail(data.email);
        $state.go('private.polls', {}, {reload: true});
      }, function(err) {
        $scope.response = err;
        var alertPopup = $ionicPopup.alert({
          title: 'Register failed!',
          template: 'Please try again!'
        });
      });
    };
  })
  .controller('DashCtrl', function($scope, $state, $http, $ionicPopup, AuthService, API_ENDPOINTS) {
    $scope.performValidRequest = function() {
      $http.get(API_ENDPOINTS.polls).then(
        function(result) {
          $scope.response = result.data;
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
        }); // end then
    };
  }).controller('PollsCtrl', function($scope, $state, AllPollsService) {
    AllPollsService.getPolls().then(function(polls) {
      $scope.polls = polls;
    });

    $scope.nextPage = function(pageNumber) {
      AllPollsService.getPolls(pageNumber).then(function(polls) {
        $scope.polls = polls;
        console.log(polls);
      });
    };
    $scope.updateVote = function(pollId, pollOptionId, voted) {
      if (voted) { return; }
      var pollToVote = AllPollsService.getPollById(pollId);

      AllPollsService.updateVote(pollToVote, pollOptionId).then(function(result) {
        console.log(result);
      }, function (error) {
        console.log(error.data);
      });
    }

  }).controller('PollPageCtrl', function($scope, $state, AllPollsService, $stateParams) {
    AllPollsService.getPoll($stateParams.poll_id).then(function(poll) {
      $scope.poll = poll;
    });

    $scope.updateVote = function(pollId, pollOptionId, voted) {
      if (voted) { return; }

      AllPollsService.updateVote(AllPollsService.poll(), pollOptionId).then(function(result) {
        console.log(result);
      }, function (error) {
        console.log(error.data);
      });
      return;
    }
  });
