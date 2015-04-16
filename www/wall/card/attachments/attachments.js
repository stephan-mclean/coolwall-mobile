'use strict';

angular.module('coolwallApp')
.directive('attachments', function() {
	return {
		restrict : 'E',
		templateUrl : 'wall/card/attachments/attachments.html',
		scope: {
			attachments: '=',
			card: '='
		},
		controller : function($scope, $rootScope, CardService) {

			$scope.newAttachment = {};
			
			$scope.showModal = function(id) {
				$rootScope.showModal(id);
				$(id).on("hidden.bs.modal", function() {
					$scope.newAttachment.url = '';
				});
			}

			$scope.addAttachment = function() {
				//console.log($scope.newAttachment);
				if($scope.newAttachment.data) {
					$scope.newAttachment.data = $scope.newAttachment.data.replace('data:image/jpeg;base64,', '');
					$scope.newAttachment.data = $scope.newAttachment.data.replace('data:image/png;base64,', '');
				}

				CardService.addAttachment($scope.card.id, $scope.newAttachment).then(function(result) {
					/* Reset cover variables for other attachments */
					for(var i = 0; i < $scope.attachments.length; i++) {
						$scope.attachments[i].cover = 0;
					}
					$scope.attachments.push(result);
					$scope.card.cover = result.url;
					$scope.newAttachment.url = '';
					$scope.newAttachment.data = '';
					$scope.newAttachment.fileName = '';
				});

				
			};

			$scope.deleteAttachment = function(attachmentId) {
				CardService.deleteAttachment(attachmentId).then(function(result) {
					/* Remove from attachments list */
					for(var i = 0; i < $scope.attachments.length; i++) {
						if($scope.attachments[i].id == attachmentId) {
							/* Reset cover if cover was deleted */ 
							if($scope.attachments[i].cover == 1) {
								$scope.card.cover = '';
							}
							$scope.attachments.splice(i, 1);
							break;
						}
					}

					/* Update cover if available */
					if(result != null && result != undefined && result.url) {
						$scope.card.cover = result.url;
					}
				})
			}
		}
	};
});