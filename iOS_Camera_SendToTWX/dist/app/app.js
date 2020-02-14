(function(){
  window.twx = window.twx || {};

  var requires = ["ionic","twx.byoc"];
  var twxViewControllersModule = angular.module('twxViewControllers', requires);
  twxViewControllersModule.run(function($templateCache) {
    //Inject an ng-if for preview cases where the web-assembly module needs time to load & compile async.
    //Delays loading model-items until its ready and the model tags are processed.
    
      var viewHTML =  '<ion-view hasGridEvenRows="true" view-type="ar" twx-view="Home" view-title="Home" ctrl-name="Home_TwxViewController" can-swipe-back="false"><div class="overlay ng-hide" ng-show=""></div><ion-content scroll="false" ><twx-widget widget-id="view-1" original-widget="twx-view" widget-name="view-1"><twx-widget-property name="widgetName" datatype="string" value="view-1"></twx-widget-property><twx-widget-property name="viewtype" datatype="string" value="ar"></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-content><twx-container-content class="{{me.class}}"><twx-widget widget-id="3DContainer-1" original-widget="twx-dt-view" widget-name="3D Container"><twx-widget-service name="unlockCameraAndOrientation"></twx-widget-service><twx-widget-service name="lockCameraAndOrientation"></twx-widget-service><twx-widget-property name="widgetName" datatype="string" value="3D Container"></twx-widget-property><twx-widget-property name="far" datatype="number" value="200"></twx-widget-property><twx-widget-property name="near" datatype="number" value="0.01"></twx-widget-property><twx-widget-property name="dropshadow" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="enabletrackingevents" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="camera" datatype="json" value="{}"></twx-widget-property><twx-widget-property name="persistmap" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="src" datatype="string" value="TW-VuMark.xml"></twx-widget-property><twx-widget-property name="extendedtracking" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-content><twx-dt-view near="0.01" far="200" extendedtracking="true" persistmap="false" dropshadow="{{me.dropshadow}}">\n'+
'     <twx-dt-tracker id="tracker1" enabletrackingevents="false">\n'+
'        <twx-container-content>\n'+
'           <div class="targetGuide" ng-class="targetGuideClass" ng-hide="hideTargetGuide">\n'+
'               <div class="bracket-top-left"></div>\n'+
'               <div class="bracket-top-right"></div>\n'+
'               <div class="bracket-bottom-right"></div>\n'+
'               <div class="bracket-bottom-left"></div>\n'+
'               <div class="targetGuideText hint" ng-hide="hideTargetGuide">{{targetGuideHint}}</div>\n'+
'           </div>\n'+
'        <twx-widget widget-id="model-1" original-widget="twx-dt-model" widget-name="model-1"><twx-widget-service name="stop"></twx-widget-service><twx-widget-service name="rewind"></twx-widget-service><twx-widget-service name="reset"></twx-widget-service><twx-widget-service name="playAll"></twx-widget-service><twx-widget-service name="play"></twx-widget-service><twx-widget-service name="forward"></twx-widget-service><twx-widget-property name="widgetName" datatype="string" value="model-1"></twx-widget-property><twx-widget-property name="sequencePartIds" datatype="string"></twx-widget-property><twx-widget-property name="playing" datatype="boolean"></twx-widget-property><twx-widget-property name="stepDescription" datatype="string"></twx-widget-property><twx-widget-property name="stepName" datatype="string"></twx-widget-property><twx-widget-property name="currentStep" datatype="number"></twx-widget-property><twx-widget-property name="steps" datatype="number"></twx-widget-property><twx-widget-property name="showSequenceInCanvas" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="sequence" datatype="resource_url" value=""></twx-widget-property><twx-widget-property name="sequenceList" datatype="infotable"></twx-widget-property><twx-widget-property name="shader" datatype="string" value=""></twx-widget-property><twx-widget-property name="translucent" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="opacity" datatype="number" value="1"></twx-widget-property><twx-widget-property name="decal" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="occlude" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="forceHidden" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="rz" datatype="number" value="-90.00"></twx-widget-property><twx-widget-property name="ry" datatype="number" value="-90.00"></twx-widget-property><twx-widget-property name="rx" datatype="number" value="0.00"></twx-widget-property><twx-widget-property name="z" datatype="number" value="-0.0000"></twx-widget-property><twx-widget-property name="y" datatype="number" value="0.0957"></twx-widget-property><twx-widget-property name="x" datatype="number" value="0"></twx-widget-property><twx-widget-property name="scale" datatype="string" value="0.0030"></twx-widget-property><twx-widget-property name="src" datatype="resource_url" value="app/resources/Uploaded/BMW_dashboard_300K_tri_recenter.pvz"></twx-widget-property><twx-widget-content><twx-dt-model id="model-1" ng-src="{{me.src | trustUrl}}" src="app/resources/Uploaded/BMW_dashboard_300K_tri_recenter.pvz" sx="{{me.scale.split(&apos; &apos;)[0] || me.scale}}" sy="{{me.scale.split(&apos; &apos;)[1] || me.scale}}" sz="{{me.scale.split(&apos; &apos;)[2] || me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!app.fn.isTrue(me.visible)}}" force-hidden="{{me.forceHidden}}" occlude="{{me.occlude}}" decal="{{me.decal}}" opacity="{{me.opacity}}" phantom="{{!me.translucent}}" shader="{{me.shader}}" sequencelist="{{me.sequenceList}}" sequence="{{me.sequence}}" showsequenceincanvas="{{me.showSequenceInCanvas}}" steps="{{me.steps}}" currentstep="{{me.currentStep}}" stepname="{{me.stepName}}" stepdescription="{{me.stepDescription}}" playing="{{me.playing}}" sequencepartids="{{me.sequencePartIds}}"><twx-container-content></twx-container-content></twx-dt-model></twx-widget-content></twx-widget><twx-widget widget-id="thingMark-1" original-widget="twx-dt-target" widget-name="thingMark-1"><twx-widget-event name="trackinglost" value="trackingLost();"></twx-widget-event><twx-widget-event name="trackingacquired" value="trackingAcquired();\n'+
'initGetUserMedia();"></twx-widget-event><twx-widget-property name="widgetName" datatype="string" value="thingMark-1"></twx-widget-property><twx-widget-property name="decal" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="stationary" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="trackingIndicator" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="istracked" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="placeholder_img" datatype="" value="/extensions/images/placeholder_thingmark.png"></twx-widget-property><twx-widget-property name="rz" datatype="number" value="-0.00"></twx-widget-property><twx-widget-property name="ry" datatype="number" value="0.00"></twx-widget-property><twx-widget-property name="rx" datatype="number" value="-89.99"></twx-widget-property><twx-widget-property name="z" datatype="number" value="0"></twx-widget-property><twx-widget-property name="y" datatype="number" value="0.0000"></twx-widget-property><twx-widget-property name="x" datatype="number" value="0"></twx-widget-property><twx-widget-property name="width" datatype="number" value="0.0254"></twx-widget-property><twx-widget-property name="markerId" datatype="string" value=""></twx-widget-property><twx-widget-content><twx-dt-target id="thingMark-1" src="{{&apos;vuforia-vumark:///vumark?id=&apos; + me.markerId}}" guide-src="app/resources/Default/thing_code_phantom.png" size="{{me.width}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" istracked="{{me.istracked}}" trackingindicator="{{me.trackingIndicator}}" stationary="{{me.stationary}}"><twx-dt-image id="thingMark-1-image" sz="{{me.width*4.51}}" sy="{{me.width*4.51}}" sx="{{me.width*4.51}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!me.trackingIndicator}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}" shader="recogniser;active f {{pulse}}" src="img/recognised.png?name=sampler0 img/recognised2.png?name=sampler1" trackingindicator="{{me.trackingIndicator}}" stationary="{{me.stationary}}"></twx-dt-image></twx-dt-target></twx-widget-content><twx-databind databind-id="db-1566890940952" source-type="data" source-name="vumark" source-item-type="value" source-item-name="vumark" binding-type="custom_field" from-expression="app.params[&apos;vumark&apos;]" to-property="markerId"></twx-databind></twx-widget></twx-container-content>\n'+
'     </twx-dt-tracker>\n'+
'</twx-dt-view></twx-widget-content></twx-widget><twx-widget widget-id="2DOverlay-1" original-widget="twx-overlay" widget-name="2D Overlay"><twx-widget-property name="widgetName" datatype="string" value="2D Overlay"></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-content><div class="twx-2d-overlay {{me.class}}" ng-show="app.fn.isTrue(me.visible)"><twx-container-content><div class="panel undefined top" style=" "></div><div class="panel body undefined"><twx-widget widget-id="panel-2" original-widget="twx-panel" widget-name="Left Panel"><twx-widget-property name="widgetName" datatype="string" value="Left Panel"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="wrap" datatype="string" value="wrap"></twx-widget-property><twx-widget-property name="alignment" datatype="string" value="flex-start"></twx-widget-property><twx-widget-property name="justification" datatype="string" value="center"></twx-widget-property><twx-widget-property name="flexdirection" datatype="string" value="column"></twx-widget-property><twx-widget-property name="padding" datatype="string"></twx-widget-property><twx-widget-property name="height" datatype="string" value=""></twx-widget-property><twx-widget-property name="width" datatype="string" value=""></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-content><div ng-show="app.fn.isTrue(me.visible)" class="twx-panel {{me.class}}" style=""><twx-container-content style="flex-direction:column; justify-content: center; align-items: flex-start; flex-wrap: wrap;"> <twx-widget widget-id="button-1" original-widget="twx-button" widget-name="button-1"><twx-widget-event name="click" value="snapshotView();"></twx-widget-event><twx-widget-property name="widgetName" datatype="string" value="button-1"></twx-widget-property><twx-widget-property name="margin" datatype="string" value=""></twx-widget-property><twx-widget-property name="disabled" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="class" datatype="string" value="fault-menu-button"></twx-widget-property><twx-widget-property name="text" datatype="string" value="Take photo"></twx-widget-property><twx-widget-content><button style="" ng-show="app.fn.isTrue(me.visible)" ng-disabled="app.fn.isTrue(me.disabled)" class="button {{me.class}}" twx-native-events="">{{me.text}}</button></twx-widget-content></twx-widget><twx-widget widget-id="button-2" original-widget="twx-button" widget-name="button-2"><twx-widget-event name="click" value="displayPicture();"></twx-widget-event><twx-widget-property name="widgetName" datatype="string" value="button-2"></twx-widget-property><twx-widget-property name="margin" datatype="string" value=""></twx-widget-property><twx-widget-property name="disabled" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="class" datatype="string" value="fault-menu-button"></twx-widget-property><twx-widget-property name="text" datatype="string" value="Display picture"></twx-widget-property><twx-widget-content><button style="" ng-show="app.fn.isTrue(me.visible)" ng-disabled="app.fn.isTrue(me.disabled)" class="button {{me.class}}" twx-native-events="">{{me.text}}</button></twx-widget-content><twx-eventbind eventbind-id="eb-1570552047619" source-type="widget" source-label="Button" source-name="button-2" source-event="click" handler-type="data" handler-name="ImageThing" handler-service="AddImageService" handler-path="app.mdl.ImageThing.svc.AddImageService"></twx-eventbind></twx-widget></twx-container-content></div></twx-widget-content></twx-widget><div class="panel undefined center" style=" "><twx-widget widget-id="centerPanelGrid" original-widget="twx-gridlayout" widget-name="centerPanelGrid" class="hasEvenlySpacedRows"><twx-widget-property name="widgetName" datatype="string" value="centerPanelGrid"></twx-widget-property><twx-widget-property name="evenlyspacedrows" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="margin" datatype="string" value=""></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-content><div ng-show="app.fn.isTrue(me.visible)" even-rows="true" class="gridLayout {{me.class}}" style="padding:;"><twx-container-content><div class="row undefined" style=""><div class="col undefined" style="flex-direction:column;justify-content: center;align-items: stretch;padding: ;flex-wrap: wrap;"></div></div></twx-container-content></div></twx-widget-content></twx-widget></div><twx-widget widget-id="panel-4" original-widget="twx-panel" widget-name="Right Panel"><twx-widget-property name="widgetName" datatype="string" value="Right Panel"></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="wrap" datatype="string" value="wrap"></twx-widget-property><twx-widget-property name="alignment" datatype="string" value="flex-end"></twx-widget-property><twx-widget-property name="justification" datatype="string" value="center"></twx-widget-property><twx-widget-property name="flexdirection" datatype="string" value="column"></twx-widget-property><twx-widget-property name="padding" datatype="string"></twx-widget-property><twx-widget-property name="height" datatype="string" value=""></twx-widget-property><twx-widget-property name="width" datatype="string" value=""></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-content><div ng-show="app.fn.isTrue(me.visible)" class="twx-panel {{me.class}}" style=""><twx-container-content style="flex-direction:column; justify-content: center; align-items: flex-end; flex-wrap: wrap;"> <twx-widget widget-id="picture" original-widget="twx-image2" widget-name="picture"><twx-widget-property name="widgetName" datatype="string" value="picture"></twx-widget-property><twx-widget-property name="padding" datatype="string" value=""></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="imageAlign" datatype="string" value="flex-start"></twx-widget-property><twx-widget-property name="height" datatype="string" value=""></twx-widget-property><twx-widget-property name="width" datatype="string" value=""></twx-widget-property><twx-widget-property name="backgroundcolor" datatype="string"></twx-widget-property><twx-widget-property name="imgsrc" datatype="resource_url" value=""></twx-widget-property><twx-widget-property name="class" datatype="string"></twx-widget-property><twx-widget-content><div class="imgAlignContainer" style="justify-content: flex-start;"><img class="{{me.class}}" ng-show="app.fn.isTrue(me.visible)" style="background-color: {{me.backgroundcolor}}; width: {{me.width}}; height: {{me.height}};  padding: {{me.padding}}" ng-src="{{me.imgsrc}}" twx-native-events=""></div></twx-widget-content></twx-widget></twx-container-content></div></twx-widget-content></twx-widget></div><div class="panel undefined bottom" style=" "><twx-widget widget-id="debugLog" original-widget="twx-label" widget-name="debugLog"><twx-widget-property name="widgetName" datatype="string" value="debugLog"></twx-widget-property><twx-widget-property name="wrap" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="margin" datatype="string" value=""></twx-widget-property><twx-widget-property name="visible" datatype="boolean" value="true"></twx-widget-property><twx-widget-property name="padding" datatype="string"></twx-widget-property><twx-widget-property name="stateFormat" datatype="string"></twx-widget-property><twx-widget-property name="stateFormatValue" datatype="string" value="text"></twx-widget-property><twx-widget-property name="enableStateFormatting" datatype="boolean" value="false"></twx-widget-property><twx-widget-property name="class" datatype="string" value="simple-label"></twx-widget-property><twx-widget-property name="text" datatype="string" value="Label"></twx-widget-property><twx-widget-content><div ng-show="app.fn.isTrue(me.visible)" class="labelWidget {{me.class}} wrapSettingsClass" style="" twx-native-events="">{{me.text}}</div></twx-widget-content><twx-databind databind-id="db-1570453185128" source-type="data" source-name="debugText" source-item-type="value" source-item-name="debugText" binding-type="custom_field" from-expression="app.params[&apos;debugText&apos;]" to-property="text"></twx-databind></twx-widget></div></twx-container-content></div></twx-widget-content></twx-widget></twx-container-content></twx-widget-content><twx-fragment-parameters></twx-fragment-parameters><twx-view-data></twx-view-data></twx-widget></ion-content></ion-view>\n';
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
  var defaultParams = {"vumark":{"id":"vumark","isbound":"false","isdeletable":"false","name":"ThingMark","value":""},"template":{"id":"template","isbound":"false","isdeletable":"false","name":"Thing Template","value":""},"thing":{"id":"thing","isbound":"false","isdeletable":"false","name":"Thing","value":""},"photo":{"id":"photo","isbound":"false","isdeletable":"true","name":"photo","value":""},"debugText":{"id":"debugText","isbound":"false","isdeletable":"true","name":"debugText","value":""}};

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

var experienceInfo = new twx.app.ExperienceInfo({"name":"","version":"1.0.0","requires":["w320dp"],"experiences":[{"vumark":"37047:3","experienceType":"vumark","id":1,"index-keys":["urn:vuforia:vumark:37047:3"],"title":{"en":"iOS Camera SendToTWX"},"description":{"en":"","en-US":""},"requires":["AR-tracking"],"tags":[],"icon":"","viewName":"Camera","url-template":"index.html?expId=1&vumark={{vuforia:vumark}}","entryPoint":"index.html?expId=1","thumbnail":"public/Uploaded/BMW-320d-M-Sport-package-Portimao-Blue-02.jpg"}],"accessType":"public","designedfor":["offline"]});
