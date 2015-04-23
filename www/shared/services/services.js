/*
	This file includes services which are used throughout the 
	various components of the application.

	Author: Stephan McLean
*/

var app = angular.module('coolwallApp');

var baseUrl = 'http://localhost:4567';

/*
	LocalStorage service. 

	This service wraps the windows local storage functions
	to allow data to be saved to the browser.
*/
app.factory('LocalStorage', function($window) {
	return {
		set: function(key, value) {
	      $window.localStorage[key] = value;
	    },
	    get: function(key, defaultValue) {
	      return $window.localStorage[key] || defaultValue;
	    },
	    setObject: function(key, value) {
	      $window.localStorage[key] = JSON.stringify(value);
	    },
	    getObject: function(key) {
	      return JSON.parse($window.localStorage[key] || '{}');
	    },
	    deleteItem: function(key) {
	    	delete $window.localStorage[key];
	    }
	};
});

/* 
	Authentication service.
	This service handles login & logout of the user.
	It stores/deletes the users token locally in the browser &
	also adds/removes it's value to the 'Authorization' HTTP header. 

*/
app.factory('Authentication', function($http, LocalStorage, $q) {
	return {
		login: function(user) {
			var deferred = $q.defer();
			$http.post(baseUrl + '/login', user).success(function(data, status, headers, config) {
				$http.defaults.headers.common.Authorization = data.token;
				LocalStorage.set('token', data.token);
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(data);
			});
			return deferred.promise;
		},

		logout: function() {
			var deferred = $q.defer();
			$http.put(baseUrl + '/logout').success(function(data, status, headers, config) {
				delete $http.defaults.headers.common.Authorization;
				LocalStorage.deleteItem('token');
				deferred.resolve('Success');
			})
			.error(function(data, status, headers, config) {
				deferred.reject('error');
			});
			return deferred.promise;
		}
	};
});

app.factory('User', function($http, $q) {
	return {
		getCurrentUser: function() {
			var deferred = $q.defer();
			$http.get(baseUrl + '/currentUser').success(function(data) {
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		}
	}
})