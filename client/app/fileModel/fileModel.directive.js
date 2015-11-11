'use strict';

<!--
	http://qiita.com/zaburo/items/f03433caa710902d599f
-->
angular.module('mtdApp')
  .directive('fileModel', function ($parse) {
    return {
      templateUrl: 'app/fileModel/fileModel.html',
      restrict: 'A',
      link: function (scope, element, attrs) {
				var onChangeHandler = scope.$eval(attrs.fileModel);
				element.bind('change', onChangeHandler);

			}
    };
  });
