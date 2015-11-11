'use strict';

angular.module('mtdApp')
  .controller('GenerateCtrl', function ($scope, $http, $q, $window, $timeout, $location, work) {
		$scope.items = [];
		var pj = {};
		$scope.url = null;
		$scope.fileName = '';
		$scope.isCollapsed = true;
		$scope.progress = false;
		$scope.progressMsg = '';
		$scope.downloadTitle = '';

		if(!(pj = work.getPj())) {

  		$scope.message = 'プロジェクトが選択されていません。3秒後にプロジェクト選択画面へ移動します';
			$timeout(function() {
				$location.path('/projects');
			}, 3000);
		} else {
			$http.get('/api/generates/' + pj._id).success(function(datas) {
				$scope.targets = [];
			
				// http://tech.quartetcom.co.jp/2015/08/10/sequential-async/
				var deferred = $q.defer();
				var promise = deferred.promise;
	
				datas.forEach(function(data) {
					promise = promise.finally(function() {
						return $http
							.get('/api/targets/' + data._id + '/photos/' + data.src, {responseType:'blob'})
							.success(function(blob) {
								data.src =  $window.URL.createObjectURL(blob);
	
								$scope.items.push(data);
							});
					});
				});
				promise = promise.finally(function() {
				});
	
				deferred.resolve();

			}).error(function(err) {
				$scope.message = err;
			});
		}

		$scope.generate = function() {
			$scope.progress = true;
			$scope.progressMsg = '生成中...';
			$http.post('/api/generates/' + pj._id, {}, {responseType: 'blob'}).success(function(data) {
				$scope.url =  $window.URL.createObjectURL(data);
				// これで小数点第一位まで表示
				$scope.fileSize = Math.round(data.size * 0.00001) / 10 + 'MB';
				$scope.fileName = pj.name + '.zip';
				$scope.progress = false;
				$scope.progressMsg = '完了';
				$scope.downloadTitle = 'Download';
			});
		};
  });
