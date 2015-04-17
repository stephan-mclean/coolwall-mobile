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
		controller : function($scope, $ionicModal) {

			$scope.searchFor = {'term': ''};

			$ionicModal.fromTemplateUrl('wall/members/membersModal.html', {
		        scope: $scope,
		        animation: 'slide-in-up'
		      }).then(function(modal) {
		        $scope.addMemberModal = modal;
		    });

		    $scope.showAddMemberModal = function() {
		    	$scope.addMemberModal.show();
		    };

		    $scope.closeAddMemberModal = function() {
		    	$scope.searchFor.term='';
		    	$scope.searchResults = [];
		    	$scope.addMemberModal.hide();
		    };

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
			};
		}
	};
});