'use strict';

describe('Controller: TargetsCtrl', function () {

  // load the controller's module
  beforeEach(module('mtdApp'));

  var TargetsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TargetsCtrl = $controller('TargetsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
