angular.module('coolwallApp')
.factory('HomeService', function($http, $q) {
	return {
		getWalls : function() {
			var deferred = $q.defer();
			$http.get(baseUrl + '/walls').success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		addWall : function(wall) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/newWall', wall).success(function(data, status, headers, config) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		deleteWall : function(id) {
			var deferred = $q.defer();
			$http.delete(baseUrl + '/wall/' + id).success(function(data, status, headers, config) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		}
	};
});