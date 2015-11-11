'use strict';

angular.module('mtdApp')
  .filter('searchFilter', function () {
    return function (input, str) {
			var retArray = [];
			for(var i in input) {
				if(input[i].name.indexOf(str) != -1) {
					retArray.push(input[i]);
				}
			}
      return retArray;
    };
  });
