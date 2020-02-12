var width = 256;
var height = 256;

var front = false;

var video;
var canvas;
var canvas2;
var context2;
var streaming = false;

var capturedPhoto = false;

var localstream = null;
try {

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
  }

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

  $scope.takePhoto = function () {
    capturedPhoto = true;

    var context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    tempPhotoData = canvas.toDataURL('image/png');

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
  }
} catch(error) {
 $scope.view.wdg['error-lab'].text = error; 
}