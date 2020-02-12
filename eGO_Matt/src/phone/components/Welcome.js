var appInputObj = {

  "username": "JohnDoe",
  "gates": [{
    "displayName": "Gate01",
    "name": "G01"
  },{
    "displayName": "Gate02",
    "name": "G02"   
  },{
    "displayName": "Gate03",
    "name": "G03"
  }]
}

$scope.ScriptInject = function(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.addEventListener('load', resolve);
    script.addEventListener('error', () => reject('Error loading script.'));
    script.addEventListener('abort', () => reject('Script loading aborted.'));
    document.head.appendChild(script);
  });
};

$scope.DoInject = function() {
  $scope.ScriptInject('https://cdn.jsdelivr.net/npm/webcamjs@1.0.26/webcam.min.js').then(() => {
    console.log('ScriptInject: webcam.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
  $scope.ScriptInject('app/resources/Uploaded/EGO.js').then(() => {
    console.log('ScriptInject: EGO.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
    console.log(EGO);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
  $scope.ScriptInject('app/resources/Uploaded/Model.js').then(() => {
    console.log('ScriptInject: Model.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
    console.log(Model);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
  $scope.ScriptInject('app/resources/Uploaded/matrix.js').then(() => {
    console.log('ScriptInject: matrix.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
  $scope.ScriptInject('app/resources/Uploaded/socket.io.js').then(() => {
    console.log('ScriptInject: socket.io.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
  $scope.ScriptInject('app/resources/Uploaded/easyrtc.js').then(() => {
    console.log('ScriptInject: easyrtc.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
  $scope.ScriptInject('app/resources/Uploaded/trackingUtils.js').then(() => {
    console.log('ScriptInject: trackingUtils.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
};

angular.element(document).ready($scope.DoInject);

$scope.gateSelected = () => {
  console.log($scope.view.wdg['select-1']);
  var currentVal = $scope.view.wdg['select-1'].value;
  let allGates = appInputObj.gates;
  let obj = allGates.find(x => x.name === currentVal);
  console.log({ obj: obj });

  EGO.CONST.currentQualityGate = obj.name;

  let index = allGates.indexOf(obj);
  console.log(index);


  if(index > -1) {
    $scope.view.wdg['button-1'].disabled = false;
  }
}

$scope.$on("userpick", function (e1, e2) {
  console.log({ click1: e1, click2: e2 });
  var EFSMids = EGO.METHODS.staticMarkersIdsList.indexOf(e2);
  var EFMIids = EGO.METHODS.modelItemsIdsList.indexOf(e2);
  if(EFSMids > -1 && currentMethod == 'A'){      
    EGO.METHODS.staticMarkerController(e2);
  }
  if(EFMIids > -1 && currentMethod == 'E') {
    EGO.METHODS.carPartController(e2);
  }
});

$scope.initializeEGO_AR = () => {
  $scope.app.params.gatesList = [];
  $scope.app.params.FullReportList = [];
  $scope.app.params.loggedUser = appInputObj.username;

  // iOS Camera
  let cameraDiv = document.createElement('div');
  cameraDiv.id = 'my_camera';
  document.body.appendChild(cameraDiv);

  appInputObj.gates.forEach(element => {
    // Setting the dropdown of worklist
    $scope.app.params.gatesList.push({ 'displayName': element.displayName , 'name': element.name });
  }); 
}

angular.element(document).ready($scope.initializeEGO_AR);
console.log({ scope: $scope });