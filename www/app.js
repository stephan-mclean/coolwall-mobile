
angular.module('coolwallApp', ['ionic'])

.run(function($ionicPlatform, $rootScope, $state, $http, LocalStorage, User) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    /* Check if user already logged in */
    if(LocalStorage.get("token")) {
      $http.defaults.headers.common.Authorization = LocalStorage.get("token");
      User.getCurrentUser().then(function(user) {
        $rootScope.user = user;
        $state.transitionTo('home');
      });
    }
    else {
      $state.transitionTo('login');
    }

  });
})

.config(function($stateProvider) {
  
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'login/login.html',
    controller: 'LoginCtrl'
  });

  $stateProvider.state('home', {
    url: '/home',
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl',
    resolve: {
      walls: function(HomeService) {
        return HomeService.getWalls();
      }
    }
  });

  $stateProvider.state('wall', {
    url: '/wall/:id',
    templateUrl: 'wall/wall.html',
    controller: 'WallCtrl',
    resolve: {
      wall: function(WallService, $stateParams) {
        return WallService.getWall($stateParams.id);
      }
    }
  });


})
