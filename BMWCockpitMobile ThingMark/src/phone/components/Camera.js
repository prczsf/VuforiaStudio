// $scope, $element, $attrs, $injector, $sce, $timeout, $http, $ionicPopup, and $ionicPopover services are available

var width;
var heigh;

var firstButtons = true;

$scope.showTakePhotoButtonsR = function() {
  if($scope.view.wdg['snapshotButtonR']) 
    $scope.view.wdg['snapshotButtonR'].visible = true;
  if($scope.view.wdg['snapshotButtonBackR'])
    $scope.view.wdg['snapshotButtonBackR'].visible = true;
}
$scope.hideTakePhotoButtonsR = function() {
  if($scope.view.wdg['snapshotButtonR'])
    $scope.view.wdg['snapshotButtonR'].visible = false;
  if($scope.view.wdg['snapshotButtonBackR'])
    $scope.view.wdg['snapshotButtonBackR'].visible = false;
}
$scope.showFreezePhotoButtonsR = function() {
  if($scope.view.wdg['acceptPhotoButtonR'])
    $scope.view.wdg['acceptPhotoButtonR'].visible = true;
  if($scope.view.wdg['declinePhotoButtonR'])
    $scope.view.wdg['declinePhotoButtonR'].visible = true;
}
$scope.hideFreezePhotoButtonsR = function() {
  if($scope.view.wdg['acceptPhotoButtonR'])
    $scope.view.wdg['acceptPhotoButtonR'].visible = false;
  if($scope.view.wdg['declinePhotoButtonR'])
    $scope.view.wdg['declinePhotoButtonR'].visible = false;
}

$scope.showTakePhotoButtonsD = function() {
  if($scope.view.wdg['snapshotButtonD'])
    $scope.view.wdg['snapshotButtonD'].visible = true;
  if($scope.view.wdg['snapshotButtonBackD'])
    $scope.view.wdg['snapshotButtonBackD'].visible = true;
}
$scope.hideTakePhotoButtonsD = function() {
  if($scope.view.wdg['snapshotButtonD'])
    $scope.view.wdg['snapshotButtonD'].visible = false;
  if($scope.view.wdg['snapshotButtonBackD'])
    $scope.view.wdg['snapshotButtonBackD'].visible = false;
}
$scope.showFreezePhotoButtonsD = function() {
  if($scope.view.wdg['acceptPhotoButtonD'])
    $scope.view.wdg['acceptPhotoButtonD'].visible = true;
  if($scope.view.wdg['declinePhotoButtonD'])
    $scope.view.wdg['declinePhotoButtonD'].visible = true;
}
$scope.hideFreezePhotoButtonsD = function() {
  if($scope.view.wdg['acceptPhotoButtonD'])
    $scope.view.wdg['acceptPhotoButtonD'].visible = false;
  if($scope.view.wdg['declinePhotoButtonD'])
    $scope.view.wdg['declinePhotoButtonD'].visible = false;
}


$scope.hideButtons = function() {
  $scope.hideTakePhotoButtonsR();
  $scope.hideFreezePhotoButtonsR();
  $scope.hideTakePhotoButtonsD();
  $scope.hideFreezePhotoButtonsD();
}

$scope.refreshButtons = function(orientation) {
 if(firstButtons) {
   if(orientation == 'landscape') {
     $scope.hideButtons();
     $scope.showTakePhotoButtonsR();
   }else if(orientation == 'portrait') {
     $scope.hideButtons();
     $scope.showTakePhotoButtonsD();
   }
 } else {
   if(orientation == 'landscape') {
     $scope.hideButtons();
     $scope.showFreezePhotoButtonsR();
   }else if(orientation == 'portrait') {
     $scope.hideButtons();
     $scope.showFreezePhotoButtonsD();
   }
 }
}

$scope.screenOrientation = function() {
  var orientation = screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type;

  if (orientation === "landscape-primary" || orientation === "landscape-secondary") {
    width = $element[0].clientHeight;
	height = $element[0].clientWidth-96;
  
  	$scope.refreshButtons('landscape');
  } else if (orientation === "portrait-primary" || orientation === "portrait-secondary") {
    width = $element[0].clientWidth;
	height = $element[0].clientHeight-96;
  
  	$scope.refreshButtons('portrait');
  } else if (orientation === undefined) {
    if (Math.abs(window.orientation) === 90) {
      width = $element[0].clientHeight;
      height = $element[0].clientWidth-96;
  
  	  $scope.refreshButtons('landscape');
    } else {
      width = $element[0].clientWidth;
      height = $element[0].clientHeight-96;
  
  	  $scope.refreshButtons('portrait');
    }
  }
  tryApply();
}

$scope.screenOrientation();

window.addEventListener('orientationchange', $scope.screenOrientation);
window.onorientationchange = $scope.screenOrientation;
window.addEventListener('onorientationchange', $scope.screenOrientation);

window.addEventListener("resize", function() {
  $scope.screenOrientation();
}, false);

var front = false;

var video;
var canvas;
var canvas2;
var context2;
var streaming = false;

var capturedPhoto = false;

var localstream = null;


function get_browser() {
  var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
  if(/trident/i.test(M[1])){
    tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
    return {name:'IE',version:(tem[1]||'')};
  }   
  if(M[1]==='Chrome'){
    tem=ua.match(/\bOPR|Edge\/(\d+)/)
    if(tem!=null)   {return {name:'Opera', version:tem[1]};}
  }   
  M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
  return {
    name: M[0],
    version: M[1]
  };
}

var browser = get_browser();
alert(browser.name + " " + browser.version);

function startup() {
  try {
    video = document.createElement('video');
    canvas = document.createElement('canvas');
    canvas2 = document.createElement('canvas');

    context2 = canvas2.getContext('2d');
    canvas2.width = width;
    canvas2.height = height;

    //$scope.app.params['debugLog'] = JSON.stringify(
    
    var getUserMedia = (function () {
      if(navigator.getUserMedia) {
        return navigator.getUserMedia.bind(navigator)
      }
      if(navigator.webkitGetUserMedia) {
        return navigator.webkitGetUserMedia.bind(navigator)
      }
      if(navigator.mozGetUserMedia) {
        return navigator.mozGetUserMedia.bind(navigator)
      }
    })();
    
    getUserMedia({ video: true, audio: false }, function(stream) {
      localstream = stream;
      video.srcObject = stream;
      video.play();
    }, function(err) {
      console.log("An error occurred: " + err.stack);
    });

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        //height = video.videoHeight / (video.videoWidth/width);

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        canvas2.setAttribute('width', width);
        canvas2.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    draw();
  } catch(e) {
    alert(e);
  }
}

startup();

function tryApply() {
  if (!$scope.$$phase) {
    $scope.$apply();
  }
}

function draw() {
  if(!capturedPhoto) {
    context2.drawImage(video, 0, 0, width, height);
    setTimeout(draw, 40);

    var data2 = canvas2.toDataURL();
    $scope.app.params.captureImage = data2;
 	tryApply();
  }
}

$scope.displayCapturedImage = function () {
  canvas2.width = width;
  canvas2.height = height;
  context2.drawImage(video, 0, 0, width, height);
  
  var data2 = canvas2.toDataURL();
  $scope.app.params.captureImage = data2;
  $scope.$apply();
}

var tempPhotoData = "";

// function called by the buttons.
$scope.takePhotoD = function () {
  capturedPhoto = true;
  
  var context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 128;
  context.drawImage(video, 0, 0, 256, 128);

  tempPhotoData = canvas.toDataURL('image/png');
  $scope.hideTakePhotoButtonsD();
  $scope.showFreezePhotoButtonsD();
  
  firstButtons = false;
}
$scope.takePhotoR = function () {
  capturedPhoto = true;
  
  var context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 128;
  context.drawImage(video, 0, 0, 256, 128);

  tempPhotoData = canvas.toDataURL('image/png');
  $scope.hideTakePhotoButtonsR();
  $scope.showFreezePhotoButtonsR();
  
  firstButtons = false;
}

$scope.clickedAcceptPhotoButton = function() {
  if(tempPhotoData != "") {
  	$scope.app.params.tempPhoto = tempPhotoData;
  }
  capturedPhoto = false;
  
  firstButtons = true;
  
  $scope.snapBack();
}

$scope.clickedDeclinePhotoButtonD = function() {
  capturedPhoto = false;
  
  firstButtons = true;
  
  tempPhotoData = "";
  $scope.hideFreezePhotoButtonsD();
  $scope.showTakePhotoButtonsD();
  
  draw();
}
$scope.clickedDeclinePhotoButtonR = function() {
  capturedPhoto = false;
  
  firstButtons = true;
  
  tempPhotoData = "";
  $scope.hideFreezePhotoButtonsR();
  $scope.showTakePhotoButtonsR();
  
  draw();
}

// Wciśnięcie przycisku cofania w widoku robienia zdjęcia
$scope.snapBack = function() {
  stopWebcam();

  firstButtons = true;
}

function stopWebcam() {
  video.pause();
  video.src = "";
  localstream.getTracks()[0].stop();
  console.log("Video off");
  $scope.app.params.backFromTakePhoto = true;
}

/*let app = {
  init: function(){
    document.querySelector('[widget-id="snapshotButtonR"] button').addEventListener('click', app.takephoto);
  },
  takephoto: function(){
    let opts = {
      quality: 80,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      mediaType: Camera.MediaType.PICTURE,
      encodingType: Camera.EncodingType.JPEG,
      cameraDirection: Camera.Direction.BACK,
      targetWidth: 300,
      targetHeight: 400
    };

    navigator.camera.getPicture(app.ftw, app.wtf, opts);
  },
  ftw: function(imgURI){
    document.getElementById('msg').textContent = imgURI;
    document.getElementById('photo').src = imgURI;

  },
  wtf: function(msg){
    document.getElementById('msg').textContent = msg;
  }
};

document.addEventListener('deviceready', app.init);*/