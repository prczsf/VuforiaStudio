// $scope, $element, $attrs, $injector, $sce, $timeout, $http, $ionicPopup, and $ionicPopover services are available

// map your json file the model name
var MODEL_JSON = { 'model-1':'carBB.json' }
var PICK_COLOR = "rgba(0,255,0,1)";

//twx.app.fn.triggerDataService('ImageThing', 'AddImageService', { 'mediaFileName': fileName, 'mediaContentBase64': realData });

$scope.modelData = new Array();

//load MODEL_JSON files
angular.forEach(MODEL_JSON, function(value, key) {
  $http.get('app/resources/Uploaded/' + value).
  success(function(data, status, headers, config) {
    $scope.modelData[key]=data;
  }).error(function(data, status, headers, config) { });
});

$timeout(function() {
  angular.forEach($element.find('twx-dt-model'), function(value, key) {
    angular.element(value).scope().$on('userpick',function(event,target,parent,edata) {
      var data = $scope.modelData[target];
      if (data != undefined) {
        if(edata != "" && $scope.currentSelection != undefined) {
          tml3dRenderer.setColor($scope.currentSelection, undefined);
        }
        var pathid = "/0/0";
        var name = "";
        if (edata != "") {
          pathid = JSON.parse(edata).occurrence;
          name = JSON.parse(edata).name;
        }
        $scope.currentSelection = target + "-" + pathid;
        var v = data[pathid].anchors["ctc"];
        $scope.app.params['debug'] = data[pathid].name;

        $scope.view.wdg['3DImage-1']['x'] = v[0];
        $scope.view.wdg['3DImage-1']['y'] = v[1] + parseFloat($scope.view.wdg['model-1'].y);
        $scope.view.wdg['3DImage-1']['z'] = v[2];

        $scope.view.wdg['3DLabel-2']['x'] = v[0];
        $scope.view.wdg['3DLabel-2']['y'] = v[1]+0.6 + parseFloat($scope.view.wdg['model-1'].y);
        $scope.view.wdg['3DLabel-2']['z'] = v[2];
        $scope.view.wdg['3DLabel-2']['text'] = pathid;

        tml3dRenderer.setColor($scope.currentSelection, PICK_COLOR);

        $scope.$apply();
      }
    });
  });
} ,0);

document.addEventListener('click', function(event) {
  $scope.lastClick = { x: event.pageX, y: event.pageY};
});