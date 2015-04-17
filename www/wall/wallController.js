'use strict';

angular.module('coolwallApp')
  .controller('WallCtrl', function ($scope, $rootScope, $timeout, $state, $ionicSlideBoxDelegate, $ionicModal, 
    $ionicPopup, WallService, HomeService, MemberService, wall) {

    $scope.wall = wall;

    $scope.lane = {'title': ''}; // For adding a new lane

    /*
      Load the wall options modal
    */
    $ionicModal.fromTemplateUrl('wall/wallModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.wallOptionsModal = modal;
    });

    /*
      Show the wall options modal
    */
    $scope.showWallOptionsModal = function() {
      if(!$scope.wall.members) {
        WallService.getMembers($scope.wall.id).then(function(result) {
          $scope.wall.members = result;
        });
      }

      $scope.wallOptionsModal.show();
    }

    /*
      Close the wall options modal
    */
    $scope.closeWallOptionsModal = function() {
      $scope.wallOptionsModal.hide();
    }


    /*
      Top Nav button pressed to access wall settings.
    */
    $scope.$on('showWallModal', function() {
      $scope.showWallOptionsModal();
    });

    /*
      Top Nav 'Plus' button pressed, show the add lane popup.
    */
    $scope.$on('showAddLane', function() {
      $scope.showAddLanePopup();
    });

    /*
      Show a popup to the user where they can add a new lane.
    */
    $scope.showAddLanePopup = function() {
      $ionicPopup.show({
        title: 'Add a new lane',
        template: '<input type="text" ng-model="lane.title" placeholder="Lane Title..">',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            onTap: function(e) {
              $scope.lane.title = '';
            }
          },
          {
            text: 'Add',
            type: 'buttonAccept',
            onTap: function(e) {
              $scope.addNewLane();
            }
          }
        ]
      });
    }

    /*
      A lane has been deleted from the wall, 
      update the slidebox.

      BUG:
        If the lane in the last index is deleted the slidebox
        does not update properly. Should move one back
        instead stays the same i.e blank screen.
    */
    $scope.$on('laneDeleted', function() {
      $ionicSlideBoxDelegate.update();
    });

    /*
      Function called by the add lane popup. Call the back
      end service, add the lane to wall.lanes 
      and update the slide box
    */
    $scope.addNewLane = function() {
      WallService.addLane($scope.wall.id, $scope.lane).then(function(result) {
        $scope.wall.lanes.push(result);
        $scope.lane.title = ''; // Reset new lane title
        $ionicSlideBoxDelegate.update();
        
        /*
          Timeout to allow slide box to update, then
          navigate to newly added lane
        */
        $timeout(function() {
          $ionicSlideBoxDelegate.slide($scope.wall.lanes.length - 1);
        }, 100);
        
      });
    };

    /*
      Delete the wall and return to the home screen
    */
    $scope.deleteWall = function() {
      HomeService.deleteWall($scope.wall.id).then(function(result) {
        $state.transitionTo('home');
      })
    };

    /*
      Show a popup to the user asking if they wish to
      delete this wall.
    */
    $scope.showDeleteWallPopup = function() {
      $ionicPopup.show({
        title: 'Delete ' + '"' + $scope.wall.title + '"?',
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
              $scope.deleteWall();
            }
          }
        ]
      });
    }

    /*
      Update the walls title and close the wall options modal.
    */
    $scope.updateWall = function() {
      var updatedWall = {'title' : $scope.wall.title};
      WallService.updateWall($scope.wall.id, updatedWall).then(function(result) {
        // Check for errors
      });
    };

    /*
      Call back function for the members directive used in the modal.
      Search the backend for a list of users and return the list.
    */
    $scope.searchMembers = function(search) {
      return MemberService.searchAllUsers(search);
    };

    /*
      Call back function for the members directive used in the modal.
      Add a member to this wall.
    */
    $scope.addMember = function(user) {
      return MemberService.addWallMember($scope.wall.id, user);
    }


    $scope.$on('cardDrag', function() {
      $ionicSlideBoxDelegate.enableSlide(false);
    });

    $scope.$on('cardDragEnd', function() {
      $ionicSlideBoxDelegate.enableSlide(true);
    });

    /*
      Called when reordering cards
    */
    $scope.$on('changeSlide', function() {
      $ionicSlideBoxDelegate.next();
    });

    $scope.slideDrag = function() {
      $scope.$broadcast('slideBoxDrag');
    }

  });
