'use strict';

angular.module('mtdApp')
  .service('confirm', function ($modal) {
    // AngularJS will instantiate a singleton by calling "new" on this function

		this.showConfirm = function(messages, func) {
			var modalInstance = $modal.open({
					templateUrl: '/components/modal/confirmModal.html',
					controller: 'ConfirmModalInstanceCtrl',
		      size: 'sm',
					resolve: {
						messages: function () {
							return messages;
					  }
					}
			});

			modalInstance.result.then(function (ret) {
				if(ret) { func(); }
		  });

		};

  });
