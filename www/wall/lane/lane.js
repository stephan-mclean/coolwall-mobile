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
				console.log("Sorting from: " + startPos + " to" + index);
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

			$scope.sortableOptions = {
    		  placeholder: "cardPlaceholder",
    		  connectWith: ".connectedLane",
    		  start: function(event, ui) {
    		  	$(ui.placeholder[0]).css('height', $(ui.item[0]).height());
    		  	$(ui.item[0]).css({'-webkit-transform' : 'rotate(7deg)',
                 '-moz-transform' : 'rotate(7deg)',
                 '-ms-transform' : 'rotate(7deg)',
                 'transform' : 'rotate(7deg)'}).css('cursor', 'move');
    		  	ui.item.data = $scope.lane.cards[ui.item.index()];
    		  	ui.item.startPos = ui.item.index();

    		  },
    		  stop: function(event, ui) {
    		  	$(ui.item[0]).css({'-webkit-transform' : 'none',
                 '-moz-transform' : 'none',
                 '-ms-transform' : 'none',
                 'transform' : 'none'}).css('cursor', 'pointer');
    		  	if(ui.item.index() != -1) {
    		 		// Sorted in this list, update ordinal for all cards
    		 		var index = ui.item.index();
    		 		var updatedCard = {"ordinal": index};
    		 		//$scope.updateCardsSorting(ui.item.startPos, index, undefined);
    		 	}
    		 	else {
    		 		ui.item.data.targetOrdinal = ui.item.sortable.dropindex;
    		 		// Update card with new lane ID and ordinal
    		 		var updatedCard = {'ordinal' : ui.item.data.targetOrdinal + "", 'laneId' : ui.item.data.targetLane + ""};
    		 		//CardService.updateCard(ui.item.data.id, updatedCard).then(function(result) {
    		 		//	console.log(result);
    		 		//});
    		 		//$scope.updateCardsSorting(0, 0, undefined); // Update for this lane with card removed
    		 		//$scope.updateCardsSorting(ui.item.data.targetOrdinal + 1, ui.item.data.targetOrdinal + 1, ui.item.data.targetLaneCards) // Update for new lane with card inserted
    		 	}
    		 	
    		  },
    		  receive : function(event, ui) {
    		  	/* Received from another list */
    		  	ui.item.data.targetLane = $scope.lane.id;
    		  	ui.item.data.targetLaneCards = $scope.lane.cards;
    		  }
    		};

    		$scope.cardDrag = function() {
    			$scope.$emit('cardDrag');
    		};

    		$scope.dragRelease = function() {
    			$scope.$emit('cardDragEnd');
    		};

    		$scope.$on('slideBoxDrag', function() {
    			$ionicListDelegate.closeOptionButtons();
    		});

    		$scope.onReorder = function(from, to) {
    			console.log(from, to);
    		}

    		$scope.changeSlide = function() {
    			$scope.$emit('changeSlide');
    		}
		}
	};
});