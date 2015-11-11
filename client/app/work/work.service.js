'use strict';

angular.module('mtdApp')
  .service('work', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
		var selectPj = null;
		var location = null;

		this.setPj = function(id) {
			selectPj = id;
		};

		this.getPj = function() {
			return selectPj;
		};

		this.setLocation = function(id) {
			location = id;
		};

		this.getLocation = function() {
			return location || selectPj;
		};
  });
