'use strict';

angular.module('coolwallApp')
.factory('CardService', function($http, $q) {
	return {
		updateCard : function(cardId, updatedCard) {
			var deferred = $q.defer();
			$http.put(baseUrl + '/card/' + cardId + "/update", updatedCard).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		getComments : function(cardId) {
			var deferred = $q.defer();
			$http.get(baseUrl + '/card/' + cardId + "/comments").success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		addComment : function(cardId, comment) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/card/' + cardId + "/addComment", comment).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		getMembers : function(cardId) {
			var deferred = $q.defer();
			$http.get(baseUrl + '/card/' + cardId + "/members").success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		addAttachment : function(cardId, attachment) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/card/' + cardId + "/addAttachment", attachment).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		deleteAttachment : function(attachmentId) {
			var deferred = $q.defer();
			$http.delete(baseUrl + '/attachment/' + attachmentId).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		getAttachments : function(cardId) {
			var deferred = $q.defer();
			$http.get(baseUrl + '/card/' + cardId + "/attachments").success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},

		deleteCard : function(cardId) {
			var deferred = $q.defer();
			$http.delete(baseUrl + '/card/' + cardId).success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		}		
	};
});