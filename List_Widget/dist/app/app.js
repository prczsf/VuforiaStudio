(function(){
  window.twx = window.twx || {};

  var requires = ["ionic","twx.byoc"];
  var twxViewControllersModule = angular.module('twxViewControllers', requires);
  twxViewControllersModule.run(function($templateCache) {
    //Inject an ng-if for preview cases where the web-assembly module needs time to load & compile async.
    //Delays loading model-items until its ready and the model tags are processed.
    
      var viewHTML =  '<ion-view hasGridEvenRows="false" view-type="ar" twx-view="Home" view-title="Home" ctrl-name="Home_TwxViewController" can-swipe-back="false"><div class="overlay ng-hide" ng-show=""></div><ion-content scroll="false" has-bouncing="false" ><twx-widget widget-id="view-1" original-widget="twx-view" widget-name="view-1"><twx-widget-property name="widgetName" datatype="string" value="view-1"></twx-widget-property><twx-widget-property name="viewtype" datatype="string" value="ar"></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-content><twx-container-content class="{{me.class}}"><twx-widget widget-id="3DContainer-1" original-widget="twx-dt-view" widget-name="3D Container"><twx-widget-service name="unlockCameraAndOrientation"></twx-widget-service><twx-widget-service name="lockCameraAndOrientation"></twx-widget-service><twx-widget-property name="widgetName" datatype="string" value="3D Container"></twx-widget-property><twx-widget-property name="far" datatype="number" value="200"></twx-widget-property><twx-widget-property name="near" datatype="number" value="0.01"></twx-widget-property><twx-widget-property name="dropshadow" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="enabletrackingevents" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="camera" datatype="json" value="{}"></twx-widget-property><twx-widget-property name="persistmap" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="src" datatype="string" value="TW-VuMark.xml"></twx-widget-property><twx-widget-property name="extendedtracking" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-content><twx-dt-view near="0.01" far="200" dropshadow="{{me.dropshadow}}">\n'+
'     <twx-dt-tracker id="tracker1" enabletrackingevents="false" stationary="true">\n'+
'        <twx-container-content>\n'+
'           <div class="targetGuide" ng-class="targetGuideClass" ng-hide="hideTargetGuide">\n'+
'               <div class="bracket-top-left"></div>\n'+
'               <div class="bracket-top-right"></div>\n'+
'               <div class="bracket-bottom-right"></div>\n'+
'               <div class="bracket-bottom-left"></div>\n'+
'               <div class="targetGuideText hint" ng-hide="hideTargetGuide">{{targetGuideHint}}</div>\n'+
'           </div>\n'+
'        <twx-widget widget-id="gauge3dImage" original-widget="twx-dt-image" widget-name="gauge3dImage"><twx-widget-property name="widgetName" datatype="string" value="gauge3dImage"></twx-widget-property><twx-widget-property name="placeholder_img" datatype="" value="/extensions/images/placeholder_img.svg"></twx-widget-property><twx-widget-property name="shader" datatype="string" value=""></twx-widget-property><twx-widget-property name="pivot" datatype="select" value="5"></twx-widget-property><twx-widget-property name="opacity" datatype="number" value="1"></twx-widget-property><twx-widget-property name="experimentalOneSided" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="decal" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="occlude" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="billboard" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="rz" datatype="number" value="0.00"></twx-widget-property><twx-widget-property name="ry" datatype="number" value="0.00"></twx-widget-property><twx-widget-property name="rx" datatype="number" value="-90.00"></twx-widget-property><twx-widget-property name="z" datatype="number" value="0.0000"></twx-widget-property><twx-widget-property name="y" datatype="number" value="0.0000"></twx-widget-property><twx-widget-property name="x" datatype="number" value="-0.0792"></twx-widget-property><twx-widget-property name="scale" datatype="string" value="1.0000"></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-property name="width" datatype="number" value=""></twx-widget-property><twx-widget-property name="height" datatype="number" value=""></twx-widget-property><twx-widget-property name="src" datatype="resource_url" value=""></twx-widget-property><twx-widget-content><twx-dt-image id="gauge3dImage" ng-src="{{me.src | trustUrl}}" src="" height="{{me.height}}" width="{{me.width}}" class="basic-3d-state-formatting {{me.class}}" sx="{{me.scale.split(&apos; &apos;)[0] || me.scale}}" sy="{{me.scale.split(&apos; &apos;)[1] || me.scale}}" sz="{{me.scale.split(&apos; &apos;)[2] || me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!app.fn.isTrue(me.visible)}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}" experimental-one-sided="{{me.experimentalOneSided}}" opacity="{{me.opacity}}" pivot="{{me.pivot}}" shader="{{me.shader}}"></twx-dt-image></twx-widget-content></twx-widget><twx-widget widget-id="model-1" original-widget="twx-dt-model" widget-name="model-1"><twx-widget-event name="modelLoaded" value="printOn3dImage();"></twx-widget-event><twx-widget-service name="stop"></twx-widget-service><twx-widget-service name="rewind"></twx-widget-service><twx-widget-service name="reset"></twx-widget-service><twx-widget-service name="playAll"></twx-widget-service><twx-widget-service name="play"></twx-widget-service><twx-widget-service name="forward"></twx-widget-service><twx-widget-property name="widgetName" datatype="string" value="model-1"></twx-widget-property><twx-widget-property name="sequencePartIds" datatype="string"></twx-widget-property><twx-widget-property name="playing" datatype="boolean"></twx-widget-property><twx-widget-property name="stepDescription" datatype="string"></twx-widget-property><twx-widget-property name="stepName" datatype="string"></twx-widget-property><twx-widget-property name="currentStep" datatype="number"></twx-widget-property><twx-widget-property name="steps" datatype="number"></twx-widget-property><twx-widget-property name="showSequenceInCanvas" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="sequence" datatype="resource_url" value=""></twx-widget-property><twx-widget-property name="sequenceList" datatype="infotable"></twx-widget-property><twx-widget-property name="shader" datatype="string" value=""></twx-widget-property><twx-widget-property name="translucent" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="opacity" datatype="number" value="1"></twx-widget-property><twx-widget-property name="decal" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="occlude" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="forceHidden" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="rz" datatype="number" value="0"></twx-widget-property><twx-widget-property name="ry" datatype="number" value="0"></twx-widget-property><twx-widget-property name="rx" datatype="number" value="0"></twx-widget-property><twx-widget-property name="z" datatype="number" value="-0.01656485628336668"></twx-widget-property><twx-widget-property name="y" datatype="number" value="0.39881232380867004"></twx-widget-property><twx-widget-property name="x" datatype="number" value="0.12245059758424759"></twx-widget-property><twx-widget-property name="scale" datatype="string" value="1.0"></twx-widget-property><twx-widget-property name="src" datatype="resource_url" value="app/resources/Uploaded/TEST1.pvz"></twx-widget-property><twx-widget-content><twx-dt-model id="model-1" ng-src="{{me.src | trustUrl}}" src="app/resources/Uploaded/TEST1.pvz" sx="{{me.scale.split(&apos; &apos;)[0] || me.scale}}" sy="{{me.scale.split(&apos; &apos;)[1] || me.scale}}" sz="{{me.scale.split(&apos; &apos;)[2] || me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!app.fn.isTrue(me.visible)}}" force-hidden="{{me.forceHidden}}" occlude="{{me.occlude}}" decal="{{me.decal}}" opacity="{{me.opacity}}" phantom="{{!me.translucent}}" shader="{{me.shader}}" sequencelist="{{me.sequenceList}}" sequence="{{me.sequence}}" showsequenceincanvas="{{me.showSequenceInCanvas}}" steps="{{me.steps}}" currentstep="{{me.currentStep}}" stepname="{{me.stepName}}" stepdescription="{{me.stepDescription}}" playing="{{me.playing}}" sequencepartids="{{me.sequencePartIds}}"><twx-container-content></twx-container-content></twx-dt-model></twx-widget-content></twx-widget></twx-container-content>\n'+
'     </twx-dt-tracker>\n'+
'</twx-dt-view></twx-widget-content></twx-widget></twx-container-content></twx-widget-content><twx-fragment-parameters></twx-fragment-parameters><twx-view-data></twx-view-data></twx-widget></ion-content></ion-view>\n';
      if (twx.app.isPreview() && viewHTML.indexOf('view-type="ar"') > 0) {
        viewHTML = viewHTML.replace(/<twx-dt-modelitem /ig, '<twx-dt-modelitem ng-if="$root.thingViewReady !== false" ');
      }
      $templateCache.put('app/components/Home.html', viewHTML);
    

    
  });

  

  twxViewControllersModule.controller('Home_TwxViewController',
      function ($scope, $element, $attrs, $timeout, $interval, $http, $ionicPopup, $ionicPopover, $stateParams, $location, $rootScope, tml3dRenderer, $injector, $sce) {
    $scope.app = twx.appScope;
    $scope.device = twx.device;
    $scope.view = {
        mdl: {
            custom: {}
        },
        wdg: {},
        fn: {},
        evt: {},
        prm: {},
        view: {}
    };

    var myWidgets = '';
    var activeWidgetEvents = {};
    var customWidgetEventListeners = [];

    if( $attrs['twxView'] !== undefined && $attrs['twxView'].length > 0 ) {
        $scope.app.view = $scope.app.view || {};
        $scope.app.view[$attrs['twxView']] = $scope.view;
    }

    this.setProperty = function(widgetProperty,value) {
        $scope.view.wdg[$attrs.widgetId][widgetProperty] = value;

    };

    this.addWidget = function(widgetScope,widgetElem,widgetAttrs) {
        var widgetId = widgetAttrs['widgetId'] || widgetAttrs['model'];
        var x = $scope;
        $scope.view.wdg = $scope.view.wdg || {};
        $scope.view.wdg[widgetId] = widgetScope[widgetId];
        myWidgets += '|' + widgetId;
        widgetScope['_widgetId'] = widgetId;
        //console.log('twxView --- adding widget "' + widgetId + '" to view - total widgets: ' + myWidgets);
    };

    $scope.getWidgetScope = function(widgetId){
      return $scope.view.wdg[widgetId];
    };

    $scope.getWidgetProp = function (widgetId, prop) {
      var propVal;
      if ($scope.view.wdg[widgetId] && $scope.view.wdg[widgetId][prop]) {
        propVal = $scope.view.wdg[widgetId][prop];
      }
      return propVal;
    };

    $scope.setWidgetProp = function (widgetId, prop, val) {
      if ($scope.view.wdg[widgetId]) {
        $scope.view.wdg[widgetId][prop] = val;
      }
    };

    $scope.addWidgetEventListener = function (widgetId, widgetEvent, callback) {
      customWidgetEventListeners.push({
        widgetId: widgetId,
        widgetEvent: widgetEvent,
        callback: callback
      });
      if (!activeWidgetEvents[widgetEvent]) {
        activeWidgetEvents[widgetEvent] = true;
        $scope.$on(widgetEvent, function (event, args) {
          _.each(customWidgetEventListeners, function (listenerInfo) {
            if (listenerInfo.widgetId == event.targetScope.widgetId && listenerInfo.widgetEvent == event.name) {
              listenerInfo.callback();
            }
          });
        });
      }
    };

    $scope.pulse = 1.0;

    $scope.tracerWidth = 0.0;
    $scope.tracerHeight = 0.0;
    $scope.tracerDimensions = { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    $scope.loadingPromise = null;
    $scope.modelLoaded = $element.find('twx-dt-model').length === 0;
    var modelCount = $element.find('twx-dt-model').length;
    var modelLoadedCount = 0;
    var targets = $element.find('twx-dt-target');

    // hide the target guide initially until the actual image to use is known.
    $scope.hideTargetGuide = true;

    function setImageTrackerTracerDimensions(src) {
      let image = new Image();
      image.onload = () => {
        $scope.tracerWidth = image.width;
        $scope.tracerHeight = image.height;
        $scope.$apply();
      };

      image.src = src;
    }

    var setGuideImageData = function() {
      if (targets[0]) { // assume one target only
        var src = targets[0].getAttribute("src");

        if (src.startsWith("vuforia-vumark://")) {
          $scope.hideTargetGuide = false;
          $scope.targetGuideClass = "thingmark";
          $scope.targetGuideHint = "Point camera at ThingMark";
        } else if (src.startsWith('vuforia-image://')) {
          $scope.hideTargetGuide = false;
          $scope.targetGuideClass = "imageTarget";
          $scope.targetGuideHint = 'Point camera at image';
          setImageTrackerTracerDimensions(targets[0].getAttribute("guide-src"));
        } else if (!src.startsWith("spatial://")) {
          $scope.hideTargetGuide = false;
          var targetGuideDiv = $element[0].querySelector("div.targetGuide");
          var guideSrc = targets[0].getAttribute("guide-src");
          if (targetGuideDiv && guideSrc) {
            $scope.targetGuideClass = "imagemark";
            targetGuideDiv.style.backgroundImage = "url('" + guideSrc + "')";
          }
        }
      }
    };

    $scope.$applyAsync(function() {
      // This has to be invoked asynchronously now to give angular time to digest and interpolate the value of
      // guide-src="{{ ... }}" to the real value.
      setGuideImageData();
    });

    $scope.$on('trackingacquired', function (evt, arg) {
      tml3dRenderer.getTracked(function(trackedObjects) {
        $scope.startLoadingIndicatorIfNeeded(trackedObjects);
        $scope.applyTargetGuideIfNeeded(trackedObjects);
      });
    });

    $scope.$on('trackinglost', function (evt, arg) {
      tml3dRenderer.getTracked(function(trackedObjects) {
        $scope.applyTargetGuideIfNeeded(trackedObjects);
      });
    });

    $scope.$on('modelLoaded', function (evt, arg) {
      modelLoadedCount++;
      $scope.modelLoaded = true;

      tml3dRenderer.getTracked(function(trackedObjects) {
        $scope.applyTargetGuideIfNeeded(trackedObjects);
      });
    });

    // starts the 'spinner' animation around the thing code while the model is loading
    $scope.startLoadingIndicatorIfNeeded = function (trackedObjects) {
      if (!twx.app.fn.isCompatibleObjectsTracked(trackedObjects, targets)) {
        return;
      }

      // Start animation if this is first successful call to startLoadingIndicatorIfNeeded.
      var spinnerInterval = 0.03;
      if ($scope.pulse === 1.0 && $scope.loadingPromise === null) {
        $scope.loadingPromise = $interval(function () {
          // stop the animation after it makes one complete loop around
          if($scope.pulse <= 0) {
            // stop the animation
            $interval.cancel($scope.loadingPromise);
            $scope.loadingPromise = null;
            $scope.pulse = 0;
          }
          $scope.pulse -= spinnerInterval;
        }, 100);
      }
    };

    /**
     * @param trackedObjects [Elements]
     */
    $scope.applyTargetGuideIfNeeded = function(trackedObjects) {
      var hideTargetGuide = twx.app.fn.computeHideTargetGuide(trackedObjects, targets, modelLoadedCount, modelCount);

      $scope.$apply(function () {
        $scope.hideTargetGuide = hideTargetGuide;
      });
    };

    (function($scope, $element, $attrs, $timeout){

      // Tworzymy i formatujemy widget za pomoc HTML I CSS (nie wszystkie elementy css bd nam tu super dziaa, w niektórych przypadkach zaczynaj dziaa kiedy zwyky css zamienimy na style inline)
$scope.gaugeConfig = () => {
  var gaugeCss = `.select {
    /* All sizes will be expressed with the em value for accessibility reasons
     (to make sure the widget remains resizable if the user uses the  
     browser's zoom in a text-only mode). The computations are made
     assuming 1em == 16px which is the default value in most browsers.
     If you are lost with px to em conversion, try http://riddle.pl/emcalc/ */
    font-size   : 0.625em; /* this (10px) is the new font size context for em value in this context */
    font-family : Verdana, Arial, sans-serif;

    -moz-box-sizing : border-box;
    box-sizing : border-box;

    /* We need extra room for the down arrow we will add */
    padding : .1em 2.5em .2em .5em; /* 1px 25px 2px 5px */
    width   : 10em; /* 100px */

    border        : .2em solid #000; /* 2px */
    border-radius : .4em; /* 4px */
    box-shadow    : 0 .1em .2em rgba(0,0,0,.45); /* 0 1px 2px */

    /* The first declaration is for browsers that do not support linear gradients.
       The second declaration is because WebKit based browsers haven't unprefixed it yet.
       If you want to support legacy browsers, try http://www.colorzilla.com/gradient-editor/ */
    background : #F0F0F0;
    background : -webkit-linear-gradient(90deg, #E3E3E3, #fcfcfc 50%, #f0f0f0);
    background : linear-gradient(0deg, #E3E3E3, #fcfcfc 50%, #f0f0f0);
  }
  .select .active,
  .select:focus {
    outline: none;

    /* This box-shadow property is not exactly required, however it's so important to be sure
       the active state is visible that we use it as a default value, feel free to override it. */
    box-shadow: 0 0 3px 1px #227755;
  }
  /* The .select selector here is syntactic sugar to be sure the classes we define are
   the ones inside our widget. */
  .select .optList {
     z-index : 2; /* We explicitly said the list of options will always overlap the down arrow */

    /* this will reset the default style of the ul element */
    list-style: none;
    margin : 0;
    padding: 0;

    -moz-box-sizing : border-box;
    box-sizing : border-box;

    /* This will ensure that even if the values are smaller than the widget,
       the list of options will be as large as the widget itself */
    min-width : 100%;

    /* In case the list is too long, its content will overflow vertically 
       (which will add a vertical scrollbar automatically) but never horizontally 
       (because we haven't set a width, the list will adjust its width automatically. 
       If it can't, the content will be truncated) */
    max-height: 10em; /* 100px */
    overflow-y: auto;
    overflow-x: hidden;

    border: .2em solid #000; /* 2px */
    border-top-width : .1em; /* 1px */
    border-radius: 0 0 .4em .4em; /* 0 0 4px 4px */

    box-shadow: 0 .2em .4em rgba(0,0,0,.4); /* 0 2px 4px */
    background: #f0f0f0;
  }
  .select .optList.hidden {
    /* This is a simple way to hide the list in an accessible way, 
       we will talk more about accessibility in the end */
    max-height: 0;
    visibility: hidden;
    }
    .select .value {
    /* Because the value can be wider than our widget, we have to make sure it will not
       change the widget's width */
    display  : inline-block;
    width    : 100%;
    overflow : hidden;

    vertical-align: top;

    /* And if the content overflows, it's better to have a nice ellipsis. */
    white-space  : nowrap;
    text-overflow: ellipsis;
  }
  .select:after {
    content : "▼"; /* We use the unicode character U+25BC; see http://www.utf8-chartable.de */
    position: absolute;
    z-index : 1; /* This will be important to keep the arrow from overlapping the list of options */
    top     : 0;
    right   : 0;

    -moz-box-sizing : border-box;
    box-sizing : border-box;

    height  : 100%;
    width   : 2em;  /* 20px */
    padding-top : .1em; /* 1px */

    border-left  : .2em solid #000; /* 2px */
    border-radius: 0 .1em .1em 0;  /* 0 1px 1px 0 */

    background-color : #000;
    color : #FFF;
    text-align : center;
  }
  .select .option {
    padding: .2em .3em; /* 2px 3px */
  }

  .select .highlight {
    background: #000;
    color: #FFFFFF;
  }`;
  
  var gaugeHtml = `<div class="select" tabindex="0">
  
  <!-- This container will be used to display the current value of the widget -->
  <span class="value">Cherry</span>
  
  <!-- This container will contain all the options available for our widget.
       Because it's a list, it makes sense to use the ul element. -->
  <ul class="optList">
    <!-- Each option only contains the value to be displayed, we'll see later
         how to handle the real value that will be sent with the form data -->
    <li class="option">Cherry</li>
    <li class="option">Lemon</li>
    <li class="option">Banana</li>
    <li class="option">Strawberry</li>
    <li class="option">Apple</li>
  </ul>

</div>`;
  
  return `<style>${gaugeCss}</style>${gaugeHtml}`;
}

// Metoda do drukowania elementu na widgetcie 3dImage jest bardzo uniwersalna i w zasadzie wystarczy wrzuci w ni gotowy content i referencje do naszego 3dImage:
$scope.printOn3dImage = () => {
  var myContentToPrint = $scope.gaugeConfig();
  
  // polega na utworzeniu virtualnego canvasu 2d, którego nigdzie nie wywietlamy
  var canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  var ctx = canvas.getContext('2d');
  var width = 400;
  var height = 400;
  var x = 0;
  var y = 0;
  //sformatowaniu svg, z wczeniej przygotowanego htmla i cssa
  var xmlSrc = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' + '<foreignObject width="100%" height="100%">' + $scope.html_to_xml(myContentToPrint) + '</foreignObject>' + '</svg>';
  
  // Duo eksperymentowaem z kodowaniem, nie umiem wyjani czemu ale to byo jedyne, które zadziaao prawidowo z HOLO:
  var data = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xmlSrc);
  var img = document.createElement('img');
  img.onload = function () {
    ctx.drawImage(img, x, y);
    var new_image_url = canvas.toDataURL("image/png;base64");
    
    // Tutaj podajemy nazw naszego 3dImage
    tml3dRenderer.setTexture("gauge3dImage", new_image_url);
  }
  
  img.src = data;
}


// Metodka pomocnicza do serializacji htm
$scope.html_to_xml = function (html) {
var doc = document.implementation.createHTMLDocument('');
doc.write(html);
doc.documentElement.setAttribute('xmlns', doc.documentElement.
namespaceURI);
html = new XMLSerializer().serializeToString(doc.body);
return html;
}

    }($scope, $element, $attrs, $timeout))

  });

  

  var moduleDependencies = ['ionic', 'ngCordova', 'vuforia-angular', 'com.thingworx.services', 'twxRuntime'];
  var app = angular.module('app', moduleDependencies);
    twx = twx || {};
    twx.appXXX = app;

  app.config(function(DataConnectorConfigProvider, $ionicConfigProvider) {
    //Configured TWX server
    app.twxRoot = "/Thingworx";

    // Get this from application config later
    DataConnectorConfigProvider.addDataProvider({
        name: 'ThingworxConnector',
        urlRoot: app.twxRoot
    });

    $ionicConfigProvider.views.swipeBackEnabled(false);
  });

  // filter to allow remote resources (images, models, etc.) to be loaded
  app.filter('trustUrl', function($sce) {
      return function(url) {
          return $sce.trustAsResourceUrl(url);
      };
  });

  app.controller('AppCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $location, $http, $injector, $templateCache) {
      var appScope = this;
      twx.appScope = this;
      var locationParams = {};
      // replace any occurrences of unreplaced URL params (i.e. {{foo:bar}}) with an empty string - DT-18867
      for(var entry of (new URLSearchParams(location.search.replace(/{{[a-zA-Z]*:[a-zA-Z]*}}/g, ''))).entries()) {
        locationParams[entry[0]] = entry[1];
      }
      twx.app.params = angular.extend(twx.app.params, $stateParams, locationParams);
      $scope.app.params = angular.extend({}, twx.app.params);
      appScope.params = twx.app.params;
      appScope.fn = twx.app.fn;
      appScope.mdl = twx.app.mdl;
      appScope.evt = twx.app.evt;

      twx.device.mdl['CurrentDevice'] = {
            svc: {
              'getCameraPictureURL': {}
            }
          };

      appScope.camera = {};
      appScope.camera.lastPictureData = "";
      appScope.camera.getPictureData = function(){
        var options = {
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA
        };
        var $cordovaCamera = $injector.get('$cordovaCamera');
        $cordovaCamera.getPicture(options).then(function (imageData) {
          appScope.camera.lastPictureData = imageData;
        }, function (err) {
          console.error('Error getting camera.', err);
        });
      };

      appScope.camera.getPictureURL = function(){
        var options = {
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA
        };
        var $cordovaCamera = $injector.get('$cordovaCamera');
        $cordovaCamera.getPicture(options).then(function (imageURI) {
          appScope.camera.lastPictureURL = imageURI;
          twx.device.mdl['CurrentDevice'].svc['getCameraPictureURL'].data = imageURI;
        }, function (err) {
          console.error('Error getting camera picture.', err);
        });
      };

      $scope.$on('device.mdl.CurrentDevice.svc.getCameraPictureURL', function () {
            appScope.camera.getPictureURL();
        });

      $scope.$on('app-fn-navigate',function(e,data) {
        twx.app.fn.navigate(data['viewname']);
      });

      if($rootScope.enableVoiceCommands && twx.app.isPreview()) {
        $rootScope.$on('$ionicView.afterEnter', function(event, toState, toParams, fromState, fromParams) {
          // get the app events each time the view changes to ensure we're displaying the "triggerable" app events for the current view
          $scope.appEvents = twx.app.getAppEventsWithHandlers();
        });
       }

      $scope.showModal = function(view){

        var modalContents = '';
        var modalUrl = 'app/components/' + view + '.html';
        $http.get(modalUrl).then(function(response) {
          modalContents = response.data;
          var modalTransformedContents = modalContents.replace('ion-view','ion-modal-view');
          $scope.modal = $ionicModal.fromTemplate(modalTransformedContents, {
            scope: $scope,
            animation: 'slide-in-up'
          });
          $scope.modal.show();
          $scope.$broadcast('show-modal');
        });

      };

      $scope.hideModal = function(){
        $scope.modal.hide();
        $scope.modal.remove();
      };

      $scope.$on('app-fn-show-modal',function(e,data) {
        // DT-18461 modalIsActive helps us to add particular listener in twxWidget controller (in runtime)
        $scope.modalIsActive = true;
        $scope.showModal(data['viewname']);
      });

      $scope.$on('app-fn-hide-modal',function(e,data) {
        delete $scope.modalIsActive;
        $scope.hideModal();
      });

      appScope.acceleration = {};
      appScope.location = {};
      appScope.location.getCurrentLocation = function(){
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        var $cordovaGeolocation = $injector.get('$cordovaGeolocation');
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
            appScope.location.lastLocation = { latitude: lat, longitude: long };
          }, function(err) {
            console.error("Error getting current position", err);
          });
      };
      appScope.location.lastLocation = {
        latitude: 40.056545,
        longitude: -99.672037
      };

      if($rootScope.enableVoiceCommands) {
        // add the speech service to the app scope when there are voice alias'd app events
        appScope.speech = $injector.get('appSpeechService');
        if(twx.app.isPreview()) {
            // in preview for eyewear projects, we'll wrap the calls to app.speech.synthesizeSpeech so we can display the text in the snackbar
            appScope.speech.synthesizeSpeech = _.wrap(appScope.speech.synthesizeSpeech, function(func, info) {
              twx.app.fn.addSnackbarMessage(info.text, 'voice-response');
              return func(info);
            });
        }
      }

      twx.device.camera = appScope.camera;
      twx.device.location = appScope.location;
      twx.device.acceleration = appScope.acceleration;
      appScope.listCanSwipe = true;
    });

  app.controller('AppsMenuCtrl', function ($scope, $timeout, $http, $ionicSideMenuDelegate, $location, $ionicHistory) {
      $scope.isCordovaApp = window.cordova === undefined ? false : true;
      if( !($scope.isCordovaApp) ) {
        $scope.hasBackView = function () {
           return ($ionicHistory.backView() != null);
        };
      }
      else {
        //DT-12925: Disable swipe gesture to show the menu when the spatial target is in view
        $scope.$on('$ionicView.afterEnter', function() {
          $timeout(function() {
            $ionicSideMenuDelegate.canDragContent(document.querySelectorAll('[original-widget="twx-dt-target-spatial"]').length === 0);
          }, 10); //Just after other listeners still removing the old view widgets
        });
      }

      $scope.toggleLeftMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
      };

      $scope.navigateFromLeftMenu = function (path) {
        $location.path(path);
        $ionicSideMenuDelegate.toggleLeft();
      };

      $scope.$watch(function(){
          return $ionicSideMenuDelegate.getOpenRatio();
      }, function(newValue, oldValue) {
          $scope.hideLeftMenu = !$ionicSideMenuDelegate.isOpenLeft();
      });
    });

  app.controller('BaseCtrl', function ($scope, $parse, $location, $state, $ionicPopup, $timeout, $injector) {
    $scope['twInvokeAction'] = function(name){
      if (this['twActions'] && this['twActions'][name]){
        var action = this['twActions'][name];
        var fn = $parse(action.do, /* interceptorFn */ null, /* expensiveChecks */ true);
        fn(action.scope);
      } else {
        console.log('Action "' + name + '" not found');
      }
    };

    $scope._setCurrentAndNavigate = function(items, item, target){
      items.Current = item;
      $scope.navigate(target);
    };

    $scope.showConfirmPopup = function (title, subtitle, confirmEventId, confirmView) {
      var confirmPopup = $ionicPopup.confirm({
        title: title,
        template: subtitle
      });
      confirmPopup.then(function (res) {
        if (res) {
          $scope.$emit(confirmEventId);
          if (confirmView !== '') {
            $scope.navigateOnTimeout(confirmView);
          }
        }
      });
    };

    $scope.navigateOnTimeout = function(target){
      $timeout(function () {
        $scope.navigate(target);
      }, 300);
    };

    $scope.$on('$stateChangeStart',function() {
      try {
        var vuforiaCleanup = $injector.get('vuforiaCleanup');
        if (vuforiaCleanup) {
          vuforiaCleanup.requestCleanupAndPause();
        }
      } catch(e) {console.log(e);}
    });

    $scope.navigate = function(target){
      $state.go(target);
    };
  });

}(window, document, angular));

/**
 * Adds a description meta tag for each supported language.  If the meta tag already exists, it will update the contents.
 */
function appendDescriptionMetaData(descriptionObj) {
  descriptionObj = descriptionObj || {};
  var head = document.querySelector('head');

  // append a 'description' meta tag for each supported language
  Object.keys(descriptionObj).forEach(function(lang) {
    var meta = document.querySelector('meta[name="description"][lang="' + lang + '"]');
    if(!meta) {
      meta = document.createElement('meta');
      meta.name = "description";
      meta.lang = lang;
      meta.content = descriptionObj[lang];

      // add the meta tag to the document's head element
      head.appendChild(meta);
    } else {
      // update the meta tag value
      meta.content = descriptionObj[lang];
    }
  });
};

/**
 *  initialize the mobile app/experience title and populate the params in the window.twx.app.params object.
 */
function updateTitleWithExpTitle() {
  var defaultParams = {"vumark":{"id":"vumark","isbound":"false","isdeletable":"false","name":"ThingMark","value":""},"template":{"id":"template","isbound":"false","isdeletable":"false","name":"Thing Template","value":""},"thing":{"id":"thing","isbound":"false","isdeletable":"false","name":"Thing","value":""}};

  Object.keys(defaultParams).forEach(function(key) {
    if (defaultParams[key].value) {
      window.twx.app.params[key] = defaultParams[key].value;
    }
  });

  // get the index of the experience being loaded, default to the first view if the 'expIndex' is not passed on the URL

  var urlParams = new URLSearchParams(location.search);
  var title = '';
  var descriptionObj = {};
  if (urlParams.has('expIndex')) {
    //Old bookmarks will come through here, may not be correct if experiences have been redone in a different order
    var expIdx = parseInt(twx.app.fn.getParameterByName('expIndex', location.href) || '0', 10);
    title = experienceInfo.getTitleByIndex(expIdx);
    descriptionObj = experienceInfo.getDescription(expIdx);
  }
  else if (urlParams.has('expId')) {
    //expId could still be old/stale if experiences have been all deleted and redone
    var exp = experienceInfo.findExperienceById(parseFloat(urlParams.get('expId')));
    title = experienceInfo.getTitle(exp);
    descriptionObj = exp.description;
  }
  else {
    title = experienceInfo.getTitleByIndex(0);
    descriptionObj = experienceInfo.getDescription(0);
    if (!title) {
      title = urlParams.get('project');
    }
  }

  // set the page title as the name of the loaded experience
  document.title = title;

  appendDescriptionMetaData(descriptionObj);
}

var experienceInfo = new twx.app.ExperienceInfo({"name":"","version":"1.0.0","requires":["holographic"],"experiences":[{"vumark":"37047:1","experienceType":"vumark","id":1,"index-keys":["urn:vuforia:vumark:37047:1"],"title":{"en":"List Widget"},"description":{"en":"","en-US":""},"requires":["AR-tracking"],"tags":[],"icon":"","viewName":"Home","url-template":"index.html?expId=1&vumark={{vuforia:vumark}}","entryPoint":"index.html?expId=1","thumbnail":""}],"accessType":"private","designedfor":[]});
