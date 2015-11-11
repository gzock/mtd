'use strict';

describe('Controller: GenerateCtrl', function () {

  // load the controller's module
  beforeEach(module('mtdApp'));

  var GenerateCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GenerateCtrl = $controller('GenerateCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
