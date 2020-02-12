var triggerDown = false;
var gunUp = false;
var endTrigger = false;

$scope.fire = function() {
  endTrigger = false;
  $scope.intervalPromise = $interval(function() {
    // Rotate gun trigger
    if(!endTrigger) {
      if(!triggerDown) {
        if($scope.app.params.triggerZRot > 155) {
            $scope.app.params.triggerZRot = parseInt($scope.app.params.triggerZRot) - 1;
        } else {
            triggerDown = true; 
        }
      }else {
        if($scope.app.params.triggerZRot < 195) {
            $scope.app.params.triggerZRot = parseInt($scope.app.params.triggerZRot) + 1;
        } else {
            triggerDown = false;
            endTrigger = true;
        } 
      }
    }
    
    // Rotate gun
    if(!gunUp) {
      if(parseFloat($scope.app.params.gunZRot) <= 3) {
          $scope.app.params.gunZRot = parseFloat($scope.app.params.gunZRot) + parseFloat(0.075);
      } else {
      	gunUp = true;
      }
    } else {
      if(parseFloat($scope.app.params.gunZRot) >= 0) {
          $scope.app.params.gunZRot = parseFloat($scope.app.params.gunZRot) - parseFloat(0.075);
      } else {
      	gunUp = false;
    	$interval.cancel($scope.intervalPromise);
      }
    }
  }, 5);
}