// $scope, $element, $attrs, $injector, $sce, $timeout, $http, $ionicPopup, and $ionicPopover services are available

var reportObj = $scope.app.params.FullReportList;

$scope.init = () => {
  //$scope.app.params.workList = [];
  var html = ``;

  reportObj.forEach((elem, i) => {
    console.log(i);
    html = html + `
      <input type="checkbox" id="list-item-${i}">
      <label for="list-item-${i}"><b>Time:</b>Time: ${new Date(elem.timestamp * 1e3).toISOString().slice(-13, -5)} <b>Area:</b> ${elem.inspectionArea} <b>Cat:</b> ${elem.category} <b>Sub:</b> ${elem.type} </label>
      <ul>
      <li>Quality gate: ${elem.QualityGate} | User: ${elem.user} | Vin NO: ${elem.carVinNo} | Car area: ${elem.inspectionArea} | Defect category: ${elem.category} | Defect subcatgory: ${elem.type} | Related SM/Part: ${elem.areaName} | Comment: ${elem.textComment}  | Markers: ${elem.modelsCount} </li>
      </ul>
      </table>`;
  });

  var labeldiv = document.querySelector("*[widget-id='displayLabel'] div"); // div");
  // var labeldiv = document.getElementsByClassName('labelWidget');;
  labeldiv.innerHTML = `<div class="wrapper">
      <ul>
        ${html}
      </ul>
    </div>`;

  //$scope.view.wdg['displayLabel'].text = `${html}`;
  $scope.view.wdg['vinNoLabel'].text = `#VIN${$scope.app.params.currentCarVinNo}#`;
  $scope.view.wdg['colorLabel'].text = `#COLOR GREEN#`;
  $scope.view.wdg['rimsLabel'].text = `#BIG FOOT CHROME#`;
}

angular.element(document).ready($scope.init);

$scope.reportButtonClicked = (el) => {
  console.log(`report btn clicked: ${el}`); 
  var coll = document.getElementById(el);
  console.log(coll);

  /*
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.maxHeight){
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
  reportButtonClicked('${elem}')
*/
}

/*
<div class="wrapper">
  <ul>
    <li>
      <input type="checkbox" id="list-item-1">
      <label for="list-item-1" class="first">Serif</label>
      <ul>
        <li>Slabo</li>
        <li>Droid Serif</li>
        <li>Roboto Serif</li>
        <li>Lora</li>
        <li>Meriweather</li>
      </ul>
    </li>
    <li>
      <input type="checkbox" id="list-item-2">
      <label for="list-item-2">Sans Serif</label>
      <ul>
        <li>Open Sans</li>
        <li>Roboto</li>
        <li>Lato</li>
        <li>Stabo</li>
        <li>Oswald</li>
      </ul>
    </li>
    <li>
      <input type="checkbox" id="list-item-3">
      <label for="list-item-3" class="last">Monospace</label>
      <ul>
        <li>Inconsolata</li>
        <li>Source Code Pro</li>
        <li>Droid Sans Mono</li>
        <li>Ubuntu Mono</li>
        <li>Cousine</li>
      </ul>
    </li>
  </ul>
</div>

<button class="report" id="${elem}" name="${elem}" twx-native-events="" ng-click="reportButtonClicked('${elem}')"><b>Area:</b> ${elem.inspectionArea} <b>Cat:</b> ${elem.category} <b>Sub:</b> ${elem.type} <b>Comment:</b> ${elem.textComment}</button>
<div class="content">
    <p>Lorem ipsum...</p>
</div>
*/