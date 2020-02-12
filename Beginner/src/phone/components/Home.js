// $scope, $element, $attrs, $injector, $sce, $timeout, $http, $ionicPopup, and $ionicPopover services are available


$scope.rotateZLabel = function() {
	$scope.app.params.rotationZParameter = ($scope.app.params.rotationZParameter  + 5) % 360;
};

$scope.rotateXLabel = function() {
	$scope.app.params.rotationXParameter = ($scope.app.params.rotationXParameter  + 5) % 360;
};

$scope.loadDeeplinkedExperience = function () {
  window.location="https://view.vuforia.com/command/view-experience?url=https%3A%2F%2F90beb02cc9edbf9d.studio-trial.vuforia.io%2FExperienceService%2Fcontent%2Fprojects%2Fstudio%2520sample%2520-%2520quadcopter%2Findex.html%3FexpId%3D1%26vumark%3D36217%253A1";
};