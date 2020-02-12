$scope.EGO = EGO;

$scope.EGO.$scope = $scope;
$scope.EGO.$ionicPopup = $ionicPopup;
$scope.EGO.Model = Model;
$scope.EGO.tml3dRenderer = tml3dRenderer;

console.log({ scope: $scope });

$scope.EGO.METHODS.initEGO('EBSM', 23, 'EBMI', 7);