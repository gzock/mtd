'use strict';

angular.module('mtdApp')
  .controller('ModalInstanceCtrl', function ($scope, $http, $modalInstance, $window, selectedTgt) {

		$scope.selectedTgt = selectedTgt;
		$scope.stepCnt = 0;
		$scope.names = $scope.selectedTgt.photo.bfr.names;
		$scope.type = 0;
		$scope.isAdopt = false;
		$scope.urls = [];

		
		$scope.nextPhoto = function() {
			$scope.stepCnt++;
			$scope.searchAdoptPhoto();
		};

		$scope.searchAdoptPhoto = function() {
			$scope.isAdopt = false;
			if(!$scope.names) { return; }
			if(!$scope.type) {
				if($scope.selectedTgt.photo.bfr.adopt == $scope.names[$scope.stepCnt]) {
					$scope.isAdopt = true;
				}
			} else {
				if($scope.selectedTgt.photo.aft.adopt == $scope.names[$scope.stepCnt]) {
					$scope.isAdopt = true;
				}
			}

		};

		$scope.prevPhoto = function() {
			$scope.stepCnt--;
			$scope.searchAdoptPhoto();
		};

		$scope.chgType = function(num) {
			$scope.type = num;
			$scope.stepCnt = 0;
			$scope.isAdopt = false;
			$scope.urls = [];

			if(!$scope.type) {
				$scope.names = $scope.selectedTgt.photo.bfr.names;
			} else {
				$scope.names = $scope.selectedTgt.photo.aft.names;
			}
			angular.forEach($scope.names, function (name) {
				$http.get('/api/targets/' + selectedTgt._id + '/photos/' + name, 
						{responseType: "blob"}).success(function(data) {
					$scope.urls.push($window.URL.createObjectURL(data));
				});
		  });

		};

		$scope.adoptPhoto = function() {
			var adoptPhotoName = $scope.names[$scope.stepCnt];
			if(!$scope.type) {
				$scope.selectedTgt.photo.bfr.adopt = adoptPhotoName;
			} else {
				$scope.selectedTgt.photo.aft.adopt = adoptPhotoName;
			}
				

			$http.put('/api/targets/' + selectedTgt.pj_id + "/" + selectedTgt._id + '/photos/adopt',$scope.selectedTgt 
			).success(function() {
				$scope.isAdopt = true;
			});
			
		};

		$scope.closeModal = $modalInstance.close;

		$scope.chgType(0);
		$scope.searchAdoptPhoto();

  });
