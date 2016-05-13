'use strict';

angular.module('mtdApp')
  .controller('TargetsCtrl', function ($scope, $http, $window, $modal, $location, $timeout, work, confirm) {
    $scope.message = '';
		$scope.alertMsg = '';
		var pj = null;
		$scope.addShowFlg = false;
		$scope.editShowFlg = false;
		$scope.delShowFlg = false;
		$scope.cameraShowFlg = false;
		$scope.shotShowFlg = false;
		$scope.photosShowFlg = false;
		$scope.newFlg = false;
		$scope.selectTgtName = '';
		$scope.selectTgtId = '';
		$scope.selectedTgt = '';
		$scope.addTgtName = '';
		$scope.editTgtName = '';
		$scope.locations = [];
		$scope.targets = [];
		$scope.prevLocationId = [];
		$scope.photoType = '';
		$scope.test = '';
		$scope.photos = [];
		$scope.searchStr = '';

		$scope.hereLocation = {};
		$scope.hereLocation = work.getPj();
		$scope.locationHistory = [];

		$scope.typeFlag = true;


		$scope.Math = $window.Math;

		$scope.name = "";
		$scope.file = "";

		$scope.uploadFile = function(event) {
			$scope.file = event.target.files;
			console.log("new file : " + $scope.file);
			$scope.testClick();
		}

		$scope.testClick = function() {
			var fd = new FormData();

			fd.append('file', $scope.file[0]);
			$http.post('/api/targets/' + $scope.selectedTgt._id + '/photos/' + $scope.photoType,
					fd, 
					{	transformRequest: null,
						headers: { 'Content-Type': undefined }
					}
			).success(function() {
				$scope.refreshLocation();
				setAlertMsg('success', '写真を追加しました');

			}).error(function(err) {
				setAlertMsg('danger', err);
			});
		};

/*
		$scope.$watch("file", function(file) {
			console.log("watch : " + file);
		});
*/
		$scope.chgFlg = function(flg) {
			$scope.addShowFlg = false;
			$scope.editShowFlg = false;
			$scope.delShowFlg = false;
			$scope.cameraShowFlg = false;
			$scope.shotShowFlg = false;
			$scope.photosShowFlg = false;

			switch(flg) {
				case 'add':
					$scope.addShowFlg = true;
					break;
				case 'edit':
					$scope.editShowFlg = true;
					break;
				case 'del':
					$scope.delShowFlg = true;
					break;
				case 'camera':
					$scope.cameraShowFlg = true;
					break;
				case 'shot':
					$scope.shotShowFlg = true;
					break;
				case 'photos':
					$scope.photosShowFlg = true;
					break;
			};
		};


		$scope.setPostPrep = function(num) {
			$scope.photoType = num;
			if(!num) {
				if(!$scope.selectedTgt.photo.bfr.shot) {
					$scope.newFlg = true;
				}
			} else {
				if(!$scope.selectedTgt.photo.aft.shot) {
					$scope.newFlg = true;
				}
			}
			return;
		};

		$scope.getTgt = function(tgt, str) {
			$scope.alertMsg = '';
			$scope.selectedTgt = '';
			if(pj) {
				var url = '/api/targets/' + work.getPj()._id;
				var filterFlg = false;
				if(tgt) {	url += "/" + tgt._id; }

				$http.get(url).success(function(data) {
					$scope.targets = [];
					$scope.locations = [];
					$scope.hereLocation = tgt;
					$scope.chgFlg('none');
					
					for(var i=0; i<data.length; i++) {
						if(str && data[i].name.indexOf(str) == -1) { continue;	}
						if(data[i].type) {
							$scope.targets.push(data[i]);
						} else {
							$scope.locations.push(data[i]);
						}
					};
				});
			}
		};

		$scope.goHome = function() {
			$scope.getTgt(work.getPj());
			$scope.locationHistory = [];
		};

		if(pj = work.getPj()) {
			$scope.getTgt(pj);
			$scope.message = '';

		} else {
  		$scope.message = 'プロジェクトが選択されていません。3秒後にプロジェクト選択画面へ移動します';
			$timeout(function() {
				$location.path('/projects');
			}, 3000);
		}
		
		$scope.prevLocation = function() {
			$scope.selectedTgt = null;
			$scope.getTgt($scope.locationHistory.pop());
		};
		$scope.nextLocation = function(tgt) {
			$scope.selectedTgt = null;
			$scope.locationHistory.push($scope.hereLocation);
			$scope.getTgt(tgt);
		};
		$scope.refreshLocation = function() {
			$scope.getTgt($scope.hereLocation);
		};



		$scope.selectTgt = function(tgt) {
			$scope.selectedTgt = tgt;
			$scope.alertMsg = '';
		};

		$scope.hasPj = function() {
			if(!pj) {

				console.log("false");
				$timeout(function() {
					$location.path('/projects');
				}, 3000);
				return false;
			}
			return true;
		};

		$scope.addTgt = function() {
			$http.post('/api/targets', {pj_id: work.getPj()._id,
																	parent: $scope.hereLocation._id,
																	name: $scope.addTgtName,
																	type: $scope.type
			}).success(function() {
				$scope.getTgt($scope.hereLocation);	
				setAlertMsg('success', $scope.addTgtName + 'を追加しました');
			}).error(function(err) {
				setAlertMsg('danger', err);
			});
		};

		$scope.editTgt = function() {
			var editTgt = $scope.selectedTgt;
			editTgt.name = $scope.editTgtName;
			$http.put('/api/targets/' + work.getPj()._id + "/" + editTgt._id, editTgt).success(function() {
				$scope.getTgt($scope.hereLocation);	
				setAlertMsg('success', $scope.editTgtName + 'に編集しました');
			}).error(function(err) {
				setAlertMsg('danger', err);
			});
		};

		$scope.deleteTgt = function() {
			confirm.showConfirm("選択項目\"" + $scope.selectedTgt.name + "\"を削除してもよろしいですか？",
				function() {
					$http.delete('/api/targets/' + work.getPj()._id + "/" + $scope.selectedTgt._id).success(function() {
						$scope.getTgt($scope.hereLocation);	
						setAlertMsg('success', $scope.selectedTgt.name + 'を削除しました');
					}).error(function(err) {
						setAlertMsg('danger', err);
					});
				}
			);
		};

		$scope.chgFileName = function($file, $event, $flow) {
			$file.name = $scope.selectedTgt._id + ".jpg"; 
		};

		$scope.showPhoto = function(name) {
			$modal.open({
					templateUrl: '/components/modal/photoModal.html',
					controller: 'ModalInstanceCtrl',
		      size: 'lg',
					resolve: {
						selectedTgt: function () {
							return $scope.selectedTgt;
					  }
					}
	    });
		};

		function setAlertMsg(type, msg) {
			
			switch(type) {
				case 'success':
					msg = '成功 : ' + msg;
					break;
				case 'danger' :
					msg = '失敗 : ' + msg;
					break;
			}

			$scope.alertMsg = {
													type: type,
													msg: msg
												};
		};

  });
