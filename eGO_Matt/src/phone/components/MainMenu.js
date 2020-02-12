// $scope, $element, $attrs, $injector, $sce, $timeout, $http, $ionicPopup, and $ionicPopover services are available




//$scope.app.params.selectedCarArea = "Exterior Front"

$scope.selectCarArea = (area) => {
  console.log(area);

  $scope.app.params.selectedCarArea = area;
  
};


$scope.init = () => {
  //$scope.app.params.workList = [];
  
  $scope.view.wdg['vinNoLabel'].text = `#VIN${$scope.app.params.currentCarVinNo}#`;
  $scope.view.wdg['colorLabel'].text = `#COLOR GREEN#`;
  $scope.view.wdg['rimsLabel'].text = `#BIG FOOT CHROME#`;
  
}

angular.element(document).ready($scope.init);