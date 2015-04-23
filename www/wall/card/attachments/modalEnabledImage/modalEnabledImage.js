'use strict';

angular.module('coolwallApp')
.directive('modalEnabledImage', function($ionicModal, $timeout) {
	return {
		restrict : 'E',
		scope: {
			url: '='
		},
		templateUrl: 'wall/card/attachments/modalEnabledImage/modalEnabledImage.html',
		controller: function($scope, $ionicModal) {

			$ionicModal.fromTemplateUrl('wall/card/attachments/modalEnabledImage/imageModal.html', {
		     	scope: $scope,
		      	animation: 'slide-in-up'
		    }).then(function(modal) {
		      	$scope.modal = modal;
		    });

			$scope.openModal = function() {
			  if(window.StatusBar) {
			  	StatusBar.hide();
			  }
			  $timeout(function() {
			  	$scope.modal.show();
			  }, 50);
		    };

		    $scope.closeModal = function(e) {
		      e.stopPropagation();
		      if(window.StatusBar) {
		      	StatusBar.show();
		      }	
		      $scope.modal.hide();
		    };
		    
		}
	};
})