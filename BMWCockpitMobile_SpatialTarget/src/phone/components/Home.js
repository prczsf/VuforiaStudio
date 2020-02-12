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

window.onload = function() {
  navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia || 
                            navigator.msGetUserMedia);
}

var topPanelStepLabelCount = 3;

// Ustawienie pełnego ekranu
ionic.Platform.fullScreen(true);

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

// Funkcja inicjalizuja oraz zapełniająca listę z możliwymi nieprawidłowościami do zgłoszenia
$scope.initialize = function() {
 $scope.view.wdg['faultList']['list'] = [
  { faultName: "Incorrect assembly" },
  { faultName: "Part poluted" },
  { faultName: "Part damaged" },
  { faultName: "Part missing" },
  { faultName: "Wrong part" },
  { faultName: "Other" }
 ];
  
  
  for(let stepsArrayIter = 1; stepsArrayIter <= topPanelStepLabelCount; stepsArrayIter++) {
    $scope.view.wdg['labelStep-'+stepsArrayIter].text = 'Step ' + parseInt(stepsArrayIter);
  }
  
  $scope.app.params.initialized = parseInt($scope.app.params.initialized) + 1;
  
  $scope.helpPhotoAndNotePlacer();
}

// Parametr steps zawiera informację JSON (tablicę obiektów) o każdym kroku: id, nazwę widgetu, nazwę kroku, status (czy został zgłoszony problem w części lub zaakceptowana jego prawidłowość, numer ID, pełną nazwę, opis, nazwę pomocniczego zdjęcia, pozycję białej ramki, ułatwiającej odnalezienie badanej części, pozycję pomocniczego zdjęcia, tablicę zgłoszonych niedoskonałości, wykonane zdjęcie oraz notkę nieprawidłowości.
if(!$scope.app.params.steps) {
  $scope.app.params.steps = [
    { "id": 1, "name": "Combined Instrument", "status": "UNCHECKED", "number": "7627794", "fullname": "combined Instrument chrome", "description": "Check assembly of correct variant 1", "filename": "Combined_Instrument.png","framePosition": {
      "width": 100,
      "height": 40,
      "x": -0.114,
      "y": 0.133,
      "z": 0.058,
      "rotX": -17,
      "rotY": 0,
      "rotZ": 0
    }, "helpImagePosition": {
      "x": -0.114,
      "y": 0.086,
      "z": 0.09
    }, "faultTypes": [], "photo": "", "note": ""},
    { "id": 2, "name": "Cover Driver’s Side", "status": "UNCHECKED", "number": "8806219", "fullname": "cover driver’s side piano black", "description": "Check assembly of correct variant 2", "filename": "Cover_Driver_Side.png", "framePosition": {
      "width": 60,
      "height": 40,
      "x": -0.184,
      "y": 0.113,
      "z": 0.038,
      "rotX": -28,
      "rotY": 0,
      "rotZ": 0
    }, "helpImagePosition": {
      "x": -0.184,
      "y": 0.066,
      "z": 0.07
    }, "faultTypes": [], "photo": "", "note": ""},
    { "id": 3, "name": "Control Unit Light", "status": "UNCHECKED", "number": "6671530", "fullname": "control unit light piano black with fog light switch", "description": "Check assembly of correct variant 3", "filename": "Control_Unit_Light.png", "framePosition": {
      "width": 50,
      "height": 30,
      "x": -0.176,
      "y": 0.083,
      "z": 0.048,
      "rotX": -2,
      "rotY": 0,
      "rotZ": 0
    }, "helpImagePosition": {
      "x": -0.176,
      "y": 0.058,
      "z": 0.08
    }, "faultTypes": [], "photo": "", "note": ""},
    { "id": 4, "name": "Cover Centerspeaker", "status": "UNCHECKED", "number": "9322816", "fullname": "cover centerspeaker high", "description": "Check assembly of correct variant 4", "filename": "Cover_Centerspeaker.png", "framePosition": {
      "width": 95,
      "height": 50,
      "x": -0.001,
      "y": 0.156,
      "z": -0.012,
      "rotX": -58,
      "rotY": 0,
      "rotZ": 0
    }, "helpImagePosition": {
      "x": -0.001,
      "y": 0.196,
      "z": 0.02
    }, "faultTypes": [], "photo": "", "note": ""},
    { "id": 5, "name": "Cover Passenger’s Side", "status": "UNCHECKED", "number": "9836220", "fullname": "cover passenger’s side silver/black", "description": "Check assembly of correct variant 5", "filename": "Cover_Passenger_Side.png", "framePosition": {
      "width": 270,
      "height": 70,
      "x": 0.079,
      "y": 0.106,
      "z": 0.058,
      "rotX": -20,
      "rotY": 0,
      "rotZ": 0
    }, "helpImagePosition": {
      "x": 0.079,
      "y": 0.059,
      "z": 0.09
    }, "faultTypes" : [], "photo": "", "note": ""}
  ]
}




// Przypisanie zerowego indexu z tablicy stepów jako pierwszego kroku
if(!$scope.app.params.currentStepIndex) {
  $scope.app.params.currentStepIndex = 0;
}

// Zmiana wielkości oraz pozycji 
transformFrame();

// Tymczasowy obiekt, w którym przechowywane są defekty do zapisu
if(!$scope.app.params.tempFaultTypesList) {
  $scope.app.params.tempFaultTypesList = {};
}
// Tymczasowy obiekt, w którym przechowywane są notatki do zapisu
if(!$scope.app.params.tempNote) {
  $scope.app.params.tempNote = "";
}


// Ustawianie odpowiedniego zdjęcia sprawdzanej części oraz ustawienie odpowiedniego tekstu w widgecie note
$scope.helpPhotoAndNotePlacer = function() {
  $scope.view.wdg['helpImage'].src = 'app/resources/Uploaded/' + $scope.app.params.steps[$scope.app.params.currentStepIndex].filename;
  $scope.view.wdg['noteInput'].text = $scope.app.params.steps[$scope.app.params.currentStepIndex].note;
}

// Funkcja transformująca ramkę ułatwiającą znalezienie częsci z bieżącego kroku
function transformFrame() {
  var c = document.createElement("canvas");
  c.width = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.width;
  c.height = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.height;
  var ctx = c.getContext("2d");
  ctx.rect(3, 3, c.width-6, c.height-6);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.stroke();
  $scope.app.params.xFrame = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.x;
  $scope.app.params.yFrame = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.y;
  $scope.app.params.zFrame = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.z;
  $scope.app.params.xRotFrame = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.rotX;
  $scope.app.params.yRotFrame = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.rotY;
  $scope.app.params.zRotFrame = $scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.rotZ;
  
  $scope.app.params.srcFrame = c.toDataURL();
 
  
  $scope.app.params.xHelpImage = $scope.app.params.steps[$scope.app.params.currentStepIndex].helpImagePosition.x;
  $scope.app.params.yHelpImage = $scope.app.params.steps[$scope.app.params.currentStepIndex].helpImagePosition.y;
  $scope.app.params.zHelpImage = $scope.app.params.steps[$scope.app.params.currentStepIndex].helpImagePosition.z;
  $scope.app.params.widthHelpImage = parseFloat($scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.width) * 0.001;
  $scope.app.params.heightHelpImage = parseFloat($scope.app.params.steps[$scope.app.params.currentStepIndex].framePosition.height) * 0.001;
}

refreshStepLabel();

// Funkcja aktualizująca informację o bieżącym kroku w dolnym pasku oraz transformująca ramkę ułatwiającą znalezienie częsci z bieżącego kroku
function refreshStepLabel() {
  $scope.app.params.currentStepLabelParam = 'Step ' + $scope.app.params.steps[$scope.app.params.currentStepIndex].id + '/' + $scope.app.params.steps.length + ' ' + $scope.app.params.steps[$scope.app.params.currentStepIndex].name;
  $scope.app.params.currentStepNumberLabelParam = $scope.app.params.steps[$scope.app.params.currentStepIndex].number;
  $scope.app.params.currentStepDescLabelParam = $scope.app.params.steps[$scope.app.params.currentStepIndex].description;
  transformFrame();
}





// Wciśnięcie przycisku zaakceptowania prawidłowości części
$scope.successStep = function() {
  $scope.app.params.tempFaultTypesList = {};
  $scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].status = 'SUCCESS';
  $scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].faultTypes = [];
  $scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].photo = "";
  $scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].note = "";
  if(parseInt($scope.app.params.currentStepIndex) + 1 < parseInt($scope.app.params.steps.length)) {
    $scope.app.params.currentStepIndex = parseInt($scope.app.params.currentStepIndex) + 1;
    $scope.app.params.frameVisibility = false;
    $scope.app.params.helpImageVisibility = false;
    
  	$scope.helpPhotoAndNotePlacer();
    refreshStepLabel();
  
    $scope.app.params.helpImageVisibility = true;
    $scope.app.params.frameVisibility = true;
  } else {
  	$scope.app.params.UIVisible = false;
    $scope.view.wdg['sumUpWarning'].visible = true;
  }
  
  $scope.nextStepLabel();
  $scope.refreshFaulTypesList();
}

// Wciśnięcie przycisku chęci zgłoszenia błędu
$scope.onClickAcceptDefectTypes = function() {
  if(Object.keys($scope.app.params.tempFaultTypesList).length !== 0 && $scope.app.params.tempFaultTypesList.constructor !== Object || $scope.app.params.tempNote != "" || ($scope.app.params.tempPhoto && parseInt($scope.app.params.tempPhoto.length) >= 10)) {
    $scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].status = 'FAIL';
    if(Object.keys($scope.app.params.tempFaultTypesList).length !== 0 && $scope.app.params.tempFaultTypesList.constructor !== Object) {
    	$scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes = $scope.app.params.tempFaultTypesList.selectedRows;
    }
    $scope.app.params.tempFaultTypesList = {};
    
    $scope.app.params.steps[$scope.app.params.currentStepIndex].note = $scope.app.params.tempNote;
    $scope.app.params.tempNote = "";
    
    if($scope.app.params.tempPhoto != "") {
      $scope.app.params.steps[$scope.app.params.currentStepIndex].photo = $scope.app.params.tempPhoto;
      $scope.app.params.tempPhoto = "";
    }

    if(parseInt($scope.app.params.currentStepIndex) + 1 < parseInt($scope.app.params.steps.length)) {
      $scope.app.params.currentStepIndex = parseInt($scope.app.params.currentStepIndex) + 1;
      $scope.app.params.frameVisibility = false;
      $scope.app.params.helpImageVisibility = false;

      $scope.helpPhotoAndNotePlacer();
      refreshStepLabel();
  
      $scope.app.params.helpImageVisibility = true;
      $scope.app.params.frameVisibility = true;
    } else {
      $scope.app.params.UIVisible = false;
      $scope.view.wdg['sumUpWarning'].visible = true;
    }

    $scope.nextStepLabel();
    $scope.refreshFaulTypesList();
  }
}

// Wciśnięcie przycisku strzałki w lewo, w celu ominięcia bieżącego kroku i przejścia do poprzedniego
$scope.backStep = function() {
  $scope.app.params.tempFaultTypesList = {};
  if(parseInt($scope.app.params.currentStepIndex) > 0) {
    $scope.app.params.currentStepIndex = parseInt($scope.app.params.currentStepIndex) - 1;
    $scope.app.params.frameVisibility = false;
    $scope.app.params.helpImageVisibility = false;
    
  	$scope.helpPhotoAndNotePlacer();
    refreshStepLabel();
  
    $scope.app.params.helpImageVisibility = true;
    $scope.app.params.frameVisibility = true;
  }
  
  $scope.prevStepLabel();
  $scope.refreshFaulTypesList();
}

// Wciśnięcie przycisku strzałki w prawo, w celu ominięcia bieżącego kroku i przejścia do następnego
$scope.skipStep = function() {
  $scope.app.params.tempFaultTypesList = {};
  if(parseInt($scope.app.params.currentStepIndex) < parseInt($scope.app.params.steps.length)-1) {
    $scope.app.params.currentStepIndex = parseInt($scope.app.params.currentStepIndex) + 1;
    $scope.app.params.frameVisibility = false;
    $scope.app.params.helpImageVisibility = false;
    
  	$scope.helpPhotoAndNotePlacer();
    refreshStepLabel();
  
    $scope.app.params.helpImageVisibility = true;
    $scope.app.params.frameVisibility = true;
  } else if(parseInt($scope.app.params.currentStepIndex) == parseInt($scope.app.params.steps.length)-1) {
  	$scope.app.params.UIVisible = false;
    $scope.app.params.faultButtonVisible = true;
    $scope.app.params.successButtonVisible = true;
    $scope.view.wdg['sumUpWarning'].visible = true;
  }
  
  $scope.nextStepLabel();
  $scope.refreshFaulTypesList();
}

// Poruszanie się pomiędzy krokami w górnym menu
$scope.nextStepLabel = function() {
  if(parseInt($scope.view.wdg['labelStep-'+topPanelStepLabelCount].text.replace( /^\D+/g, '')) + 1 <= parseInt($scope.app.params.steps.length)) {
    for(let stepsArrayIter = 1; stepsArrayIter <= topPanelStepLabelCount; stepsArrayIter++) {
      $scope.view.wdg['labelStep-'+stepsArrayIter].text = 'Step ' + (parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, '')) + 1);
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-success", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-fail", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("current-step-underline", "");
      if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "SUCCESS") {
    	$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-success';
      } else if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "FAIL") {
        $scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-fail';
      }
      if((parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1) == parseInt($scope.app.params.currentStepIndex)) {
  		$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' current-step-underline';
      }
    }
  } else {
    for(let stepsArrayIter = 1; stepsArrayIter <= topPanelStepLabelCount; stepsArrayIter++) {
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-success", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-fail", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("current-step-underline", "");
      if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "SUCCESS") {
    	$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-success';
      } else if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "FAIL") {
        $scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-fail';
      }
      if((parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1) == parseInt($scope.app.params.currentStepIndex)) {
  		$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' current-step-underline';
      }
    }
  }
}

$scope.prevStepLabel = function() {
  if(parseInt($scope.view.wdg['labelStep-1'].text.replace( /^\D+/g, '')) - 1 > 0) {
    for(let stepsArrayIter = 1; stepsArrayIter <= topPanelStepLabelCount; stepsArrayIter++) {
      $scope.view.wdg['labelStep-'+stepsArrayIter].text = 'Step ' + (parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, '')) - 1);
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-success", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-fail", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("current-step-underline", "");
      if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "SUCCESS") {
    	$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-success';
      } else if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "FAIL") {
        $scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-fail';
      }
      if((parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1) == parseInt($scope.app.params.currentStepIndex)) {
  		$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' current-step-underline';
      }
    }
  } else {
    for(let stepsArrayIter = 1; stepsArrayIter <= topPanelStepLabelCount; stepsArrayIter++) {
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-success", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("step-fail", "");
      $scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("current-step-underline", "");
      if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "SUCCESS") {
    	$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-success';
      } else if($scope.app.params.steps[parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1].status == "FAIL") {
        $scope.view.wdg['labelStep-'+stepsArrayIter].class += ' step-fail';
      }
      if((parseInt($scope.view.wdg['labelStep-'+stepsArrayIter].text.replace( /^\D+/g, ''))-1) == parseInt($scope.app.params.currentStepIndex)) {
  		$scope.view.wdg['labelStep-'+stepsArrayIter].class += ' current-step-underline';
      }
    }
  }
}


// Odświeżenie listy wybranych niedoskonałości części
$scope.refreshFaulTypesList = function() {
  $scope.view.wdg['faultList'].list.selectedRows = [];
  $scope.view.wdg['faultList'].list.current = {};

  for(let listIter = 0; listIter < $scope.view.wdg['faultList'].list.length; listIter++) {
    delete $scope.view.wdg['faultList'].list[listIter]._isSelected;
  }

  //console.log("Array size: " + Object.keys($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes).length);
  for(let listIter = 0; listIter < $scope.view.wdg['faultList'].list.length; listIter++) {
    for(let faultArrayiter = 0; faultArrayiter < Object.keys($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes).length; faultArrayiter++) {
      if($scope.view.wdg['faultList'].list[listIter].faultName == $scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes[faultArrayiter].faultName) {
        //if(!($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes.some(el => el.faultName === $scope.view.wdg['faultList'].list[listIter].faultName))) {
        $scope.view.wdg['faultList'].list[listIter]['_isSelected'] = true;
        $scope.view.wdg['faultList'].list.selectedRows.push($scope.view.wdg['faultList'].list[listIter]);
        $scope.view.wdg['faultList'].list.current = $scope.view.wdg['faultList'].list[listIter];
        break;
        //}
      }
    }
  }
}

// Odświeżenie listy wybranych niedoskonałości części
$scope.refreshFaulTypesListFromTempFaultTypesList = function() {
  $scope.view.wdg['faultList'].list.selectedRows = [];
  $scope.view.wdg['faultList'].list.current = {};

  for(let listIter = 0; listIter < $scope.view.wdg['faultList'].list.length; listIter++) {
    delete $scope.view.wdg['faultList'].list[listIter]._isSelected;
  }
  
  if(Object.keys($scope.app.params.tempFaultTypesList).length !== 0 && $scope.app.params.tempFaultTypesList.constructor !== Object) {
    //console.log("Array size: " + Object.keys($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes).length);
    for(let listIter = 0; listIter < $scope.view.wdg['faultList'].list.length; listIter++) {
      for(let faultArrayiter = 0; faultArrayiter < Object.keys($scope.app.params.tempFaultTypesList.selectedRows).length; faultArrayiter++) {
        if($scope.view.wdg['faultList'].list[listIter].faultName == $scope.app.params.tempFaultTypesList.selectedRows[faultArrayiter].faultName) {
          //if(!($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes.some(el => el.faultName === $scope.view.wdg['faultList'].list[listIter].faultName))) {
          console.log($scope.view.wdg['faultList'].list[listIter].faultName);
          $scope.view.wdg['faultList'].list[listIter]['_isSelected'] = true;
          $scope.view.wdg['faultList'].list.selectedRows.push($scope.view.wdg['faultList'].list[listIter]);
          $scope.view.wdg['faultList'].list.current = $scope.view.wdg['faultList'].list[listIter];
          break;
          //}
        }
      }
    }
  }
  
  $scope.view.wdg['noteInput'].text = $scope.app.params.tempNote;
}

// Wciśnięcie przycisku zakończenia sprawdzania oraz chęci przejścia do podsumowania
$scope.submit = function() {
  let notCheckedAll = false;
  let notCheckedStepsArray = [];

  $scope.view.wdg['sumUpWarning'].visible = false;

  for(let stepsArrayIter = 0; stepsArrayIter < parseInt($scope.app.params.steps.length); stepsArrayIter++) {
    if($scope.app.params.steps[stepsArrayIter].status == 'UNCHECKED') {
      notCheckedAll = true;
      notCheckedStepsArray.push(stepsArrayIter+1);
    }
  }

  if(notCheckedAll) {
    $scope.app.params.errorWarningText = "You didn't check ";
    if(notCheckedStepsArray.length > 1) {
      $scope.app.params.errorWarningText += "steps: " + notCheckedStepsArray;
    } else {
      $scope.app.params.errorWarningText += "step: " + notCheckedStepsArray;
    }
    $scope.view.wdg['errorWindow'].visible = true;
  } else {
    $scope.fillSumUpTable();
    $scope.view.wdg['sumUpWarning'].visible = false;
    $scope.view.wdg['faultButton'].visible = false;
    $scope.view.wdg['successButton'].visible = false;
    $scope.view.wdg['sumUpTablePopup'].visible = true;
    console.log("Successfully checked");
  }
}

// Wciśnięcie przycisku cofania w oknie z dopisywaniem notatek do danego kroku
$scope.noteBackButton = function() {
  $scope.view.wdg['noteInput'].text = $scope.app.params.steps[$scope.app.params.currentStepIndex].note;
  $scope.app.params.tempNote = "";
  $scope.view.wdg['faultMenu'].visible = true;
  
}

// Wciśnięcie błędu w liście błędów, zapisuje do tymczasowego obiektu tempFaultTypesList listę 
$scope.faultTypeItemClicked = function() {
  $scope.app.params.tempFaultTypesList = this.me.list;
}

// Zapisywanie wyborów z listy błędów do tablicy kroków oraz ukrycie menu z listą błędów
$scope.faultTypesSave = function() { 
  $scope.hideDefectTypesMenu();
}

// Zapisywanie wyborów z listy błędów do tablicy kroków oraz ukrycie menu z listą błędów
$scope.faultTypesBack = function() {  
  $scope.hideDefectTypesMenu();
  $scope.refreshFaulTypesList();
}

// Funckcja do czyszczenia informacji o błędzie z danego kroku
$scope.faultMenuClear = function() {
  $scope.hideFaultMenu();
  $scope.refreshFaulTypesList();
  $scope.view.wdg['noteInput'].text = $scope.app.params.steps[$scope.app.params.currentStepIndex].note;
  $scope.app.params.tempPhoto = "";
}

// Włączenie UI
$scope.turnOnUI = function() {
  $scope.app.params.UIVisible = true;
  $scope.view.wdg['faultButton'].visible = true;
  $scope.view.wdg['successButton'].visible = true;
}

// Wyłączenie UI
$scope.turnOffUI = function() {
  $scope.app.params.UIVisible = false;
  $scope.view.wdg['faultButton'].visible = false;
  $scope.view.wdg['successButton'].visible = false;
  $scope.view.wdg['takePhotoButton'].visible = false;
  $scope.view.wdg['acceptPhotoButton'].visible = false;
  $scope.view.wdg['cancelPhotoButton'].visible = false;
}

// Zainicjalizowanie listy możliwych błędów, włączenie UI oraz podkreślenie pierwszego kroku, jako wykonywany
$scope.trackingAcquired = function() {
  $scope.initialize();
  $scope.turnOnUI();
  
  if($scope.app.params.backFromTakePhoto == true) {
  	$scope.refreshFaulTypesListFromTempFaultTypesList();
    $scope.app.params.backFromTakePhoto = false;
  }
  
  if(parseInt($scope.app.params.initialized) > 1) {
    $scope.showFaultMenu();
  }

  for(let stepsIter = 1; stepsIter <= topPanelStepLabelCount; stepsIter++) {
    $scope.view.wdg['labelStep-'+stepsIter].class = $scope.view.wdg['labelStep-'+stepsIter].class.replace("current-step-underline", "");
    $scope.view.wdg['labelStep-'+stepsIter].class = $scope.view.wdg['labelStep-'+stepsIter].class.replace("step-success", "");
    $scope.view.wdg['labelStep-'+stepsIter].class = $scope.view.wdg['labelStep-'+stepsIter].class.replace("step-fail", "");
  }
  
  for(let stepsIter = 0; stepsIter < topPanelStepLabelCount; stepsIter++) {
    if($scope.app.params.steps[stepsIter].status == "SUCCESS") {
      $scope.view.wdg['labelStep-'+(stepsIter+1)].class = $scope.view.wdg['labelStep-'+(stepsIter+1)].class + ' step-success';
    } else if($scope.app.params.steps[stepsIter].status == "FAIL") {
      $scope.view.wdg['labelStep-'+(stepsIter+1)].class = $scope.view.wdg['labelStep-'+(stepsIter+1)].class + ' step-fail';
    }
    if((parseInt($scope.view.wdg['labelStep-'+(stepsIter+1)].text.replace( /^\D+/g, ''))-1) == parseInt($scope.app.params.currentStepIndex)) {
     $scope.view.wdg['labelStep-'+(stepsIter+1)].class = $scope.view.wdg['labelStep-'+(stepsIter+1)].class + ' current-step-underline';
    }
  }
}

// Usunięcie podkreślenia bieżącego kroku w górnym menu
$scope.trackingLost = function() {
  //for(let stepsIter = 0; stepsIter < parseInt($scope.app.params.steps.length); stepsIter++) {
  //  $scope.view.wdg[$scope.app.params.steps[stepsIter].widget].class = $scope.view.wdg[$scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].widget].class.replace("current-step-underline", "");
  //}
}

// Wciśnięcie przycisku cofnięcia w faultMenu
$scope.cancelFaultMenuValues = function() {  
  if($scope.changesInFaultList() || ($scope.app.params.tempNote != "" && $scope.app.params.tempNote != $scope.app.params.steps[$scope.app.params.currentStepIndex].note) || ($scope.app.params.tempPhoto && parseInt($scope.app.params.tempPhoto.length) >= 10)) {
    $scope.view.wdg['faultMenuCancelWarning'].visible = true;
  } else {
  	$scope.hideFaultMenu();
  }
  
  //console.log($scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].faultTypes);
  //console.log($scope.app.params.tempFaultTypesList.selectedRows);
}

// Wciśnięcie przycisku cofnięcia w defectTypesMenu
$scope.onClickDefectBack = function() {
  $scope.hideDefectTypesMenu();
  $scope.refreshFaulTypesList();
  $scope.app.params.tempFaultTypesList = {};
}

// Zmienna, która wskazuje index środkowego elementu w tablicy podsumowującej
var sumUpTablePivot = 1;

// Funkcja do wypełniania tablicy z podsumowanymi informacjami o kokpicie
$scope.fillSumUpTable = function() {
  for(let stepsArrayIter = sumUpTablePivot-1, labelNumber = 1; stepsArrayIter <= sumUpTablePivot+1; stepsArrayIter++, labelNumber++) {
    $scope.view.wdg['sumUpStepName-'+labelNumber].text = $scope.app.params.steps[stepsArrayIter].name;
    $scope.view.wdg['sumUpStepNumber-'+labelNumber].text = $scope.app.params.steps[stepsArrayIter].number;
    $scope.view.wdg['stepNameLabelSumUp-'+labelNumber].text = 'Step ' + (stepsArrayIter+1);
    
    if($scope.app.params.steps[stepsArrayIter].faultTypes != undefined && $scope.app.params.steps[stepsArrayIter].faultTypes.length > 0) {
      $scope.view.wdg['issuesDescription-'+labelNumber].text = $scope.app.params.steps[stepsArrayIter].faultTypes[0].faultName;
      for(let faultTypesArrayIter = 1; faultTypesArrayIter < Object.keys($scope.app.params.steps[stepsArrayIter].faultTypes).length; faultTypesArrayIter++) {
        $scope.view.wdg['issuesDescription-'+labelNumber].text += ';\n' + $scope.app.params.steps[stepsArrayIter].faultTypes[faultTypesArrayIter].faultName;
      }
    } else {
      $scope.view.wdg['issuesDescription-'+labelNumber].text = 'none';
    }
    
    if($scope.app.params.steps[stepsArrayIter].note != "") {
      $scope.view.wdg['noteDescription-'+labelNumber].text = $scope.app.params.steps[stepsArrayIter].note;
    } else {
      $scope.view.wdg['noteDescription-'+labelNumber].text = 'none';
    }
    
    if($scope.app.params.steps[stepsArrayIter].status == 'SUCCESS') {
      $scope.view.wdg['resultSumUpImage-'+labelNumber].imgsrc = 'app/resources/Uploaded/check.png';
      $scope.view.wdg['resultSumUpImage-'+labelNumber].backgroundcolor = '#007e33';
    } else {
      $scope.view.wdg['resultSumUpImage-'+labelNumber].imgsrc = 'app/resources/Uploaded/x.png';
      $scope.view.wdg['resultSumUpImage-'+labelNumber].backgroundcolor = '#cc0000';
    }

    if($scope.app.params.steps[stepsArrayIter].photo != "") {
    	$scope.view.wdg['imageArray'+labelNumber].imgsrc = $scope.app.params.steps[stepsArrayIter].photo;
    } else {
      clearphoto($scope.view.wdg['imageArray'+labelNumber]);
    }
  }
}

// Clear photo frame in sum up table
function clearphoto(photoWidget) {
  	var canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    var context = canvas.getContext('2d');
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, 128, 128);

    var data = canvas.toDataURL('image/png');
    photoWidget.imgsrc = data;
  }

// Wciśnięcie przycisku do przesunięcia tabeli podsumowującej o jedną pozycję w lewo
$scope.prevSumUp = function() {
  if(sumUpTablePivot > 1) {
    sumUpTablePivot--;
    $scope.fillSumUpTable();
  }
}

// Wciśnięcie przycisku do przesunięcia tabeli podsumowującej o jedną pozycję w prawo
$scope.nextSumUp = function() {
  if(sumUpTablePivot < parseInt($scope.app.params.steps.length) - 2) {
    sumUpTablePivot++;
    $scope.fillSumUpTable();
  }
}

// Sprawdzanie, czy zostały wprowadzone jakieś zmiany w liście defectTypesMenu
$scope.changesInFaultList = function() {
  if(Object.keys($scope.app.params.tempFaultTypesList).length === 0 && $scope.app.params.tempFaultTypesList.constructor === Object || Object.keys($scope.app.params.tempFaultTypesList.selectedRows).length === 0 && $scope.app.params.tempFaultTypesList.selectedRows.constructor === Object) {
   return false; 
  }
    
  let stepsFaultArraySize = 0;
  let tempFaultArraySize = $scope.app.params.tempFaultTypesList.selectedRows.length;
  
  for(let stepsArrayIter = 0; stepsArrayIter < Object.keys($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes).length; stepsArrayIter++) {
    if($scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].faultTypes[stepsArrayIter]._isSelected) {
      stepsFaultArraySize++;
    }
  }
  
  if(stepsFaultArraySize != tempFaultArraySize) {
   return true; 
  }
  
  let sameSteps = 0;
  
  for(let stepsArrayIter = 0; stepsArrayIter < Object.keys($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes).length; stepsArrayIter++) {
    for(let tempStepArrayIter = 0; tempStepArrayIter < Object.keys($scope.app.params.steps[$scope.app.params.currentStepIndex].faultTypes).length; tempStepArrayIter++) {
      if($scope.app.params.tempFaultTypesList.selectedRows[tempStepArrayIter] == undefined) {
       return true; 
      }
      if($scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].faultTypes[stepsArrayIter]._isSelected == true && $scope.app.params.steps[parseInt($scope.app.params.currentStepIndex)].faultTypes[stepsArrayIter].faultName == $scope.app.params.tempFaultTypesList.selectedRows[tempStepArrayIter].faultName) {
        sameSteps++;
      }
  	}
  }
  
  if(sameSteps != tempFaultArraySize) {
    return true;
  }
  
  return false;
}

// Wciśnięcie przycisku Save w inpucie Note
$scope.saveNote = function() {
  $scope.app.params.tempNote = $scope.view.wdg['noteInput'].text;
  $scope.view.wdg['faultMenu'].visible = true;
}


// Pokaż liste możliwych defektów oraz ukryj menu z możliwościami zgłoszenia błędu
$scope.showDefectTypesMenu = function() {
  $scope.view.wdg['defectTypesMenu'].visible = true;
  $scope.view.wdg['faultMenu'].visible = false;
}

// Schowaj liste możliwych defektów oraz pokaż menu z możliwościami zgłoszenia błędu
$scope.hideDefectTypesMenu = function() {
  $scope.view.wdg['defectTypesMenu'].visible = false;
  $scope.view.wdg['faultMenu'].visible = true;
}

// Pokaż menu z możliwościami zgłoszenia błędu oraz ukryj wszystkie przycisi do ominięcia kroku, cofnięcia kroku, zgłoszenia problemu oraz zgłoszenia prawidłowej częsci
$scope.showFaultMenu = function() {
  $scope.view.wdg['faultButton'].visible = false;
  $scope.view.wdg['successButton'].visible = false;
  $scope.app.params.previousStepButtonVisible = false;
  $scope.app.params.nextStepButtonVisible = false;
  $scope.view.wdg['faultMenu'].visible = true;
}

// Schowaj menu z możliwościami zgłoszenia błędu oraz pokaż wszystkie przycisi do ominięcia kroku, cofnięcia kroku, zgłoszenia problemu oraz zgłoszenia prawidłowej częsci
$scope.hideFaultMenu = function() {
  $scope.view.wdg['faultButton'].visible = true;
  $scope.view.wdg['successButton'].visible = true;
  $scope.app.params.previousStepButtonVisible = true;
  $scope.app.params.nextStepButtonVisible = true;
  $scope.view.wdg['faultMenu'].visible = false;
}

// Sending ending report and restarting experience
$scope.sendReportAndRestart = function() {
  for(let stepsIter = 0; stepsIter < parseInt($scope.app.params.steps.length); stepsIter++) {
    $scope.app.params.steps[stepsIter].faultTypes = $scope.app.params.steps[stepsIter].faultTypes.map(a => a.faultName);
  }
  
  console.log(JSON.stringify($scope.app.params.steps, null, 2));
  var json = JSON.stringify($scope.app.params.steps, null, 2);
  var blob = new Blob([json], {type: "application/json"});
  var url  = URL.createObjectURL(blob);

  var a = document.createElement('a');
  a.download = "BMW raport.json";
  a.href = url;
  a.click();
  window.location = "https://view.vuforia.com/command/view-experience?url=https%3A%2F%2F3bd2760cf54a75ca.studio-trial.vuforia.io%2FExperienceService%2Fcontent%2Fprojects%2Fbmwcockpitmobile%2520spatialtarget%2Findex.html%3FexpId%3D1%26vumark%3D37047%253A2";
}

// Przyciśnięcie tekstu z numerem stepu np. 'Step 1' w górnym menu
$scope.stepClicked = function() {
  $scope.app.params.tempFaultTypesList = {};
  for(let stepsArrayIter = 1; stepsArrayIter <= topPanelStepLabelCount; stepsArrayIter++) {
  	$scope.view.wdg['labelStep-'+stepsArrayIter].class = $scope.view.wdg['labelStep-'+stepsArrayIter].class.replace("current-step-underline", "");
  }
  $scope.app.params.currentStepIndex = parseInt(this.me.text.replace( /^\D+/g, '')-1);
  $scope.view.wdg[this.me.widgetName].class += ' current-step-underline';
  $scope.app.params.frameVisibility = false;
  $scope.app.params.helpImageVisibility = false;

  $scope.helpPhotoAndNotePlacer();
  refreshStepLabel();

  $scope.app.params.helpImageVisibility = true;
  $scope.app.params.frameVisibility = true;

  $scope.refreshFaulTypesList();
}


// iOS Camera
var cameraDiv = document.createElement('div');
cameraDiv.id = 'my_camera';
document.body.appendChild(cameraDiv);

// Android Camera
/*var canvas = document.createElement('canvas');
canvas.id = 'canvas';
canvas.style.display = 'none';
document.body.appendChild(canvas);

var mediaStreamTrack;
var imageCapture;

var tempMediaStreamTrack;*/

function initCameraStream() {
  navigator.mediaDevices.getUserMedia({video: { facingMode: { exact: "environment" } }})
  .then(gotMedia)
  .catch(error => alert('getUserMedia() error:', error));

  function gotMedia(mediaStream) {
    tempMediaStreamTrack = mediaStream.getVideoTracks()[0];
    mediaStreamTrack = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(mediaStreamTrack);
    console.log(imageCapture);
  }
}

function vidOff() {
  mediaStreamTrack.stop();
  mediaStreamTrack = tempMediaStreamTrack;
  console.log("Vid off");
}

// Webcam.js || Android navigator
$scope.snapshotView = function() {
  if(system == 'iOS') {
    Webcam.set({
      width: 320,
      height: 240,
      image_format: 'jpeg',
      jpeg_quality: 90
    });

	Webcam.reset();
    Webcam.attach('#my_camera');

    Webcam.snap( function(data_uri) {
      $scope.app.params.tempPhoto = data_uri;
  	  $scope.app.params.backFromTakePhoto = true;
      Webcam.reset();
    });
  } else {
  	$scope.app.fn.navigate('Camera');
    
  	/*initCameraStream();
    
    $scope.turnOffUI();
    $scope.hideFaultMenu();
    
    $scope.view.wdg['faultButton'].visible = false;
    $scope.view.wdg['successButton'].visible = false;
    
    $scope.view.wdg['takePhotoButton'].visible = true;
    $scope.view.wdg['acceptPhotoButton'].visible = true;
  	$scope.view.wdg['cancelPhotoButton'].visible = true;*/
  }
}

$scope.takeSnap = function(e) {
  imageCapture.grabFrame()
  .then(imageBitmap => {
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    canvas.getContext('2d').drawImage(imageBitmap, 0, 0);
    
    $scope.app.params.tempPhoto = canvas.toDataURL();
  })
  .catch(error => alert('grabFrame() error:', error));
}

$scope.acceptSnap = function() {
  vidOff();
  $scope.view.wdg['takePhotoButton'].visible = false;
  $scope.view.wdg['acceptPhotoButton'].visible = false;
  $scope.view.wdg['cancelPhotoButton'].visible = false;
  $scope.turnOnUI();
  $scope.showFaultMenu();
}

$scope.cancelSnap = function() {
  vidOff();
  $scope.app.params.tempPhoto = "";
  
  $scope.view.wdg['takePhotoButton'].visible = false;
  $scope.view.wdg['acceptPhotoButton'].visible = false;
  $scope.view.wdg['cancelPhotoButton'].visible = false;
  $scope.turnOnUI();
  $scope.showFaultMenu();
}