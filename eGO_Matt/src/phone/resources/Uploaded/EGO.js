// ################################################################################ GLOBAL OBJECTS
(function(window) {
  var EGO = {

    CONST: {
      CATEGORIES_OBJ: {
        "Funktion":{
          "id": "CAT0",
          "list": [{"Static markers" : ["A","C","D","E","F"]}, {"leichtgängig" : ["E","D"]}, {"rastet nicht" : ["A","D"]}]
        },
        "Maßhaltigkeit": {
          "id": "CAT1",
          "list": ["zu lang","zu kurz","zu dick","zu dünn","Querschnitt zu groß","Querschnitt zu klein"]
        },
          "Visuell": {
            "id": "CAT2",
            "list": [{"schwergängig" : ["A","C","B"]},"leichtgängig","rastet nicht","scheuert","öffnet nicht","schließt nicht","arretiert nicht","nicht gegeben","Fehlfunktion"]
        }/*,
          "Geräusch": {
            "id": "CAT3",
            "list": ["schwergängig","leichtgängig","rastet nicht","scheuert","öffnet nicht","schließt nicht","arretiert nicht","nicht gegeben","Fehlfunktion"]
        },
          "Fügen": {
            "id": "CAT4",
            "list": ["schwergängig","leichtgängig","rastet nicht","scheuert","öffnet nicht","schließt nicht","arretiert nicht","nicht gegeben","Fehlfunktion"]
        },
        "Geometrie": {
            "id": "CAT5",
            "list": ["schwergängig","leichtgängig","rastet nicht","scheuert","öffnet nicht","schließt nicht","arretiert nicht","nicht gegeben","Fehlfunktion"]
        },
          "Oberfläche": {
            "id": "CAT6",
            "list": ["schwergängig","leichtgängig","rastet nicht","scheuert","öffnet nicht","schließt nicht","arretiert nicht","nicht gegeben","Fehlfunktion"]
        },
          "Verpackung": {
            "id": "CAT7",
            "list": ["schwergängig","leichtgängig","rastet nicht","scheuert","öffnet nicht","schließt nicht","arretiert nicht","nicht gegeben","Fehlfunktion"]
        },
          "Sonstige": {
            "id": "CAT8",
            "list": ["schwergängig","leichtgängig","rastet nicht","scheuert","öffnet nicht","schließt nicht","arretiert nicht","nicht gegeben","Fehlfunktion"]
        },*/
      },
      
      AVAILABLE_REPORT_METHODS: {
        'A' : 'Static Markers',
        'B' : 'Dynamic pointers',
        'C' : 'Numerical comments',
        'D' : 'Full text comments',
        'E' : 'One car part selection',
        'F' : 'Photo documentation'
      },
      
      staticMarkersIdsList: [],
      modelItemsIdsList: [],
      
      currentPopup: null,
      currentMethodsList: [],
      currentStep: 0,
      currentMethod: '',
      currentQualityGate: null,

      // Dynamic Pointers
      scale: 0.6,

      canvas: null,
      context: null,

      id: 0,
      TrackerId: "tracker1",
      PickColor: "rgba(255, 255, 0, 1)",
      twxDtView: null,

      tracker: null,

      previousModelLoad: null,
      connected: false,
      buttonClicked: false,
    },

    METHODS: {
      initEGO: function(prefix1, lenPrefix1, prefix2, lenPrefix2) {
        try {
          EGO.$scope.categoryButtonClicked = EGO.METHODS.categoryButtonClicked;
          EGO.$scope.typeButtonClicked = EGO.METHODS.typeButtonClicked;
          
          EGO.CONST.staticMarkersIdsList = [];
          EGO.CONST.modelItemsIdsList = [];

          EGO.CONST.canvas = document.createElement('canvas');
          EGO.CONST.canvas.id = 'canvas';
          EGO.CONST.context = EGO.CONST.canvas.getContext('2d');
          EGO.CONST.twxDtView = document.querySelector("twx-dt-view");
          EGO.CONST.tracker = document.querySelector(`twx-dt-tracker[id='${EGO.CONST.TrackerId}']`);
          EGO.CONST.tracker.setAttribute("enabletrackingevents", "true");

          EGO.CONST.staticMarkersIdsList = Array.from(Array(lenPrefix1), (d, i) => `${prefix1}-${i+1}`);
          EGO.CONST.modelItemsIdsList = Array.from(Array(lenPrefix2), (d, i) => `${prefix2}-${i+1}`);
          
          EGO.$scope.$on("userpick", function (e1, e2) {
            let EFSMids = EGO.CONST.staticMarkersIdsList.indexOf(e2);
            let EFMIids = EGO.CONST.modelItemsIdsList.indexOf(e2);
            if(EFSMids > -1 && EGO.CONST.currentMethod == 'A'){      
              EGO.METHODS.staticMarkerController(e2);
            }
            if(EFMIids > -1 && EGO.CONST.currentMethod == 'E') {
              EGO.METHODS.carPartController(e2);
            }
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      categoryPopupController: function() {
        try {
          // console.log(Object.keys(EGO.CONST.CATEGORIES_OBJ));
          EGO.$scope.app.params.currentMethodsList = '';  
          let keys = Object.keys(EGO.CONST.CATEGORIES_OBJ);
          let html = '';
          keys.forEach(elem => {
            //let newId = CATEGORIES_OBJ[elem].id;
            html = html + `<button style="margin:5px;" id="${elem}" name="${elem}" class="button category" twx-native-events="" ng-click="categoryButtonClicked('${elem}')">${elem}</button>`;
          });
          EGO.METHODS.categoryPopup(html);
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
        
      categoryPopup: function(html) {
        try {
          console.log(`input html for categoryPopup: ${html}`);
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
              title: `Select the error category`,
              cssClass: "reportCategoryPopup",
              template: html,
              scope: EGO.$scope,
              buttons: [
                  {
                      text: '<b>CANCEL</b>',
                      type: 'button-positive',
                      onTap: function () {
                        console.log('categoryPopup CANCEL');  
                      }
                  }
              ]
          });
        
          EGO.CONST.currentPopup.then(function(res) {
            console.log('categoryPopup go to next step.');
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
      
      categoryButtonClicked: function(name) {
        try {
          console.log(`Category BTN clicked for: ${name}`);
          let types = EGO.CONST.CATEGORIES_OBJ[name].list;
          console.log({ types: types });
          EGO.CONST.currentPopup.close();
          EGO.METHODS.typesPopupController(types); 
          
          EGO.$scope.app.params.ReportObj = {};
          
          EGO.$scope.app.params.ReportObj.timestamp = Date.now();
          EGO.$scope.app.params.ReportObj.user = EGO.$scope.app.params.loggedUser;
          EGO.$scope.app.params.ReportObj.QualityGate = EGO.$scope.app.params.currentQualityGate;
          EGO.$scope.app.params.ReportObj.carVinNo = EGO.$scope.app.params.currentCarVinNo;
          EGO.$scope.app.params.ReportObj.inspectionArea = EGO.$scope.app.params.selectedCarArea;
          EGO.$scope.app.params.ReportObj.category = name;
          EGO.$scope.app.params.ReportObj.pictures = [];
          EGO.$scope.app.params.ReportObj.textComment = '';
          EGO.$scope.app.params.ReportObj.models = [];
          EGO.$scope.app.params.ReportObj.modelsCount = 0;
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
      
      
      // ################################################################################ STEP: SELECT CATEGORY-TYPE
      
      typesPopupController: function(types) {
        try {
          //console.log(Object.keys(CATEGORIES_OBJ)); 
          console.log(`input types for typesPopupController: ${types}`);  
          //let keys = Object.keys(CATEGORIES_OBJ);
          let html = '';
          types.forEach(elem => {
            let name = Object.keys(elem).filter(function(key) {return elem[key]; })[0]; 
            let methods = elem[name];
              //  console.log(methods);
              // Object.keys(AVAILABLE_REPORT_METHODS).filter(function(key) {return AVAILABLE_REPORT_METHODS[key] === val})[0];
              //console.log(name)
            html = html + `<button style="margin:5px;" id="${name}" name="${name}" class="button category" twx-native-events="" ng-click="typeButtonClicked('${methods}','${name}')">${name}</button>`;
          });
          
          EGO.METHODS.startWatcher();
          EGO.METHODS.typesPopup(html);
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
      
      typesPopup: function(html) {
        try {
          console.log(`input html for typesPopup: ${html}`);
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
                title: `Select the error type`,
                cssClass: "reportCategoryPopup",
                template: html, // `<img src=\"app/resources/Uploaded/glasses1.png" alt=\"Safty Goggles\" class=\"responsive\">,
                scope: EGO.$scope,
                buttons: [
                    {
                        text: '<b>CANCEL</b>',
                        type: 'button-positive',
                        onTap: function () {
                          console.log('gogglesPopup onTap');   
                          
                          
                        }
                    }
                ]
            });
          } catch(e) {
            EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
          }
      },
      
      typeButtonClicked: function(methods, name) {
        try {
          console.log(`methods in type btn clicked: ${methods} and name: ${name}`);
          EGO.CONST.currentStep = 0;
          console.log({ methods: methods });
          EGO.$scope.app.params.currentMethodsList = methods;
          EGO.$scope.app.params.ReportObj.methods = methods;
          EGO.$scope.app.params.ReportObj.type = name;
          //unbindWatcher();
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
      // ################################################################################ REPORTING METHODS CONTROLLER
      unbindWatcher: null,
      
      startWatcher: function() {
        try {
          unbindWatcher = EGO.$scope.$watch('app.params.currentMethodsList', function(val) {
            console.log(`watcher val: ${val}`); 
            let lista = val.split(","); 
            EGO.CONST.currentMethodsList = [];
          
            lista.forEach( elem => {
              console.log(`watcher elem: ${elem}`);
              let key = EGO.CONST.AVAILABLE_REPORT_METHODS[elem];  // Object.keys(AVAILABLE_REPORT_METHODS).filter(function(key) {return AVAILABLE_REPORT_METHODS[key] === elem})[0];  
              console.log(`watcher key: ${key}`);
              if(key != (null || undefined)){ 
                EGO.CONST.currentMethodsList.push(elem);  
              }
            });
            if(EGO.CONST.currentMethodsList.length > 0){
              EGO.METHODS.reportingMethod(EGO.CONST.currentMethodsList, EGO.CONST.currentStep);
            }
          // unbindWatcher();
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
  
      reportingMethod: function(methodsList, index) {
        try {
          console.log(`current methods list ${methodsList} and index ${index}`);
            if (index < methodsList.length){
              if(methodsList[index] == 'A') {
                EGO.CONST.currentPopup.close();
                EGO.METHODS.turnOnStaticMarkers();
                EGO.$scope.view.wdg['operatorInfoLabel'].text = "Please select the appropriate static marker";  
                EGO.$scope.view.wdg['operatorInfoLabel'].visible = true;  
              }
          
              if(methodsList[index] == 'B') {  
                EGO.CONST.currentPopup.close();    
                console.log('NOW WE SHOUD START DYNAMIC POINTERS METHOD');  
                EGO.$scope.view.wdg['operatorInfoLabel'].text = "Please set the marker in appropriate position";
                EGO.$scope.view.wdg['operatorInfoLabel'].visible = true;
                EGO.METHODS.turnOffStaticMarkers();
                EGO.METHODS.DynamicPointerPopup(EGO.$scope.app.params.ReportObj.areaName);
              }
          
              if(methodsList[index] == 'C') {
                EGO.CONST.currentPopup.close();   
                console.log('NOW WE SHOUD START NUMERICAL COMMENT METHOD');
                //console.log(`leci numerical popup na podstawie: ${$scope.app.params.ReportObj.areaName}`)
                EGO.METHODS.NumericalPopup(EGO.$scope.app.params.ReportObj.areaName);
              }
              
              if(methodsList[index] == 'D') {
                EGO.CONST.currentPopup.close();   
                console.log('NOW WE SHOUD START Full text comments METHOD');
                EGO.METHODS.FullTextPopup(EGO.$scope.app.params.ReportObj.areaName);
              }
          
              if(methodsList[index] == 'E') {
                EGO.CONST.currentPopup.close();   
                console.log('NOW WE SHOUD START One car part selection METHOD');
                EGO.CONST.modelItemsIdsList.forEach(elem => {
                  EGO.$scope.view.wdg[elem].color = 'rgba(0,255,0,0.2)';
                  
                  EGO.$scope.$applyAsync();
                });
                EGO.$scope.view.wdg['operatorInfoLabel'].text = "Please select one of the higlighted car parts";  
                EGO.$scope.view.wdg['operatorInfoLabel'].visible = true; 
              }
          
              if(methodsList[index] == 'F') {   
                EGO.CONST.currentPopup.close();   
                console.log('NOW WE SHOUD START Photo documentation METHOD');
                EGO.$scope.view.wdg['operatorInfoLabel'].text = "Please take the first photo";  
                EGO.$scope.view.wdg['operatorInfoLabel'].visible = true;
                EGO.METHODS.PhotoPopup(EGO.$scope.app.params.ReportObj.areaName);
              }
    
              EGO.CONST.currentMethod = methodsList[index];
              EGO.CONST.currentStep++;
            } else {
              console.log(`The end of single report process so adding report:`);
              console.log({ ReportObj: EGO.$scope.app.params.ReportObj });
              console.log({ FullReportList: EGO.$scope.app.params.FullReportList} );
              EGO.$scope.app.params.FullReportList.push(EGO.$scope.app.params.ReportObj);
              //EGO.$scope.app.params.ReportObj = {};
              //console.log(EGO.$scope.app.params.FullReportList);
              
              unbindWatcher();
          }
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
      
      staticMarkerController: function(SMid) {
        try {
          EGO.$scope.view.wdg[SMid].src = `app/resources/Uploaded/gap_shader_static_blue_001.png`;
          EGO.METHODS.staticMarkerPopup(SMid);
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      turnOnStaticMarkers: function() {
        EGO.CONST.staticMarkersIdsList.forEach(elem => {   
          EGO.$scope.view.wdg[elem].visible = true;     
        }); 
      },

      turnOffStaticMarkers: function() {
        EGO.CONST.staticMarkersIdsList.forEach(elem => {   
          EGO.$scope.view.wdg[elem].visible = false;     
        }); 
      },
      
      staticMarkerPopup: function(areaName) {
        try {
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
            title: `CONFIRM YOUR CHOICE`,
            cssClass: "SMPopup",
            template:  `<p><b>Selected area: ${areaName}</b></p>`, // `<img src=\"app/resources/Uploaded/glasses1.png" alt=\"Safty Goggles\" class=\"responsive\">,
            scope: EGO.$scope,
            buttons: [
              {
                text: '<b>CANCEL</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('staticMarkerPopup CANCEL');   
                  EGO.$scope.view.wdg[areaName].src = `app/resources/Uploaded/gap_shader_static_green_001.png`;
                }
              },
              {
                text: '<b>NEXT STEP</b>',
                type: 'button-positive',
                  onTap: function () {
                  console.log('staticMarkerPopup next step');   
                  EGO.$scope.view.wdg[areaName].src = `app/resources/Uploaded/gap_shader_static_red_001.png`;
                  EGO.$scope.app.params.ReportObj.areaName = areaName;

                  EGO.METHODS.turnOffStaticMarkers();
                  EGO.$scope.view.wdg['operatorInfoLabel'].visible = false;
                  EGO.METHODS.reportingMethod(EGO.CONST.currentMethodsList, EGO.CONST.currentStep);
                }
              }
            ]
          });
        
          EGO.CONST.currentPopup.then(function(res) {
            console.log('Close staticMarkerPopup');         
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      carPartController: function(MIid) {
        try {
          EGO.$scope.view.wdg[MIid].color = 'rgba(255,0,255,1)';
          EGO.METHODS.carPartPopup(MIid);
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
     
      carPartPopup: function(areaName) {
        try {
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
            title: `CONFIRM YOUR CHOICE`,
            cssClass: "SMPopup",
            template:  `<p><b>Selected car part: ${areaName}</b></p>`, 
            scope: EGO.$scope,
            buttons: [
              {
                text: '<b>CANCEL</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('carPartPopup CANCEL');   
                  EGO.CONST.modelItemsIdsList.forEach(elem => {      
                    EGO.$scope.view.wdg[elem].color = 'rgba(255,255,255,1)';  
                  });
                }
              },
              {
                text: '<b>NEXT STEP</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('carPartPopup next step');   
                  EGO.$scope.app.params.ReportObj.areaName = areaName;
                  EGO.METHODS.turnOffStaticMarkers();
                    
                  EGO.CONST.modelItemsIdsList.forEach(elem => {      
                    EGO.$scope.view.wdg[elem].color = 'rgba(255,255,255,1)'; 
                  });
                  EGO.$scope.view.wdg['operatorInfoLabel'].visible = false; 
                    
                  EGO.METHODS.reportingMethod(EGO.CONST.currentMethodsList, EGO.CONST.currentStep);
                }
              }
            ]
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
     },

      NumericalPopup: function(areaName) {
        try {
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          let localAreaName = areaName;
          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
            title: `Apply distance for ${localAreaName}`,
            cssClass: "SMPopup",
            template:  `<p><b>Enter distance:</b></p><p><input type="text" pattern="[0-9]*" name="${localAreaName}" id="${localAreaName}" ng-model="EGO.$scope.data.numValueComment""/> mm </p>`, // ng-change="inputValueChange(data.customeDiscount)
            scope: EGO.$scope,
            buttons: [
              {
                text: '<b>CANCEL</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('skip numerical popup');
                }
              },
              {
                text: '<b>NEXT STEP</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('NumericalPopup next step');
                  EGO.$scope.app.params.ReportObj.numValueComment = EGO.$scope.data.numValueComment;
                  EGO.METHODS.reportingMethod(EGO.CONST.currentMethodsList, EGO.CONST.currentStep);
                }
              }
            ]
          });
        
          EGO.CONST.currentPopup.then(function(res) {
            console.log('Close NumericalPopup');
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      FullTextPopup: function(areaName) {
        try {
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          let localAreaName = areaName;
          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
              title: `Apply comment for ${localAreaName}`,
              cssClass: "SMPopup",
              template: `<p><b>Enter comment:</b></p><p><textarea name="${localAreaName}" id="${localAreaName}" ng-model="EGO.$scope.data.textComment""/> </p>`, 
              scope: EGO.$scope,
              buttons: [
                {
                  text: '<b>CANCEL</b>',
                  type: 'button-positive',
                  onTap: function () {
                    console.log('skip full text popup');   
                  }
                },
                {
                  text: '<b>NEXT STEP</b>',
                  type: 'button-positive',
                  onTap: function () {
                    console.log('FullTextPopup next step');                     
                    EGO.$scope.app.params.ReportObj.textComment = EGO.$scope.data.textComment;
                    EGO.METHODS.reportingMethod(EGO.CONST.currentMethodsList, EGO.CONST.currentStep);
                  }
                }
              ]
          });
        
          EGO.CONST.currentPopup.then(function(res) {
            console.log('Close FullTextPopup');
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      // Photo capturing Methods
      PhotoPopup: function(areaName) {
        try {
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          let localAreaName = areaName;

          let template = '';
          EGO.$scope.app.params.ReportObj.pictures.forEach(elem => {
            template += `<img src="${elem}" width="15%" height="15%" style="margin-right: 3px"/>`;
          });

          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
            title: `Take picture for ${localAreaName}`,
            cssClass: "SMPopup",
            template:  template,
            scope: EGO.$scope,
            buttons: [
              {
                text: '<b>CANCEL</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('skip photo popup');
                  EGO.$scope.app.params.ReportObj.pictures = [];
                }
              },
              {
                text: '<b>TAKE PHOTO</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('PhotoPopup takePhoto clicked');
                  EGO.METHODS.takePhoto();
                }
              },
              {
                text: '<b>NEXT STEP</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('PhotoPopup next step');
                  EGO.$scope.app.params.ReportObj.pictures = [];
                  EGO.METHODS.reportingMethod(EGO.CONST.currentMethodsList, EGO.CONST.currentStep);
                }
              }
            ]
          });
          
          EGO.CONST.currentPopup.then(function(res) {
            console.log('Close PhotoPopup');
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      takePhoto: function() {
        try {
          Webcam.set({
            width: window.screen.width,
            height: window.screen.height,
            image_format: 'jpeg',
            jpeg_quality: 80
          });
      
          Webcam.attach('#my_camera');
      
          Webcam.snap( function(data_uri) {
            EGO.$scope.app.params.ReportObj.pictures.push(data_uri);

            console.log(EGO.$scope.app.params.ReportObj);
            
            EGO.METHODS.PhotoPopup(areaName);
            Webcam.reset();
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },
      // ========================
      
      // Dynamic pointers Methods
      DynamicPointerPopup: function(areaName) {
        try {
          EGO.$scope.data = {};
          EGO.CONST.currentPopup = null;
          let localAreaName = areaName;

          EGO.CONST.currentPopup = EGO.$ionicPopup.show({
            title: `Place markers for ${localAreaName}`,
            cssClass: "SMPopup",
            template:  '',
            scope: EGO.$scope,
            buttons: [
              {
                text: '<b>CANCEL</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('skip dynamic pointer popup');
                  EGO.$scope.app.params.ReportObj.pictures = [];
                }
              },
              {
                text: '<b>ADD MARKERS</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('DynamicPointerPopup add marker clicked');
                  EGO.METHODS.turnOnAddPointerWidgets();
                  EGO.$scope.view.wdg['reportADefectButton'].visible = false;
                  EGO.METHODS.buttonClicked();
                }
              },
              {
                text: '<b>NEXT STEP</b>',
                type: 'button-positive',
                onTap: function () {
                  console.log('PhotoPopup next step');
                  EGO.$scope.app.params.ReportObj.pictures = [];
                  EGO.METHODS.reportingMethod(EGO.CONST.currentMethodsList, EGO.CONST.currentStep);
                }
              }
            ]
          });
          
          EGO.CONST.currentPopup.then(function(res) {
            console.log('Close PhotoPopup');
          });
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      turnOnAddPointerWidgets: function() {
        try {
          EGO.$scope.view.wdg['gaze3D'].visible = true;
          EGO.$scope.view.wdg['placeMarker'].visible = true;
          EGO.$scope.view.wdg['plusGaze'].visible = true;
          EGO.$scope.view.wdg['minusGaze'].visible = true;
          EGO.$scope.view.wdg['stopPlacingMarkers'].visible = true;
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      turnOffAddPointerWidgets: function() {
        try {
          EGO.$scope.view.wdg['gaze3D'].visible = false;
          EGO.$scope.view.wdg['placeMarker'].visible = false;
          EGO.$scope.view.wdg['plusGaze'].visible = false;
          EGO.$scope.view.wdg['minusGaze'].visible = false;
          EGO.$scope.view.wdg['stopPlacingMarkers'].visible = false;
        } catch(e) {
          EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
        }
      },

      addLocalModel: function() {
        EGO.CONST.id = EGO.CONST.id + 1;
      
        return EGO.METHODS._addModel(EGO.CONST.id, EGO.METHODS.makeModelUrl('znacznik.pvz'), false, false);
      },
      
      _addModel: function(id, modelUrl, fromRemote, synchronized) {
        // Adding a fake twx-widget so that click handling code works properly.
        let modelElement = document.createElement("twx-widget");
        modelElement.setAttribute("widget-id", id);
        modelElement.setAttribute("widget-name", id);
        modelElement.setAttribute("original-widget", "twx-dt-model");
        EGO.CONST.tracker.appendChild(modelElement);
      
        let model = EGO.$scope.app.params.ReportObj.models[id] = new Model(id, modelElement, modelUrl, EGO.tml3dRenderer);
        console.log(EGO.$scope.app.params.ReportObj.models[id]);
        if (typeof synchronized === "boolean") {
          model.synchronized = synchronized;
        }
      
        if (!fromRemote && !this.synchronized) {
          model.sendModelCreatedUpdate();
        }
      
        let promise = new Promise((resolve, reject) => {
          let doAdd = () => {
            try {
              console.log(EGO.tml3dRenderer);
              return EGO.tml3dRenderer.addPVS(EGO.CONST.TrackerId, String(id), modelUrl, false, "", handleAdded, handleFailed);
            } catch(exc) {
              console.log(exc);
            }
          };
      
          let handleAdded = () => {
            if (EGO.CONST.previousModelLoad === promise) {
              EGO.CONST.previousModelLoad = null;
            }
      
            EGO.METHODS.startBatch();
            model.setScaleInternal(...model.transform.scale);
            model.setTranslationInternal(EGO.$scope.view.wdg['gaze3D'].x, EGO.$scope.view.wdg['gaze3D'].y, EGO.$scope.view.wdg['gaze3D'].z);
            model.setRotationInternal(EGO.$scope.view.wdg['gaze3D'].rx, EGO.$scope.view.wdg['gaze3D'].ry, EGO.$scope.view.wdg['gaze3D'].rz);
            EGO.METHODS.executeBatch();
      
            EGO.$scope.app.params.ReportObj.modelsCount++;
      
            EGO.CONST.scale = 0.6;
            resolve(model);
          };
      
          let handleFailed = (e) => {
            if (EGO.CONST.previousModelLoad === promise) {
              EGO.CONST.previousModelLoad = null;
            }

            console.log(e);
      
            EGO.CONST.scale = 0.6;
            reject(e);
          };
      
          if (EGO.CONST.previousModelLoad) {
            EGO.CONST.previousModelLoad.then(doAdd, doAdd);
          } else {
            doAdd();
          }
        });
      
        EGO.CONST.previousModelLoad = promise;
        return promise;
      },
      
      tryApply: function () {
        if (!EGO.$scope.$$phase) {
          EGO.$scope.$apply();
        }
      },
      
      makeModelUrl: function(name) {
        name = encodeURIComponent(name);
        return `app/resources/Uploaded/${name}`;
      },
      
      startBatch: function() {
        // startBatch and executeBatch are not available in preview.
        if (EGO.tml3dRenderer.startBatch) {
          EGO.tml3dRenderer.startBatch();
        }
      },

      executeBatch: function() {
        if (EGO.tml3dRenderer.executeBatch) {
          EGO.tml3dRenderer.executeBatch();
        }
      },

      // ==================================== CONTROLLING VIEW ========================================

      buttonClicked: function() {
        EGO.CONST.buttonClicked = !EGO.CONST.buttonClicked;
        EGO.METHODS.buttonClickedFun();
      },
      
      buttonClickedFun: function() {
        try {
          if(EGO.CONST.buttonClicked) {
            EGO.$scope.$root.$on('tracking', EGO.METHODS.setMyEYEtrack);
            console.log('klikniete');
          }else {
            EGO.$scope.$root.$on('tracking', EGO.METHODS.setMyEYEtrack); 
            console.log('odklikniete');
          }
        } catch(e) {
          console.log(e);
        }
      },
      
      getGestureTransformMatrix: function(upParam, gazeParam) {
        let up = new Vector4().Set3(...upParam);
        let forward = new Vector4().Set3(...gazeParam);
        let right = forward.CrossP(up);
        return new Matrix4().Set3V(right, forward, up);
      },
      
      plusGazeFun: function() {
        EGO.CONST.scale += 0.2;
      },
      
      minusGazeFun: function() {
        EGO.CONST.scale -= 0.2;
      },
    
      // ======================================= TRACKING =============================================
      
      setMyEYEtrack: function() {
        if(EGO.tml3dRenderer) {
          try {
            EGO.tml3dRenderer.setupTrackingEventsCommand (function(target, eyepos, eyedir, eyeup) {
              if(EGO.CONST.buttonClicked) {
                EGO.$scope.view.wdg['gaze3D'].x = eyepos[0]+eyedir[0] * EGO.CONST.scale;
                EGO.$scope.view.wdg['gaze3D'].y = eyepos[1]+eyedir[1] * EGO.CONST.scale;
                EGO.$scope.view.wdg['gaze3D'].z = eyepos[2]+eyedir[2] * EGO.CONST.scale;
      
                var rotation = EGO.METHODS.getGestureTransformMatrix(eyeup, eyedir).ToEuler();
                EGO.$scope.view.wdg['gaze3D'].rx = rotation['attitude'] + 90;
                EGO.$scope.view.wdg['gaze3D'].ry = rotation['heading'];
                EGO.$scope.view.wdg['gaze3D'].rz = rotation['bank'];
                EGO.$scope.$applyAsync();
              }
            }, undefined)
          } catch(e) {
            EGO.$scope.view.wdg['debugLog'].text = e.name + ': ' + e.message;
          }
        } else {
          //EGO.tml3dRenderer.setupTrackingEventsCommand (null);
        }
      }
      // ========================
    }
  }

  if (typeof define === 'function' && define.amd) {
    define( function() { return EGO; } );
  } 
  else if (typeof module === 'object' && module.exports) {
    module.exports = EGO;
  } 
  else {
    window.EGO = EGO;
  }
}(window))