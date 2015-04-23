angular.module('coolwallApp')
.factory('MemberService', function($http, $q) {
	return {
		searchAllUsers : function(search) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/searchUsers', search).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		searchWallMembers : function(wallId, search) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/wall/' + wallId + "/searchMembers", search).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		addWallMember : function(wallId, user) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/wall/' + wallId + "/addMember", user).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		addCardMember : function(cardId, user) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/card/' + cardId + "/addMember", user).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		deleteWallMember : function(wallId, member) {
			var deferred = $q.defer();
			$http.delete(baseUrl + '/wall/' + wallId + "/member/" + member).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		deleteCardMember : function(cardId, member) {
			var deferred = $q.defer();
			$http.delete(baseUrl + '/card/' + cardId + "/member/" + member).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

	};
});