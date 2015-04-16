angular.module('coolwallApp')
.factory('WallService', function($http, $q) {
	return {
		getWall : function(id) {
			var deferred = $q.defer();
			$http.get(baseUrl + '/wall/' + id).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},
		addLane : function(wallId, lane) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/wall/' + wallId + "/addLane", lane).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		updateWall : function(wallId, updatedWall) {
			var deferred = $q.defer();
			$http.put(baseUrl + '/wall/' + wallId + "/update", updatedWall).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		getMembers : function(wallId) {
			var deferred = $q.defer();
			$http.get(baseUrl + '/wall/' + wallId + "/members").success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		}
	};
});