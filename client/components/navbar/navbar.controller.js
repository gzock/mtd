'use strict';

angular.module('mtdApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'トップ',
      'link': '/'
    },{
			'title': '案件一覧',
			'link': '/projects'
		},{
			'title': '撮影対象項目',
			'link': '/targets'
		},{
			'title': '図書生成',
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
