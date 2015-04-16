'use strict';

angular.module('coolwallApp')
.directive('topNav', function() {
	return {
		restrict : 'E',
		templateUrl : 'shared/topnav/topNav.html',
		scope: {
			user: '='
		},
		controller : function($scope, $state, $ionicPopup) {
			$scope.page = $state.current.name;

			$scope.showLogout = function() {
				var logoutPopup = $ionicPopup.show({
					title: 'Logged in as: ' + $scope.user.name,
					subTitle: 'Do you wish to log out?',
					scope: $scope,
					buttons: [
						{text: 'Cancel'},
						{
							text: 'Logout',
							type: 'buttonDanger',
							onTap: function(e) {
								console.log("Logout btn");
							}
						}
					]
				});
			};

			$scope.showAddWall = function() {
				$scope.$emit('showAddWall');
			};

			$scope.showAddLane = function() {
				$scope.$emit('showAddLane');
			}

			$scope.performContextualAction = function() {
				if($scope.page == 'home') {
					$scope.showAddWall();
				}
				else if($scope.page == "wall") {
					$scope.showAddLane();
				}
			};

			$scope.showWallSettings = function() {
				$scope.$emit('showWallModal');
			};

			$scope.toPage = function(to) {
				$state.transitionTo(to);
			}	
		}
	};
});