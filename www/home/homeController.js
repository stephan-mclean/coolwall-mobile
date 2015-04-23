'use strict';

angular.module('coolwallApp')
  .controller('HomeCtrl', function ($scope, $state, $ionicPopup, walls, HomeService) {
  	$scope.walls = walls;
  	$scope.wall = {'title': ''};

  	$scope.$on('showAddWall', function() {
  		var addWallPopup = $ionicPopup.show({
			title: 'Add a new wall',
			template: '<input type="text" ng-model="wall.title" placeholder="Title">',
			scope: $scope,
			buttons: [
				{
					text: 'Cancel',
					onTap: function(e) {
						$scope.wall.title = '';
					}
				},
				{
					text: 'Add',
					type: 'buttonAccept',
					onTap: function(e) {
						$scope.addNewWall();
					}
				}
			]
		});
  	});

  	$scope.addNewWall = function() {
  		HomeService.addWall($scope.wall).then(function(result) {
  			$scope.walls.push(result);
        $scope.wall.title = '';
  		});
  	};

  	$scope.showWall = function(id) {
  		$state.transitionTo('wall', {id: id});
  	};

  	$scope.deleteWall = function(wall) {
      HomeService.deleteWall(wall.id).then(function(result) {
        var index = $scope.walls.indexOf(wall);
        if(index > -1) {
        	$scope.walls.splice(index, 1);
        }
      })
    };

  	$scope.showDeleteWallPopup = function(wall) {
      $ionicPopup.show({
        title: 'Delete ' + '"' + wall.title + '"?',
        subTitle: 'Are you sure you want to delete this wall?',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Delete',
            type: 'buttonDanger',
            onTap: function(e) {
              $scope.deleteWall(wall);
            }
          }
        ]
      });
    };

  });
