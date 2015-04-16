'use strict';

angular.module('coolwallApp')
.directive('card', function() {
	return {
		restrict : 'E',
		templateUrl : 'wall/card/card.html',
		scope: {
			card: '=',
			cards: '='
		},
		controller : function($scope, $rootScope, $ionicModal, $ionicPopup, CardService) {
			$scope.editingDescription = false;

			/*
				Load the card modal
			*/
			$ionicModal.fromTemplateUrl('wall/card/cardModal.html', {
			    scope: $scope,
			    animation: 'slide-in-up'
			  }).then(function(modal) {
			    $scope.cardOptionsModal = modal;
			});

			/*
				Show the card options modal
			*/
			$scope.showCardOptionsModal = function() {
				 $scope.cardOptionsModal.show();
			};

			/*
				Close the card options modal
			*/
			$scope.closeCardOptionsModal = function() {
				$scope.cardOptionsModal.hide();
			};

			$scope.$on('showCardModal', function(event, id) {
				if(id == $scope.card.id) {
					$scope.showCardOptionsModal();
				}
			});

			$scope.$on('showDeleteCardPopup', function(event, id) {
				if(id == $scope.card.id) {
					$scope.showDeleteCardPopup();
				}
			});

			$scope.showDeleteCardPopup = function() {
				$ionicPopup.show({
			        title: 'Delete ' + '"' + $scope.card.title + '"?',
			        subTitle: 'Are you sure you wish to delete this card?',
			        scope: $scope,
			        buttons: [
			          {
			            text: 'Cancel',
			          },
			          {
			            text: 'Delete',
			            type: 'buttonDanger',
			            onTap: function(e) {
			              $scope.deleteCard();
			            }
			          }
			        ]
			     });
			};

			$scope.showModal = function(id) {

				// Load extra card details before modal is shown
				if(!$scope.card.comments) {
					CardService.getComments($scope.card.id).then(function(result) {
						$scope.card.comments = result;
					});
				}

				if(!$scope.card.members) {
					CardService.getMembers($scope.card.id).then(function(result) {
						$scope.card.members = result;
					});
				}

				if(!$scope.card.attachments) {
					CardService.getAttachments($scope.card.id).then(function(result) {
						$scope.card.attachments = result;
					});
				}

				$rootScope.showModal(id);
				$(id).on('hidden.bs.modal', function(e) {
					$scope.editingDescription = false;
				});
			};

			$scope.updateCard = function() {
				var updatedCard = {
					'title' : $scope.card.title,
					'description' : $scope.card.description,
				};
				CardService.updateCard($scope.card.id, updatedCard).then(function(result) {
					console.log(result);
				});
			};

			$scope.deleteCard = function() {
				CardService.deleteCard($scope.card.id).then(function(result) {
					console.log(result);
					var index = $scope.cards.indexOf($scope.card);
					if(index > -1) {
						$scope.cards.splice(index, 1);
					}
				})
			}

			$scope.searchMembers = function(search) {
		      return MemberService.searchAllUsers(search);
		    };

		    $scope.addMember = function(user) {
		      return MemberService.addCardMember($scope.card.id, user);
		    };
		}
	};
});