// ======================================= INITIALIZING ========================================

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
  $scope.ScriptInject('https://cdn.jsdelivr.net/npm/webcamjs@1.0.25/webcam.min.js').then(() => {
    console.log('ScriptInject: webcam.js loaded.');
    angular.element(document).ready($scope.init);
    angular.element(document).ready($scope.initCanvas);
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

$scope.alreadyInitialized = false;

$scope.trackingAcquired = function() {
  if($scope.alreadyInitialized != true) {
    $scope.view.wdg['faultTypeList']['list'] = [
      { name: "Gap", displayName: "znacznik.pvz" },
      { name: "Scratch", displayName: "trigger.pvz" }
    ];

    $scope.initialVariables();

    $scope.app.params['gazeVisible'] = false;
    $scope.app.params['addMarkVisible'] = true;
    $scope.alreadyInitialized = true;
  }
}

$scope.listItemClicked = function() {
  $scope.app.params.actualModel = this.me.list['current'].displayName;
  $scope.app.params['gazeVisible'] = true;
  $scope.buttonClicked();
  $scope.app.params['placeMarkVisible'] = true;
  $scope.app.params['forward_back_cancelVisible'] = true;
  $scope.app.params['faultTypeListVisible'] = false;
  console.log(this);
}

$scope.initialVariables = function() {
  $scope.app.params.photosArray = [];
  $scope.app.params.tempPhotosArray = [];
  $scope.app.params.photoId = 0;
  $scope.app.params.photosUploaded = false;
  console.log($scope);
}

$scope.cancelButtonFun = function() {
  $scope.app.params['faultTypeListVisible'] = false;
  $scope.app.params['placeMarkVisible'] = false;
  $scope.app.params['forward_back_cancelVisible'] = false;
  $scope.app.params['addMarkVisible'] = true;
  $scope.view.wdg['faultTypeList'].list.selectedRows = [];
  $scope.view.wdg['faultTypeList'].list.current = {};

  for(let listIter = 0; listIter < $scope.view.wdg['faultTypeList'].list.length; listIter++) {
    delete $scope.view.wdg['faultTypeList'].list[listIter]._isSelected;
  }

  $scope.buttonClicked();
}

// ==============================================================================================


// ========================================= VARIABLES =========================================

var scale = 0.6;

var canvas = document.createElement('canvas');
canvas.id = 'canvas';
var context = canvas.getContext('2d');

var id = 0;
const TrackerId = "tracker1";
const PickColor = "rgba(255, 255, 0, 1)";
const twxDtView = document.querySelector("twx-dt-view");

let tracker = document.querySelector(`twx-dt-tracker[id='${TrackerId}']`);
tracker.setAttribute("enabletrackingevents", "true");

let previousModelLoad = null;
let connected = false;

var modelsCount = 0;

var models = [];

var buttonClicked = false;

// ==============================================================================================


// ======================================== MODEL CLASS==========================================

class Model {
  constructor(id, element, modelUrl) {
    this.id = id;
    this.element = element;
    this.modelUrl = modelUrl;
    this.transform = {
      position: [0, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0]
    };

    this.removed = false;
    this.synchronized = true;
    this.selected = false;
    this.selectable = true;
  }

  setTranslation(x, y, z) {
    this.setTranslationInternal(x, y, z);
    this.sendModelUpdate({ position: this.transform.position });
  }

  setTranslationInternal(x, y, z) {
    tml3dRenderer.setTranslation(this.id, x, y, z);
    this.transform.position = [x, y, z];
  }

  translateBy(x, y, z) {
    let pos = this.transform.position;
    pos[0] += x;
    pos[1] += y;
    pos[2] += z;
    this.setTranslation(...pos);
  }

  setScale(x, y, z) {
    this.setScaleInternal(x, y, z);
    this.sendModelUpdate({ scale: this.transform.scale });
  }

  setUniformScale(scale) {
    this.setScale(scale, scale, scale);
  }

  setScaleInternal(x, y, z) {
    tml3dRenderer.setScale(this.id, x, y, z);
    this.transform.scale = [x, y, z];
  }

  setRotation(x, y, z) {
    this.setRotationInternal(x, y, z);
    this.sendModelUpdate({ rotation: this.transform.rotation });
  }

  setRotationInternal(x, y, z) {
    tml3dRenderer.setRotation(this.id, x, y, z);
    this.transform.rotation = [x, y, z];
  }

  remove(fromRemote) {

    _removeModel(this);
    this.removed = true;
    if (!this.synchronized) {
      _removeModelReference(this);
    } else if (!fromRemote) {
      this.sendModelUpdate({ removed: true });
    }
  }

  sendModelUpdate(packet) {
    if (this.synchronized) {
      this.updatePacket = _.assign(this.updatePacket || { id: this.id }, packet);
    }
  }

  sendFullUpdate(additionalData) {
    if (this.synchronized) {
      this.sendModelUpdate(_.assign({
        position: this.transform.position,
        scale: this.transform.scale,
        rotation: this.transform.rotation,
        selected: this.selected,
        wrapped: this.wrapped,
        modelUrl: this.modelUrl,
        removed: this.removed
      }, additionalData || {}));
    }
  }

  sendModelCreatedUpdate() {
    this.sendModelUpdate(_.assign({ created: true, modelUrl: this.modelUrl }, this.transform));
  }

  setSelected(selected) {
    if (selected !== this.selected) {
      this.selected = selected;
      if (this.selected) {
        this.setColor(PickColor);
      } else if (this.remoteSelected) {
        this.setColor(RemotePickColor);
      } else {
        this.setColor(undefined);
      }

      this.sendModelUpdate({ selected: this.selected });
    }
  }

  setRemoteSelected(selectedBy) {
    this.remoteSelected = selectedBy;

    if (selectedBy) {
      this.setColor(RemotePickColor);
    } else if (!this.selected) {
      this.setColor(undefined);
    }
  }

  setColor(color) {
    try {
      tml3dRenderer.setColor(this.id, color);
    } catch (e) {
      // In preview setColorbuttonClicked fails when passing null as color (for resetting it).
      console.log(e);
    }
  }
}

// ==============================================================================================


// ====================================== ADDING MODEL ==========================================

function addLocalModel() {
  id = id + 1;
  scale = 0.6;

  $scope.view.wdg['faultTypeList']['list'].current._isSelected = false;
  $scope.view.wdg['faultTypeList']['list'].selectedRows = [];
  console.log($scope.view.wdg['faultTypeList']['list']);

  return _addModel(id, makeModelUrl($scope.app.params.actualModel), false, false);
}

$scope.addLocalModel = addLocalModel;

function _addModel(id, modelUrl, fromRemote, synchronized) {
  // Adding a fake twx-widget so that click handling code works properly.
  let modelElement = document.createElement("twx-widget");
  modelElement.setAttribute("widget-id", id);
  modelElement.setAttribute("widget-name", id);
  modelElement.setAttribute("original-widget", "twx-dt-model");
  tracker.appendChild(modelElement);

  let model = models[id] = new Model(id, modelElement, modelUrl);
  console.log(models[id]);
  if (typeof synchronized === "boolean") {
    model.synchronized = synchronized;
  }

  if (!fromRemote && !this.synchronized) {
    model.sendModelCreatedUpdate();
  }

  let promise = new Promise((resolve, reject) => {
    let doAdd = () => {
      return tml3dRenderer.addPVS(TrackerId, String(id), modelUrl, false, "", handleAdded, handleFailed);
    };

    let handleAdded = () => {
      if (previousModelLoad === promise) {
        previousModelLoad = null;
      }

      startBatch();
      model.setScaleInternal(...model.transform.scale);
      model.setTranslationInternal($scope.view.wdg['gaze3D'].x, $scope.view.wdg['gaze3D'].y, $scope.view.wdg['gaze3D'].z);
      model.setRotationInternal($scope.view.wdg['gaze3D'].rx, $scope.view.wdg['gaze3D'].ry, $scope.view.wdg['gaze3D'].rz);
      executeBatch();

      modelsCount++;

      resolve(model);
    };

    let handleFailed = (e) => {
      if (previousModelLoad === promise) {
        previousModelLoad = null;
      }

      reject(e);
    };

    if (previousModelLoad) {
      previousModelLoad.then(doAdd, doAdd);
    } else {
      doAdd();
    }
  });

  previousModelLoad = promise;
  return promise;
}

$scope.tryApply = function () {
  if (!$scope.$$phase) {
    $scope.$apply();
  }
};

function makeModelUrl(name) {
  name = encodeURIComponent(name);
  return `app/resources/Uploaded/${name}`;
}

$scope.makeModelUrl = makeModelUrl;

function startBatch() {
  // startBatch and executeBatch are not available in preview.
  if (tml3dRenderer.startBatch) {
    tml3dRenderer.startBatch();
  }
}
function executeBatch() {
  if (tml3dRenderer.executeBatch) {
    tml3dRenderer.executeBatch();
  }
}

// ==============================================================================================


// ==================================== CONTROLLING VIEW ========================================

$scope.buttonClicked = function() {
  buttonClicked = !buttonClicked;
  if($scope.view.wdg['gaze3D'].visible == true) {
    $scope.view.wdg['gaze3D'].visible = false;
  } else {
    $scope.view.wdg['gaze3D'].visible = true;
  }
  $scope.app.params['forward_back_cancelVisible'] = false;
  $scope.buttonClickedFun();
}

$scope.buttonClickedFun = function() {
  try {
    if(buttonClicked) {
      $scope.$root.$on('tracking', $scope.setMyEYEtrack);
      console.log('klikniete');
    }else {
      $scope.$root.$on('tracking', $scope.setMyEYEtrack); 
      console.log('odklikniete');
    }
  } catch(e) {
    console.log(e);
  }
};

$scope.getGestureTransformMatrix = function(upParam, gazeParam) {
  let up = new Vector4().Set3(...upParam);
  let forward = new Vector4().Set3(...gazeParam);
  let right = forward.CrossP(up);
  return new Matrix4().Set3V(right, forward, up);
}

$scope.plusGazeFun = function() {
  scale += 0.2;
}

$scope.minusGazeFun = function() {
  scale -= 0.2;
}

// ==============================================================================================


// ======================================= TRACKING =============================================

$scope.setMyEYEtrack = function() {
  if(tml3dRenderer) {
    try {
      tml3dRenderer.setupTrackingEventsCommand (function(target, eyepos, eyedir, eyeup) {
        if(buttonClicked) {
          $scope.view.wdg['gaze3D'].x = eyepos[0]+eyedir[0] * scale;
          $scope.view.wdg['gaze3D'].y = eyepos[1]+eyedir[1] * scale;
          $scope.view.wdg['gaze3D'].z = eyepos[2]+eyedir[2] * scale;

          var rotation = $scope.getGestureTransformMatrix(eyeup, eyedir).ToEuler();
          $scope.view.wdg['gaze3D'].rx = rotation['attitude']+90;
          $scope.view.wdg['gaze3D'].ry = rotation['heading'];
          $scope.view.wdg['gaze3D'].rz = rotation['bank'];
          $scope.$applyAsync();
        }
      },undefined)
    } catch (e) {
      $scope.setWidgetProp('3DLabel-2',  'text', "exception=");
    }
  } else {
    //tml3dRenderer.setupTrackingEventsCommand (null);
  }
}

// ==============================================================================================


// ======================================== PHOTOS ==============================================


//$scope.view.wdg['imageArray'+labelNumber].imgsrc = $scope.app.params.steps[stepsArrayIter].photo;

// iOS Camera
var cameraDiv = document.createElement('div');
cameraDiv.id = 'my_camera';
document.body.appendChild(cameraDiv);

$scope.snapshotView = function() {
  Webcam.set({
    width: $element[0].clientWidth,
    height: $element[0].clientHeight,
    image_format: 'jpeg',
    jpeg_quality: 100
  });

  Webcam.attach('#my_camera');

  Webcam.snap( function(data_uri) {
    $scope.app.params.photosArray.push(data_uri);

    Webcam.reset();
  });
}

$scope.savePhotos = function() {
  if($scope.app.params.photosUploaded == false && parseInt($scope.app.params.photoId) >= parseInt($scope.app.params.photosArray.length)) {
    $scope.app.params.photosUploaded = true;
    console.log('END: ' + parseInt($scope.app.params.photoId) + ' >= ' + parseInt($scope.app.params.photosArray.length));
    $scope.app.params.photoId = 0;
    $scope.app.params.photosArray = [];
    twx.app.fn.triggerDataService('eGOImagesFileRepository', 'IncrementCheckIndex');

    $scope.hideDebugLog();
    $scope.view.wdg['debugLabel'].text = "Saved:";
    $scope.view.wdg['imagePopup'].visible = false;

    return;

  } else if(parseInt($scope.app.params.photoId) < parseInt($scope.app.params.photosArray.length)) {
    console.log('CONTINUE: ' + parseInt($scope.app.params.photoId) + ' < ' + parseInt($scope.app.params.photosArray.length));
    $scope.showDebugLog();
    $scope.view.wdg['debugLabel'].text += ' Photo ' + parseInt($scope.app.params.photoId) + ', ';

    let photosArrayIter = 0;

    let block = $scope.app.params.photosArray[parseInt($scope.app.params.photoId)].split(";");
    // Get the content type
    let dataType = block[0].split(":")[1];// In this case "image/jpeg"
    // get the real base64 content of the file
    let realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."
    let fileName = 'Photo ' + $scope.app.params['imageGUID'] + '.jpeg';

    $scope.app.params.photoId = parseInt($scope.app.params.photoId) + 1;

    twx.app.fn.triggerDataService('eGOImagesFileRepository', 'AddImageService', { 'mediaContentBase64': realData });
  }
}

// ==============================================================================================

$scope.showDebugLog = function() {
  $scope.view.wdg['debugLabel'].visible = true;
}

$scope.hideDebugLog = function() {
  $scope.view.wdg['debugLabel'].visible = false;
}

$scope.$watch("app.params['imageGUID']", function() {
  console.log($scope.app.params['imageGUID']);
  $scope.savePhotos();
});