'use strict';

angular.module('mtdApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('targets', {
        url: '/targets',
        templateUrl: 'app/targets/targets.html',
        controller: 'TargetsCtrl'
      });
  });