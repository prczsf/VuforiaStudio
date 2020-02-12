/*setTimeout(function () {
  $scope.view.wdg['image-2'].visible = true;
  $scope.view.wdg['splashScreenGrid'].class = 'fade-in-image-anim';
  console.log($scope.view.wdg['splashScreenGrid'].class);
  setTimeout(function () {
    $scope.view.wdg['splashScreenGrid'].class = 'fade-out-image-anim';
    console.log($scope.view.wdg['splashScreenGrid'].class);
    $scope.app.fn.navigate('Home');
  }, 1500);
}, 30);

*/

setTimeout(function () {
    $scope.app.fn.navigate('Home');
}, 3000);