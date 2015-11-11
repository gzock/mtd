'use strict';

describe('Service: work', function () {

  // load the service's module
  beforeEach(module('mtdApp'));

  // instantiate service
  var work;
  beforeEach(inject(function (_work_) {
    work = _work_;
  }));

  it('should do something', function () {
    expect(!!work).toBe(true);
  });

});
