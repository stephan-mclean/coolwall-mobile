'use strict';

angular.module('coolwallApp')
.directive('comments', function() {
	return {
		restrict : 'E',
		templateUrl : 'wall/card/comments/comments.html',
		scope: {
			card: '=',
			comments: '='
		},
		controller : function($scope, CardService) {
			$scope.addComment = function() {
				CardService.addComment($scope.card.id, $scope.comment).then(function(result) {
					$scope.comment.text = '';
					$scope.comments.push(result);
				});
			}
		}
	};
});