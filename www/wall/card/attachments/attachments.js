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
		controller : function($scope, $rootScope, $ionicModal, CardService, Camera) {

			$scope.newAttachment = {'data': '', 'description': ''};

			$ionicModal.fromTemplateUrl('wall/card/attachments/addAttachmentModal.html', {
		        scope: $scope,
		        animation: 'slide-in-up'
		      }).then(function(modal) {
		        $scope.addAttachmentModal = modal;
		    });

		    $scope.showAddAttachmentModal = function() {
		    	$scope.addAttachmentModal.show();
		    };

		    $scope.closeAddAttachmentModal = function() {
		    	$scope.addAttachmentModal.hide();
		    };

		    $scope.takePhoto = function() {
			  Camera.takePhoto().then(function(imageData) {
			  	$scope.imageSrc = "data:image/jpeg;base64," + imageData;
				$scope.imageData = imageData;
				$scope.$apply()
			  });
			};

			$scope.choosePhoto = function() {
				Camera.choosePhoto().then(function(imageData) {
					$scope.imageSrc = "data:image/jpeg;base64," + imageData;
					$scope.imageData = imageData;
					$scope.$apply()
				});
			};

			$scope.deleteImage = function() {
				$scope.imageSrc = null;
				$scope.imageData = null;
				$scope.$apply();
			};

			$scope.addAttachment = function() {
				
				if($scope.imageData) {
					$scope.newAttachment.data = $scope.imageData;
				}

				CardService.addAttachment($scope.card.id, $scope.newAttachment).then(function(result) {
					/* Reset cover variables for other attachments */
					for(var i = 0; i < $scope.attachments.length; i++) {
						$scope.attachments[i].cover = 0;
					}
					$scope.attachments.push(result);
					$scope.card.cover = result.url;
					
					$scope.newAttachment.data = '';
					$scope.newAttachment.description = '';

					$scope.imageSrc = null;
					$scope.imageData = null;
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