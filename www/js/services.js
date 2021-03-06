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

  .service('AuthService', function($q, $http, USER_ROLES, API_ENDPOINTS) {
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
      role = USER_ROLES.public
      //if (email == 'admin') {
      //  role = USER_ROLES.admin
      //}
      //if (email == 'user') {
      //}

      // Set the token as header for your requests!
      $http.defaults.headers.common['X-Auth-Token'] = token; // 'email.token'
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
        // make call to allpolls and try to authenticate user
        var data = new FormData;
        data.append('email', email);
        data.append('password', pw);

        $http({
          url: API_ENDPOINTS.sessions,
          method: 'POST',
          data: data,
          transformRequest: false,
          headers: { 'Content-Type': undefined }
        }).then(function(response) {
          access_token = response.data.access_token;
          //email = response.data.email;
          //token_type = response.data.token_type;
          storeUserCredentials(email + '.' + access_token);
          resolve('Login success.');
        }, function(error) {
          //console.log(error.data);
          reject('Login Failed.');
        });
      });
    };

    var register = function(email, username, password, password_confirmation) {
      return $q(function(resolve, reject) {
        // make call to allpolls and try to authenticate user
        var data = new FormData;
        data.append('email', email);
        data.append('username', username);
        data.append('password', password);
        data.append('password_confirmation', password_confirmation);

        $http({
          url: API_ENDPOINTS.registrations,
          method: 'POST',
          data: data,
          transformRequest: false,
          headers: { 'Content-Type': undefined }
        }).then(function(response) {
          access_token = response.data.access_token;
          storeUserCredentials(email + '.' + access_token);
          resolve('Registration success.');
        }, function(error) {
          reject(error.data);
        });
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
      register: register,
      isAuthenticated: function() {return isAuthenticated;},
      email: function() {return email;},
      role: function() {return role;}
    };
  })
  .factory('AllPollsService', function($http, $q, API_ENDPOINTS) {
    var polls = [];
    var poll = null;
    var pollsFeed = [];

    var getPollFeedByIndex = function(index) {
      return pollsFeed[index]
    };

    var getPollFeedById = function (id) {
      for(i = 0; i < pollsFeed.length; i++) {
        if (pollsFeed[i].id == id) {
          return pollsFeed[i];
        }
      }
      return null;
    };

    var getPollByIndex = function(index) {
      return polls[index]
    };

    var getPollById = function (id) {
      for(i = 0; i < polls.length; i++) {
        if (polls[i].id == id) {
          return polls[i];
        }
      }
      return null;
    };

   var updatePollVote = function (poll, pollResponse) {
      console.log(pollResponse);
      poll.poll_options[0].voted = pollResponse.poll_options[0].voted;
      poll.poll_options[0].user_answers_count = pollResponse.poll_options[0].user_answers_count;
      poll.poll_options[1].voted = pollResponse.poll_options[1].voted;
      poll.poll_options[1].user_answers_count = pollResponse.poll_options[1].user_answers_count;
      poll.current_user_vote = pollResponse.current_user_vote;
      poll.user_answers_count = pollResponse.user_answers_count;
      
      // update poll object from feed page if exists. Refactor broadcast somehow
      feedPoll = getPollFeedById(poll.id);
      if ((feedPoll != null) || (feedPoll != undefined) ) {
        feedPoll.poll_options[0].voted = pollResponse.poll_options[0].voted;
        feedPoll.poll_options[0].user_answers_count = pollResponse.poll_options[0].user_answers_count;
        feedPoll.poll_options[1].voted = pollResponse.poll_options[1].voted;
        feedPoll.poll_options[1].user_answers_count = pollResponse.poll_options[1].user_answers_count;
        feedPoll.current_user_vote = pollResponse.current_user_vote;
        feedPoll.user_answers_count = pollResponse.user_answers_count;
      }
 
      // update poll obj from polls page
      otherPoll = getPollById(poll.id);
      if ((otherPoll != null) || (otherPoll != undefined) ) {
        otherPoll.poll_options[0].voted = pollResponse.poll_options[0].voted;
        otherPoll.poll_options[0].user_answers_count = pollResponse.poll_options[0].user_answers_count;
        otherPoll.poll_options[1].voted = pollResponse.poll_options[1].voted;
        otherPoll.poll_options[1].user_answers_count = pollResponse.poll_options[1].user_answers_count;
        otherPoll.current_user_vote = pollResponse.current_user_vote;
        otherPoll.user_answers_count = pollResponse.user_answers_count;
      }
   };

    var getPollsFromResponse = function (pollsResponse, metaResponse) {
      tmp_polls = {};
      tmp_polls = pollsResponse;
      tmp_polls.meta = metaResponse;

      return tmp_polls;
    };

    return {
      createPoll: function(newPollData) {
        return $q(function(resolve, reject) {
          return $http({
            url: API_ENDPOINTS.polls,
            method: "POST",
            data: { 'poll': {
              'title': newPollData.title,
              'poll_options': [
                {'title': newPollData.poll_options[0].title},
                {'title': newPollData.poll_options[1].title},
              ]
            }
            }
          }).then(function(response) {
              resolve(response);
            },
            function(response) { // optional
              reject(response);
            });
        });
        //return $http.post(API_ENDPOINTS.polls, newPollData).then(
        //  function (result) {
        //    return result;
        //  }, function(error) {
        //    return error;
        //  });
      },
      getPublicPolls: function(pageNumber) {
        if (pageNumber == null) {
          pageNumber = 1
        }
        return $http.get(API_ENDPOINTS.public_polls + "?page=" + pageNumber).then(
          function(result) {
            polls = getPollsFromResponse(result.data.polls, result.data.meta);
            console.log(polls.meta);
            return polls;
          });
      },
      feed: function(params){
        return $http.get(API_ENDPOINTS.feed, {
          params: params
        }).then(
          function(result) {
            newPollsFeed = getPollsFromResponse(result.data.feeds, result.data.meta);
            pollsFeed = pollsFeed.concat(newPollsFeed);
            return pollsFeed;
          });
      },
      getPolls: function(params) {
        return $http.get(API_ENDPOINTS.polls, {
          params: params
        }).then(
          function(result) {
            polls = getPollsFromResponse(result.data.polls, result.data.meta);
            return polls;
          });
      },
      getPoll: function(poll_id) {
        return $http.get(API_ENDPOINTS.poll_path + poll_id).then(
          function(result) {
            poll = result.data.poll;
            return poll;
          });
      },
      getCategories: function() {
        return $http.get(API_ENDPOINTS.categories).then(
          function(result) {
            return result.data;
          });
      },
      updateVote: function(poll, pollOptionId) {
        var endpoint = API_ENDPOINTS.update_vote.replace(':poll_id', poll.id);
        endpoint = endpoint.replace(':poll_option_id', pollOptionId);
        return $http.post(endpoint).then(
          function(result) {
            pollResponse = result.data.poll;
            updatePollVote(poll, pollResponse);
            return poll;
          });
      },
      polls: function() { return polls; },
      poll:  function() { return poll; },
      getPollByIndex: getPollByIndex,
      getPollFeedById: getPollFeedById,
      getPollFeedByIndex: getPollFeedByIndex,
      getPollById: getPollById
    };
  })
  .factory('MyAPIServiceExample', function($http){
    var apiurl, myData;
    return {
      getData: function(){
        $http.get(apiurl)
          .success(function(data, status, config, headers){
            return (myData = data);
          })
          .error(function(){ //handler errors here
          });
      },
      data: function() { return myData; }
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
