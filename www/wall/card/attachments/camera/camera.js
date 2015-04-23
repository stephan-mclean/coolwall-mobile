'use strict';

angular.module('coolwallApp')
.factory('Camera', function($q) {
	return {
		takePhoto: function() {
			var deferred = $q.defer();
			navigator.camera.getPicture(function(imageData) {
				deferred.resolve(imageData);
	  		},
	  		function(err) {
	  			deferred.reject(err);
	  		}, 
	  		{
	  			quality: 50, 
	  			sourceType: Camera.PictureSourceType.CAMERA, 
	  			destinationType: Camera.DestinationType.DATA_URL, 
	  			allowEdit: true
	  		})
			return deferred.promise;
		},

		choosePhoto: function() {
			var deferred = $q.defer();
			navigator.camera.getPicture(function(imageData) {
				deferred.resolve(imageData);
			},
			function(err) {
				deferred.reject(err);
			}, 
			{
				quality: 50, 
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY, 
				destinationType: Camera.DestinationType.DATA_URL, 
				allowEdit: true
			})
			return deferred.promise;
		}
	}
})