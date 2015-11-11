'use strict';

angular.module('mtdApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('generate', {
        url: '/generate',
        templateUrl: 'app/generate/generate.html',
        controller: 'GenerateCtrl'
      });
  });