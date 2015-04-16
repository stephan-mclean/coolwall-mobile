'use strict';

angular.module('coolwallApp')
.factory('LaneService', function($http, $q) {
	return {
		addCard : function(laneId, card) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/lane/' + laneId + "/addCard", card).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		deleteLane : function(laneId) {
			var deferred = $q.defer();
			$http.delete(baseUrl + '/lane/' + laneId).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		updateLane : function(laneId, updatedLane) {
			var deferred = $q.defer();
			$http.put(baseUrl + '/lane/' + laneId + "/update", updatedLane).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		}
	};
});