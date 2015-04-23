'use strict';

angular.module('coolwallApp')
.directive('comments', function() {
	return {
		restrict : 'E',
		templateUrl : 'wall/card/comments/comments.html',
		scope: {
			card: '=',
			comments: '=',
			user: '='
		},
		controller : function($scope, $ionicModal, CardService) {

			$scope.newComment = {'text': ''};

			$ionicModal.fromTemplateUrl('wall/card/comments/addCommentModal.html', {
		        scope: $scope,
		        animation: 'slide-in-up'
		      }).then(function(modal) {
		        $scope.addCommentModal = modal;
		    });

		    $scope.showAddCommentModal = function() {
		    	$scope.addCommentModal.show();
		    };

		    $scope.closeAddCommentModal = function() {
		    	$scope.addCommentModal.hide();
		    };

			$scope.addComment = function() {
				CardService.addComment($scope.card.id, $scope.newComment).then(function(result) {
					$scope.newComment.text = '';
					$scope.comments.push(result);
				});
			};

			$scope.deleteComment = function(comment) {
				CardService.deleteComment(comment.id).then(function(result) {
					var index = $scope.comments.indexOf(comment);
					if(index > -1) {
						$scope.comments.splice(index, 1);
					}
				});
			};
		}
	};
});