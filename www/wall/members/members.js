'use strict';

angular.module('coolwallApp')
.directive('members', function() {
	return {
		restrict : 'E',
		templateUrl : 'wall/members/members.html',
		scope: {
			members: '=',
			searchFunc: '&',
			addFunc: '&'
		},
		controller : function($scope) {
			$scope.search = function() {
				$scope.searchFunc({search: $scope.searchFor}).then(function(result) {
					$scope.searchResults = result;
				});
			};

			$scope.addMember = function(user) {
				var theUser = {'id': user.id + "", 'moderator': '0'}; // Fix moderator here
				$scope.addFunc({user: theUser}).then(function(result) {
					$scope.members.push(result);
					$scope.searchResults = [];
					$scope.searchFor.term = '';
				})
			}
		}
	};
});