'use strict';

angular.module('mtdApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'Top',
      'link': '/'
    },{
			'title': 'Projects',
			'link': '/projects'
		},{
			'title': 'Targets',
			'link': '/targets'
		},{
			'title': 'Generate',
			'link': '/generate'
		}];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
