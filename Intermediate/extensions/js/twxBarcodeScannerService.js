(function () {
  'use strict';

  const SCAN_HISTORY_ITEM_LIMIT = 15;

  function getViewOverlay () {
    return document.querySelector('.twx-view-overlay');
  }

  function get2dOverlay () {
    return document.querySelector('.twx-2d-overlay');
  }

  function twxBarcodeScannerService($rootScope, $compile, renderer) {
    return {
      restrict: 'A',
      link: function (scope, el) {
        const viewElementsList = Array.from(document.querySelectorAll('ion-view'));
        const viewElements = viewElementsList.filter(view => view.contains(el[0]));
        const viewElementTypeAttribute = viewElements.length > 0 ? viewElements[0].getAttribute('view-type') : '';
        const is2D = viewElementTypeAttribute === 'mobile-2D' || viewElementTypeAttribute === 'hmt-2D';
        let controlPanelScope;
        const containerParentElement = (parent && parent.document) ?
          angular.element(parent.document.getElementById('scan-controls-container')) :
          null;
        let hasHeader;

        // set the 2D project's Scan Widget's height so it won't overlap the 2D widgets
        if (is2D) {
          el[0].parentNode.classList.add('is2DWidgetContent');

          //The view-overlay hides the "camera" bg that the twx-dt-view is adding the screen.
          //The dt-view is needed to show the camera feed through while scanning
          //But after turning off the scan and hiding the dt-view, it still show through.
          //Will need a fix in vuforia-angular or View to get this workaround removed to an api call
          if (getViewOverlay()) {
            //Apply the user custom color to the overlay div
            let origView = el[0].closest('ion-view').querySelector('[original-widget="twx-view"] > twx-widget-content > twx-container-content');
            let computedStyle = window.getComputedStyle(origView);

            //For the theme, its background-color is not being inherited, so look it up.
            if (computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
              computedStyle = window.getComputedStyle(el[0].closest('ion-view'));
            }
            getViewOverlay().style.backgroundColor = computedStyle.backgroundColor;
          }

          // stop the camera for 2D project at start
          if (renderer.pauseAR) {
            renderer.pauseAR();
          }
        }

        /**
         * Opens up the Scan Widget
         * It shows the scanner overlay,
         * hides the 2D widgets and (if the 'Hide AR Augmentations' property is set to true) 3D models/augmentations of 3D/AR project
         * and shows the Studio Preview Scan control panel if in Studio Preview screen.
         */
        scope.startScan = () => {
          const ionContentElement = document.querySelector('ion-content');
          const twx2dOverlay = get2dOverlay();

          scope.me.visible = true;
          hasHeader = ionContentElement ? ionContentElement.classList.contains('has-header') : false;

          // hide the headder of multi-view project preview
          if (hasHeader) {
            ionContentElement.classList.remove('has-header');

            // hide the nav bar element
            document.querySelector('ion-nav-bar').style.display = 'none';
          }

          // hide 2D and 3D/AR widgets/augmentations
          if (is2D) {
            if (renderer.resumeAR) {
              renderer.resumeAR();
            }

            // hide the 2D project white overlay over the device camera image
            getViewOverlay().style.display = 'none';

            // hide the 2D project widgets
            if (!scope.me.hiddenWidgets) {
              const widgetElements = document.querySelector('twx-widget[original-widget="twx-view"]').querySelectorAll('twx-widget:not([original-widget="twx-barcode-scanner"])');

              scope.me.hiddenWidgets = [];

              widgetElements.forEach(function (elem) {
                scope.me.hiddenWidgets.push(elem);
                elem.hidden = true;
              });
            } else {
              scope.me.hiddenWidgets.forEach(function (elem) {
                elem.hidden = true;
              });
            }
          } else {
            // hide 2D layer of 3D/AR View
            if (twx2dOverlay) {
              twx2dOverlay.style.display = 'none';
            }

            //hide augmentations if the 'Hide AR Augmentations' property is enabled
            if (scope.me.isAugmentationsHidden) {
              if (!scope.me.hiddenWidgets) {
                const all3DElements = document.querySelectorAll('[original-widget="twx-dt-view"] twx-widget');

                scope.me.hiddenWidgets = [];

                all3DElements.forEach(function (element) {
                  let originalWidget = element.querySelector(element.getAttribute('original-widget'));
                  let originalWidgetScope = angular.element(originalWidget).scope();

                  if (originalWidgetScope) {
                    originalWidgetScope.me.initVisible = originalWidgetScope.me.visible || true;
                    originalWidgetScope.me.visible = false;
                    scope.me.hiddenWidgets.push(originalWidgetScope);
                  }
                });
              } else {
                scope.me.hiddenWidgets.forEach(function (elem) {
                  elem.me.visible = false;
                });
              }
            }
          }

          if (renderer.scanForNextBarCode) {
            renderer.scanForNextBarCode(scannedValue => {
              scope.me.scannedValue = scannedValue;
              scope.me.visible = false;
              scope.stopScan();
              scope.$emit('valueacquired', scannedValue);
            }, function (e) {
              console.error('scanForNextBarCode error', e);
            });
          }

          scope.$applyAsync();

          // open Studio Preview Scan control panel
          if (controlPanelScope) {
            controlPanelScope.showControls = true;
          }
        };

        /**
         * Closes the Scan Widget
         * It hides the scanner overlay,
         * shows back the 2D widgets and (if the 'Hide AR Augmentations' property is set to true) 3D models/augmentations of 3D/AR project
         * and hides the Studio Preview Scan control panel if in Studio Preview screen.
         */
        scope.stopScan = () => {
          const ionContentElement = document.querySelector('ion-content');
          const twx2dOverlay = get2dOverlay();

          scope.me.visible = false;

          if (renderer.stopBarCodeScanning) {
            renderer.stopBarCodeScanning();
          }

          // show the headder of multi-view project preview
          if (hasHeader) {
            ionContentElement.classList.add('has-header');

            // show the nav bar element
            document.querySelector('ion-nav-bar').style.display = 'inline';
          }

          // show the 3D/AR project 2D widgets overlay
          if (twx2dOverlay) {
            twx2dOverlay.style.display = 'block';
          }

          // show the 2D project white overlay over the device camera image
          if (is2D) {
            getViewOverlay().style.display = 'block';
          }


          if (is2D) {
            // pause AR camera view
            if (renderer.pauseAR) {
              renderer.pauseAR();
            }
          }
          // show the 2D and 3D/AR widgets/augs back
          if (scope.me.hiddenWidgets) {
            scope.me.hiddenWidgets.forEach(function (elem) {
              if (is2D) {
                elem.hidden = false;
              } else {
                elem.me.visible = elem.me.initVisible;
              }
            });
          }

          scope.$emit('usercanceled');

          scope.$applyAsync();

          // hide Studio Preview Scan control panel
          if (controlPanelScope) {
            controlPanelScope.showControls = false;
          }
        };

        scope.$on('serviceInvoke', function (evt, data) {
          if (is2D) {
            return;
          }

          const name = data.serviceName;
          if (scope[name]) {
            scope[name](data.params); // Invoke the method if its found
          }
        });

        /**
         * Setting up the Scanner Control Panel to simulate barcode scan on the Studio Preview page
         */
        // check if it's Studio Preview page
        if (containerParentElement.length < 1) {
          return;
        }

        function updateScanHistory(scannedValue) {
          // remove from list if duplicated
          const existingItemIndex = controlPanelScope.scanHistory.indexOf(scannedValue);
          if (existingItemIndex > -1) {
            controlPanelScope.scanHistory.splice(existingItemIndex, 1);
          }

          controlPanelScope.scanHistory.unshift(scannedValue);
          controlPanelScope.scanHistory = controlPanelScope.scanHistory.slice(0, SCAN_HISTORY_ITEM_LIMIT);

          localStorage.setItem('scanHistory', JSON.stringify(controlPanelScope.scanHistory));
        }
        // create a new scope for Scanner Control Panel
        controlPanelScope = $rootScope.$new();

        controlPanelScope.showControls = false;
        controlPanelScope.scanHistory = JSON.parse(localStorage.getItem('scanHistory')) || [];
        controlPanelScope.submitScan = scannedValue => {
          scope.me.scannedValue = scannedValue;
          scope.$emit('valueacquired', scannedValue);

          updateScanHistory(scannedValue);
          scope.stopScan();
        };
        controlPanelScope.selectHistoryItem = item => {
          controlPanelScope.scanValue = item;
          controlPanelScope.showDropdown = false;
        };

        controlPanelScope.openDropdown = () => {
          controlPanelScope.showDropdown = true;
          controlPanelScope.scanValue = '';
        };

        // use iframe's parent i18next
        const i18n = parent.window.i18next;
        // Scanner Control Panel template
        const controlPanelTemplate = `
          <div class="scan-controls twxTree" ng-class="{'hidden': !showControls}">
            <div class="scan-controls__label header">
              <span>${i18n.t('ves-ar-extension:Scan')}</span>
            </div>

            <div class="twxWidgetPropsSection">
              <div class="twxTreeRow twxTreeSectionHeader scan-controls__label">
                <span>${i18n.t('Properties')}</span>
              </div>
              <form name="scanCtrlForm${controlPanelScope.$id}" class="scan-controls__input padded" autocomplete="off" novalidate>
                <label>${i18n.t('ves-ar-extension:barcode-scanned-value')}</label>
                <div class="twxSelect dropdown-selectsize">
                  <input ng-model="scanValue" name="${scope.me.widgetName}-input" ng-click="openDropdown()" ng-blur="showDropdown = false"
                    required />

                  <div class="scan-controls__input item-list" data-selectable ng-if="showDropdown">
                    <div class="scan-controls__input item" ng-repeat="element in scanHistory | filter:scanValue track by $index"
                      ng-mousedown="selectHistoryItem(element)">
                      {{ element }}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div class="twxWidgetPropsSection">
              <div class="twxTreeRow twxTreeSectionHeader scan-controls__label">
                <span>${i18n.t('Events')}</span>
              </div>
              <div class="scan-controls__button padded" ng-class="{disabled: scanCtrlForm${controlPanelScope.$id}.$invalid}">
               <span class="scan-play"  ng-click="scanCtrlForm${controlPanelScope.$id}.$valid? submitScan(scanValue): null">
                 <span class="iconSmall iconPlay"></span>
                 <button class="twxButton">
                   ${i18n.t('ves-ar-extension:barcode-value-acquired')}
                 </button>
               </span>
              </div>
            </div>
          </div>`;

        // Append the Scanner Control Panel to the Preview DOM
        const controlPanelElement = $compile(controlPanelTemplate)(controlPanelScope);
        containerParentElement.append(controlPanelElement);
      }
    };
  }

  angular.module('ngBarcodeScannerService', ['vuforia-angular'])
    .directive('twxBarcodeScannerService', ['$rootScope', '$compile', 'tml3dRenderer', twxBarcodeScannerService]);
}());
