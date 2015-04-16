'use strict';

angular.module('coolwallApp')
  .controller('LoginCtrl', function ($scope, $rootScope, $state, Authentication) {
    
    $scope.login = function() {
    	Authentication.login($scope.user).then(function(user) {
    		$rootScope.user = user;
    		$state.transitionTo('home');
    	},
        function(error) {
            $scope.errorMessage = error;
        });
    };
  });
