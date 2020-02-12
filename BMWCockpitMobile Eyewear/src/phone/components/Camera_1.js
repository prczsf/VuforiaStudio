var width = 550;
var height = 100;

var front = false;

var video;
var canvas;
var canvas2;
var context2;
var streaming = false;

var localstream = null;

var timerId;

function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new interval, stop current interval
    this.reset = function(newT) {
        t = newT;
        return this.stop().start();
    }
}

if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {

    // First get ahold of the legacy getUserMedia, if present
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

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

startup();

function startup() {
  video = document.createElement('video');
  canvas = document.createElement('canvas');
  canvas2 = document.createElement('canvas');
  
  context2 = canvas2.getContext('2d');
  canvas2.width = width;
  canvas2.height = height;
  
  navigator.mediaDevices.getUserMedia({ video: { facingMode: (front? "user" : "environment") }, audio: false })
    .then(function(stream) {
      localstream = stream;
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
    	alert("An error occurred: " + err);
    });
  
  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);

      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      canvas2.setAttribute('width', width);
      canvas2.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  timerId = new Timer(function() {
    $scope.displayCapturedImage();
  }, 500);
}

$scope.displayCapturedImage = function () {
  context2.drawImage(video, 0, 0, width, height);
  
  var data2 = canvas2.toDataURL();
  $scope.app.params.captureImage = data2;
  $scope.$apply();
}

var tempPhotoData = "";

// function called by the buttons.
$scope.takePhoto = function () {
  timerId.stop();
  var context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  tempPhotoData = canvas.toDataURL('image/png');
  $scope.hideTakePhotoButtons();
  $scope.showFreezePhotoButtons();
}

$scope.showTakePhotoButtons = function() {
  $scope.view.wdg['snapshotButton'].visible = true;
  $scope.view.wdg['snapshotButtonBack'].visible = true;
}
$scope.hideTakePhotoButtons = function() {
  $scope.view.wdg['snapshotButton'].visible = false;
  $scope.view.wdg['snapshotButtonBack'].visible = false;
}
$scope.showFreezePhotoButtons = function() {
  $scope.view.wdg['acceptPhotoButton'].visible = true;
  $scope.view.wdg['declinePhotoButton'].visible = true;
}
$scope.hideFreezePhotoButtons = function() {
  $scope.view.wdg['acceptPhotoButton'].visible = false;
  $scope.view.wdg['declinePhotoButton'].visible = false;
}

$scope.clickedAcceptPhotoButton = function() {
  if(tempPhotoData != "") {
  	$scope.app.params.tempPhoto = tempPhotoData;
  }
  $scope.snapBack();
}

$scope.clickedDeclinePhotoButton = function() {
  tempPhotoData = "";
  $scope.hideFreezePhotoButtons();
  $scope.showTakePhotoButtons();
  
  
  timerId.start();
}

// Wciśnięcie przycisku cofania w widoku robienia zdjęcia
$scope.snapBack = function() {
  stopWebcam();
}

function stopWebcam() {
  video.pause();
  video.src = "";
  localstream.getTracks()[0].stop();
  console.log("Video off");
}