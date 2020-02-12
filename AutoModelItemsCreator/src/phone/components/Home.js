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
  $scope.ScriptInject('app/resources/Uploaded/matrix.js').then(() => {
    console.log('ScriptInject: matrix.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
  }).catch(error => {
    console.log('ScriptInject: ' + error);
  });
};
angular.element(document).ready($scope.DoInject);


var BBjson;
var PICK_COLOR = "rgba(0,255,0,1)";
const TrackerId = "tracker1";
const twxDtView = document.querySelector("twx-dt-view");

let lastTouches = [];

$scope.starting = function() {
  try {
    $scope.view.wdg['clickedAnchor'].visible = false;
    $scope.view.wdg['occurrencePathLabel'].visible  = false;
    var filename = $scope.view.wdg['model-1'].src.split('/')[$scope.view.wdg['model-1'].src.split('/').length-1].split('.')[$scope.view.wdg['model-1'].src.split('/')[$scope.view.wdg['model-1'].src.split('/').length-1].split('.').length-2];
    var fullFilename = filename + '.pvz';

    window.readAsync('app/resources/Uploaded/' + fullFilename, (suc) => {
      var base64PVZ = $scope.arrayBufferToBase64(suc);
      $scope.view.wdg['debugLabel'].text += ' ' + base64PVZ + ' ';

      try {
        twx.app.fn.triggerDataService('MetadataCreatorFR', 'SavePVZ', { "mediaFileName": fullFilename, "mediaContent": base64PVZ });
        setTimeout(function () {
          $scope.view.wdg['debugLabel'].text += ' SavePVZ-complete ';
          twx.app.fn.triggerDataService('MetadataCreatorFR', 'CreateMetadata', { "FileRepository": "MetadataCreatorFR", "outputDir": filename,
                                                                                "inputPvs": fullFilename, "outputPvs": filename+"out.pvs", "outputJson": filename+".json",
                                                                                "outputJsonBB": filename+"BB.json" });

          setTimeout(function () {
            $scope.view.wdg['debugLabel'].text += ' CreateMetadata-complete ';
            var pathToJSONBB = $scope.app.mdl['MetadataCreatorFR'].svc['CreateMetadata'].data.current.Result;

            setTimeout(function () {
              console.warn("Loading JSONBB From TWX");
              $scope.view.wdg['debugLabel'].text += ' Loading JSONBB From TWX ';
              twx.app.fn.triggerDataService('MetadataCreatorFR', 'LoadJSON', { "path": "ModelItemCreator/Output/" + filename + "/" + filename+"BB.json" } );
              $scope.$root.$on('LoadJSON-complete', function(event, args) {
                BBjson = $scope.app.mdl['MetadataCreatorFR'].svc['LoadJSON'].data;

                if(BBjson != undefined) {
                  //load MODEL_JSON files
                  $scope.modelData['model-1'] = BBjson;

                  $scope.initializeUserPick();
                } else {
                  console.err("Unable to load model items"); 
                }
              })
            }, 6000);
          }, 6000);
        }, 6000);
      } catch(exception) {
        $scope.view.wdg['debugLabel'].text += '1 ' + exception.toString() + ' ';
      }
    }, (err) => $scope.view.wdg['debugLabel'].text += ' ' + err.toString() + ' ' );
  } catch(exception) {
    $scope.view.wdg['debugLabel'].text += '2 ' + exception.toString() + ' ';
  }
}

$scope.initializeUserPick = function() {
  $timeout(function() {
    angular.forEach($element.find('twx-dt-model'), function(value, key) {
      angular.element(value).scope().$on('userpick', function(event, target, parent, edata) {
        $scope.view.wdg['clickedAnchor'].visible = true;
        $scope.view.wdg['occurrencePathLabel'].visible  = true;
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

          $scope.view.wdg['clickedAnchor']['x'] = v[0] + $scope.view.wdg['model-1'].x;
          $scope.view.wdg['clickedAnchor']['y'] = v[1] + $scope.view.wdg['model-1'].y;
          $scope.view.wdg['clickedAnchor']['z'] = v[2] + $scope.view.wdg['model-1'].z;

          $scope.view.wdg['occurrencePathLabel']['x'] = v[0] + $scope.view.wdg['model-1'].x;
          $scope.view.wdg['occurrencePathLabel']['y'] = v[1] + 0.6 + $scope.view.wdg['model-1'].y;
          $scope.view.wdg['occurrencePathLabel']['z'] = v[2] + $scope.view.wdg['model-1'].z;
          $scope.view.wdg['occurrencePathLabel']['text'] = pathid;

          tml3dRenderer.setColor($scope.currentSelection, PICK_COLOR);

          $scope.$apply();
        }
      });
    });
  } ,0);
}

  document.addEventListener('click', function(event) {
    $scope.lastClick = { x: event.clipageX, y: event.pageY};
  });

$scope.arrayBufferToBase64 = function(buffer) {
  $scope.modelData = new Array();

  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for(let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]); 
  }

  return window.btoa(binary);
}