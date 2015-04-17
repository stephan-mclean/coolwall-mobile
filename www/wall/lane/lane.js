'use strict';

angular.module('coolwallApp')
.directive('lane', function() {
	return {
		restrict : 'E',
		templateUrl : 'wall/lane/lane.html',
		scope: {
			lanes: '=',
			lane: '='
		},
		controller : function($scope, $rootScope, $timeout, $ionicModal, $ionicPopup, $ionicListDelegate, LaneService, CardService) {

			$scope.card = {'title': '', 'ordinal': ''}; // Var for adding a new card

			/*
				Load the lane options modal
			*/
			$ionicModal.fromTemplateUrl('wall/lane/laneModal.html', {
			    scope: $scope,
			    animation: 'slide-in-up'
			  }).then(function(modal) {
			    $scope.laneOptionsModal = modal;
			});

			/*
				Show the lane options modal
			*/
			$scope.showLaneOptionsModal = function() {
				 $scope.laneOptionsModal.show();
			};

			/*
				Close the lane options modal
			*/
			$scope.closeLaneOptionsModal = function() {
				$scope.laneOptionsModal.hide();
			};

			$scope.showCardModal = function(card) {
				$scope.$broadcast('showCardModal', card.id);
			};

			$scope.showDeleteCardPopup = function(card) {
				$scope.$broadcast('showDeleteCardPopup', card.id);
			}

			/*
				Show a popup to allow the user to 
				add a new card to the lane.
			*/
			$scope.showAddCardPopup = function() {
				$ionicPopup.show({
			        title: 'Add a new card',
			        template: '<input type="text" ng-model="card.title" placeholder="Card title.."/>',
			        scope: $scope,
			        buttons: [
			          {
			            text: 'Cancel',
			            onTap: function(e) {
			            	$scope.card.title = '';
			            }
			          },
			          {
			            text: 'Add',
			            type: 'buttonAccept',
			            onTap: function(e) {
			              $scope.addNewCard();
			            }
			          }
			        ]
			    });
			}

			/* 
				Card sorting on start 
			*/
			$scope.sortCards = function() {
				
				function compare(a, b) {
					if(a.ordinal < b.ordinal) {
						return -1;
					}
					else if(a.ordinal > b.ordinal) {
						return 1;
					}
					return 0;
				}

				$scope.lane.cards.sort(compare);
			}

			$scope.sortCards();

			/*
				Call the back end service to add a new 
				card. On receiving the result, add it to the list
				of cards.
			*/
			$scope.addNewCard = function() {
				var ordinal = $scope.lane.cards.length;
				$scope.card.ordinal = ordinal + "";
				LaneService.addCard($scope.lane.id, $scope.card).then(function(result) {
					$scope.lane.cards.push(result);
					$scope.card.title = '';
					$scope.card.ordinal = '';
				});
			};

			/*
				Delete the lane from the back end & remove from the list of lanes.
				TODO: Update the slide box
			*/
			$scope.deleteLane = function() {
				LaneService.deleteLane($scope.lane.id).then(function(res) {
					var index = $scope.lanes.indexOf($scope.lane);
					if(index > -1) {
						$scope.lanes.splice(index, 1);
						$scope.$emit('laneDeleted');
					}
				})
			};

			/*
				Show a popup to confirm deleting a lane
			*/
			$scope.showDeleteLanePopup = function() {
				$ionicPopup.show({
			        title: 'Delete ' + '"' + $scope.lane.title + '"?',
			        subTitle: 'Are you sure you wish to delete this lane?',
			        scope: $scope,
			        buttons: [
			          {
			            text: 'Cancel',
			          },
			          {
			            text: 'Delete',
			            type: 'buttonDanger',
			            onTap: function(e) {
			              $scope.deleteLane();
			            }
			          }
			        ]
			     });
			}

			/*
				Function call to rename a lane
			*/
			$scope.updateLane = function() {
				var updatedLane = {'title' : $scope.lane.title};
				LaneService.updateLane($scope.lane.id, updatedLane).then(function(result) {
					// Check for errors
				})
			}

			
			$scope.updateCardsSorting = function(startPos, index, cards) {
				if(cards == null || cards == undefined) {
					cards = $scope.lane.cards;
				}
				
				var i;
				if(index < startPos) {
					i = index;
				}
				else {
					i = startPos;
				}
				while(i < cards.length && i >= 0) {
					cards[i].ordinal = i;
					var updatedCard = {'ordinal' : cards[i].ordinal + ""};
					CardService.updateCard(cards[i].id, updatedCard).then(function(result) {
    		 			console.log(result);
    		 		});
					i++;
				}
			}

    		$scope.cardDrag = function() {
    			$scope.$emit('cardDrag');
    		};

    		$scope.dragRelease = function() {
    			$scope.$emit('cardDragEnd');
    			$ionicListDelegate.canSwipeItems(true);
    		};

    		$scope.cardHold = function() {
    			$ionicListDelegate.canSwipeItems(false);
    		}

    		$scope.$on('slideBoxDrag', function() {
    			$ionicListDelegate.closeOptionButtons();
    		});

    		/*
				Sorting has finished, reorder the cards accordinly
				and inform the back end of the change.
    		*/
    		$scope.onReorder = function(from, to, data) {
    			
    			if(from != undefined && to != undefined) {
    				$scope.lane.cards.splice(to, 0, $scope.lane.cards.splice(from, 1)[0]);
    				$scope.updateCardsSorting(from, to, undefined);
    			}
    			else if(from == undefined) {
    				
    				$scope.lane.cards.splice(to, 0, data);
    				var updatedCard = {'ordinal' : to + "", 'laneId' : $scope.lane.id + ""};
    		 		CardService.updateCard(data.id, updatedCard).then(function(result) {
    		 			console.log(result);
    		 		});
    		 		$scope.updateCardsSorting(to + 1, to + 1, undefined);
    				
    			}
    			else if(to == undefined) {
    				//console.log("TO UNDEFINED");
    				$timeout(function() {
    					$scope.lane.cards.splice(from, 1);	
    					$scope.updateCardsSorting(0, 0, undefined);
    				}, 50);
    				
    			}
    		}

    		$scope.onOutsideContainer = function() {
    			$scope.$emit('changeSlide');
    		}


		}
	};
});