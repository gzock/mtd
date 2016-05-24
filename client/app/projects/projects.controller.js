'use strict';

angular.module('mtdApp')
  .controller('ProjectsCtrl', function ($scope, $http, $cookieStore, User, Auth, work, confirm) {
    $scope.message = 'Hello';
		$scope.alertMsg = null;
		$scope.alertMsg2 = null;
		$scope.selectPjName = '';
		$scope.selectedPj = null;
		$scope.projects = [];
		$scope.createPjName = '';
		$scope.batchAddText = "";
		$scope.isCollapsed = true;
    
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.isLoggedIn = Auth.isLoggedIn;
		$scope.hideCompFlg = false;
		$scope.hideOtherPjFlg = false;

		(function(){
	    $('pre').addClass('prettyprint');
			    prettyPrint();
		})();

		// 美しくない。。。書き直したい
		$scope.getPj = function() {

			$http.get('/api/projects/' + Auth.getCurrentUser()._id)
			.success(function(res) {
					$scope.projects = res;
   		})
			.error(function() { 
				$scope.getPj();
			});
		};

		$scope.getPj();

		$scope.refreshPj = function() { $scope.getPj(); }

		$scope.selectPj = function(pj) {
			$scope.selectPjName = pj.name;
			$scope.selectedPj = pj;
			console.log($scope.selectedPj);
			work.setPj(pj);
		};

		$scope.createPj = function() {
			$http.post('/api/projects', { 
																		owner: [$scope.getCurrentUser()._id],
																		users: [$scope.getCurrentUser()._id],
																		name: $scope.createPjName
																	}).
				success(function(data, status, headers, config) {
					//$scope.projects.push({name: $scope.createPjName});
					$scope.getPj();
					$scope.alertMsg = {type: 'success', msg: '成功 : プロジェクトを追加しました'};
				}).
				error(function(err) {
					$scope.alertMsg = {type: 'danger', msg: '失敗 : ' + err};
				});
		};

		$scope.deletePj = function(pj) {
			confirm.showConfirm("プロジェクト\"" + $scope.selectedPj.name + "\"を削除してもよろしいですか？", 
				function() {
					alert(1);
				}
			);
		};

		$scope.switchCompPj = function(pj) {
			if(pj.complete) {
				var msg = "プロジェクト\"" + $scope.selectedPj.name + "\"を未完了状態に移行してもよろしいですか？";
			} else {
				var msg = "プロジェクト\"" + $scope.selectedPj.name + "\"を完了状態に移行してもよろしいですか？";
			}

			confirm.showConfirm(msg,
				function() {
					pj.complete = !pj.complete;
					$http.put('/api/projects/' + pj._id, pj ).success(function() {
						$scope.getPj();
					});
				}
			);
		};

		$scope.batchAdd = function() {
			console.log($scope.batchAddText);
			$http.post('/api/projects/' + work.getPj()._id + "/batch", {text: $scope.batchAddText}).
					success(function(data) {
					});
		};

		$scope.file = "";

		$scope.uploadFile = function(event) {
			$scope.file = event.target.files;
			console.log("new file : " + $scope.file);
			$scope.testClick();
		}

		$scope.testClick = function() {
			var fd = new FormData();

			fd.append('file', $scope.file[0]);
			$http.post('/api/projects/' + work.getPj()._id + '/batch',
					fd, 
					{	transformRequest: null,
						headers: { 'Content-Type': undefined }
					}
			).success(function() {
				$scope.alertMsg2 = {type: 'success', msg: '成功 : 一括登録が完了しました'};
			}).error(function(err) {
				$scope.alertMsg2 = {type: 'danger', msg: '失敗 : ' + err};
			});
		};

		$scope.isOwner = function(item) {
				return item.owner == $scope.getCurrentUser()._id ? item : null;
		};

		$scope.isOwnerFilter = function(item) {
			if($scope.hideOtherPjFlg) {
				return $scope.isOwner(item);
			} else {
				return item;
			}
		};
  });
