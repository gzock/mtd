'use strict';

describe('Filter: searchFilter', function () {

  // load the filter's module
  beforeEach(module('mtdApp'));

  // initialize a new instance of the filter before each test
  var searchFilter;
  beforeEach(inject(function ($filter) {
    searchFilter = $filter('searchFilter');
  }));

  it('should return the input prefixed with "searchFilter filter:"', function () {
    var text = 'angularjs';
    expect(searchFilter(text)).toBe('searchFilter filter: ' + text);
  });

});
