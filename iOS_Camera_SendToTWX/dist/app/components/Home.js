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
};
angular.element(document).ready($scope.DoInject);


function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

var system = getMobileOperatingSystem();

function runTWXService(thingName, serviceName, parameters) {
  twx.app.fn.triggerDataService(thingName, serviceName, parameters);
}

// iOS Camera
var cameraDiv = document.createElement('div');
cameraDiv.id = 'my_camera';
document.body.appendChild(cameraDiv);

// Webcam.js || Android navigator
$scope.snapshotView = function() {
  //if(system == 'iOS') {
  Webcam.set({
    width: $element[0].clientWidth,
    height: $element[0].clientHeight,
    image_format: 'jpeg',
    jpeg_quality: 100
  });

  Webcam.attach('#my_camera');

  Webcam.snap( function(data_uri) {
    try {
      let block = data_uri.split(";");
      // Get the content type
      let dataType = block[0].split(":")[1];// In this case "image/jpeg"
      // get the real base64 content of the file
      let realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."
      let fileName = 'step ' + 1 + '.jpeg';
      runTWXService('ImageThing', 'AddImageService', { 'mediaContentBase64': realData, 'mediaFileName': fileName });

      Webcam.reset();
    } catch(e) {
      $scope.app.params.debugText = e;
    }
  });
  //}
}

$scope.displayPicture = function() {
  try {
    $scope.$on("AddImageService.serviceInvokeComplete", function(event ) {
      $scope.app.params['debugText'] = ">>>SaveImage.serviceInvokeComplete " + event;
    });
  } catch(e) {
    $scope.app.params.debugText = e;
  }
}