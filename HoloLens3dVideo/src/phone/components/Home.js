let canvas = document.createElement("canvas");
canvas.width = $scope.app.params.width;
canvas.height = $scope.app.params.height;
canvas.className = 'canvas';
let ctx = canvas.getContext("2d");

let video = document.createElement("video");
let intervalId = null;

video.src = "app/resources/Uploaded/video.mp4";

let videoPlaying = false;

$scope.videoClicked = function() {
  if(videoPlaying == false) {
    videoPlaying = true;
    video.play();
    $scope.initInterval();
  } else {
    videoPlaying = false;
    clearInterval(intervalId);
    video.pause();
  }
}

$scope.initInterval = function() {
  intervalId = setInterval(function() {
    $scope.update();
  }, 4);
}

$scope.update = function(){
  ctx.drawImage(video, 0, 0, $scope.app.params.width, $scope.app.params.height);
  $scope.view.wdg['3DImage-1'].src = canvas.toDataURL();
  $scope.tryApply();
}

$scope.tryApply = function () {
  if (!$scope.$$phase) {
    $scope.$apply();
  }
};