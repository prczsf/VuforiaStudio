/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
var twxAppBuilder = (function() {
  let widgets = {};
  let dataProviders = {};
  let widgetGroups = {};
  let _cacheWidgetsByTag;
  let availableWidgets = [];
  let commonWidgetProperties = [
    {
      name: 'widgetId',
      label: 'Studio ID',
      title: 'Studio ID',
      datatype: 'custom_ui',
      visibleValue: true,
      readonly: true,
      done: '$root.$broadcast("updateWidgetId", ctrl.customWidgetEditorTargetWidgetProperty.valueTemp, ctrl.customWidgetEditorTargetWidgetProperty.value, $root.currentResource.name);' +
      'ctrl.customWidgetEditorTargetWidget.updateWidgetId(ctrl.customWidgetEditorTargetWidgetProperty.valueTemp, ctrl.customWidgetEditorTargetWidgetProperty.value);' +
      '',
      template: function (props, widget) {
        props.widgetId.valueTemp = props.widgetId.value;
        return '<p class="errorText" ng-show="widget.widgetIdErrorMessage">{{widget.widgetIdErrorMessage}}</p>' +
          '<input type="text" ' +
          'ng-model="props.widgetId.valueTemp" ' +
          'required="true" ' +
          'ng-required="true" ' +
          'twx-widget-id ' +
          'ng-model-options="{ updateOn: \'default blur\',  allowInvalid: false}"/>' +
          '';
      }
    },
    {
      name: 'widgetName',
      label: 'Friendly Name',
      datatype: 'string'
    }
  ];

  return {
    /**
     * Returns all the registered widgets
     * @returns {object} The key is the widget id and the value is the widget definition
     */
    widgets: function () {
      return widgets;
    },

    /**
     * Used to register a widget definition (when both arguments are provided) or to retrieve the widget definition (when just the first argument is provided)
     *
     * @param {string} id - the unique id that the widget is registered with
     * @param {function} widgetFn - a function that returns the widget definition
     * @returns {object} Returns the widget widget definition when just the first argument is provided
     */
    widget: function (id, widgetFn) {
      let result;
      let self = this;
      if (typeof id === 'string') {
        if (typeof widgetFn === 'function') {
          // Add a widget.
          widgets[id] = function (project) {
            const widgetDef = widgetFn(project);
            widgetDef.designTemplate = self._getTemplateFunc(widgetDef.designTemplate);
            widgetDef.runtimeTemplate = self._getTemplateFunc(widgetDef.runtimeTemplate);
            return widgetDef;
          };
          availableWidgets = []; // cache is obsolete
          _cacheWidgetsByTag = null; // cache is obsolete
        } else {
          // Fetch an existing widget.
          result = widgets[id];
        }
      }

      return result;
    },

    dataProviders: function () {
      return dataProviders;
    },

    registerDataProvider: function (id) {
      dataProviders[id] = id;
    },

    getDataProvider: function (id) {
      return dataProviders[id];
    },

    /**
     * Adds a group to the cache.
     * @param {string} id - (required) internal id for the group
     * @param {string} translationKey - (optional) translation key so the translated value can be looked up in the client, i.e. "ves-ar-extension:targets"
     */
    registerWidgetGroup: function (id, translationKey) {
      if (!id) {
        throw new Error('A group id is required to register a Widget Group');
      }
      let groupId = id.toLowerCase();
      if (widgetGroups[groupId]) {
        throw new Error('A group is already registered as ' + groupId);
      }
      widgetGroups[groupId] = translationKey || id;
    },

    /**
     * Returns the translation key ("ves-ar-extension:targets") associated to the given widget group.  This is the translation key that was used to register the group.
     * If the group is not found in the cache, undefined is returned
     * @param {string} id - internal id for the group
     * @return {string} the translation key ("ves-ar-extension:targets") for the given widget group
     */
    getWidgetGroupTranslationKey: function (id) {
      return (id) ? widgetGroups[id.toLowerCase()] : undefined;
    },

    /**
     * Returns an array of all available widgets.
     *
     * @returns {Array} of widgets, for example [{id: 'twxButton', name: 'Button'}], this list is used by the Widget Browser.
     */
    availableWidgets: function () {
      if (availableWidgets.length < 1) {
        Object.keys(widgets).forEach(function (widgetKey) {
          var widgetFn = widgets[widgetKey];
          var widget = widgetFn(); // instantiate the widget

          if (!widget.category) {
            widget.category = 'basic-html';
            // This case should be fixed by development.
            console.warn('availableWidgets: widget "' + widget.label + '" is missing its category property.');
          }

          var widgetNameAndId = {
            id: widgetKey,
            label: widget.label,
            name: widget.name || widget.label.replace(/.*:/, ''), // use name if explicit, else significant part of label
            category: widget.category
          };

          availableWidgets.push(widgetNameAndId);
        });
      }

      return availableWidgets;
    },

    /**
     * Overrides the runtime and/or design template for the widget
     * @param {String} id - widget id
     * @param {String} type (runtime/design/both)
     * @param {String} src
     */
    addTemplate: function addTemplate(id, type, src) {
      var oldFunc = widgets[id];
      if (oldFunc) {
        const template = this._twxToNg(src);
        widgets[id] = function () {
          var w = oldFunc();
          if (type === 'both') {
            w['runtimeTemplate'] = w['designTemplate'] = function () {
              return template;
            };
          }
          else {
            w[type + 'Template'] = function () {
              return template;
            };
          }

          return w;
        };
      } else {
        console.warn('addTemplate cannot find widget "' + id + '" for template with content', src);
      }
    },

    /**
     * @param {string} tag a tag name such as 'twx-button'
     * @return {object} a widget definition object
     */
    findWidgetDefByTag: function (tag) {
      if (!_cacheWidgetsByTag) {
        _cacheWidgetsByTag = {};
        Object.values(widgets).forEach(function (widgetFunc) {
          const widget = widgetFunc();
          if (widget.elementTag) {
            _cacheWidgetsByTag[widget.elementTag.toLowerCase()] = widgetFunc;
          }
        });
      }

      let widgetDef;
      const widgetFunc = _cacheWidgetsByTag[tag.toLowerCase()];
      if (widgetFunc) {
        widgetDef = widgetFunc();
        this.addCommonProperties(widgetDef);
      }
      return widgetDef;
    },

    /**
     * Appends the Studio ID and Friendly Name properties the to the list of properties on the given widget.
     * @param {object} widgetDef - the widget to append the properties to
     * @returns {object} The widget definition with the updated set of properties
     */
    addCommonProperties: function (widgetDef) {
      widgetDef = widgetDef || {};
      let combinedProps = widgetDef.properties || [];
      commonWidgetProperties.forEach(function (commonProp) {
        if (!combinedProps.find(function (existingProp) {
            return existingProp.name === commonProp.name;
          })) {
          combinedProps.push(commonProp);
        }
      });
      widgetDef.properties = combinedProps;
      return widgetDef;
    },

    /**
     * Handles replacement of twx-* attributes with ng-* attributes.
     * @param {string} template the designTemplate or runtimeTemplate string from a widget definition
     * @return {string} template string which has twx-* attributes replaced with ng-* equivalents
     * @internal
     */
    _twxToNg: function (template) {
      if (typeof template === 'string') {
        const regex = /twx-(disabled|if|model|show)=("[^"]*")(?=>|\/>|[ ][^<>]*[^-]>)/g;
        template = template.replace(regex, 'ng-$1=$2');
        // replace twx-visible with ng-show="app.fn.isTrue(me.visible)"
        template = template.replace(/ twx-visible(?=>|\/>|[ ][^<>]*[^-]>)/, ' ng-show="app.fn.isTrue(me.visible)"');
        // replace twx-disabled with ng-disabled="app.fn.isTrue(me.disabled)"
        template = template.replace(/ twx-disabled(?=>|\/>|[ ][^<>]*[^-]>)/, ' ng-disabled="app.fn.isTrue(me.disabled)"');
      }
      return template;
    },

    /**
     * Wraps given template func in func that replaces twx-* attributes with ng-* attributes
     * @param {function|string} widgetDefTemplate the designTemplate or runtimeTemplate func or string from a widget definition
     * @return {function} template function which has twx-* attributes replaced with ng-* equivalents
     * @internal
     */
    _getTemplateFunc: function (widgetDefTemplate) {
      let self = this;
      if (typeof widgetDefTemplate === 'function') {
        if (widgetDefTemplate._twxWrapped === undefined) { //Avoid re-wrappring infinitely
          let wrappedFunc = function () {
            const template = widgetDefTemplate.apply(this, arguments);
            return self._twxToNg(template);
          };
          wrappedFunc._twxWrapped = true;
          return wrappedFunc;
        } else {
          return widgetDefTemplate;
        }
      } else {
        const template = self._twxToNg(widgetDefTemplate);
        return function () {
          return template;
        };
      }
    },

    /**
     * Used for testing to re-initialize the collections within this object.
     * @private
     */
    _init: function () {
      widgets = {};
      dataProviders = {};
      widgetGroups = {};
      availableWidgets = [];
      _cacheWidgetsByTag = undefined;
    }
  };
})();

exports = module.exports = twxAppBuilder;

/**
 * Common functions for widgets, used in Canvas, and in node-server transpiler
 */

/**
 * Adds the necessary state formatting properties to the properties array
 * @param properties
 * @param sortOrder Number to use for the sort placement
 * @returns properties Array with new entries.
 */
// eslint-disable-next-line no-unused-vars
function addStateFormattingProperties(properties, sortOrder) { // jshint ignore:line
    var classIndex = 0;
    var stateFormatIndex = -1;
    var i = properties.length;
    while (i--) {
      if (properties[i].name === 'class') {
        classIndex = i + 1;
      }
      if (properties[i].name === 'stateFormat') {
        stateFormatIndex = i;
      }
    }
    if (stateFormatIndex === -1) {
      properties.splice(classIndex, 0, {
          name: 'enableStateFormatting',
          label: 'Enable State-Based Formatting',
          datatype: 'boolean',
          isBindingTarget: false,
          default: false,
          sortOrder: sortOrder
        },
        {
          name: 'stateFormatValue',
          label: 'Dependent Field',
          datatype: 'string',
          isBindingTarget: true,
          isVisible: function(props) {
            return (props.enableStateFormatting === true);
          },
          sortOrder: sortOrder + 0.1
        },
        {
          name: 'stateFormat',
          label: 'State Definition',
          isBindingTarget: false,
          datatype: 'custom_ui',
          runtimeDatatype: 'string',
          visibleValue: true,
          buttonLabel: 'Select',
          title: 'State Definition',
          done: 'ctrl.customWidgetEditorTargetWidgetProperty.value = ctrl.customWidgetEditorTargetWidgetProperty.pickedValue',
          template: function() {
            return '<state-format-picker></state-format-picker>';
          },
          isVisible: function(props) {
            return (props.enableStateFormatting === true);
          },
          sortOrder: sortOrder + 0.2
        });
    }

    return properties;
  }

  var Twx3dCommon = (function ( me ) {
    var OUTPUT_CACHE_STATS = false;
    var OUTPUT_CACHE_HIT_PERIOD = 10;
    var cacheMisses = {};
    var cacheHits = {};
    var cache = {};
    var COMMON_PROPS_3D = [
        {
            name: 'x',
            label: 'ves-ar-extension:X Coordinate',
            datatype: 'number',
            default: 0.0,
            isBindingTarget: true,
            sortOrder: 100,
            decimalLimit: 3
        },
        {
            name: 'y',
            label: 'ves-ar-extension:Y Coordinate',
            datatype: 'number',
            default: 0.0,
            isBindingTarget: true,
            sortOrder: 101,
            decimalLimit: 3
        },
        {
            name: 'z',
            label: 'ves-ar-extension:Z Coordinate',
            datatype: 'number',
            default: 0.0,
            isBindingTarget: true,
            sortOrder: 102,
            decimalLimit: 3
        },
        {
            name: 'rx',
            label: 'ves-ar-extension:X Rotation',
            datatype: 'number',
            default: 0.0,
            isBindingTarget: true,
            sortOrder: 110,
            decimalLimit: 3
        },
        {
            name: 'ry',
            label: 'ves-ar-extension:Y Rotation',
            datatype: 'number',
            default: 0.0,
            isBindingTarget: true,
            sortOrder: 111,
            decimalLimit: 3
        },
        {
            name: 'rz',
            label: 'ves-ar-extension:Z Rotation',
            datatype: 'number',
            default: 0.0,
            isBindingTarget: true,
            sortOrder: 112,
            decimalLimit: 3
        },
        {
            name: 'scale',
            label: 'ves-ar-extension:Scale',
            datatype: 'string',
            default: '1.0',
            isBindingTarget: true,
            sortOrder: 90,
            validationRegex: '^[\\d\\.]*$|^[\\d\\.]+ [\\d\\.]+ [\\d\\.]+$', //Matches single decimal number or 3 decimals comma separated
            tFrag: ' sx="{{me.scale.split(\' \')[0] || me.scale}}" sy="{{me.scale.split(\' \')[1] || me.scale}}" sz="{{me.scale.split(\' \')[2] || me.scale}}"'
        },
        {
            name: 'visible',
            label: 'ves-ar-extension:Visible',
            datatype: 'boolean',
            default: true,
            isBindingTarget: true,
            sortOrder: 150,
            tFrag: 'hidden="{{!app.fn.isTrue(me.visible)}}" '
        },
        {
            name: 'billboard',
            label: 'ves-ar-extension:Billboard',
            datatype: 'boolean',
            default: false,
            isBindingTarget: true,
            sortOrder: 200
        },
        {
            name: 'occlude',
            label: 'ves-ar-extension:Occluding',
            datatype: 'boolean',
            default: false,
            isBindingTarget: true,
            sortOrder: 220
        },
        {
            name: 'decal',
            label: 'ves-ar-extension:Always on top',
            datatype: 'boolean',
            default: false,
            isBindingTarget: true,
            sortOrder: 230
        },
        {
            name: 'opacity',
            label: 'ves-ar-extension:Opacity (1 Opaque - 0 Transparent)',
            datatype: 'number',
            default: 1,
            isBindingTarget: true,
            sortOrder: 240,
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            name: 'shader',
            label: 'ves-ar-extension:Shader Name',
            datatype: 'string',
            default: '',
            isBindingTarget: true,
            isVisible: false,
            sortOrder: 250
        }
    ];

    me.getPivotProperty = function() {
        return {
            name: 'pivot',
            label: 'ves-ar-extension:Pivot',
            datatype: 'select',
            default: '5',
            isBindingTarget: false,
            editor: 'select',
            options: [
                {label: 'ves-ar-extension:Top Left', value: "1"},
                {label: 'ves-ar-extension:Top Center', value: "2"},
                {label: 'ves-ar-extension:Top Right', value: "3"},
                {label: 'ves-ar-extension:Middle Left', value: "4"},
                {label: 'ves-ar-extension:Middle Center', value: "5"},
                {label: 'ves-ar-extension:Middle Right', value: "6"},
                {label: 'ves-ar-extension:Bottom Left', value: "7"},
                {label: 'ves-ar-extension:Bottom Center', value: "8"},
                {label: 'ves-ar-extension:Bottom Right', value: "9"}
            ],
            sortOrder: 245
        };
    };

    me.getHeightProperty = function() {
        return {
            name: 'height',
            label: 'ves-ar-extension:Height',
            datatype: 'number',
            default: '',
            isBindingTarget: true,
            sortOrder: 285
        };
    };

    me.getWidthProperty = function() {
        return {
            name: 'width',
            label: 'ves-ar-extension:Width',
            datatype: 'number',
            default: '',
            isBindingTarget: true,
            sortOrder: 290
        };
    };

    /**
     * @param {string} img such as '/extensions/images/placeholder_thingmark.png'
     */
    me.getPlaceHolderImgProperty = function(img) {
        return {
            name: 'placeholder_img',
            default: img,
            tFrag: '',
            isVisible: false
        };
    };

    me.getClassProperty = function () {
        return {
            name: 'class',
            label: 'ves-ar-extension:Class',
            datatype: 'string',
            isBindingTarget: true,
            tFrag: 'class="basic-3d-state-formatting {{me.class}}"',
            sortOrder: 3
        };
    };

    me.getOneSidedProperty = function () {
        return {
            name: 'experimentalOneSided',
            label: 'ves-ar-extension:Hide when reversed',
            datatype: 'boolean',
            default: false,
            isBindingTarget: true,
            sortOrder: 235,
            tFrag: 'experimental-one-sided="{{me.experimentalOneSided}}"',
            isVisible: function(props, $scope) {
                return _.get($scope, '$root.builderSettings.enableOneSidedOption', false);
            }
        };
    };

    me.arrayToMap = function(array) {
        var retObj = array.reduce(function (map, current) {
            map[current.name] = current;
            return map;
        }, {});
        return retObj;
    };

    var MAP_PROPS_3D = me.arrayToMap(COMMON_PROPS_3D);

    /**
     * Clone handling only simple cases - as COMMON_PROPS_3D and concept of 'properties' in widget is simple
     * i.e. - not handling scenario of Dates, Arrays, etc.
     * @param obj - the object to clone
     * @returns {*} - a clone of obj
     */
    function clone(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (!obj || "object" !== typeof obj) {
            return obj;
        }

        // Handle Object
        if (obj instanceof Object) {
            //console.log("Handling CLONE of an object");
            copy = {};
            for (var attr in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                    copy[attr] = clone(obj[attr]);
                }
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    function cacheWidget(label, widget) {
        cache[label] = widget;
        if (OUTPUT_CACHE_STATS) {
            //implied miss
            if (cacheMisses[label]) {
                cacheMisses[label]++;
            } else {
                cacheMisses[label] = 1;
            }
            console.log("3D Widget cache MISS(es) in Twx3dCommon for " + label + ": " + cacheMisses[label]);
        }
    }

    /**
     * Either gets the widget from the cache if it has already been built or invokes factoryFunction to build it.
     * @param label - the label (and cache key) of the widget
     * @param factoryFunction - the function used to create a widget.
     * @returns {*}
     */
    me.getWidget = function(label, factoryFunction) {
        var retObj = cache[label];
        if (retObj) {
            if (OUTPUT_CACHE_STATS) {
                if (cacheHits[label]) {
                    cacheHits[label]++;
                } else {
                    cacheHits[label] = 1;
                }
                if (cacheHits[label] % OUTPUT_CACHE_HIT_PERIOD === 0) {
                    console.log("3D Widget cache HIT(s) in Twx3dCommon for " + label + ": " + cacheHits[label]);
                }
            }
            return retObj;
        }

        //miss
        retObj = factoryFunction(label);
        cacheWidget(label, retObj);
        return retObj;
    };

    me.new3dProps = function(overlay, keyRemovalList) {
        var copy = clone(MAP_PROPS_3D);
        var overlayKeys = Object.keys(overlay);
        var i, currentKey;

        for (i=0; i < overlayKeys.length; i++) {
            currentKey = overlayKeys[i];
            copy[currentKey] = overlay[currentKey];
        }

        if(keyRemovalList && keyRemovalList.length && keyRemovalList.length > 0) {
            for (i=0; i < keyRemovalList.length; i++) {
                delete copy[keyRemovalList[i]];
            }
        }

        var props = [];
        var copyKeys = Object.keys(copy);

        for (i=0; i < copyKeys.length; i++) {
            currentKey = copyKeys[i];
            var obj = copy[currentKey];
            props.push( obj );
        }

        //Allow custom ordering of properties, sortOrder first, alphabetical second (combined into one function,
        //to avoid issues with non-preserving sort functions when values are equal
        props = props.sort(function(a,b){
            if (b.sortOrder || a.sortOrder)  {
                var bval = b.sortOrder || 1000;
                var aval = a.sortOrder || 1000;
                return (aval - bval);
            }

            if (b.label && a.label && b.label.toLowerCase() > a.label.toLowerCase()) {
                return -1;
            }
            else {
                return 1;
            }
        });

        return props;
    };

/**
     * Convenience function to generate a conventional runtime template for 3d widgets.
     * If the conventions here don't work for your needs:
     * 1. Try using a 'tFrag' property in the object (see visible/hidden for example)
     * 2. Create your own template
     * @param elementName - name of element (e.g. armodelitem, arimage, arsensor, etc.)
     * @param props - the properties to be included in the template
     * @param {boolean|string} generateId - generate the id attribute if not false. When a string is specified the id will be generated with that value.
     * @param params - additional params for building template, currently only supports isContainer which controls whether to build a container template.
     */
    me.buildRuntimeTemplate = function(elementName, props, generateId, params) {
        if ( props === undefined || props === null ) {
            console.warn("Generation of runtime template for " + elementName + " aborted. No properties defined");
            return "<!-- " + (elementName ? elementName : "(unknown element)") + ": no properties defined -->";
        }

        var tmpl = '<' + elementName + ' ';

        if (generateId !== false) {
            if (typeof generateId === 'string') {
                tmpl += 'id="' + generateId + '" ';
            } else {
                tmpl += 'id="#widgetId#" ';
            }
        }

        var keys = Object.keys(props);
        for (var i=0; i < keys.length; i++) {
            var currentObjName = props[i]['name'];

            var currentObjTFrag = props[i]['tFrag'];

            if ( currentObjTFrag !== undefined ) {
                tmpl += currentObjTFrag;
                tmpl += ' ';
                continue;
            }

            //there may be a need here to filter out keys that are in the bag - but should
            //not be included in attributes of the XML element being generated (e.g widgetId)

            tmpl += currentObjName + '="{{me.' + currentObjName + '}}" ';

        }

        if (params && params.isContainer) {
          tmpl += '>' +
              '<twx-container-content></twx-container-content>' +
            '</' + elementName + '>';
        } else {
          tmpl += '/>'; //<-- that's right - constituents not supported here
        }

        return tmpl;
    };

    me.common3dProp = function( name ) {
      return clone(MAP_PROPS_3D[name]);
    };

    return me;

}( Twx3dCommon || {} ));

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

// registers the Widget Groups for the OOTB groups, these are the group names that are displayed in the Widgets palette
twxAppBuilder.registerWidgetGroup('Augmentations', 'ves-ar-extension:augmentations-widgetGroup-label');
twxAppBuilder.registerWidgetGroup('Containers', 'ves-ar-extension:containers-widgetGroup-label');
twxAppBuilder.registerWidgetGroup('Input', 'ves-ar-extension:input-widgetGroup-label');
twxAppBuilder.registerWidgetGroup('Other', 'ves-ar-extension:other-widgetGroup-label');
twxAppBuilder.registerWidgetGroup('Targets', 'ves-ar-extension:targets-widgetGroup-label');

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxDateInput() {

    return {
        elementTag: 'twx-date-input',

        label: 'desktop-widgets:Date Input',

        category: 'desktop',

        groups : ["Input"],

        isVisibleInPalette: false,

        properties: [
            {
                name: 'value',
                label: 'ves-basic-web-widgets-extension:Value',
                datatype: 'string',
                isBindingTarget: true,
                isBindingSource: true
            },
            {
                name: 'class',
                label: 'ves-basic-web-widgets-extension:Class',
                datatype: 'string',
                isBindingTarget: true
            },
            {
                name: 'visible',
                label: 'ves-basic-web-widgets-extension:Visible',
                datatype: 'boolean',
                default: true,
                isBindingTarget: true
            },
            {
                name: 'disabled',
                label: 'ves-basic-web-widgets-extension:Disabled',
                datatype: 'boolean',
                default: false,
                isBindingTarget: true
            }
        ],

        services: [],

        events: [
            {
                name: 'change',
                label: 'ves-basic-web-widgets-extension:Value Changed'
            },
            {
                name: 'click',
                label: 'ves-basic-web-widgets-extension:Click'
            }
        ]
    };
}

twxAppBuilder.widget('twxDateInput', twxDateInput);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

(function (twxAppBuilder) {
  function twxBarcodeScanner() {
    var defaultText = 'Point camera at code';
    try {
      defaultText = i18next.t('ves-ar-extension:barcode-default-prompt-value');
    }
    catch (e) {
      //Running on the server
    }
    return {
      elementTag: 'twx-barcode-scanner',

      category: 'basic-html',

      groups: ['Other'],

      image: 'images/Scan.svg',

      label: 'ves-ar-extension:Scan',

      isVisibleInPalette: (scope) => {
        return scope.$root.currentProject.projectType === 'AR' ||
               scope.$root.currentProject.projectType === 'HMT';
      },

      properties: [
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string',
          isBindingTarget: true
        },
        {
          name: 'isAugmentationsHidden',
          label: 'ves-ar-extension:barcode-hide-augmentations',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true,
          isVisible: (props, scope) => {
            return scope.$root.projectSettings.viewType !== 'hmt-2D' &&
              scope.$root.projectSettings.viewType !== 'mobile-2D';
          }
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: false,
          isVisible: false
        },
        {
          name: 'text',
          label: 'ves-ar-extension:Text',
          datatype: 'string',
          default: defaultText,
          isBindingTarget: true,
          isVisible: true
        },
        {
          name: 'scannedValue',
          label: 'ves-ar-extension:barcode-scanned-value',
          datatype: 'string',
          showInput: false,
          isBindingSource: true,
          isVisible: true
        },
        {
          name: 'isVisibleAtDesigntime',
          datatype: 'boolean',
          default: true,
          isVisible: false
        }
      ],

      events: [
        {
          name: 'valueacquired',
          label: 'ves-ar-extension:barcode-value-acquired-event-label',
          isVisible: true
        },
        {
          name: 'usercanceled',
          label: 'ves-ar-extension:barcode-user-canceled-event-label',
          isVisible: true
        }
      ],

      services: [
        {
          name: 'startScan',
          label: 'ves-ar-extension:barcode-start-scan-service-label'
        }
      ],

      designTemplate: function () {
        var tmpl = `
        <div twx-barcode-scanner class="barcode-scanner widget-help-box widget-help-popup" ng-if="me.isVisibleAtDesigntime">\
          <img class="left-image" src="/extensions/images/Scan.svg"/> \
          <span class="widget-title-label">{{"ves-ar-extension:Scan" | i18next}}</span> \
          <div class="widget-description"> \
                 {{"ves-ar-extension:barcode-help" | i18next }}\
          </div> \
        </div>`;
        return tmpl;
      },

      runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings, isARView) {
        let tmpl;
        const widgetContent = '' +
          '<twx-container-content class="{{me.class}}">\n' +
          '  <div class="scan-content runtime">\n' +
          '    <div class="scan-mask"></div>\n' +
          '    <div class="scan-elements">\n' +
          '      <div class="scan-message">{{me.text}}</div>\n' +
          '      <div class="scan-line"></div>\n' +
          '      <button class="scan-exit-button iconClose" ng-click="stopScan()"></button>\n' +
          '    </div>\n' +
          '  </div>\n' +
          '</twx-container-content>\n';

        if (!isARView) {
          tmpl = '' +
            '<twx-dt-view twx-visible twx-barcode-scanner-service>\n' +
            '  <twx-dt-tracker>\n' +
            widgetContent +
            '  </twx-dt-tracker>\n' +
            '</twx-dt-view>';
        } else {
          tmpl = '' +
            '<div twx-visible twx-barcode-scanner-service>\n' +
            widgetContent +
            '</div>';
        }
        return tmpl;
      },

      dependencies: {
        files: ['js/twxBarcodeScannerService.js'],
        angularModules: ['ngBarcodeScannerService']
      }
    };
  }

  twxAppBuilder.widget('twxBarcodeScanner', twxBarcodeScanner);
})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxGauge() {
  function guid() {
    function _p8(s) {
      var p = (Math.random().toString(16) + "000000000").substr(2, 8);
      return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }

    return _p8() + _p8(true) + _p8(true) + _p8();
  }

  return {
    elementTag: 'twx-gauge',

    label: 'ves-ar-extension:Gauge',

    category: 'mobile-2D',

    properties: addStateFormattingProperties([
      {
        name: 'class',
        label: 'ves-ar-extension:Class',
        datatype: 'string',
        isBindingTarget: true
      },
      {
        name: 'min',
        label: 'ves-ar-extension:Minimum Value',
        datatype: 'string',
        default: '0',
        isBindingTarget: true
      },
      {
        name: 'max',
        label: 'ves-ar-extension:Maximum Value',
        datatype: 'string',
        default: '100',
        isBindingTarget: true
      },
      {
        name: 'value',
        label: 'ves-ar-extension:Value',
        datatype: 'string',
        default: '0',
        isBindingTarget: true,
        defaultDependentField: true
      },
      {
        name: 'humanFriendlyDecimal',
        label: 'ves-ar-extension:Decimal Scale',
        datatype: 'number',
        default: 0,
        isBindingTarget: false
      },
      {
        name: 'title',
        label: 'ves-ar-extension:Gauge Title',
        datatype: 'string',
        default: ''
      },
      {
        name: 'titleposition',
        label: 'ves-ar-extension:Title Position',
        datatype: 'string',
        default: 'below',
        editor: 'select',
        options: [
            { label: 'ves-ar-extension:Above', value: 'above' },
            { label: 'ves-ar-extension:Below', value: 'below' }
        ]
      },
      {
        name: 'donut',
        label: 'ves-ar-extension:Gauge Span',
        datatype: 'number',
        default: '180',
        editor: 'select',
        options: [
            { label: 'ves-ar-extension:Half Circle', value: 180},
            { label: 'ves-ar-extension:Full Circle', value: 360}
        ]
      },
      {
        name: 'donutstartangle',
        label: 'ves-basic-web-widgets-extension:Start Angle',
        datatype: 'number',
        default: 0,
        isVisible: function(props){
          return (props.donut === '360');
        }
      },
      {
        name: 'hideinnershadow',
        label: 'ves-ar-extension:Hide Inner Shadow',
        datatype: 'boolean',
        default: false,
      },
      {
        name: 'titlefontcolor',
        label: 'ves-ar-extension:Title Font Color',
        datatype: 'string',
        default: '#000000',
      },
      {
        name: 'valuefontcolor',
        label: 'ves-ar-extension:Value Font Color',
        datatype: 'string',
        default: '#000000',
      },
      {
        name: 'valuecolor',
        label: 'ves-ar-extension:Value Fill Color',
        datatype: 'string',
        default: "",
      },
      {
        name: 'backgroundcolor',
        label: 'ves-ar-extension:Value Background Color',
        datatype: 'string',
        default: '#edebeb',
      },
      {
        name: 'width',
        label: 'ves-ar-extension:Width',
        datatype: 'string',
        default: '100%'
      },
      {
        name: 'height',
        label: 'ves-ar-extension:Height',
        datatype: 'string',
        default: '100%'
      },
      {
        name: 'visible',
        label: 'ves-ar-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      }
    ]),

    services: [
      {
        name: 'updateChart',
        label: 'ves-ar-extension:Update Chart'
      }
    ],

    dependencies: {
      files: ['js/eve.js', 'js/raphael.min.js', 'js/justgage.js', 'js/twxGauge.js'],
      angularModules: ['ngJustGage']
    },

    designTemplate: function () {
      var text = window.i18next.t('ves-ar-extension:2D Gauge');
      return '<div class="gauge chart {{me.class}}">' + text + '</div>';
    },

    runtimeTemplate: function (props) {
      if (!props.humanFriendlyDecimal) {
        props.humanFriendlyDecimal = 0;
      }
      else if (props.humanFriendlyDecimal > 0) {
        props.humanFriendly = true;
      }
      var tmpl = '<div class="gage-container" style="width: '+ props.width +'; height: '+ props.height +';">' +
                    '<just-gage twx-visible id="gauge-' + guid()+ '" class="{{me.class}}" ' +
                    ' donut="me.donut" hideinnershadow="me.hideinnershadow" donutstartangle="me.donutstartangle" titleposition="me.titleposition" ' +
                    ' valuecolor="me.valuecolor" backgroundcolor="me.backgroundcolor" ' +
                    ' valuefontcolor="me.valuefontcolor" titlefontcolor="me.titlefontcolor" max="me.max" min="me.min" value="{{me.value}}" ' +
                    ' title="'+ props.title +'" width="'+ props.width +'" height="'+ props.height +'" ' +
                    'options="{humanFriendlyDecimal: '+props.humanFriendlyDecimal+', humanFriendly: '+props.humanFriendly+'}">' +
                    '</just-gage>' +
                  '</div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxGauge', twxGauge);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxChalk() {
    return {
        elementTag: 'twx-chalk',

        label: 'ves-ar-extension:Chalk',

        category: 'mobile-2D',

        groups : ["Other"],

        properties: [
            {
                name: 'class',
                label: 'ves-ar-extension:Class',
                datatype: 'string',
                //default: '',
                isBindingTarget: true
            },
            {
                name: 'text',
                label: 'ves-ar-extension:Text',
                datatype: 'string',
                isBindingTarget: true
            },
            {
              name: 'url',
              label: '',
              datatype: 'string',
              default: 'https://admin.vuforiachalk.com/call',
              isVisible: false,
              isBindingTarget: true
            },
            {
                name: 'width',
                label: 'ves-ar-extension:Width',
                datatype: 'string',
                default: '48px'
            },
            {
                name: 'height',
                label: 'ves-ar-extension:Height',
                datatype: 'string',
                default: '48px'
            },
            {
                name: 'margin',
                label: 'ves-ar-extension:Margin',
                datatype: 'string'
            },
            {
                name: 'orientation',
                label: 'ves-ar-extension:orientation-label',
                datatype: 'string',
                default: 'vertical',
                editor: 'textalign',
                options: [
                      { label: 'ves-ar-extension:horizontal-label', value: 'horizontal' },
                      { label: 'ves-ar-extension:vertical-label', value: 'vertical' }
                ]
            }
        ],

        services: [],

        events: [
            {
                name: 'click',
                label: 'ves-ar-extension:Click'
            }
        ],

        designTemplate: function () {
            return '<div class="twxChalk {{me.class}} {{me.orientation}}" style="margin: {{me.margin}};">' +
                '<div class="twxChalkIcon" style="height: {{me.height}}; width: {{me.width}};"></div>' +
                '<a class="twxChalkText" ng-if="me.text">{{me.text}}</a>' +
            '</div>';
        },

        runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
            var margin = '';
            if (props.margin) {
              margin = 'margin: ' + props.margin + ';';
            }
            var size = '';
            if (props.width || props.height) {
                size = 'height: ' + props.height + '; width: ' + props.width + ';';
            }
            if (props.margin) {
                margin = 'margin:' + props.margin + ';';
            }
            var text = '';
            if (props.text) {
                text = '<span class="twxChalkText">' + props.text + '</span>';
            }
            var tmpl = '<a class="twxChalk ' + props.class + ' ' + props.orientation + '" twx-link twx-native-events ng-href="{{me.url}}" style="' + margin + '">' +
                '<div class="twxChalkIcon" style="' + size + '"></div>' +
                text +
            '</a>';
            return tmpl;
        },

        dependencies: {
          files: ['js/common-html-widgets-ng.js', 'images/Chalk.svg'],
          angularModules: ['common-html-widgets-ng']
      },
    };
}

twxAppBuilder.widget('twxChalk', twxChalk);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxHeaderButtons() {
    return {
      elementTag: 'twx-header-buttons',

      label: 'ves-ar-extension:Header Buttons',

      category: 'mobile-2D',

      isContainer: true,

      isVisibleInPalette: false,

      properties: [
        {
          name: 'align',
          label: 'ves-ar-extension:Alignment',
          datatype: 'string',
          default: 'primary',
          editor: 'select',
          options: [
            {label: 'ves-ar-extension:Primary', value: 'primary'},
            {label: 'ves-ar-extension:Secondary', value: 'secondary'}
          ],
          alwaysWriteAttribute: true
        },
        {
          name: 'visible',
          label: 'ves-ar-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string',
          isBindingTarget: true
        }
      ],

      designTemplate: function () {
        return '<twx-container-content class="{{me.class}}"></twx-container-content><button class="button button-icon button-clear ion-navicon"></button>';
      },

      runtimeTemplate: function (properties) {
        var tmpl = '<ion-nav-buttons class="{{me.class}}" side="' + properties.align + '"><twx-container-content></twx-container-content></ion-nav-buttons>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxHeaderButtons', twxHeaderButtons);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxHeaderTitle() {
    return {
      elementTag: 'twx-header-title',

      label: 'ves-ar-extension:Header Title',

      category: 'mobile-2D',

      isContainer: true,

      isVisibleInPalette: false,

      properties: [
        {
          name: 'visible',
          label: 'ves-ar-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string',
          isBindingTarget: true
        }
      ],

      designTemplate: function () {
        return '<twx-container-content class="{{me.class}}"></twx-container-content>';
      },

      runtimeTemplate: function (properties) {
        var tmpl = '<ion-nav-title class="{{me.class}}"><twx-container-content></twx-container-content></ion-nav-title>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxHeaderTitle', twxHeaderTitle);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {
  function twxList() {
    return {
      elementTag: 'twx-list',

      label: 'ves-ar-extension:List',

      category: 'mobile-2D',

      isVisibleInPalette: true,

      properties: addStateFormattingProperties([
        {
          name: 'list',
          label: 'ves-ar-extension:List',
          datatype: 'infotable',
          isBindingTarget: true
        },
        {
            name: 'class',
            label: 'ves-ar-extension:Class',
            datatype: 'string',
            isBindingTarget: true
        },
        {
          name: 'multiselect',
          label: 'ves-ar-extension:Multi-Select',
          datatype: 'boolean',
          default: false
        },
        {
          name: 'label',
          label: 'ves-ar-extension:Display Field',
          datatype: 'string',
          editor: 'select',
          applyFieldsFromDataSource: 'list',
          isBindingTarget: true
        },
        {
          name: 'visible',
          label: 'ves-ar-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'scrollable',
          label: 'ves-ar-extension:Scrollable',
          datatype: 'boolean',
          default: true,
          isVisible: false
        },
        {
          name: 'itempadding',
          label: 'ves-ar-extension:List Item Padding',
          datatype: 'string',
          default: ''
        }
      ]),

      events: [
        {
          name: 'itemclick',
          label: 'ves-ar-extension:Item Click'
        }
      ],

      designTemplate: function () {
        return '<div class="list">' +
                  '<div class="item {{me.class}}" style="padding: {{me.itempadding}};">' +
                    '{{me.label}}' +
                  '</div>' +
                '</div>';
      },

      runtimeTemplate: function (propertyValues, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
        var voiceCommand = '';
        if (projectSettings && projectSettings.projectType === 'HMT') {
          voiceCommand =  ' data-wml-speech-command="{{item[me.label]}}" ';
        }

        var padding = '';
        if (propertyValues.itempadding) {
          padding = 'padding:' +propertyValues.itempadding + ';';
        }

        var scrollableClass = (propertyValues.scrollable === 'true') ? 'scrollable' : '';
        var tmpl = '<ion-list twx-visible class="'+ scrollableClass +'">';
        if (propertyValues.enableStateFormatting) {
          tmpl +='<twx-widget ng-repeat="item in me.list" ng-init="parentList = $parent.me;" twx-auto-assign-item>' +
            '     <twx-widget-property name="stateFormat" datatype="string" value="'+propertyValues.stateFormat+'"></twx-widget-property>' +
            '     <twx-widget-property name="stateFormatValue" datatype="string" value="item.'+propertyValues.stateFormatValue+'"></twx-widget-property>' +
            '     <twx-widget-property name="enableStateFormatting" datatype="boolean" value="'+propertyValues.enableStateFormatting+'"></twx-widget-property>' +
            '     <twx-widget-content ng-init="me.item = item">' +
            '       <ion-item style="'+ padding +'" class="item {{parentList.class}} basic-state-formatting basic-state-formatting-image" ';
        }
        else {
          tmpl += '<ion-item ng-repeat="item in me.list" style="'+ padding +'" class="item {{me.class}}" ';
        }
        tmpl +='ng-click="app.fn.clickItemInRepeater(item,(me.list || parentList.list),(me.multiselect || parentList.multiselect));fireEvent(\'itemclick\', item);" ' +
            voiceCommand + ' ng-class="{selected: item._isSelected}">' +
                    '{{item[me.label || parentList.label]}}' +
                '</ion-item>';

        if (propertyValues.enableStateFormatting) {
          tmpl += '</twx-widget-content>' +
                 '</twx-widget>';
        }
        tmpl += '</ion-list>';

        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxList', twxList);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxOverlay(){
    return {
      elementTag: 'twx-overlay',

      label: 'ves-ar-extension:2D Overlay',

      category: 'mobile-2D',

      isVisibleInPalette: false,

      isContainer: true,

      hideRemoveButton: true,

      properties: [
        {
          name: 'visible',
          label: 'ves-ar-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string',
          isBindingTarget: true
        }
      ],

      designTemplate: function(props){
        return '<twx-container-content></twx-container-content>';
      },

      runtimeTemplate: function(props){
        var tmpl = '<div class="twx-2d-overlay {{me.class}}" twx-visible><twx-container-content></twx-container-content></div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxOverlay', twxOverlay);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxOverlayBody() {
    return {
      elementTag: 'twx-overlay-body',

      label: 'ves-ar-extension:2D Overlay Body',

      category: 'mobile-2D',

      outputElementsOnly: true,

      isVisibleInPalette: false,

      isContainer: true,

      properties: [
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string'
        }
      ],

      designTemplate: function () {
        return '<twx-container-content></twx-container-content>';
      },

      runtimeTemplate: function (properties) {
        var tmpl = '<div class="panel body ' + properties.class + '"></div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxOverlayBody', twxOverlayBody);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxOverlayContainer() {
    return {
      elementTag: 'twx-overlay-container',

      label: 'ves-ar-extension:Panel',

      category: 'mobile-2D',

      outputElementsOnly: true,

      isVisibleInPalette: false,

      isContainer: true,

      properties: [
        {
          name: 'position',
          label: 'ves-ar-extension:Position',
          datatype: 'string',
          default: '',
          editor: 'select',
          options: [
            {label: 'ves-ar-extension:Top', value: 'top'},
            {label: 'ves-ar-extension:Left', value: 'left'},
            {label: 'ves-ar-extension:Center', value: 'center'},
            {label: 'ves-ar-extension:Right', value: 'right'},
            {label: 'ves-ar-extension:Bottom', value: 'bottom'}
          ],
          isVisible: false
        },
        {
          name: 'width',
          label: 'ves-ar-extension:Width',
          datatype: 'string',
          default: '',
          isVisible: function(props){
            return (props.position === 'left' || props.position === 'center' || props.position === 'right');
          }
        },
        {
          name: 'height',
          label: 'ves-ar-extension:Height',
          datatype: 'string',
          default: '',
          isVisible: function (props) {
            return (props.position === 'top' || props.position === 'bottom');
          }
        },
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string'
        }
      ],

      designTemplate: function () {
        return '<twx-container-content class="{{me.position}} {{me.class}}" style="width: {{me.width}}; height: {{me.height}};"></twx-container-content>';
      },

      runtimeTemplate: function (properties) {
        var flexWidthValue = '';
        if(properties.width !== ''){
          flexWidthValue = 'flex: 0 0 ' + properties.width;
        }

        var height = '';
        if (properties.height) {
          height = 'height: ' + properties.height + ';';
        }
        var tmpl = '<div class="panel '+ properties.class +' '+ properties.position +'" style="'+height+' '+ flexWidthValue +'"></div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxOverlayContainer', twxOverlayContainer);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxOverlayPanel(){
    return {
      elementTag: 'twx-overlay-panel',

      label: 'ves-ar-extension:Overlay Panel',

      category: 'mobile-2D',

      isContainer: true,

      isModal: true,

      isVisibleInPalette: false,

      properties: [
        {
          name: 'visible',
          label: 'ves-ar-extension:Visible',
          datatype: 'string',
          default: false,
          isBindingTarget: true
        },
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string',
          isBindingTarget: true
        }
      ],

      designTemplate: function(props){
        return '<div class="twx-overlay-panel {{me.class}}"><twx-container-content></twx-container-content></div>';
      },

      runtimeTemplate: function(props){
        var tmpl = '<div class="twx-overlay-panel {{me.class}}"><twx-container-content></twx-container-content></div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxOverlayPanel', twxOverlayPanel);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxSpinner() {
    return {
        elementTag: 'twx-spinner',

        label: 'ves-ar-extension:Spinner',

        category: 'mobile-2D',

        properties: [
            {
                name: 'icon',
                label: 'ves-ar-extension:Spinner Type',
                datatype: 'string',
                default: 'Spiral',
                editor: 'select',
                options: [
                    { label: 'ves-ar-extension:Android', value: 'Android' },
                    { label: 'ves-ar-extension:Bubbles', value: 'Bubbles' },
                    { label: 'ves-ar-extension:Circles', value: 'Circles' },
                    { label: 'ves-ar-extension:Crescent', value: 'Crescent' },
                    { label: 'ves-ar-extension:Dots', value: 'Dots' },
                    { label: 'ves-ar-extension:iOS', value: 'iOS' },
                    { label: 'ves-ar-extension:iOS Small', value: 'iOS-Small' },
                    { label: 'ves-ar-extension:Lines', value: 'Lines' },
                    { label: 'ves-ar-extension:Ripple', value: 'Ripple' },
                    { label: 'ves-ar-extension:Spiral', value: 'Spiral' }
                ]
            },
            {
                name: 'visible',
                label: 'ves-ar-extension:Visible',
                datatype: 'boolean',
                default: true,
                isBindingTarget: true
            },
            {
              name: 'class',
              label: 'ves-ar-extension:Class',
              datatype: 'string',
              isBindingTarget: true
            }
        ],

        services: [],

        events: [
        ],

        designTemplate: function () {
            return '<img class="{{me.class}}" ng-src="/extensions/images/icon{{me.icon}}.png">';
        },

        runtimeTemplate: function (properties) {
            var tmpl = '<ion-spinner class="spinner ' + properties.class + '" icon="' + properties.icon.toLowerCase() + '" twx-visible></ion-spinner>';
            return tmpl;
        }
    };
}

twxAppBuilder.widget('twxSpinner', twxSpinner);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {
  function twxView() {
    return {
      elementTag: 'twx-view',

      label: 'ves-ar-extension:View',

      category: 'mobile-2D',

      isContainer: true,

      isVisibleInPalette: false,

      allowCopy: false,

      properties: [
        {
          name: 'class',
          label: 'ves-ar-extension:Class',
          datatype: 'string',
          isBindingTarget: true
        },
        {
          name: 'viewtype',
          label: 'ves-ar-extension:View Type',
          datatype: 'string',
          default: '',
          alwaysWriteAttribute: true,
          isVisible: false
        }
      ],

      dependencies: function (projectInfo) {
        let deps = {
          files: ['js/url-search-params.js', 'twx-runtime-resource.js', 'tw-javascript-sdk-0.2.3-min.js', 'js/vuforia-angular.js'],
          angularModules: ["ionic", "twx.byoc"]
        };

        // include additional files in the main page for 2D eyewear projects
        if (projectInfo && projectInfo.projectSettings && projectInfo.projectSettings.projectType === 'HMT') {
          deps.files = deps.files.concat(['js/wearml_engine-min.js', 'js/hmt-project-startup.js']);
        }

        if (projectInfo.builderSettings.includeProjectWASM !== false) {
          deps.files.push('js/twx-mobile-widgets-3d-ng.js');
          deps.files.push('js/thingview.js');
          deps.files.push('js/libthingview_wasm.js');
          deps.files.push('js/libthingview_wasm.wasm');
        }

        return deps;
      },

      designTemplate: function () {
        return '<twx-container-content class="{{me.class}}"></twx-container-content>';
      },

      runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc) {
        const is2D = props.viewtype === 'mobile-2D' ||
          props.viewtype === 'hmt-2D';
        let tmpl = '';

        if (is2D) {
          let hasScanWidget = fullOriginalDoc.find('twx-barcode-scanner').length > 0;
          if (hasScanWidget) {
            tmpl += '<div class="twx-view-overlay"></div>\n';
          }
        }
        tmpl += '<twx-container-content class="{{me.class}}"></twx-container-content>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxView', twxView);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxViewFooter(){
    return {
      elementTag: 'twx-view-footer',

      label: 'ves-ar-extension:Footer',

      category: 'mobile-2D',

      groups : ["Containers"],

      isContainer: true,

      isVisibleInPalette: true,

      properties: [
        {
            name: 'class',
            label: 'ves-ar-extension:Class',
            datatype: 'string',
            isBindingTarget: true
        }
      ],

      designTemplate: function(){
        return '<ion-footer-bar class="bar bar-footer ion-footer-bar {{me.class}}"><twx-container-content></twx-container-content></ion-footer-bar>';
      },

      runtimeTemplate: function(props){
        var tmpl = '<ion-footer-bar class="bar bar-footer ion-footer-bar '+props.class+'"><twx-container-content></twx-container-content></ion-footer-bar>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxViewFooter', twxViewFooter);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxViewHeader(){
    return {
      elementTag: 'twx-view-header',

      label: 'ves-ar-extension:Header',

      category: 'mobile-2D',

      groups : ["Containers"],

      isContainer: true,

      isVisibleInPalette: true,

      properties: [],

      initialContent: function () {
        return '<twx-header-buttons twx-widget align="primary"><twx-container-content></twx-container-content></twx-header-buttons>' +
          '<twx-header-title twx-widget><twx-container-content></twx-container-content></twx-header-title>' +
          '<twx-header-buttons twx-widget align="secondary"><twx-container-content></twx-container-content></twx-header-buttons>';
      },

      designTemplate: function(){
        return '<twx-container-content></twx-container-content>';
      },

      runtimeTemplate: function(props){
        var tmpl = '<twx-container-content></twx-container-content>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxViewHeader', twxViewHeader);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function newTwxDtImage( widgetLabel ) {
      var ELEMENT_NAME = 'twx-dt-image';
      var overlay = {};

      overlay.rx = Twx3dCommon.common3dProp('rx');
      overlay.rx.default = -90;

      overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/placeholder_img.svg');

      overlay.src = {
          name: 'src',
          label: 'ves-ar-extension:Resource',
          datatype: 'resource_url',
          resource_image: true,
          allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
          default: '',
          isBindingTarget: true,
          tFrag: 'ng-src="{{me.src | trustUrl}}" src="#src#"',
          sortOrder: 1
      };

      overlay.pivot = Twx3dCommon.getPivotProperty();
      overlay.width = Twx3dCommon.getWidthProperty();
      overlay.height = Twx3dCommon.getHeightProperty();
      overlay.class = Twx3dCommon.getClassProperty();
      overlay.experimentalOneSided = Twx3dCommon.getOneSidedProperty();

      // matching the sort order in twxDtLabel
      overlay.height.sortOrder = 2;
      overlay.width.sortOrder = 2.1;

      var props = Twx3dCommon.new3dProps(overlay);
      var template = Twx3dCommon.buildRuntimeTemplate(ELEMENT_NAME, props);

      var retObj = {
          elementTag: ELEMENT_NAME,

          isVisibleInPalette: true,

          category: 'ar',

          groups: ['Augmentations'],

          label: widgetLabel,

          isContainer: false,

          properties: props,

          events: [
              {
                  name: 'click',
                  label: 'ves-ar-extension:Click'
              }
          ],

          designTemplate: function (props) {
              return ('<!-- twxDtImage -->');
          },

          runtimeTemplate: function (props) {
              return template.replace("#widgetId#", props.widgetId).replace('#src#', props.src);
          }
      };
      return retObj;
  }

  function twxDtImage() {
      //This call gets a cached widget - if there is one. Arguably, though, we don't want a cached widget -
      // we want a new widget each time _BUT_ when a widget is in a scene - its ctor is called over 30 times
      // per instance of widget so lets see what happens if I return a cached value.
      var widget = Twx3dCommon.getWidget( 'ves-ar-extension:3D Image', newTwxDtImage );
      return widget;
  }

  twxAppBuilder.widget('twxDtImage', twxDtImage);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function newDtLabel( widgetLabel ) {
    var ELEMENT_NAME = 'twx-dt-label';
    var overlay = {};

    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.rx.default = -90;

    overlay.text = {
      name: 'text',
      label: 'ves-ar-extension:Text',
      datatype: 'string',
      default: 'Label',
      isBindingTarget: true,
      defaultDependentField: true,
      sortOrder: 1
    };

    overlay.class = Twx3dCommon.getClassProperty();

    overlay.fontFamily = {
      name: 'fontFamily',
      label: 'ves-ar-extension:Font Family',
      datatype: 'string',
      isBindingTarget: true,
      sortOrder: 4
    };

    overlay.fontColor = {
      name: 'fontColor',
      label: 'ves-ar-extension:Font Color',
      datatype: 'string',
      isBindingTarget: true,
      sortOrder: 4.1
    };

    overlay.fontOutlineColor = {
      name: 'fontOutlineColor',
      label: 'ves-ar-extension:Font Outline Color',
      datatype: 'string',
      placeholder: '',
      isBindingTarget: true,
      sortOrder: 4.2
    };

    overlay.textprops = {
      name: 'textprops',
      label: 'ves-ar-extension:Text Properties',
      datatype: 'string',
      default: '',
      isBindingTarget: true,
      tFrag: 'textattrs="{{me.textprops}}"',
      sortOrder: 4,
      isVisible: function(props, $scope) {
        return ($scope && $scope.$root && $scope.$root.builderSettings && $scope.$root.builderSettings.showTextAttributes === true);
      }
    };

    overlay.pivot = Twx3dCommon.getPivotProperty();
    overlay.width = Twx3dCommon.getWidthProperty();
    overlay.height = Twx3dCommon.getHeightProperty();
    overlay.experimentalOneSided = Twx3dCommon.getOneSidedProperty();

    overlay.height.sortOrder = 2;
    overlay.width.sortOrder = 2.1;

    var props = Twx3dCommon.new3dProps(overlay);
    props = addStateFormattingProperties(props);
    var template = Twx3dCommon.buildRuntimeTemplate(ELEMENT_NAME, props);

    var retObj = {
      elementTag: ELEMENT_NAME,

      isVisibleInPalette: true,

      category: 'ar',

      groups: ['Augmentations'],

      label: widgetLabel,

      properties: props,

      events: [
        {
          name: 'click',
          label: 'ves-ar-extension:Click'
        }
      ],

      designTemplate: function (props) {
        return ('<!-- twxDtLabel -->');
      },

      runtimeTemplate: function (props) {
        var tmpl = template.replace("#widgetId#", props.widgetId);
        //console.log("twxDtLabel template string: " +  tmpl);
        return tmpl;
      }
    };

    return retObj;
  }

  function twxDtLabel() {
    var widget = Twx3dCommon.getWidget( 'ves-ar-extension:3D Label', newDtLabel );
    return widget;
  }

  twxAppBuilder.widget('twxDtLabel', twxDtLabel);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

(function(twxAppBuilder){

function newDtModel( widgetLabel ) {
  var ELEMENT_NAME = 'twx-dt-model';
  var overlay = {};

  /**
   * Display the sequence name instead of the pvi filename DT-10951
   * @param widget {Object} Widget instance, with properties and current values in the panel
   * @param data   {Object} Extra app info, key fileResources is an array of project resources available.
   * @returns {Array} resources
   */
  function getSequenceResources(widget, data) {
    //return any zip entries found in the file resources
    var modelVal = widget.properties.src.value;
    var result = [];
    if (modelVal && data.fileResources) {
      // dig out the pvz's pvi resource list from the given data.fileResources
      var recurse = function (entry) {
        if (entry.path === modelVal) {
          result = entry.subFiles;
        }
        else if (entry.children) {
          entry.children.forEach(recurse);
        }
      };
      data.fileResources.forEach(recurse);
      result = Array.isArray(result) ? result : [];
      if(result.length > 0) {
        var illustrationsVector = widget.$cvWidget ? widget.$cvWidget.GetIllustrations() : undefined;
        if(illustrationsVector && illustrationsVector.size() > 0) {
          // put the illustrations into key/value map using filename as key
          var illustrations = {};
          for (var i = 0, l = illustrationsVector.size(); i < l; i++) {
            var ill = illustrationsVector.get(i);
            illustrations[ill.filename] = ill;
          }
          // change each resource name from filename to display name
          result.forEach(function (resource) {
            // getSequenceResources can be called multiple times so store the original name for subsequent iterations
            resource._original_name = resource._original_name || encodeUtf8(resource.name);
            var illustration = illustrations[resource._original_name];
            if (illustration) {
              resource.name = decodeUtf8(illustration.name);
            } else {
              console.error('Unexpected state, unable to find illustration for resource ', resource, illustrations);
            }
          });
        }
      }
    }
    return result;
  }

  overlay.url = {
    name: 'src',
    label: 'ves-ar-extension:Resource',
    datatype: 'resource_url',
    allowedPatterns: ['.pvz', '.ol'],
    default: '',
    isBindingTarget: true,
    tFrag: 'ng-src="{{me.src | trustUrl}}" src="#src#"',
    sortOrder: 1
  };

  overlay.translucent = {
    name: 'translucent',
    label: 'ves-ar-extension:Item Translucence',
    datatype: 'boolean',
    default: false,
    isBindingTarget: true,
    sortOrder: 243,
    tFrag: 'phantom="{{!me.translucent}}" ',
    isVisible: false,
    isDeprecated: true
  };

  overlay.forceHidden = {
    name: 'forceHidden',
    label: 'ves-ar-extension:Force Hide',
    datatype: 'boolean',
    default: false,
    isBindingTarget: true,
    sortOrder: 180,
    isVisible: false,
    tFrag: 'force-hidden="{{me.forceHidden}}"'
  };

  overlay.sequenceList = {
    name: 'sequenceList',
    label: 'ves-ar-extension:Sequence List',
    datatype: 'infotable',
    isBindingTarget: false,
    isBindingSource: true,
    showInput: false,
    metadata: {
      Outputs: {
        fieldDefinitions: {
          name: {
            name: 'name',
            label: 'name',
            baseType: 'STRING'
          },
          filename: {
            name: 'filename',
            label: 'ves-ar-extension:filename',
            baseType: 'STRING'
          }
        }
      }
    },
    sortOrder: 300,
    isVisible: function(props, $scope){
      let projectSettings = $scope.$root.projectSettings || {};
      return projectSettings.projectType !== 'eyewear';
    }
  };

  overlay.sequence = {
    name: 'sequence',
    label: 'ves-ar-extension:Sequence',
    datatype: 'resource_url',
    editor: 'select_custom_labels',
    getResources: getSequenceResources,
    hideAddResourceAction: true,
    default: '',
    isBindingTarget: true,
    sortOrder: 310
  };

  overlay.sequence_in_cavas = {
    name: 'showSequenceInCanvas',
    label: 'ves-ar-extension:Apply sequence at design time',
    datatype: 'boolean',
    default: true,
    isBindingTarget: false,
    isBindingSource: false,
    sortOrder: 320
  };

  overlay.steps = {
    name: 'steps',
    label: 'ves-ar-extension:Steps',
    datatype: 'number',
    isBindingTarget: false,
    isBindingSource: true,
    sortOrder: 330,
    showInput: false
  };

  overlay.currentStep = {
    name: 'currentStep',
    label: 'ves-ar-extension:Current Step',
    datatype: 'number',
    isBindingTarget: true,
    isBindingSource: true,
    sortOrder: 340,
    showInput: false
  };

  overlay.stepName = {
    name: 'stepName',
    label: 'ves-ar-extension:Step Name',
    datatype: 'string',
    isBindingTarget: false,
    isBindingSource: true,
    sortOrder: 350,
    showInput: false,
    isVisible: function(props, $scope) { return ($scope.$root.builderSettings.exposeStepName);}
  };

  overlay.stepDescription = {
    name: 'stepDescription',
    label: 'ves-ar-extension:Step Description',
    datatype: 'string',
    isBindingTarget: false,
    isBindingSource: true,
    sortOrder: 360,
    showInput: false,
    isVisible: function(props, $scope) { return ($scope.$root.builderSettings.exposeStepName);}
  };

  overlay.playing = {
    name: 'playing',
    label: 'ves-ar-extension:Playing',
    datatype: 'boolean',
    isBindingTarget: false,
    isBindingSource: true,
    sortOrder: 370,
    showInput: false
  };

  overlay.sequencePartIds = {
    name: 'sequencePartIds',
    label: 'ves-ar-extension:Sequence Part Ids',
    datatype: 'string',
    isBindingTarget: false,
    isBindingSource: false,
    sortOrder: 380,
    showInput: false,
    isVisible: false
  };

  var services = [];

  services.push({
    name: 'forward',
    label: 'ves-ar-extension:Forward'
  });

  services.push({
    name: 'play',
    label: 'ves-ar-extension:Play'
  });

  services.push({
    name: 'playAll',
    label: 'ves-ar-extension:Play All'
  });

  services.push({
    name: 'reset',
    label: 'ves-ar-extension:Reset'
  });

  services.push({
    name: 'rewind',
    label: 'ves-ar-extension:Rewind'
  });

  services.push({
    name: 'stop',
    label: 'ves-ar-extension:Stop'
  });

  var events = [];

  events.push({
    name: 'playstarted',
    label: 'ves-ar-extension:Play Started'
  });

  events.push({
    name: 'playstopped',
    label: 'ves-ar-extension:Play Stopped'
  });

  events.push({
    name: 'modelLoaded',
    label: 'ves-ar-extension:Model Loaded'
  });

  events.push({
    name: 'click',
    label: 'ves-ar-extension:Click'
  });

  events.push({
    name: 'sequenceacknowledge',
    label: 'ves-ar-extension:Acknowledge Requested'
  });

  var removals = ['billboard'];
  var props = Twx3dCommon.new3dProps(overlay, removals);
  var isContainer = true;
  var template = Twx3dCommon.buildRuntimeTemplate(ELEMENT_NAME, props, undefined, { isContainer });

  var retObj = {
    elementTag: ELEMENT_NAME,

    isVisibleInPalette: true,

    category: 'ar',

    groups: ['Augmentations'],

    label: widgetLabel,

    isContainer: isContainer,

    properties: props,

    services: services,

    events: events,

    dependencies: function(info) {
      if(info.builderSettings.metadataEnabled) {
        return {files: ['Metadata.js', 'linq.js']};
      } else {
        return {};
      }
    },

    designTemplate: function (props) {
      return '<twx-container-content></twx-container-content>';
    },

    runtimeTemplate: function (props) {
      var tmpl = template.replace("#widgetId#", props.widgetId).replace('#src#', props.src);
      return tmpl;
    },

    delegate: function () {

      /**
       * @param element
       * @return Returns the widget controller for the given widget element
       */
      function getWidgetController (widgetEl) {
        return angular.element(widgetEl).data('_widgetController');
      }

      //Delete related model-items before removing model from thingview, fixes memory-ptr errors
      this.beforeDestroy = function (element, widgetCtrl) {
        var modelItems = element.parent().find('twx-dt-modelitem[data-model="'+widgetCtrl.widgetId+'"]');
        modelItems.each(function (index, el) {
          getWidgetController(el).remove();
        });
      };

      /**
       * Called whenever the properties are changed on the widget
       *
       * @param {object} widgetCtrl - The controller for the model widget
       * @param {object} currentProps - Map containing the current properties (and values) on the widget
       * @param {object} changedProps - Map containing the properties (and values) that changed
       * @param {object} oldProps - Map containing the old property values
       */
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // if the model's widget id changed, update the model items and the model targets
        if(changedProps.widgetId) {
          let newId = changedProps.widgetId;
          let oldId = (oldProps.widgetId) ? oldProps.widgetId.value : undefined;

          if(oldId) {
            let modelEl = widgetCtrl.element();

            // update the model propety on each model target that references the model
            let modelTargets = modelEl.parent().find('twx-dt-target-model[data-model="'+oldId+'"]');
            modelTargets.each(function (index, el) {
              let modelTargetCtrl = getWidgetController(el);
              modelTargetCtrl.setProp('model', newId);
            });

            // update the model propety on each model item that references the model
            let modelItems = modelEl.parent().find('twx-dt-modelitem[data-model="'+oldId+'"]');
            modelItems.each(function (index, el) {
              let modelItemCtrl = getWidgetController(el);
              modelItemCtrl.setProp('model', newId);
            });
          }
        }
      };

      return this;
    },

    acceptsDropElement: function (targetEl, sourceEl) {
      return sourceEl.tagName.toLowerCase() === 'twx-dt-modelitem';
    }
  };

  return retObj;
}

function twxDtModel() {
  var widget = Twx3dCommon.getWidget( 'Model', newDtModel );
  return widget;
}

/**
  * Encode unicode strings into utf8.  Strings passed from ThingView are utf8
  *
  * @param {string} s the unicode string
  * @returns {string} the string endcoded as utf8
  */
function encodeUtf8(s) { // jshint ignore:line
  return unescape(encodeURIComponent(s));
}

/**
  * Decode UTF8 strings into unicode.  Strings passed from ThingView are utf8
  *
  * @param {string} s the utf8 encoded string
  * @returns {string} the string as unicode
  */
function decodeUtf8(s) { // jshint ignore:line
  return decodeURIComponent(escape(s));
}

twxAppBuilder.widget('twxDtModel', twxDtModel);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

/**
 * Parsed the id path in format /0/0/1 - in other words a list of strings separated by /.
 *
 * @param {string} pathStr - the path string to be parsed.
 */
function parseIdPath(pathStr) {
  if (!pathStr) {
    return [];
  }

  if (pathStr instanceof Array) {
    return pathStr; // assume it's already been parsed
  }

  let parts = pathStr.split('/');
  return _.filter(parts, part => part !== '');
}

/**
 * Checks if an idpath is a child of another idpath. For instance path /0/1/2 will be a descendant of /0/1, but not of /0/2.
 *
 * @param {string[]} parent - the parent idpath.
 * @param {string[]} child - the potential child idpath to check.
 */
function isIdPathDescendant(parent, child) {
  if (child.length <= parent.length) {
    return false;
  }

  for (let i = 0; i < parent.length; i++) {
    if (parent[i] !== child[i]) {
      return false;
    }
  }

  return true;
}

function getAllModelItemsFromIdPath(modelItems, idpath) {
  // Cannot use model.GetModelItemFromIdPath because it will just return the first one and since validation is broken there can be more.
  return _.filter(modelItems, item => _.isEqual(parseIdPath(item.getProp('idpath')), idpath));
}

/**
 * Returns all controllers of model items belonging to specified model.
 */
function getAllModelItems(modelId) {
  let modelCtrl = angular.element(`twx-dt-model[widget-id="${modelId}"]`).data('_widgetController');
  // Sometimes $cvWidget is not available so we need to search the DOM. At other times, DOM will not be completely up to date so it's best
  // to take modelItems from controller.
  if (modelCtrl && modelCtrl.$cvWidget) {
    return _.map(modelCtrl.$cvWidget.modelItems, 'ctrlWidget');
  } else {
    return _.map(document.querySelectorAll(`twx-dt-modelitem[data-model="${modelId}"]`),
        itemElem => angular.element(itemElem).data('_widgetController'));
  }
}

function isIdpathConfilictingWithAnotherModelItem(modelId, widgetId, idpath) {
  let allModelItems = getAllModelItems(modelId);
  let otherModelItems = getAllModelItemsFromIdPath(allModelItems, idpath);
  let conflictingModelItem = _.find(otherModelItems, other => other && other.getProp('widgetId') !== widgetId);
  if (conflictingModelItem) {
    console.warn(`New widget ${widgetId} idpath is conflicting with ${conflictingModelItem.getProp('widgetId')}, idpath: ${idpath}`);
  }

  return !!conflictingModelItem;
}

function newDtModelitem( widgetLabel ) {
  var ELEMENT_NAME = 'twx-dt-modelitem';
  var overlay = {};

  overlay.model = {
      name: 'model',
      label: 'ves-ar-extension:Model Widget ID',
      datatype: 'string',
      default: '',
      isBindingTarget: false,
      sortOrder: 1,
      readonly: true,
      tFrag: 'for="#model#" '
  };

  overlay.idpath = {
      name: 'idpath',
      label: 'ves-ar-extension:Component Occurrence',
      datatype: 'string',
      default: '',
      isBindingTarget: false,
      sortOrder: 2,
      tFrag: 'occurrence="#idpath#" ',
      validator: (value, oldValue, widget) => {
        return !isIdpathConfilictingWithAnotherModelItem(widget.getProp('model'), widget.getProp('widgetId'), parseIdPath(value));
      }
  };

  overlay.texture = {
      name: 'texture',
      label: 'ves-ar-extension:Texture',
      datatype: 'resource_url',
      default: '',
      isBindingTarget: true,
      isVisible: false
  };

  overlay.color = {
      name: 'color',
      label: 'ves-ar-extension:Color',
      datatype: 'color',
      default: '',
      isBindingTarget: true
  };

  overlay.translucent = {
    name: 'translucent',
    label: 'ves-ar-extension:Item Translucence',
    datatype: 'boolean',
    default: false,
    isBindingTarget: true,
    sortOrder: 243,
    tFrag: 'phantom="{{!me.translucent}}" ',
    isVisible: false,
    isDeprecated: true
  };

  overlay.forceHidden = {
    name: 'forceHidden',
    label: 'ves-ar-extension:Force Hide',
    datatype: 'boolean',
    default: false,
    isBindingTarget: true,
    sortOrder: 180,
    isVisible: false,
    tFrag: 'force-hidden="{{me.forceHidden}}"'
  };

  var removals = ['billboard'];
  var props = Twx3dCommon.new3dProps(overlay, removals);
  var isContainer = true;
  var template = Twx3dCommon.buildRuntimeTemplate(ELEMENT_NAME, props, undefined, { isContainer });

  var retObj = {
    elementTag: ELEMENT_NAME,

    isVisibleInPalette: true,

    category: 'ar',

    groups: ['Augmentations'],

    label: widgetLabel,

    allowCopy: false,  //Until its a child of model, its too problematic to copy/paste them

    isContainer: isContainer,

    properties: props,

    events: [
      {
        name: 'click',
        label: 'ves-ar-extension:Click'
      }
    ],

    designTemplate: function (props) {
      return '<twx-container-content></twx-container-content>';
    },

    runtimeTemplate: function (props) {
      var tmpl = template.replace("#widgetId#", props.widgetId);
      var tmpl2 = tmpl.replace("#model#", props.model);
      var tmpl3 = tmpl2.replace("#idpath#", props.idpath);
      //console.log("twxDtModelitem template string: %s",tmpl);
      return tmpl3;
    },

    isValidDropTarget: function (targetEl, sourceEl) {
      let tagName = targetEl.tagName.toLowerCase();
      if (tagName === 'twx-dt-model' || tagName === 'twx-dt-modelitem') {
        sourceEl = angular.element(sourceEl);
        targetEl = angular.element(targetEl);
        let targetId = targetEl.data('_widgetController').widgetId;

        // First check if source isn't a child of another model item.
        let modelItemParent = sourceEl.parents('twx-dt-modelitem').first();
        if (modelItemParent.length > 0) {
          return modelItemParent.data('_widgetController').widgetId === targetId;
        }

        // It must be a child of a model, so check for that.
        let parentId = sourceEl.data('_widgetController').properties.model.value;
        return parentId === targetId;
      }

      return false;
    },

    acceptsDropElement: function (targetEl, sourceEl) {
      return sourceEl.tagName.toLowerCase() === 'twx-dt-modelitem';
    },

    delegate: function () {
      function findBestContainerFor(applicableModelItems, modelId, childIdpath) {
        childIdpath = parseIdPath(childIdpath);
        let best = null;
        let bestId = null;
        applicableModelItems.forEach(itemCtrl => {
          let idpath = parseIdPath(itemCtrl.getProp('idpath'));

          // Looking not only for fitting model item, but also the one that has the longest idpath.
          if (!_.isEqual(childIdpath, idpath) && isIdPathDescendant(idpath, childIdpath) && (!best || best.length < idpath.length)) {
            best = idpath;
            bestId = itemCtrl.getProp('widgetId');
          }
        });

        // If no model item was found that could contain childIdpath just return the model itself as the only valid container.
        return bestId || modelId;
      }

      function moveToBestContainerInModel(modelItemCtrl, modelItems, modelId, idpath) {
        let bestContainerId = findBestContainerFor(modelItems, modelId, idpath);
        modelItemCtrl.moveToContainer(bestContainerId);
      }

      function placeWidgetInContainerAfterCreate(widgetCtrl) {
        let idpath = widgetCtrl.getProp('idpath');
        if (idpath) {
          let modelId = widgetCtrl.getProp('model');
          let modelItems = getAllModelItems(modelId);
          moveToBestContainerInModel(widgetCtrl, modelItems, modelId, idpath);
        }
      }

      function updateAllModelItemContainersBasedOnIdPaths(modelId) {
        let modelItems = getAllModelItems(modelId);
        modelItems.forEach(modelItem => {
          let idpath = parseIdPath(modelItem.getProp('idpath'));
          moveToBestContainerInModel(modelItem, modelItems, modelId, idpath);
        });
      }

      function updateChildrenFromIdPath(widgetCtrl, idpath) {
        idpath = parseIdPath(idpath);
        let changedWidgetId = widgetCtrl.getProp('widgetId');
        let modelId = widgetCtrl.getProp('model');
        if (isIdpathConfilictingWithAnotherModelItem(modelId, changedWidgetId, idpath)) {
          // Because validation lets incorrect values through we have to check if the idpath is valid here again and bail if it's not right.
          return;
        }

        updateAllModelItemContainersBasedOnIdPaths(modelId);
      }

      /**
       * Called whenever the properties are changed on the widget
       *
       * @param {object} widgetCtrl - The controller for the model item widget
       * @param {object} currentProps - Map containing the current properties (and values) on the widget
       * @param {object} changedProps - Map containing the properties (and values) that changed
       * @param {object} oldProps - Map containing the old property values
       */
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        if (changedProps.idpath) {
          updateChildrenFromIdPath(widgetCtrl, changedProps.idpath);
        }
      };

      /**
       * Called after the widget was created and the 3d model was loaded.
       *
       * @param {object} widgetCtrl - The controller for the model item widget
       */
      this.widgetCreatedAndLoaded = function (widgetCtrl) {
        // Model item is initially placed in the 3d object container as it's created before the 3d object is loaded.
        // Only now that the 3d object is loaded we know to which model the model item should really belong, so it has to be moved there.
        placeWidgetInContainerAfterCreate(widgetCtrl);
      };

      return this;
    }
  };

  return retObj;
}

function twxDtModelitem() {
  var widget = Twx3dCommon.getWidget( 'Model Item', newDtModelitem );
  return widget;
}

twxAppBuilder.widget('twxDtModelitem', twxDtModelitem);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function newDtSensor( widgetLabel ) {
    var ELEMENT_NAME = 'twx-dt-sensor';
    var properties = [
      {
        name: 'src',
        label: 'ves-ar-extension:Resource',
        datatype: 'resource_url',
        resource_image: true,
        default: 'Default/vu_gauge1.svg',
        allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
        isBindingTarget: true,
        alwaysWriteAttribute: true,
        sortOrder: 2,
        inlineForOffline: true
      },
      {
        name: 'text',
        label: 'ves-ar-extension:Text',
        datatype: 'string',
        default: '###',
        isBindingTarget: true,
        sortOrder: 1,
        defaultDependentField: true
      },
      {
        name: 'font',
        label: 'ves-ar-extension:Font',
        datatype: 'string',
        default: 'Arial',
        isBindingTarget: true,
        sortOrder: 10
      },
      {
        name: 'fontsize',
        label: 'ves-ar-extension:Font Size',
        datatype: 'string',
        default: '40px',
        isBindingTarget: true,
        alwaysWriteAttribute: true,
        sortOrder: 11
      },
      {
        name: 'canvasgrowthoverride',
        label: 'ves-ar-extension:Canvas Growth Override',
        datatype: 'string',
        default: 'image+text',
        isBindingTarget: true,
        editor: 'select',
        options: [
          {label: 'ves-ar-extension:Canvas grows with text size', value: 'text'},
          {label: 'ves-ar-extension:Canvas grows with image Size', value: 'image'},
          {label: 'ves-ar-extension:Canvas grows with image and text sizes', value: 'image+text'},
          {label: 'ves-ar-extension:No Override', value: 'canvas'}
        ],
        sortOrder: 122
      },
      {
        name: 'canvasheight',
        label: 'ves-ar-extension:Canvas Height',
        datatype: 'number',
        default: 128.0,
        isBindingTarget: false,
        alwaysWriteAttribute: true,
        sortOrder: 123
      },
      {
        name: 'canvaswidth',
        label: 'ves-ar-extension:Canvas Width',
        datatype: 'number',
        default: 128.0,
        isBindingTarget: false,
        alwaysWriteAttribute: true,
        sortOrder: 124
      },
      {
        name: 'imagex',
        label: 'ves-ar-extension:X coord of Image w/r/t Canvas',
        datatype: 'number',
        default: 0,
        isBindingTarget: true,
        sortOrder: 120
      },
      {
        name: 'imagey',
        label: 'ves-ar-extension:Y coord of Image w/r/t Canvas',
        datatype: 'number',
        default: 0,
        isBindingTarget: true,
        sortOrder: 121
      },
      {
        name: 'imageattrs',
        label: 'ves-ar-extension:Image Attributes',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        sortOrder: 20,
        isVisible: false
      },
      {
        name: 'textx',
        label: 'ves-ar-extension:X coord of Text w/r/t Canvas',
        datatype: 'number',
        default: 64,
        isBindingTarget: true,
        alwaysWriteAttribute: true,
        sortOrder: 13
      },
      {
        name: 'texty',
        label: 'ves-ar-extension:Y coord of Text w/r/t Canvas',
        datatype: 'number',
        default: 94,
        isBindingTarget: true,
        alwaysWriteAttribute: true,
        sortOrder: 14
      },
      {
        name: 'textattrs',
        label: 'ves-ar-extension:Text Attributes',
        datatype: 'string',
        default: 'fill:rgba(255, 255, 255, 1);textbaseline:middle;textalign:center',
        isBindingTarget: true,
        alwaysWriteAttribute: true,
        sortOrder: 12
      },
      {
        name: 'billboard',
        label: 'ves-ar-extension:Billboard',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true,
        alwaysWriteAttribute: true,
        sortOrder: 200
      }
    ];

    properties = addStateFormattingProperties(properties, 12.5);

    properties.push(Twx3dCommon.getPivotProperty());
    properties.push(Twx3dCommon.getWidthProperty());
    properties.push(Twx3dCommon.getHeightProperty());
    properties.push(Twx3dCommon.getOneSidedProperty());

    var overlay = Twx3dCommon.arrayToMap(properties);

    var props = Twx3dCommon.new3dProps(overlay);

    var retObj = {
      elementTag: ELEMENT_NAME,

      isVisibleInPalette: true,

      category: 'ar',

      groups: ['Augmentations'],

      label: widgetLabel,

      isContainer: false,

      properties: props,

      events: [
        {
          name: 'click',
          label: 'ves-ar-extension:Click'
        }
      ],

      isBuildRequired: function( changedProps ) {
        if (changedProps === undefined) {
          return false;
        }
        var changedPropKeys = Object.keys(changedProps);

        if (changedPropKeys.length === 0) {
          return false;
        }

        for (var i=0; i < changedPropKeys.length; i++) {
          var currentKey = changedPropKeys[i];
          //if any of the changed props show up in overlay return true
          if (overlay[currentKey] !== undefined) {
            return true;
          }
        }
      },

      designTemplate: function (props) {
        return ('<!-- 3dSensor -->');
      },

      runtimeTemplate: function (props) {
        // no longer builds textattrs or imageattrs live here

        var tmpl = '<' + ELEMENT_NAME + ' ' +
            'id="' + props.widgetId + '" ' +
            'x="{{me.x}}" ' +
            'y="{{me.y}}" ' +
            'z="{{me.z}}" ' +
            'rx="{{me.rx}}" ' +
            'ry="{{me.ry}}" ' +
            'rz="{{me.rz}}" ' +
            'sx="{{me.scale.split(\' \')[0] || me.scale}}" ' +
            'sy="{{me.scale.split(\' \')[1] || me.scale}}" ' +
            'sz="{{me.scale.split(\' \')[2] || me.scale}}" ' +
            'billboard="{{me.billboard}}" ' +
            'occlude="{{me.occlude}}" ' +
            'opacity="{{me.opacity}}" ' +
            'pivot="{{me.pivot}}" ' +
            'decal="{{me.decal}}" ' +
            'canvasheight="{{me.canvasheight}}" ' +
            'canvaswidth="{{me.canvaswidth}}" ' +
            'height="{{me.height}}" ' +
            'width="{{me.width}}" ' +
            'imageattrs="{{app.fn.buildImageAttrs(me.imagex,me.imagey,me.imageattrs)}}" ' +
            'textattrs="{{app.fn.buildTextAttrs(me.textx,me.texty,me.font,me.fontsize,me.textattrs)}}" ' +
            'canvasgrowthoverride="{{me.canvasgrowthoverride}}" ' +
            'textx="{{me.textx}}" ' +
            'texty="{{me.texty}}" ' +
            'imagex="{{me.imagex}}" ' +
            'imagey="{{me.imagey}}" ' +
            'text="{{me.text}}" ' +
            'ng-src="{{me.src | trustUrl}}" src="' + props.src + '" ' +
            'shader="{{me.shader}}" ' +
            'hidden="{{!app.fn.isTrue(me.visible)}}" ' +
            'experimental-one-sided="{{me.experimentalOneSided}}"/>';
        //console.log("twxArSensor.runtimeTemplate: " + tmpl);
        return tmpl;
      }
    };
    return retObj;
  }

  function findAndAssignPropertyDefault(obj, name, value) {
    var prop = _.find(obj.properties, {name: name});
    prop.default = value;
  }

  function twxDtSensor(project) {
    var sensor = Twx3dCommon.getWidget( 'ves-ar-extension:3D Gauge', newDtSensor );

    if (project && project.projectType === 'eyewear') {
      sensor = _.cloneDeep(sensor);
      findAndAssignPropertyDefault(sensor, 'fontsize', '80px');
      findAndAssignPropertyDefault(sensor, 'textx', 128);
      findAndAssignPropertyDefault(sensor, 'texty', 188);
      findAndAssignPropertyDefault(sensor, 'canvaswidth', 256.0);
      findAndAssignPropertyDefault(sensor, 'canvasheight', 256.0);
    }
    return sensor;
  }

  twxAppBuilder.widget('twxDtSensor', twxDtSensor);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function newTwxDtSpatialMap( widgetLabel ) {
    const ELEMENT_NAME = 'twx-dt-spatial-map';
    const overlay = {};

    let posProps = ['x', 'y', 'z'];
    posProps.forEach( function(element) {
      overlay[element] = Twx3dCommon.common3dProp(element);
      overlay[element].default = 0;
      overlay[element].alwaysWrittenAttribute = true;
      overlay[element].isVisible = false;
    });

    overlay.anchorsrc = {
      name: 'anchorsrc',
      label: 'ves-ar-extension:Resource',
      datatype: 'resource_url',
      allowedPatterns: ['.bin'],
      default: '',
      isVisible: true,
      tFrag: 'src="{{\'spatial-anchor:///\' + me.anchorsrc + \'?id=\' + me.anchorguid}}"',
      sortOrder: 1
    };

    overlay.anchorguid = {
      name: 'anchorguid',
      label: 'ves-ar-extension:target Anchor Guid',
      datatype: 'string',
      default: '',
      isVisible: false,
      tFrag: '',
      sortOrder: 2
    };

    overlay.translucent = {
      name: 'translucent',
      label: 'ves-ar-extension:Item Translucence',
      datatype: 'boolean',
      default: true,
      isBindingTarget: true,
      sortOrder: 243,
      tFrag: 'phantom="{{!me.translucent}}" ',
      isVisible: false,
      isDeprecated: true
    };

    overlay.url = {
      name: 'src',
      label: 'ves-ar-extension:Resource',
      datatype: 'resource_url',
      allowedPatterns: ['.obj'],
      default: '',
      isVisible: false,
      sortOrder: 3
    };

    var removals = ['decal', 'billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale', 'width'];
    var props = Twx3dCommon.new3dProps(overlay, removals);
    var template = Twx3dCommon.buildRuntimeTemplate(TargetUtils.TARGET_ELEMENT_TAG, props, true);

    var retObj = {
      elementTag: ELEMENT_NAME,

      label: widgetLabel,

      isVisibleInPalette: function(scope) {
        let projectSettings = scope.$root.currentProject || {};
        let builderSettings = scope.$root.builderSettings || {};
        return projectSettings.projectType === 'eyewear' && !!builderSettings.hopper;
      },

      category: 'ar',

      isContainer: false,

      properties: props,

      designTemplate: function (props) {
        return ('<!-- twxDtSpatialMap -->');
      },

      runtimeTemplate: function (props) {
        var tmpl = template.replace("#widgetId#", props.widgetId);
        return tmpl;
      }
    };
    return retObj;
  }

  function twxDtSpatialMap() {
    var widget = Twx3dCommon.getWidget( 'Spatial Map', newTwxDtSpatialMap );
    return widget;
  }
  twxAppBuilder.widget('twxDtSpatialMap', twxDtSpatialMap);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

var TargetUtils = (function ( me ) {
  let registeredTargets = [];

  me.TARGET_ELEMENT_TAG = 'twx-dt-target';

  /**
   * Registers the widget definition as a target/tracking widget, this will be used to lookup the targets (if any) in the canvas
   * to determine if the target widget can be added to the canvas during design time.
   *
   * @param widgetDef
   */
  me.registerWidgetAsTarget = function (widgetDef) {
    if(!registeredTargets.includes(widgetDef.elementTag)) {
      registeredTargets.push(widgetDef.elementTag);
    }
  };

  /**
   * Verify the target widget can be added to the canvas. If a target widget already exists, a confirmation dialog is displayed
   * to the user allowing them to replace the current target widget with the new instance or to cancel out of the operation.
   *
   * @return {Promise} Promise is resolved when the target widget is allowed to be added, otherwise it is rejected.
   * @param widgetCtrl Controller for the backing widget
   */
  me.canTargetBeAdded = function(widgetCtrl) {
    return new Promise(function (resolve, reject) {
      let currentTargets = widgetCtrl.element().closest('twx-dt-view').find(registeredTargets.join(','));

      if (currentTargets.length > 0 && currentTargets[0].getAttribute("widget-id") !== widgetCtrl.widgetId) {
        // there is another target already on the canvas, display a confirmation dialog to replace it with this one
        var title = i18next.t('ves-ar-extension:Replace Target Confirmation Title');
        var message = i18next.t('ves-ar-extension:Replace Target Confirmation Message', {widgetId: currentTargets.attr('widget-id')});
        widgetCtrl.showConfirmationDialog(title, message).then(function (canAdd) {
          if (canAdd) {
            // remove the current target widget and allow this new instance of the widget to be added
            angular.element(currentTargets).data('_widgetController').remove();
            resolve(canAdd);
          } else {
            reject(i18next.t('ves-ar-extension:Replace Target Log Message'));
          }
        }, reject);
      } else {
        // no targets added to the canvas yet, allow this instance to be added
        resolve(true);
      }
    });
  };

  return me;
}( TargetUtils || {} ));

(function(twxAppBuilder){

  function newTwxDtTarget( widgetLabel ) {
    var overlay = {};

    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.rx.default = -90;
    overlay.rx.alwaysWriteAttribute = true; // this flag is needed for any defaults different from the browser defaults

    overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/placeholder_thingmark.png');

    overlay.markerid = {
      name: 'markerId',
      label: 'ves-ar-extension:ThingMark',
      datatype: 'string',
      default: '',
      placeholder: 'ves-ar-extension:ThingMark ID Placeholder',
      isBindingTarget: true,
      tFrag: 'src="{{\'vuforia-vumark:///vumark?id=\' + me.markerId}}" guide-src="app/resources/Default/thing_code_phantom.png"',
      sortOrder: 1
    };

    overlay.width = {
      name: 'width',
      label: 'ves-ar-extension:Marker Width',
      datatype: 'number',
      default: 0.0254,
      isBindingTarget: true,
      alwaysWriteAttribute: true,
      tFrag: 'size="{{me.width}}"',
      min: 0,
      sortOrder: 2
    };

    overlay.istracked = {
      name: 'istracked',
      label: 'ves-ar-extension:Tracked',
      datatype: 'boolean',
      default: false,
      isBindingSource: true,
      isBindingTarget: false,
      sortOrder: 2000
    };

    overlay.trackingIndicator = {
      name: 'trackingIndicator',
      label: 'ves-ar-extension:Display Tracking Indicator',
      datatype: 'boolean',
      default: true,
      isBindingSource: false,
      isBindingTarget: false,
      alwaysWriteAttribute: true,
      sortOrder: 3000
    };

    overlay.stationary = {
      name: 'stationary',
      label: 'ves-ar-extension:Stationary',
      datatype: 'boolean',
      default: true,
      isBindingSource: false,
      isBindingTarget: false,
      sortOrder: 4000,
      isVisible: function(props, $scope){
        let projectSettings = $scope.$root.projectSettings || {};
        return projectSettings.projectType === 'eyewear';
      }
    };

    var removals = ['billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale'];

    var props = Twx3dCommon.new3dProps(overlay, removals);

    //Decal should be a property that only applies to the image runtime template.
    var decal;
    var i = props.length;
    while (i--) {
      if (props[i].name === 'decal') {
        decal = props.splice(i, 1)[0];
      }
    }
    var template = Twx3dCommon.buildRuntimeTemplate(TargetUtils.TARGET_ELEMENT_TAG, props, true);
    props.push(decal);

    removals = ['markerid', 'width', 'opacity', 'istracked'];
    overlay.url = {
      name: 'url',
      tFrag: 'src="img/recognised.png?name=sampler0 img/recognised2.png?name=sampler1"'
    };
    overlay.shader = Twx3dCommon.common3dProp('shader');
    overlay.shader.tFrag = 'shader="recogniser;active f {{pulse}}"';
    overlay.sx = Twx3dCommon.common3dProp('scale');
    // 4.51 = 1000*hexagonHeightWidthRatio/256, where 256 is the height of the hexagon image (recognised2.png) in pixels.
    overlay.sx.tFrag = 'sx = "{{me.width*4.51}}"';
    overlay.sy = Twx3dCommon.common3dProp('scale');
    overlay.sy.tFrag = 'sy = "{{me.width*4.51}}"';
    overlay.sz = Twx3dCommon.common3dProp('scale');
    overlay.sz.tFrag = 'sz = "{{me.width*4.51}}"';
    overlay.visible = Twx3dCommon.common3dProp('visible');
    overlay.visible.tFrag = 'hidden="{{!me.trackingIndicator}}"';
    overlay.decal = Twx3dCommon.common3dProp('decal');
    template += Twx3dCommon.buildRuntimeTemplate('twx-dt-image', Twx3dCommon.new3dProps(overlay, removals), true);

    var retObj = {
      elementTag: TargetUtils.TARGET_ELEMENT_TAG,

      label: widgetLabel,

      isVisibleInPalette: true,

      category: 'ar',

      groups: ['Targets'],

      isContainer: false,

      properties: props,

      canBeAdded: function (ctrl, $scope) {
        return TargetUtils.canTargetBeAdded(ctrl);
      },

      defaultBindings:  [{
        sourceType: 'data',
        sourceName: 'vumark',
        sourceItemType: 'value',
        sourceItemName: 'vumark',
        sourcePath: "app.params['vumark']",
        targetType: 'widget',
        toProperty: 'markerId',
        bindingType: 'custom_field'
      }],
      events: [
        {
          name: 'trackingacquired',
          label: 'ves-ar-extension:Tracking Acquired'
        },
        {
          name: 'trackinglost',
          label: 'ves-ar-extension:Tracking Lost'
        }
      ],

      designTemplate: function (props) {
        return ('<!-- twxDtTarget -->');
      },

      runtimeTemplate: function (props) {
        var tmpl = template.replace("#widgetId#", props.widgetId);
        tmpl = tmpl.replace("#widgetId#", props.widgetId + '-image'); // replace the twx-dt-image id
        return tmpl;
      }
    };
    TargetUtils.registerWidgetAsTarget(retObj);

    return retObj;
  }

  function twxDtTarget() {
    var widget = Twx3dCommon.getWidget( 'ThingMark', newTwxDtTarget );
    return widget;
  }
  twxAppBuilder.widget('twxDtTarget', twxDtTarget);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function newTwxDtTargetImage() {
    var ELEMENT_NAME = 'twx-dt-target-image';
    var overlay = {};

    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.rx.default = -90;
    overlay.rx.alwaysWriteAttribute = true; // this flag is needed for any defaults different from the browser defaults

    overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/placeholder_img_target.svg');

    overlay.url = {
        name: 'url',
        label: 'ves-ar-extension:Image',
        allowedPatterns: ['.png', '.jpg', '.jpeg'],
        datatype: 'resource_url',
        resource_image: true,
        tFrag: 'guide-src="{{me.url || me.placeholder_img }}"',
        sortOrder: 1
    };

    overlay.dataset = {
      name: 'dataset',
      datatype: 'resource_url',
      default: '',
      resource_url: true,
      allowedPatterns: ['.dat'],
      tFrag: 'src="#_src_#"',
      isVisible: false
    };

    overlay.width = {
      name: 'width',
      label: 'ves-ar-extension:Marker Width',
      datatype: 'number',
      default: 0.0254,
      isBindingTarget: true,
      alwaysWriteAttribute: true,
      tFrag: 'size="{{me.width}}"',
      sortOrder: 3
    };

    overlay.istracked = {
      name: 'istracked',
      label: 'ves-ar-extension:Tracked',
      datatype: 'boolean',
      default: false,
      isBindingSource: true,
      isBindingTarget: false,
      sortOrder: 2000
    };

    overlay.trackingIndicator = {
      name: 'trackingIndicator',
      label: 'ves-ar-extension:Display Tracking Indicator',
      datatype: 'boolean',
      default: true,
      isBindingSource: false,
      isBindingTarget: false,
      alwaysWriteAttribute: true,
      sortOrder: 3000
    };

    overlay.stationary = {
      name: 'stationary',
      label: 'ves-ar-extension:Stationary',
      datatype: 'boolean',
      default: true,
      isBindingSource: false,
      isBindingTarget: false,
      sortOrder: 4000,
      isVisible: function(props, $scope){
        let projectSettings = $scope.$root.projectSettings || {};
        return projectSettings.projectType === 'eyewear';
      }
    };

    overlay.targetId = {
      name: 'targetId',
      label: 'Target ID',
      readonly: true,
      datatype: 'string',
      isVisible: false
    };

    var removals = ['billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale', 'decal'];

    var props = Twx3dCommon.new3dProps(overlay, removals);
    var template = Twx3dCommon.buildRuntimeTemplate(TargetUtils.TARGET_ELEMENT_TAG, props, true);

    removals = ['markerid', 'opacity', 'istracked', 'trackingIndicator'];
    overlay.url = {
      name: 'url',
      tFrag: 'src="img/recognisedSquare.png?name=gradientSampler"'
    };
    overlay.shader = Twx3dCommon.common3dProp('shader');
    overlay.shader.tFrag = 'shader="imageRecogniser;active f {{pulse}}; imageWidth f {{tracerWidth}}; imageHeight f {{tracerHeight}}"';
    overlay.width = Twx3dCommon.getWidthProperty();
    overlay.width.tFrag = 'width="{{me.width}}"';
    overlay.height = Twx3dCommon.getHeightProperty();
    overlay.height.tFrag = 'height="{{me.width}}"';
    overlay.sx = Twx3dCommon.common3dProp('scale');
    overlay.sx.tFrag = 'sx = "1"';
    overlay.sy = Twx3dCommon.common3dProp('scale');
    overlay.sy.tFrag = 'sy = "1"';
    overlay.sz = Twx3dCommon.common3dProp('scale');
    overlay.sz.tFrag = 'sz = "1"';
    overlay.visible = Twx3dCommon.common3dProp('visible');
    overlay.visible.tFrag = 'hidden="{{!me.trackingIndicator}}"';
    overlay.decal = Twx3dCommon.common3dProp('decal');

    template += Twx3dCommon.buildRuntimeTemplate('twx-dt-image', Twx3dCommon.new3dProps(overlay, removals), '#widgetTracerId#');

    var retObj = {
      elementTag: ELEMENT_NAME,
      label:  'ves-ar-extension:Image Target',
      canBeAdded: function (ctrl, $scope) {
        return TargetUtils.canTargetBeAdded(ctrl);
      },
      category: 'ar',
      groups: ['Targets'],
      isContainer: false,
      properties: props,
      events: [
        {
          name: 'trackingacquired',
          label: 'ves-ar-extension:Tracking Acquired'
        },
        {
          name: 'trackinglost',
          label: 'ves-ar-extension:Tracking Lost'
        }
      ],

      designTemplate: function (props) {
        return ('<!-- twxDtTargetImage -->');
      },

      runtimeTemplate: function (props) {
        var tmpl = template.replace(new RegExp("#widgetId#", 'g'), props.widgetId);
        tmpl = tmpl.replace(new RegExp("#widgetTracerId#", 'g'), props.widgetId + '-targetTracer');

        // strip off .dat extension: 'app/resources/Uploaded/DB2.dat' -> 'app/resources/Uploaded/DB2'
        var data = props.dataset.replace(/\.[^\.]*$/, '');

        // result is like: src="vuforia-image:///app/resources/Uploaded/DB2?id=56aa7377-371d-4620-8938-ca360558abd6"
        var finalReplacement = 'vuforia-image:///' + data + '?id=' + props.targetId;
        tmpl = tmpl.replace('#_src_#', finalReplacement);
        return tmpl;
      }
    };
    TargetUtils.registerWidgetAsTarget(retObj);

    return retObj;
  }

  function twxDtTargetImage() {
    var widget = Twx3dCommon.getWidget( 'Image Target', newTwxDtTargetImage );
    return widget;
  }
  twxAppBuilder.widget('twxDtTargetImage', twxDtTargetImage);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

    function newTwxDtTargetModel(widgetLabel) {
        var ELEMENT_NAME = 'twx-dt-target-model';
        var overlay = {};

        overlay.rx = Twx3dCommon.common3dProp('rx');
        overlay.rx.default = -90;
        overlay.rx.alwaysWriteAttribute = true; // this flag is needed for any defaults different from the browser defaults
        overlay.ry = Twx3dCommon.common3dProp('ry');
        overlay.rz = Twx3dCommon.common3dProp('rz');
        overlay.rx.isVisible = false; // user cannot rotate Model marker
        overlay.rx.isBindingTarget = false;
        overlay.ry.isVisible = false;
        overlay.ry.isBindingTarget = false;
        overlay.rz.isVisible = false;
        overlay.rz.isBindingTarget = false;
        overlay.x = Twx3dCommon.common3dProp('x');
        overlay.x.isVisible = false;
        overlay.x.isBindingTarget = false;
        overlay.y = Twx3dCommon.common3dProp('y');
        overlay.y.isVisible = false;
        overlay.y.isBindingTarget = false;
        overlay.z = Twx3dCommon.common3dProp('z');
        overlay.z.isVisible = false;
        overlay.z.isBindingTarget = false;
        overlay.z.default = 0;

        overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/placeholder_model_target.svg');
        overlay.url = {
            name: 'url',
            label: 'ves-ar-extension:Image',
            datatype: 'resource_url',
            resource_image: true,
            allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
            isVisible: false,
            tFrag: 'guide-src="{{me.url}}"',
            sortOrder: 1
        };

        overlay.istracked = {
            name: 'istracked',
            label: 'ves-ar-extension:Tracked',
            datatype: 'boolean',
            default: false,
            isBindingSource: true,
            isBindingTarget: false,
            sortOrder: 2000
        };

        overlay.dataset = {
            name: 'dataset',
            label: 'ves-ar-extension:Data Set',
            datatype: 'resource_url',
            default: '',
            resource_url: true,
            allowedPatterns: ['.dat'],
            tFrag: 'src="#_src_#"',
            sortOrder: 2,
            isVisible: false
        };

        overlay.size = {
          name: 'size',
          label: 'Target Size',
          datatype: 'number',
          isVisible: false
        };

        var removals = ['billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale', 'decal'];
        var props = Twx3dCommon.new3dProps(overlay, removals);
        var services = [];

        var template = Twx3dCommon.buildRuntimeTemplate(TargetUtils.TARGET_ELEMENT_TAG, props, true);

        var retObj = {
            elementTag: ELEMENT_NAME,
            label: 'ves-ar-extension:Model Target',
            category: 'ar',
            groups: ['Targets'],
            isContainer: false,
            canBeAdded: function (ctrl, $scope) {
              return TargetUtils.canTargetBeAdded(ctrl);
            },
            properties: props.concat([
              {
                name: 'model',
                label: 'ves-ar-extension:Model Widget ID',
                readonly: true,
                datatype: 'string',
                default: '',
                isBindingTarget: false,
                sortOrder: 1
              },
              {
                name: 'detectionPosition',
                label: 'ves-ar-extension:Detection Position',
                editor: 'detection_canvas',
                datatype: 'json',
                alwaysWriteAttribute: true,
                default: {globalPosition: {x:0.0, y:0.0, z:0.0}, axisAngle: {x: 0.0, y:0.0, z:0.0, w:0.0}},
                isBindingTarget: false,
                sortOrder: 100
              },
              {
                name: 'targetId',
                label: 'Target ID',
                readonly: true,
                datatype: 'string',
                isVisible: false
              }
            ]),
            services: services,
            events: [
                {
                    name: 'trackingacquired',
                    label: 'ves-ar-extension:Tracking Acquired'
                },
                {
                    name: 'trackinglost',
                    label: 'ves-ar-extension:Tracking Lost'
                }
            ],

            designTemplate: function (props) {
                return ('<!-- twxDtTargetModel -->');
            },

            runtimeTemplate: function (props) {
                var tmpl = template.replace("#widgetId#", props.widgetId);

                // strip off .dat extension: 'app/resources/Uploaded/DB2.dat' -> 'app/resources/Uploaded/DB2'
                var data = props.dataset ? props.dataset.replace(/\.[^\.]*$/, '') : '';
                // result is like: src="vuforia-model:///app/resources/Uploaded/DB2?id=T1"
                tmpl = tmpl.replace('#_src_#', 'vuforia-model:///' + data + '?id=' + props.targetId);
                return tmpl;
            },
            // Returns a delegate constructor
          delegate: function () {
            let ctrl;

            this.init = function (element, widgetCtrl) {
              ctrl = widgetCtrl;
            };

            /**
             * @returns {Array} Returns the paths for each of the resources this widget references.  Will be used to remove
             *         the resources when the widget is removed.
             */
            this.getResources = function () {
              return (ctrl.properties && ctrl.properties.url && ctrl.properties.url.value) ? [ctrl.properties.url.value] : [];
            };

          }
        };

        TargetUtils.registerWidgetAsTarget(retObj);
        return retObj;
    }

    function twxDtTargetModel() {
        var widget = Twx3dCommon.getWidget('Model Target', newTwxDtTargetModel);
        return widget;
    }
    twxAppBuilder.widget('twxDtTargetModel', twxDtTargetModel);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

    /**
     * Hides the gesture properties for 3D Eyewear projects (DT-21332).
     * @param {Object} props - widget props
     * @param {Object} $scope - angular scope object
     * @returns false if the project is a 3D Eyewear, otherwise returns true for all other project types.
     */
    function gesturePropsIsVisible(props, $scope) {
      let projectSettings = $scope.$root.projectSettings || {};
      return projectSettings.projectType !== 'eyewear';
    }

    function newTwxDtTargetSpatial( widgetLabel ) {
        var ELEMENT_NAME = 'twx-dt-target-spatial';
        var overlay = {};

        overlay.rx = Twx3dCommon.common3dProp('rx');
        overlay.rx.default = -90;
        overlay.rx.alwaysWriteAttribute = true; // this flag is needed for any defaults different from the browser defaults
        overlay.ry = Twx3dCommon.common3dProp('ry');
        overlay.rz = Twx3dCommon.common3dProp('rz');
        overlay.rx.isVisible = false; // user cannot rotate spatial marker
        overlay.rx.isBindingTarget = false;
        overlay.ry.isVisible = false;
        overlay.ry.isBindingTarget = false;
        overlay.rz.isVisible = false;
        overlay.rz.isBindingTarget = false;
        overlay.y = Twx3dCommon.common3dProp('y');
        overlay.y.isVisible = false;
        overlay.y.isBindingTarget = false;

        overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/placeholder_spatial.svg');
        overlay.url = {
            name: 'url',
            tFrag: 'src="spatial://"',
            isVisible: false
        };
        overlay.istracked = {
            name: 'istracked',
            label: 'ves-ar-extension:Tracked',
            datatype: 'boolean',
            default: false,
            isBindingSource: true,
            isBindingTarget: false,
            sortOrder: 2000
        };

        overlay.enablescalegesture = {
          name: 'enablescalegesture',
          label: 'ves-ar-extension:Enable Scale Gesture',
          datatype: 'boolean',
          default: false,
          isBindingSource: false,
          isBindingTarget: true,
          sortOrder: 5002,
          isVisible: gesturePropsIsVisible
        };

        overlay.enabletranslategesture = {
          name: 'enabletranslategesture',
          label: 'ves-ar-extension:Enable Pan Gesture',
          datatype: 'boolean',
          default: true,
          isBindingSource: false,
          isBindingTarget: true,
          sortOrder: 5000,
          isVisible: gesturePropsIsVisible
        };

        overlay.enablerotategesture = {
          name: 'enablerotategesture',
          label: 'ves-ar-extension:Enable Rotate Gesture',
          datatype: 'boolean',
          default: true,
          isBindingSource: false,
          isBindingTarget: true,
          sortOrder: 5001,
          isVisible: gesturePropsIsVisible
        };

        var removals = ['billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale', 'decal'];
        var props = Twx3dCommon.new3dProps(overlay, removals);
        var services =  [];

        services.push({
            name: 'resetGesture',
            label: 'ves-ar-extension:Reset Gesture Changes',
            isVisible: function(props) {
                return (props.enablescalegesture === true || props.enabletranslategesture === true || props.enablerotategesture === true);
            },
        });

        var template = Twx3dCommon.buildRuntimeTemplate(TargetUtils.TARGET_ELEMENT_TAG, props, true);

        var retObj = {
            elementTag: ELEMENT_NAME,
            label: 'ves-ar-extension:Spatial Target',
            canBeAdded: function (ctrl, $scope) {
                return TargetUtils.canTargetBeAdded(ctrl);
            },
            category: 'ar',
            groups: ['Targets'],
            isContainer: false,
            properties: props,
            services: services,
            events: [
                {
                    name: 'trackingacquired',
                    label: 'ves-ar-extension:Tracking Acquired'
                },
                {
                    name: 'trackinglost',
                    label: 'ves-ar-extension:Tracking Lost'
                }
            ],

            designTemplate: function (props) {
                return ('<!-- twxDtTargetSpatial -->');
            },

            runtimeTemplate: function (props) {
                var tmpl = template.replace("#widgetId#", props.widgetId);
                return tmpl;
            }
        };
        TargetUtils.registerWidgetAsTarget(retObj);
        return retObj;
    }

    function twxDtTargetSpatial() {
        var widget = Twx3dCommon.getWidget( 'Spatial Target', newTwxDtTargetSpatial );
        return widget;
    }
    twxAppBuilder.widget('twxDtTargetSpatial', twxDtTargetSpatial);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

    function newTwxDtTargetUserDefined( widgetLabel ) {
        var ELEMENT_NAME = 'twx-dt-target-user-defined';
        var overlay = {};

        overlay.rx = Twx3dCommon.common3dProp('rx');
        overlay.rx.default = -90;
        overlay.rx.alwaysWriteAttribute = true; // this flag is needed for any defaults different from the browser defaults

        overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/placeholder_user_defined.svg');
        overlay.url = {
            name: 'url',
            tFrag: 'src="vuforia-user://"',
            isVisible: false
        };
        overlay.istracked = {
            name: 'istracked',
            label: 'ves-ar-extension:Tracked',
            datatype: 'boolean',
            default: false,
            isBindingSource: true,
            isBindingTarget: false,
            sortOrder: 2000
        };
        overlay.width = {
          name: 'width',
          label: 'ves-ar-extension:Marker Width',
          datatype: 'number',
          default: 0.1,
          isBindingTarget: true,
          alwaysWriteAttribute: true,
          tFrag: 'size="{{me.width}}"',
          sortOrder: 3000
        };
        overlay.gesture = {
            name: 'gesture',
            label: 'ves-ar-extension:Enable Gestures',
            datatype: 'boolean',
            default: true,
            isBindingSource: false,
            isBindingTarget: true,
            sortOrder: 5000,
            isVisible: true,
            tFrag: 'enablescalegesture=\"{{me.gesture}}\" enabletranslategesture=\"{{me.gesture}}\" enablerotategesture=\"{{me.gesture}}\"',
        };

        var removals = ['billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale', 'decal'];
        var props = Twx3dCommon.new3dProps(overlay, removals);
        var services =  [];

        services.push({
            name: 'resetGesture',
            label: 'ves-ar-extension:Reset Gesture Changes',
            isVisible: function(props) {
                return (props.gesture === true);
            },
        });

        var template = Twx3dCommon.buildRuntimeTemplate(TargetUtils.TARGET_ELEMENT_TAG, props, true);

        var retObj = {
            elementTag: ELEMENT_NAME,
            label: 'ves-ar-extension:User Defined Target',
            isVisibleInPalette: function(scope) {
                let projectSettings = scope.$root.currentProject || {};
                let builderSettings = scope.$root.builderSettings || {};
                return (projectSettings.projectType !== 'eyewear' && !!builderSettings.showUserDefinedTarget);
            },
            canBeAdded: function (ctrl, $scope) {
                return TargetUtils.canTargetBeAdded(ctrl);
            },
            category: 'ar',
            groups: ['Targets'],
            isContainer: false,
            properties: props,
            services: services,
            events: [
                {
                    name: 'trackingacquired',
                    label: 'ves-ar-extension:Tracking Acquired'
                },
                {
                    name: 'trackinglost',
                    label: 'ves-ar-extension:Tracking Lost'
                }
            ],

            designTemplate: function (props) {
                return ('<!-- twxDtTargetUserDefined -->');
            },

            runtimeTemplate: function (props) {
                var tmpl = template.replace("#widgetId#", props.widgetId);
                return tmpl;
            }
        };
        TargetUtils.registerWidgetAsTarget(retObj);
        return retObj;
    }

    function twxDtTargetUserDefined() {
        var widget = Twx3dCommon.getWidget( 'User Defined Target', newTwxDtTargetUserDefined );
        return widget;
    }
    twxAppBuilder.widget('twxDtTargetUserDefined', twxDtTargetUserDefined);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxDtView() {
    return {
      elementTag: 'twx-dt-view',
      label: 'ves-ar-extension:3D Container',
      isVisibleInPalette: false,
      category: 'ar',
      allowCopy: false,
      isContainer: true,
      hideRemoveButton: true,

      properties: [
        {
          name: 'visible',
          label: 'ves-ar-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'extendedtracking',
          label: 'ves-ar-extension:Extended Tracking',
          datatype: 'boolean',
          default: true,
          isBindingTarget: false,
          isVisible: function(props, $scope){
            let projectSettings = $scope.$root.projectSettings || {};
            return projectSettings.projectType !== 'eyewear';
          }
        },
        {
          name: 'src',
          label: 'ves-ar-extension:File Data Set',
          datatype: 'string',
          default: 'TW-VuMark.xml',
          isBindingTarget: false,
          isVisible: false,
          isDeprecated: true
        },
        {
          name: 'persistmap',
          label: 'ves-ar-extension:Persist Map',
          datatype: 'boolean',
          default: false,
          isBindingTarget: false,
          isVisible: function(props, $scope){
            let projectSettings = $scope.$root.projectSettings || {};
            return projectSettings.projectType !== 'eyewear';
          }
        },
        {
          name: 'camera',
          label: 'ves-ar-extension:Camera Parameters',
          datatype: 'json',
          default: {},
          isVisible: false
        },
        {
          name: 'enabletrackingevents',
          label: 'ves-ar-extension:Enable Tracking Events',
          datatype: 'boolean',
          default: false,
          isVisible: function(prop, scope) {
            let builderSettings = scope.$root.builderSettings || {};
            return !!builderSettings.showTrackingEvents;
          }
        },
        {
          name: 'dropshadow',
          label: 'ves-ar-extension:Cast Object Shadows',
          datatype: 'boolean',
          default: false,
          isBindingTarget: true,
          isVisible: function(prop, scope) {
            let projectSettings = scope.$root.projectSettings || {};
            return projectSettings.projectType === 'AR';
          }
        },
        // Properties 'near' and 'far' are hidden as they are currently not supported (as per DT-19506).
        {
          name: 'near',
          label: 'ves-ar-extension:Camera Near Clipping Plane',
          datatype: 'number',
          default: 0.01,
          step: 0.01,
          min: 0.01,
          isVisible: false
        },
        {
          name: 'far',
          label: 'ves-ar-extension:Camera Far Clipping Plane',
          datatype: 'number',
          default: 200,
          min: 0.1,
          step: 'any',
          isVisible: false
        }
      ],

      services: [
        {
          name: 'lockCameraAndOrientation',
          label: 'ves-ar-extension:Freeze Camera',
          isVisible: function(props, $scope){
            let projectSettings = $scope.$root.projectSettings || {};
            return projectSettings.projectType !== 'eyewear';
          }
        },
        {
          name: 'unlockCameraAndOrientation',
          label: 'ves-ar-extension:Resume Camera',
          isVisible: function(props, $scope){
            let projectSettings = $scope.$root.projectSettings || {};
            return projectSettings.projectType !== 'eyewear';
          }
        }
      ],

      dependencies: function (projectInfo) {
        let deps = {
          files: ['js/cssparser.js', 'js/animation.js', 'js/sequence.js', 'js/ARScene.js', 'js/ARPlayerAnimationAdapter.js', 'js/three.min.js', 'js/Tween.js', 'js/cursors/pan.cur', 'js/cursors/spin.cur', 'js/cursors/zoom.cur', 'js/cursors/orbit.cur']
        };

        return deps;
      },

      designTemplate: function () {

        return '<twx-dt-3d-view>' +
          '<div class="orbit-control-toolbar">' +
          '<div class="orbit-controls border inline">' +
          '   <div ng-i18next="[title]ves-ar-extension:Transform - Must select widget, translates or rotates on X, Y or Z axis" class="orbit-control" ng-click="ctrl.delegate.setTranslateMode()" ng-class="{selected: ctrl.delegate.getDraggerMode()==\'translate\' && ctrl.delegate.canTranslate() === true, active: ctrl.delegate.hasSelectedObject() === true && ctrl.delegate.canTranslate() === true}"><span class="icon iconSmall iconTranslate"></span></div> ' +
          //                         '   <div title="Rotate - Must select model, rotate on X, Y or Z axis" class="orbit-control" ng-click="ctrl.delegate.setRotateMode()" ng-class="{selected: ctrl.delegate.getDraggerMode()==\'rotate\', active: ctrl.delegate.hasSelectedObject() === true}"><span class="icon iconSmall iconRotate"></span></div> '+
          '   <div ng-i18next="[title]ves-ar-extension:Mate - Must select model or ThingMark, mate to nearest surface" class="orbit-control" ng-click="ctrl.delegate.setMateMode()" ng-class="{selected: ctrl.delegate.getDraggerMode()==\'mate\' && ctrl.delegate.canMate() === true, active: ctrl.delegate.hasSelectedObject() === true && ctrl.delegate.canMate() === true}"><span class="icon iconSmall iconMate"></span></div> ' +
          '</div>' +
          '<div class="orbit-controls border inline">' +
          '  <div ng-i18next="[title]ves-ar-extension:Zoom All - Zoom out to see all models" class="orbit-control active" ng-click="ctrl.delegate.doZoomAll()"><span class="icon iconSmall iconZoomAll"></span></div> ' +
          '  <div ng-i18next="[title]ves-ar-extension:Zoom Selected - Zoom out to selected model" class="orbit-control" ng-class="{active: ctrl.delegate.hasSelectedObject() === true}" ng-click="ctrl.delegate.doZoomSelected()"><span class="icon iconSmall iconZoomSelected"></span></div> ' +
          '</div>' +
          '<div class="orbit-controls border inline">' +
          '  <div ng-i18next="[title]ves-ar-extension:Hide Components" class="orbit-control active" ng-class="{selected: ctrl.delegate.getCompHideMode() === true}" ng-click="ctrl.delegate.toggleCompHideMode()"><span class="icon iconSmall iconHideComponents"></span></div> ' +
          '  <div ng-i18next="[title]ves-ar-extension:Unhide All" class="orbit-control" ng-class="{active: ctrl.delegate.hasHiddenComponents() === true}" ng-click="ctrl.delegate.unhideAll()"><span class="icon iconSmall iconUnhideAll"></span></div> ' +
          '</div>' +
          '</div>' +
          '<twx-container-content></twx-container-content>' +
          '<canvas id="canvas3D"/>' +
          '</twx-dt-3d-view>';
      },

      runtimeTemplate: function (props) {
        var tmpl = '' +
          '<twx-dt-view near="' + props.near + '" far="' + props.far + '" extendedtracking="' + props.extendedtracking + '" persistmap="' + props.persistmap + '" dropshadow="{{me.dropshadow}}">\n' +
          '     <twx-dt-tracker id="tracker1" enabletrackingevents="' + props.enabletrackingevents +'">\n' +
          '        <twx-container-content>\n' +
          '           <div class="targetGuide" ng-class="targetGuideClass" ng-hide="hideTargetGuide">\n' +
          '               <div class="bracket-top-left"></div>\n' +
          '               <div class="bracket-top-right"></div>\n' +
          '               <div class="bracket-bottom-right"></div>\n' +
          '               <div class="bracket-bottom-left"></div>\n' +
          '               <div class="targetGuideText hint" ng-hide="hideTargetGuide">{{targetGuideHint}}</div>\n' +
          '           </div>\n' +
          '        </twx-container-content>\n' +
          '     </twx-dt-tracker>\n' +
          '</twx-dt-view>';
        return tmpl;
      },

      // Returns a delegate constructor
      delegate: function () {

        var thisDelegate = this;
        var thisElement;
        var editorCtrl;
        //var editorFactory = {};

        this.init = function (element, widgetCtrl) {
          thisElement = element;
          var props = widgetCtrl.designPropertyValues();
          thisDelegate.getEditorCtrl().init(widgetCtrl, props);
        };

        this.beforeDestroy = function (element, widgetCtrl) {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().beforeDestroy();
          }
        };

        this.getEditorCtrl = function () {
          if (!editorCtrl && thisElement) {
            editorCtrl = thisElement.find('twx-dt-3d-view').first().data('ctrl');
          }
          return editorCtrl;
        };

        this.widgetAdded = function (widgetCtrl, originalDropOffset) {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().createObject(widgetCtrl, originalDropOffset);
          }
        };

        this.widgetRemoved = function (widgetCtrl, removeOptions) {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().removeObject(widgetCtrl, removeOptions);
          }
        };

        this.widgetSelected = function (widgetCtrl) {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().selectObject(widgetCtrl);
          }
        };

        this.widgetDeselected = function (widgetCtrl) {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().deselectObject(widgetCtrl);
          }
        };

        this.childWidgetUpdated = function (widgetCtrl, allProps, changedProps) {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().updateObject(widgetCtrl, allProps, changedProps);
          }
        };

        this.setTranslateMode = function () {
          if (thisDelegate.getEditorCtrl() && this.canTranslate()) {
            thisDelegate.getEditorCtrl().setReposMode('translate');
          }
        };

        this.setRotateMode = function () {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().setReposMode('rotate');
          }
        };

        this.setMateMode = function () {
          if (thisDelegate.getEditorCtrl() && this.canMate()) {
            thisDelegate.getEditorCtrl().setReposMode('mate');
          }
        };

        this.doZoomAll = function () {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().doZoomAll();
          }
        };

        this.doZoomSelected = function () {
          if (thisDelegate.getEditorCtrl()) {
            thisDelegate.getEditorCtrl().doZoomSelected();
          }
        };

        this.hasSelectedObject = function () {
          if (thisDelegate.getEditorCtrl()) {
            return thisDelegate.getEditorCtrl().hasSelectedObject();
          }
          return false;
        };

        this.getDraggerMode = function () {
          if (thisDelegate.getEditorCtrl() && this.hasSelectedObject()) {
            return thisDelegate.getEditorCtrl().getDraggerMode();
          }
          return '';
        };
        this.getCompHideMode = function () {
          if (thisDelegate.getEditorCtrl()) {
            return thisDelegate.getEditorCtrl().getCompHideMode();
          }
          return '';
        };
        this.toggleCompHideMode = function () {
          if (thisDelegate.getEditorCtrl()) {
            return thisDelegate.getEditorCtrl().toggleCompHideMode();
          }
          return '';
        };
        this.unhideAll = function () {
          if (thisDelegate.getEditorCtrl()) {
            return thisDelegate.getEditorCtrl().unhideAll();
          }
          return '';
        };
        this.hasHiddenComponents = function () {
          if (thisDelegate.getEditorCtrl()) {
            return thisDelegate.getEditorCtrl().hasHiddenComponents();
          }
          return '';
        };

        this.canMate = function () {
          if (thisDelegate.getEditorCtrl()) {
            return thisDelegate.getEditorCtrl().canMate();
          }
          return false;
        };

        this.canTranslate = function () {
          if (thisDelegate.getEditorCtrl()) {
            return thisDelegate.getEditorCtrl().canTranslate();
          }
          return false;
        };
      }
    };
  }

  twxAppBuilder.widget('twxDtView', twxDtView);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxTMLText() {
  return {
    elementTag: 'twx-tml-text',

    label: 'ves-ar-extension:TML Text',

    category: 'ar',

    properties: [
      {
        name: 'text',
        label: 'ves-ar-extension:Text',
        datatype: 'xml',
        default: '',
        isVisible: false
      },
      {
        name: 'textEditor',
        label: 'ves-ar-extension:Text',
        datatype: 'custom_ui',
        buttonLabel: 'Edit Text',
        title: 'Edit Text',
        template: function () {
          return '<textarea style="width: 80vw; height: 40vh;" ng-model="props.text.value" ' +
            'ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 300, \'blur\': 0 } }" ' +
            'rows="10" cols="80"' +
            'ng-keydown="$event.stopPropagation();"></textarea>';
        }
      }
    ],

    services: [],

    designTemplate: function () {
      return '';
    },

    runtimeTemplate: function (props) {
      var tmpl = props.text;
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxTmlText', twxTMLText);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxAudio() {
    return {
        elementTag: 'twx-audio',

        label: 'ves-basic-web-widgets-extension:Audio',

        category: 'basic-html',

        properties: [
            {
                name: 'audiosrc',
                label: 'ves-basic-web-widgets-extension:Audio Source',
                datatype: 'resource_url',
                allowedPatterns: ['.wav', '.mp3', '.mp4'],
                //default: '',
                isBindingTarget: true
            },
            {
                name: 'class',
                label: 'ves-basic-web-widgets-extension:Class',
                datatype: 'string',
                default: '',
                isBindingTarget: true
            },
            {
                name: 'showcontrols',
                label: 'ves-basic-web-widgets-extension:Show Controls',
                datatype: 'boolean',
                alwaysWriteAttribute: true,
                default: true,
                isBindingTarget: true
            },
            {
                name: 'preload',
                label: 'ves-basic-web-widgets-extension:Preload',
                datatype: 'string',
                default: 'none',
                editor: 'select',
                options: [
                    {label: 'ves-basic-web-widgets-extension:Content', value: 'auto'},
                    {label: 'ves-basic-web-widgets-extension:Metadata Only', value: 'metadata'},
                    {label: 'ves-basic-web-widgets-extension:None', value: 'none'},
                ]
            },
            {
                name: 'isPlaying',
                label: 'ves-basic-web-widgets-extension:Playing',
                datatype: 'boolean',
                default: false,
                isBindingSource: true,
                isBindingTarget: false,
                showInput: false
            },
            {
                name: 'visible',
                label: 'ves-basic-web-widgets-extension:Visible',
                datatype: 'boolean',
                default: true,
                isBindingTarget: true
            }
        ],

        services: [
            {
                name: 'play',
                label: 'ves-basic-web-widgets-extension:Play'
            },
            {
                name: 'pause',
                label: 'ves-basic-web-widgets-extension:Pause'
            }
        ],

        events: [
            {
                name: 'playStarted',
                label: 'ves-basic-web-widgets-extension:Play Started'
            },
            {
                name: 'playPaused',
                label: 'ves-basic-web-widgets-extension:Play Paused'
            },
            {
                name: 'playEnded',
                label: 'ves-basic-web-widgets-extension:Play Ended'
            }
        ],

        designTemplate: function () {
            return '<div class="{{me.class}}"><audio controls/></div>';
        },

        //ng-src is used below to allow src="default hardocode value" where ng-attr-src will override with blank value.
        runtimeTemplate: function (props) {
            var tmpl = '<div twx-visible class="{{me.class}}">' +
                         '<audio ng-src="{{me.audiosrc | trustUrl}}"  src="'+props.audiosrc+'" ' +
                         'twx-service-handler ' +
                         (props.showcontrols.toString() === 'true' ? 'controls ' : '') +
                         'preload="{{me.preload}}" ' +
                         'onPlay="twx.app.fn.triggerStudioEvent(event, \'playStarted\', undefined, \'me.isPlaying=true\')" ' +
                         'onPause="twx.app.fn.triggerStudioEvent(event, \'playPaused\', undefined, \'me.isPlaying=false\')" ' +
                         'onEnded="twx.app.fn.triggerStudioEvent(event, \'playEnded\', undefined, \'me.isPlaying=false\')"' +
                         '></audio></div>';
            return tmpl;
        }
    };
}

twxAppBuilder.widget('twxAudio', twxAudio);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxBarChart() {
  return {
    elementTag: 'twx-bar-chart',

    label: 'ves-basic-web-widgets-extension:Bar Chart',

    category: 'basic-html',

    properties: [
      {
        name: 'class',
        label: 'ves-basic-web-widgets-extension:Class',
        datatype: 'string',
        //default: '',
        isBindingTarget: true
      },
      {
        name: 'data',
        label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
        isBindingTarget: true
      },
      {
        name: 'labelsField',
        label: 'ves-basic-web-widgets-extension:X-axis Field',
        datatype: 'string',
        editor: 'select',
        applyFieldsFromDataSource: 'data',
        default: '',
        isBindingTarget: true
      },
      {
        name: 'valuesField',
        label: 'ves-basic-web-widgets-extension:Y-axis Field',
        datatype: 'string',
        editor: 'select',
        applyFieldsFromDataSource: 'data',
        default: '',
        isBindingTarget: true
      },
      {
        name: 'autoUpdate',
        label: 'ves-basic-web-widgets-extension:Auto Update',
        datatype: 'boolean',
        default: true,
        isVisible: false
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'chartOptions',
        label: 'ves-basic-web-widgets-extension:Chart Options',
        datatype: 'json',
        alwaysWriteAttribute: true,
        default: {
          hover: {
            mode: "label"
          },
          scales: {
            xAxes: [{
              type: "category",

              // Specific to Bar Controller
              categoryPercentage: 0.8,
              barPercentage: 0.9,

              // grid line settings
              gridLines: {
                offsetGridLines: true,
                display: false,
              }
            }],
            yAxes: [{
              type: "linear"
            }]
          }
        },
        isVisible: false
      },
      {
        name: 'chartOptionsConfig',
        label: 'ves-basic-web-widgets-extension:Chart Options',
        datatype: 'custom_ui',
        buttonLabel: 'Configure',
        title: 'ves-basic-web-widgets-extension:Chart Options',
        template: function () {
          return '<cjs-chart-configurator chart-type="bar"></cjs-chart-configurator>';
        }
      }
    ],

    services: [
      {
        name: 'updateChart',
        label: 'ves-basic-web-widgets-extension:Update Chart'
      }
    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    dependencies: {
      files: ['js/moment.min.js', 'js/Chart.min.js', 'js/chartjs-ng.js'],
      angularModules: ['chartjs-ng']
    },

    designTemplate: function () {
      return '<div class="chart-placeholder {{me.class}} bar-chart">' +
          '<p class="chart-placeholder-text">{{::"ves-basic-web-widgets-extension:Bar Chart" | i18next}}</p></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl =
        '<div twx-visible>' +
          '<div class="chart-placeholder {{me.class}} bar-chart" ng-if="!me.data.length">' +
            '<p class="chart-placeholder-text">Data is not loaded yet.</p>' +
          '</div>' +
          '<div ng-if="me.data.length" ' +
            'cjs-chart ' +
            'chart-type="bar" ' +
            'data="me.data" ' +
            'labels-field="{{me.labelsField}}" ' +
            'values-field="{{me.valuesField}}" ' +
            'class="chart-size {{me.class}} bar-chart" ' +
            'auto-update="' + props.autoUpdate + '" ' +
            'options="me.chartOptions" ' +
            'delegate="delegate" ' +
            'twx-native-events>' +
          '</div>' +
        '</div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxBarChart', twxBarChart);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxButton() {
    var defaultText = 'Button';
    try {
        defaultText = i18next.t('ves-basic-web-widgets-extension:Button');
    }
    catch(e){
        //Running on the server
    }
    return {
        elementTag: 'twx-button',

        label: 'ves-basic-web-widgets-extension:Button',

        category: 'basic-html',

        groups : ["Input"],

        properties: [
            {
                name: 'text',
                label: 'ves-basic-web-widgets-extension:Text',
                datatype: 'string',
                default: defaultText,
                isBindingTarget: true
            },
            {
                name: 'class',
                label: 'ves-basic-web-widgets-extension:Class',
                datatype: 'string',
                //default: '',
                isBindingTarget: true
            },
            {
                name: 'visible',
                label: 'ves-basic-web-widgets-extension:Visible',
                datatype: 'boolean',
                default: true,
                isBindingTarget: true
            },
            {
                name: 'disabled',
                label: 'ves-basic-web-widgets-extension:Disabled',
                datatype: 'boolean',
                default: false,
                isBindingTarget: true
            },
            {
                name: 'margin',
                label: 'ves-basic-web-widgets-extension:Margin',
                datatype: 'string'
            }
        ],

        services: [],

        events: [
            {
                name: 'click',
                label: 'ves-basic-web-widgets-extension:Click'
            }
        ],

        designTemplate: function () {
            return '<button class="button {{me.class}}" style="margin: {{me.margin}};">{{me.text}}</button>';
        },

        runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
            var voiceCommand = '';
            if (projectSettings && projectSettings.projectType === 'HMT') {
              voiceCommand =  ' data-wml-speech-command="{{me.text}}" ';
            }

            var margin = '';
            if (props.margin) {
                margin = 'margin:'+ props.margin + ';';
            }
            var tmpl = '<button style="'+margin+'" twx-visible twx-disabled class="button {{me.class}}" twx-native-events'+
            voiceCommand + '>{{me.text}}</button>';
            return tmpl;
        }
    };
}

twxAppBuilder.widget('twxButton', twxButton);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxCard(){
    return {
      elementTag: 'twx-card',

      label: 'ves-basic-web-widgets-extension:Card',

      category: 'basic-html',

      groups : ["Containers"],

      isContainer: true,

      properties: [
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string',
            //default: '',
            isBindingTarget: true
        },
        {
          name: 'header',
          label: 'ves-basic-web-widgets-extension:Header',
          datatype: 'string',
          isBindingTarget: true,
          default: ''
        },
        {
          name: 'footer',
          label: 'ves-basic-web-widgets-extension:Footer',
          datatype: 'string',
          isBindingTarget: true,
          default: ''
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'scrollable',
          label: 'ves-basic-web-widgets-extension:Scrollable',
          datatype: 'boolean',
          default: true,
          isVisible: false
        },
        {
          name: 'margin',
          label: 'ves-basic-web-widgets-extension:Margin',
          datatype: 'string',
          default: '0'
        },
        {
          name: 'padding',
          label: 'ves-basic-web-widgets-extension:Padding',
          datatype: 'string',
          default: '0'
        }

      ],

      designTemplate: function(props){
        return '<div class="card {{me.class}}" style="padding:{{me.padding}}; margin:{{me.margin}};"><twx-container-content></twx-container-content></div>';
      },

      runtimeTemplate: function(props){
        var scrollableClass = (props.scrollable === 'true') ? 'scrollable' : '';
        if (props.header || props.footer ) {
          scrollableClass += ' has-header-footer';
        }
        var tmpl = '<div twx-visible class="card {{me.class}} '+ scrollableClass +'" style="padding:'+ props.padding +'; margin:'+ props.margin +';">';
          if(props.header !== '') {
              tmpl += '<div class="item item-divider">{{me.header}}</div>';
          }
          tmpl += '<twx-container-content></twx-container-content>';
          if(props.footer !== ''){
              tmpl += '<div class="item item-divider">{{me.footer}}</div>';
          }
          tmpl += '</div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxCard', twxCard);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxCheckbox() {
  var defaultText = 'Input Label';
  try {
    defaultText = i18next.t('ves-basic-web-widgets-extension:Input Label');
  }
  catch(e){
    //Running on the server
  }
  return {
    elementTag: 'twx-checkbox',

    label: 'ves-basic-web-widgets-extension:Checkbox',

    category: 'basic-html',

    groups : ["Input"],

    properties: [
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
      },
      {
        name: 'value',
        label: 'ves-basic-web-widgets-extension:Value',
        datatype: 'boolean',
        isBindingSource: true,
        isBindingTarget: true,
        default: false
      },
      {
        name: 'label',
        label: 'ves-basic-web-widgets-extension:Label',
        datatype: 'string',
        default: defaultText
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'disabled',
        label: 'ves-basic-web-widgets-extension:Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true
      },
      {
        name: 'margin',
        label: 'ves-basic-web-widgets-extension:Margin',
        datatype: 'string',
        default: ''
      },
      {
        name: 'padding',
        label: 'ves-basic-web-widgets-extension:Padding',
        datatype: 'string',
        default: '16px 16px 16px 60px'
      }
    ],

    events: [
      {
        name: 'change',
        label: 'ves-basic-web-widgets-extension:Value Changed'
      },
      {
        name: 'selected',
        label: 'ves-basic-web-widgets-extension:Selected'
      },
      {
        name: 'deselected',
        label: 'ves-basic-web-widgets-extension:Deselected'
      },
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    designTemplate: function () {
      return '<div class="item item-checkbox {{me.class}}" style="padding:{{me.padding}}; margin:{{me.margin}};"><label class="checkbox"><input type="checkbox"></label>{{me.label}}</div>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var voiceCommand = '';
      if (projectSettings && projectSettings.projectType === 'HMT') {
        voiceCommand =  ' data-wml-speech-command="{{me.label}}" ';
      }
      var padding = '', margin = '';
      if (props.padding) {
        padding = 'padding:'+ props.padding + '; ';
      }
      if (props.margin) {
        margin = 'margin:'+ props.margin + ';';
      }
      var tmpl = '<div ' +
        'twx-visible ' +
        'class="item item-checkbox {{me.class}}" ' +
        'twx-native-events="click" ' +
        'style="'+ padding + margin +'"> ' +
        '<label class="checkbox"> ' +
          '<input type="checkbox" '+ voiceCommand +
             'twx-disabled '+ ((props.value === true) ? 'checked' : '') + ' ' +
             'twx-model="me.value" ' +
             'onchange="twx.app.fn.triggerStudioEvent(event, \'change\', event.target.checked);twx.app.fn.triggerStudioEvent(event, (event.target.checked ? \'selected\' : \'deselected\'))" > ' +
        '</label>{{me.label}}</div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxCheckbox', twxCheckbox);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxCol() {
    return {
      elementTag: 'twx-col',

      label: 'ves-basic-web-widgets-extension:Column',

      category: 'basic-html',

      outputElementsOnly: true,

      isVisibleInPalette: false,

      isValidDropTarget: function (targetEl, sourceEl) {
        return targetEl && targetEl.tagName.toLowerCase() === 'twx-row';
      },

      isContainer: true,

      properties: [
        {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string'
        },
        {
          name: 'flexdirection',
          label: 'ves-basic-web-widgets-extension:Flex Direction',
          datatype: 'string',
          default: 'column',
          editor: 'select',
          options: [
            {label: 'ves-basic-web-widgets-extension:Row', value: 'row'},
            {label: 'ves-basic-web-widgets-extension:Column', value: 'column'}
          ]
        },
        {
          name: 'justification',
          label: 'ves-basic-web-widgets-extension:Justification',
          datatype: 'string',
          default: 'flex-start',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Start', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:End', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Even Space Between', value: 'space-between' },
            { label: 'ves-basic-web-widgets-extension:Even Space Around', value: 'space-around' }
          ]
        },
        {
          name: 'alignment',
          label: 'ves-basic-web-widgets-extension:Alignment',
          datatype: 'string',
          default: 'stretch',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Start', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:End', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Stretch', value: 'stretch' },
            { label: 'ves-basic-web-widgets-extension:Baseline', value: 'baseline' }
          ]
        },
        {
          name: 'fixedcolsize',
          label: 'ves-basic-web-widgets-extension:Fixed Column Size',
          datatype: 'string',
          updateDesignTimeOnChange: true
        },
        {
          name: 'wrap',
          label: 'ves-basic-web-widgets-extension:Content Wrap',
          datatype: 'string',
          default: 'wrap',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Wrap', value: 'wrap' },
            { label: 'ves-basic-web-widgets-extension:No Wrap', value: 'no-wrap' }
          ]
        },
        {
            name: 'padding',
            label: 'ves-basic-web-widgets-extension:Padding 10px',
            datatype: 'string',
            default: '0px'
        }
      ],

      designTemplate: function () {
        return '<twx-container-content class="{{me.class}}" style="flex-direction:{{me.flexdirection}}; justify-content:{{me.justification}}; align-items: {{me.alignment}}; padding:{{me.padding}}; flex-wrap:{{me.wrap}}; flex: 0 0 {{me.fixedcolsize || \'auto\'}};"></twx-container-content>';
      },

      runtimeTemplate: function (properties) {
        var tmpl = '<div class="col ' + properties.class + '" style="flex-direction:' + properties.flexdirection + ';' +
                        'justify-content: '+ properties.justification + ';' +
                        'align-items: '+ properties.alignment + ';' +
                        'padding: '+ properties.padding + ';' +
                        'flex-wrap: '+ properties.wrap + ';' +
                        (properties.fixedcolsize && properties.fixedcolsize !== 'auto' ? '-webkit-flex: 0 0 '+ properties.fixedcolsize +'; flex: 0 0 ' + properties.fixedcolsize : '') +'">' +
                      '</div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxCol', twxCol);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
/*jshint multistr:true */

/**
 * Generates a string that will contain the 'twx-state-format' directive and it's supporting properties when the widget
 * has state formatting enabled, otherwise when state formatting is disabled, an empty string will be returned.
 *
 * @param widgetProps
 * @param stateFormatValue [Optional] Used to augment/override the 'stateFormatValue', the attribute/property in stateFormatValue may
 *        actually reside on another object within the scope object (i.e. item.foo instead of just foo).
 *        If it's provided it will use the given value otherwise it will use the value from 'widgetProps.stateFormatValue'.
 * @return {string} String
 */
function getStateFormattingMarkup(widgetProps, stateFormatValue) {
  var str = '';
  if(widgetProps && widgetProps.enableStateFormatting) {
    str = ' twx-state-format="' + widgetProps.stateFormat + '" state-format-value="' + (stateFormatValue || widgetProps.stateFormatValue || '') + '"';
  }
  return str;
}

(function(twxAppBuilder) {
  var defaultText = 'Label';
  try {
    defaultText = i18next.t('ves-basic-web-widgets-extension:Label');
  }
  catch (e) {
    //Running on the server
  }

  function twxDataGrid() {
    return {
      elementTag: 'twx-data-grid',

      label: 'ves-basic-web-widgets-extension:Data Grid',

      category: 'basic-html',

      isRepeater: true,

      showChildren: false,

      columns: [],

      onAddDataBinding: function (data, ctrl, widgetInstance, $scope) {
        if (data.sourceType === 'data' && data.toProperty === 'data') {
          if (data.sourceScope) {
            widgetInstance.columns = angular.copy(data.sourceScope.service.metadata.Outputs.fieldDefinitions);
          } else {
            var dataProp = _.find(ctrl.properties, {name: 'data'});
            dataProp.getCachedMetadata({widget: ctrl});
          }
          widgetInstance.source = data;
        }
      },

      onRemoveDataBinding: function (id, ctrl, widgetInstance, $scope) {
        var srcEl = ctrl.element().find('twx-databind[to-property="data"][from-expression]');
        if (!srcEl || srcEl.length <= 0) {
          // remove the following properties if nothing else is bound to the "data" property
          delete ctrl.me.source;
          delete ctrl.me.columns;

          ctrl.element().find('[auto-generated-from]').remove();
        }
      },

      isVisibleInPalette: true,

      properties: addStateFormattingProperties([
        {
          name: 'data',
          label: 'ves-basic-web-widgets-extension:Data',
          isBindingTarget: true,
          isBindingSource: false,
          datatype: 'columns',
          default: [],

          getCachedMetadata: function(ctrl) {
            var srcEl = ctrl.widget.element().find('twx-databind[to-property="data"][from-expression]');
            if (srcEl && srcEl.length > 0) {
              var srcPath = srcEl.attr('from-expression');
              var scope = top.angular.element(top.document.querySelector('[source-path="' + srcPath + '"]')).data('scope');
              if (scope && !scope.service) {
                scope = scope.$parent;
              }
              if (scope && scope.service) {
                var metadata = scope.service.metadata;
                ctrl.widget.me.columns = angular.copy(metadata.Outputs.fieldDefinitions);
                ctrl.widget.me.source = {
                  baseType: srcEl.attr('base-type'),
                  sourceItemName: srcEl.attr('source-item-name'),
                  sourceName: srcEl.attr('source-name')
                };
              }
            }
          },
          getColumns: function (ctrl) {
            if (!ctrl.widget.me.columns) {
              this.getCachedMetadata(ctrl);
            }
            return ctrl.widget.me.columns;
          },

          getColumnCount: function (ctrl) {
            return Object.keys(this.getColumns(ctrl) || {}).length;
          },

          toggleSelectAll: function (ctrl) {
            var columns = this.getColumns(ctrl);
            var propContext = this;
            var columnsToAdd = [];

            Object.keys(columns).forEach(function (key) {
              if (!propContext.doesColumnExist(columns[key], ctrl)) {
                columnsToAdd.push(columns[key]);
              }
            });

            if (columnsToAdd.length > 0) {
              var newItems = [];

              for (var i = 0, l = columnsToAdd.length; i < l; i++) {
                newItems.push(propContext._addColumn(columnsToAdd[i], ctrl));
              }

              ctrl.getScope().$root.$broadcast('paste', newItems, false);
            }
            else {
              Object.keys(columns).forEach(function (key) {
                propContext.removeColumn(columns[key], ctrl);
              });
            }
          },

          doesColumnExist: function (column, ctrl) {
            var col = ctrl.widget.element().find('[auto-generated-from="' + column.name + '"\]');
            return (col.length > 0);
          },

          getSelectedCount: function (ctrl) {
            var columns = this.getColumns(ctrl);
            var propContext = this;
            var count = 0;

            if (columns) {
              Object.keys(columns).forEach(function (key) {
                if (propContext.doesColumnExist(columns[key], ctrl)) {
                  count++;
                }
              });
            }
            //console.log('selected count', count);
            return count;
          },

          areAllSelected: function (ctrl) {
            return this.getColumnCount(ctrl) === ctrl.widget.element().find('[auto-generated-from]').length;
          },

          getSource: function (ctrl) {
            if (!ctrl.widget.me.source) {
              this.getCachedMetadata(ctrl);
            }
            return ctrl.widget.me.source;
          },

          _addColumn: function (column, ctrl) {
            var source = this.getSource(ctrl);
            let columnTemplate = '\
              <twx-data-grid-col \
                  twx-widget="" \
                  widget-id="' + column.name + '-column-1" \
                  label="' + column.name + '" \
                  widget-name="' + column.name + '-column-1" \
                  auto-generated-from="' + column.name + '"\
                  state-format-value="' + column.name + '"\
                  is-widget-container="true">\
                <twx-container-content>\
                  <twx-label twx-widget \
                        widget-id="' + column.name + '-label-1" \
                        widget-name="' + column.name + '-label-1" \
                        >\
                      <twx-databind databind-id="db-'+ Date.now() +'" source-type="data"\
                         source-name="' + source.sourceName + '"\
                         source-item-type="service"\
                         source-item-name="' + source.sourceItemName + '"\
                         source-item-field-name="' + column.name + '"\
                         binding-type="collection_item_field"\
                         from-expression="item[\'' + column.name + '\']"\
                         to-property="text"\
                         base-type="' + source.baseType + '">\
                      </twx-databind>\
                  </twx-label>\
                </twx-container-content>\
              </twx-data-grid-col>';

            return {source: columnTemplate};
          },

          addColumn: function (column, ctrl) {
            var newItems = [];
            newItems.push(this._addColumn(column, ctrl));
            ctrl.getScope().$root.$broadcast('paste', newItems, false);
          },

          removeColumn: function (column, ctrl) {
            var col = this.getColumnEl(column, ctrl);
            if (col.length > 0) {
              col.data('_widgetController').remove();
            }
          },

          getColumnEl: function (column, ctrl) {
            return ctrl.widget.element().find('[auto-generated-from="' + column.name + '"\]');
          },

          toggleColumn: function (column, ctrl) {
            if (this.getColumnEl(column, ctrl).length > 0) {
              this.removeColumn(column, ctrl);
            }
            else {
              this.addColumn(column, ctrl);
            }
          }
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'label',
          label: 'ves-basic-web-widgets-extension:Label',
          datatype: 'string',
          default: defaultText,
          isBindingTarget: true,
          isVisible: false
        },
        {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          default: '',
          isBindingTarget: true
        },
        {
          name: 'headerClass',
          label: 'ves-basic-web-widgets-extension:Header Class',
          datatype: 'string',
          default: '',
          isBindingTarget: true
        },
        {
          name: 'rowClass',
          label: 'ves-basic-web-widgets-extension:Row Class',
          datatype: 'string',
          default: '',
          isVisible: false
        },
        {
          name: 'cellClass',
          label: 'ves-basic-web-widgets-extension:Cell Class',
          datatype: 'string',
          default: '',
          isVisible: false
        }
        /* {
         name: 'multiselect',
         label: 'ves-basic-web-widgets-extension:Multi-Select',
         datatype: 'boolean',
         default: false,
         visible: false
         }, */

      ]),

      events: [
        {
          name: 'itemclick',
          label: 'ves-basic-web-widgets-extension:Item Click',
          isVisible: function(props, scope) {
            if (scope && scope.$root && scope.$root.projectSettings && scope.$root.projectSettings.projectType === 'HMT') {
              return false;
            }
            return true;
          }
        }
      ],

      designTemplate: function () {
        var tmpl = '\
        <div class="twx-data-grid design-time {{me.class}}">\
            <span class="label" ng-if="ctrl.queryDataBindings().length <= 0"> \
                 {{"ves-basic-web-widgets-extension:grid-data-bind-help" | i18next }}\
            </span>\
            <span class="label" ng-if="ctrl.queryDataBindings().length > 0 && ctrl.element().find(\'twx-data-grid-col\').length <= 0"> \
                 {{"ves-basic-web-widgets-extension:grid-columns-help" | i18next }}\
            </span>\
            <twx-repeater-content></twx-repeater-content>\
        </div>';
        return tmpl;
      },

      runtimeTemplate: function (propertyValues, el, fullDoc, $) {
        var columnSelector = '[widget-id=' + propertyValues.widgetId + '] twx-data-grid-col';
        var columns = fullDoc.find(columnSelector);
        var tmpl = '\
        <table twx-visible class="twx-data-grid {{me.class}}">\
          <thead class="{{me.headerClass}}"> \
            <tr>';

        columns.each(function (index, column) {
          column = $(column);
          var label = column.attr("data-label");
          var horiz = column.attr("horizontal-alignment");
          var cssName = label.replace(/[^a-zA-Z0-9\-\_\.]/gi, '_');
          //console.log("column: ", column.parent().html());
          tmpl += '\
              <th class="item-header-cell header-cell-' + cssName + ' ' + horiz + '">\
                ' + label + '\
              </th>';
        });

        var stateFormatValue = (propertyValues.stateFormatValue) ? ('item.' + propertyValues.stateFormatValue) : '';
        tmpl += '\
            </tr>\
          </thead>\
          <tbody>\
          <tr ng-repeat="item in me.data" class="item-row {{me.rowClass}}"\
              ng-class="{\'{{\'selected \'}}\': item._isSelected}"\
              ng-click="app.fn.clickItemInRepeater(item,me.data,me.multiselect);fireEvent(\'itemclick\', item);"\
              ' + getStateFormattingMarkup(propertyValues, stateFormatValue) + '>\
              <twx-repeater-content></twx-repeater-content>\
            </tr>\
          </tbody>\
        </table>';

        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxDataGrid', twxDataGrid);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
/*jshint multistr:true */
(function (twxAppBuilder) {

  var defaultText = 'Label';
  try {
    defaultText = i18next.t('ves-basic-web-widgets-extension:Label');
  }
  catch(e){
    //Running on the server
  }

  function twxDataGridCol() {
    return {
      elementTag: 'twx-data-grid-col',

      label: 'ves-basic-web-widgets-extension:Data Grid Column',

      category: 'basic-html',

      isVisibleInPalette:  false,

      isContainer: true,

      outputElementsOnly: true,

      dropTargetSelector: 'twx-data-grid',

      isValidDropTarget: function (targetEl, sourceEl) {
        return targetEl && sourceEl && $(sourceEl).closest('twx-data-grid').attr('widget-id') === $(targetEl).closest('twx-data-grid').attr('widget-id');
      },

      // the grid columns will be created when the data is bound to the data grid
      allowCopy: false,

      properties: addStateFormattingProperties([
        {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          default: ''
        },
        {
          name: 'label',
          label: 'ves-basic-web-widgets-extension:Label',
          datatype: 'string',
          default: defaultText,
          isBindingTarget: true
        },
        {
          name: 'autoGeneratedFrom',
          label: '',
          datatype: 'string',
          isVisible: false,
          default: ''
        },
        {
          name: 'horizontalAlignment',
          label: 'ves-basic-web-widgets-extension:Horizontal Alignment',
          datatype: 'string',
          default: 'left',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Left', value: 'left' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Right', value: 'right' }
          ]
        },
        {
          name: 'verticalAlignment',
          label: 'ves-basic-web-widgets-extension:Vertical Alignment',
          datatype: 'string',
          default: 'middle',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Top', value: 'top' },
            { label: 'ves-basic-web-widgets-extension:Middle', value: 'middle' },
            { label: 'ves-basic-web-widgets-extension:Bottom', value: 'bottom' }
          ]
        }
      ]),

      designTemplate: function () {

        return '<div class="data-grid-col {{me.class}}">' +
          '<div class="data-grid-th {{$parent.me.headerClass}} {{me.horizontalAlignment}}"><label>{{me.label}}</label></div>' +
          '<div class="data-grid-td {{me.verticalAlignment}} {{me.horizontalAlignment}}"><twx-container-content></twx-container-content></div>' +
          '</div>';
        //<twx-col twx-widget><twx-container-content></twx-container-content></twx-col>
      },

      runtimeTemplate: function (properties) {
        var stateFormatValue = (properties.stateFormatValue) ? ('item.' + properties.stateFormatValue) : ('item.' + properties.autoGeneratedFrom);
        var label = properties.label;
        var cssName = label.replace(/[^a-zA-Z0-9\-\_\.]/gi, '_');
        var cssClasses = ['item-header-cell', 'header-cell-' + cssName, properties.verticalAlignment, properties.horizontalAlignment];
        if(properties.enableStateFormatting) {
          cssClasses = cssClasses.concat(['basic-state-formatting']);
        }
        cssClasses = cssClasses.concat([properties.class]);

        var tmpl = '<td class="'+ cssClasses.join(' ') + '"' + getStateFormattingMarkup(properties, stateFormatValue) + '></td>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxDataGridCol', twxDataGridCol);

})(twxAppBuilder);
/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxFile() {
    let linkText = 'Link Text';
    try {
        linkText = i18next.t('ves-basic-web-widgets-extension:Link Text');
    }
    catch(e){
        //Running on the server
    }

    return {
        elementTag: 'twx-file',

        label: 'ves-basic-web-widgets-extension:File',

        category: 'basic-html',

        isVisibleInPalette: true,

        properties: [
            {
                name: 'text',
                label: 'ves-basic-web-widgets-extension:Text',
                datatype: 'string',
                default: linkText,
                isBindingTarget: true
            },
            {
                name: 'url',
                label: 'ves-basic-web-widgets-extension:File URL',
                datatype: 'resource_url',
                isBindingTarget: true
            },
            {
                name: 'linkAction',
                label: 'ves-basic-web-widgets-extension:Link Action',
                datatype: 'string',
                default: 'open',
                editor: 'select',
                options: [
                    {label: 'ves-basic-web-widgets-extension:Open', value: 'open'},
                    {label: 'ves-basic-web-widgets-extension:Download', value: 'download'}
                ],
                isVisible: function(props, scope) {
                  return (scope && scope.$root && scope.$root.projectSettings && scope.$root.projectSettings.projectType === 'desktop');
                }
            },
            {
                name: 'class',
                label: 'ves-basic-web-widgets-extension:Class',
                datatype: 'string',
                isBindingTarget: true
            },
            {
                name: 'visible',
                label: 'ves-basic-web-widgets-extension:Visible',
                datatype: 'boolean',
                default: true,
                isBindingTarget: true
            },
            {
                name: 'margin',
                label: 'ves-basic-web-widgets-extension:Margin',
                datatype: 'string'
            }
        ],

        services: [],

        events: [
            {
                name: 'click',
                label: 'ves-basic-web-widgets-extension:Click'
            }
        ],

        dependencies: {
          files: ['js/common-html-widgets-ng.js'],
          angularModules: ['common-html-widgets-ng']
        },

        designTemplate: function () {
            return '<a class="twx-file {{me.class}}" style="margin: {{me.margin}}">{{me.text}}</a>';
        },

        runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
            var voiceCommand = '';
            if (projectSettings && projectSettings.projectType === 'HMT') {
                voiceCommand = ' data-wml-speech-command="{{me.text}}" ';
            }

            var margin = '';
            if (props.margin) {
                margin = 'margin: ' + props.margin + ';';
            }
            var tmpl = '<a twx-link class="twx-file twxHyperlink {{me.class}}" twx-native-events ng-href="{{me.url}}" target="_blank" ' + (props.linkAction === 'download' ? 'download' : '') + ' twx-visible style="' + margin + '" ' +
                voiceCommand + '>{{me.text}}</a>';
            return tmpl;
        }
    };
}

twxAppBuilder.widget('twxFile', twxFile);

/* begin copyright text
*
* Copyright 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
*
* end copyright text
*/
function twxFragment() {

  var selectFragment = function(ctrl, $scope, twxAppBuilderService) {
    return new Promise(function (resolve, reject) {
      var title = i18next.t('ves-basic-web-widgets-extension:Fragment Picker');
      var fragments = twxAppBuilderService.getFragments($scope.$root.projectSettings);

      ctrl.showSelectionDialog(title, fragments).then(function (item) {
        if (item) {
          resolve(item.name);
        } else {
          // fragment is not selected, go with the empty fragment link
          resolve(item);
        }
      }, reject);
    });
  };

  return {
    elementTag: 'twx-fragment',

    label: 'ves-basic-web-widgets-extension:Fragment',

    category: 'desktop',

    isContainer: true,

    showChildren: false, // don't show children in Canvas Browser tree

    properties: [
      {
        name: 'fragment',
        label: 'ves-basic-web-widgets-extension:Fragment',
        datatype: 'custom_ui',
        visibleValue: true,
        runtimeDatatype: 'string',
        readonly: true,
        done: 'ctrl.customWidgetEditorTargetWidget.setProp(\'fragment\', ctrl.customWidgetEditorTargetWidgetProperty.valueTemp);',
        template: function (props, widget, root, twxAppBuilderService) {
          props.fragment.tempSelectionList = twxAppBuilderService.getFragments(root.currentProject); // get available fragments
          return '<div class="twxPopoverTitle">{{:: "ves-basic-web-widgets-extension:Fragment Picker" | i18next}}</div>' +
          '<div id="selectionList">' +
          '<div class="list-item" ng-class="{\'list-item-selected\' : props.fragment.valueTemp === item.name}" ng-repeat="item in props.fragment.tempSelectionList" ng-click="props.fragment.valueTemp = item.name">{{::item.name}}</div>' +
          '</div>';
        }
      },
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string',
            //default: '',
            isBindingTarget: true
        },
        {
          name: 'width',
          label: 'ves-basic-web-widgets-extension:width-css-units',
          datatype: 'string',
          default: ''
        },
        {
          name: 'height',
          label: 'ves-basic-web-widgets-extension:height-css-units',
          datatype: 'string',
          default: ''
        },
        {
            name: 'padding',
            label: 'ves-basic-web-widgets-extension:Padding',
            datatype: 'string'
        },
        {
          name: 'flexdirection',
          label: 'ves-basic-web-widgets-extension:Flex Direction',
          datatype: 'string',
          default: 'column',
          editor: 'select',
          options: [
            {label: 'ves-basic-web-widgets-extension:Row', value: 'row'},
            {label: 'ves-basic-web-widgets-extension:Column', value: 'column'}
          ]
        },
        {
          name: 'justification',
          label: 'ves-basic-web-widgets-extension:Justification',
          datatype: 'string',
          default: 'flex-start',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Start', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:End', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Even Space Between', value: 'space-between' },
            { label: 'ves-basic-web-widgets-extension:Even Space Around', value: 'space-around' }
          ]
        },
        {
          name: 'alignment',
          label: 'ves-basic-web-widgets-extension:Alignment',
          datatype: 'string',
          default: 'stretch',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Start', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:End', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Stretch', value: 'stretch' },
            { label: 'ves-basic-web-widgets-extension:Baseline', value: 'baseline' }
          ]
        },
        {
          name: 'wrap',
          label: 'ves-basic-web-widgets-extension:Content Wrap',
          datatype: 'string',
          default: 'wrap',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Wrap', value: 'wrap' },
            { label: 'ves-basic-web-widgets-extension:No Wrap', value: 'nowrap' }
          ]
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        }
    ],

      getFlexValue: function(me) {
        if (me.width === '') {
          return '1';
        }
        return '0 0 ' + me.width;
      },

    services: [],

    events: [],

    canBeAdded: function (ctrl, $scope, twxAppBuilderService) {
      var fragmentPromise = selectFragment(ctrl, $scope, twxAppBuilderService);

      return fragmentPromise.then(function (fragmentName) {
        if (fragmentName) {
          return {'fragment' : fragmentName};
        } else {
          // fragment is not selected, go with the empty fragment link
          return true;
        }
      }, function(err) {
        return false;
      });
    },

    designTemplate: function () {
      return '<twx-container-content class="twx-fragment {{me.class}}" style="padding: {{me.padding}}; margin: {{me.margin}}; border:1px solid green;" fragment="{{me.fragment}}" style="padding: {{me.padding}}; flex-direction:{{me.flexdirection}}; justify-content:{{me.justification}}; align-items: {{me.alignment}}; padding:{{me.padding}}; flex-wrap:{{me.wrap}}; flex: {{ctrl.$widgetDef.getFlexValue(me)}}; height: {{me.height}};"><twx-fragment-designer fragment-id="{{me.widgetId}}" fragment="{{me.fragment}}"></twx-fragment-designer></twx-container-content>';
    },

    runtimeTemplate: function (props) {
        var height = '';
        if (props.height) {
          height = 'height: ' + props.height + ';';
        }
        var width = '';
        if (props.width) {
          width = 'width: ' + props.width + ';';
        }
        var padding = '';
        if (props.padding) {
          padding = 'padding:' + props.padding + ';';
        }

        var tmpl = '<div twx-visible class="twx-fragment-panel {{me.class}}" style="'+ height + width + padding + '">' +
          '<twx-container-content ' +
            'style="' +
            'flex-direction:' + props.flexdirection + '; ' +
            'justify-content: '+ props.justification + '; ' +
            'align-items: '+ props.alignment + '; ' +
            'flex-wrap: '+ props.wrap + ';"> '  +
//            '<fragment-content></fragment-content>'+
            '<twx-fragment-designer fragment-id="'+props.widgetId+'" fragment="'+props.fragment+'"></twx-fragment-designer>'+
            '</twx-container-content></div>';
        return tmpl;
      }
  };
}

twxAppBuilder.widget('twxFragment', twxFragment);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxFragmentPanel(){
    return {
      elementTag: 'twx-fragment-panel',

      label: 'ves-basic-web-widgets-extension:Fragment Panel',

      category: 'desktop',

      groups : ["Containers"],

      isContainer: true,

      isVisibleInPalette: false, // This widget is automatic replacement for twx-view

      properties: [
      ],

      designTemplate: function(){
        return '<twx-container-content class="twx-fragment-panel"></twx-container-content>';
      },

      runtimeTemplate: function(){
        var tmpl = '<twx-container-content class="twx-fragment-panel"></twx-container-content>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxFragmentPanel', twxFragmentPanel);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxGridLayout() {
    return {
      elementTag: 'twx-gridlayout',

      label: 'ves-basic-web-widgets-extension:Grid Layout',

      category: 'basic-html',

      groups : ["Containers"],

      isContainer: true,

      properties: [
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
        },
        {
          name: 'margin',
          label: 'ves-basic-web-widgets-extension:Margin',
          datatype: 'string',
          default: ''
        },
        {
          name: 'evenlyspacedrows',
          label: 'ves-basic-web-widgets-extension:Rows Divide Available Height Evenly',
          datatype: 'boolean',
          default: false
        }
      ],

      initialContent: function(){
        return '<twx-row twx-widget><twx-container-content><twx-col twx-widget><twx-container-content></twx-container-content></twx-col></twx-container-content></twx-row>';
      },

      designTemplate: function () {
        return '<twx-grid-designer class="{{me.class}}" even-rows="{{me.evenlyspacedrows}}" margin="{{me.margin}}"><twx-container-content></twx-container-content></twx-grid-designer>';
      },

      runtimeTemplate: function (properties) {
        var tmpl = '<div twx-visible even-rows="'+ properties.evenlyspacedrows +'"class="gridLayout {{me.class}}" style="padding:'+ properties.margin +';"><twx-container-content></twx-container-content></div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxGridLayout', twxGridLayout);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxHyperlink() {
    var defaultText = 'Hyperlink Text';
    try {
        defaultText = i18next.t('ves-basic-web-widgets-extension:Hyperlink Text');
    }
    catch(e){
        //Running on the server
    }

    return {
        elementTag: 'twx-hyperlink',

        label: 'ves-basic-web-widgets-extension:Hyperlink',

        category: 'basic-html',

        properties: [
            {
                name: 'text',
                label: 'ves-basic-web-widgets-extension:Text',
                datatype: 'string',
                default: defaultText,
                isBindingTarget: true
            },
            {
                name: 'url',
                label: 'ves-basic-web-widgets-extension:URL',
                datatype: 'string',
                default: 'http://',
                isBindingTarget: true
            },
            {
                name: 'class',
                label: 'ves-basic-web-widgets-extension:Class',
                datatype: 'string',
                //default: '',
                isBindingTarget: true
            },
            {
                name: 'visible',
                label: 'ves-basic-web-widgets-extension:Visible',
                datatype: 'boolean',
                default: true,
                isBindingTarget: true
            },
            {
                name: 'margin',
                label: 'ves-basic-web-widgets-extension:Margin',
                datatype: 'string'
            }
        ],

        services: [],

        events: [
            {
                name: 'click',
                label: 'ves-basic-web-widgets-extension:Click'
            }
        ],

        dependencies: {
            files: ['js/common-html-widgets-ng.js'],
            angularModules: ['common-html-widgets-ng']
        },

        designTemplate: function () {
            return '<a class="twxHyperlink {{me.class}}" style="margin: {{me.margin}}">{{me.text}}</a>';
        },

        runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
            var voiceCommand = '';
            if (projectSettings && projectSettings.projectType === 'HMT') {
                voiceCommand = ' data-wml-speech-command="{{me.text}}" ';
            }

            var margin = '';
            if (props.margin) {
                margin = 'margin: ' + props.margin + ';';
            }
            var tmpl = '<a twx-link class="twxHyperlink {{me.class}}" twx-native-events target="_blank" ng-href="{{me.url}}" ng-show="app.fn.isTrue(me.visible)" style="' + margin + '" ' +
                voiceCommand + '>{{me.text}}</a>';
            return tmpl;
        }
    };
}

twxAppBuilder.widget('twxHyperlink', twxHyperlink);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxImage2() {
  return {
    elementTag: 'twx-image2',

    label: 'ves-basic-web-widgets-extension:Image',

    category: 'basic-html',

    properties: [
      {
        name: 'class',
        label: 'ves-basic-web-widgets-extension:Class',
        datatype: 'string',
        //default: '',
        isBindingTarget: true
      },
      {
        name: 'imgsrc',
        label: 'ves-basic-web-widgets-extension:Source',
        datatype: 'resource_url',
        allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
        resource_image: true,
        default: '',
        isBindingTarget: true
      },
      {
        name: 'backgroundcolor',
        label: 'ves-basic-web-widgets-extension:Background Color',
        datatype: 'string',
        isBindingTarget: true
      },
      {
        name: 'width',
        label: 'ves-basic-web-widgets-extension:Width',
        datatype: 'string',
        default: ''
      },
      {
        name: 'height',
        label: 'ves-basic-web-widgets-extension:Height',
        datatype: 'string',
        default: ''
      },
      /*{
        name: 'alignment',
        label: 'ves-basic-web-widgets-extension:Alignment',
        datatype: 'string',
        default: 'left'
      },*/
      {
        name: 'imageAlign',
        label: 'ves-basic-web-widgets-extension:Alignment',
        datatype: 'string',
        default: 'flex-start',
        editor: 'select',
        options: [
          { label: 'ves-basic-web-widgets-extension:Left', value: 'flex-start' },
          { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
          { label: 'ves-basic-web-widgets-extension:Right', value: 'flex-end' }
        ]
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'padding',
        label: 'ves-basic-web-widgets-extension:Padding',
        datatype: 'string',
        default: ''
      }
    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click',
        isVisible: function(props, scope) {
          if (scope && scope.$root && scope.$root.projectSettings && scope.$root.projectSettings.projectType === 'HMT') {
            return false;
          }
          return true;
        }
      }
    ],

    designTemplate: function () {
      return '<div class="imgAlignContainer" style="justify-content: {{me.imageAlign}};" ng-if="!me.imgsrc || me.imgsrc.endsWith(\'/\')">' +
          '<img class="{{me.class}} img-placeholder" src="../../../extensions/images/Image.png" /></div>' +
        '<div class="imgAlignContainer" style="justify-content: {{me.imageAlign}};" ng-if="me.imgsrc && !me.imgsrc.endsWith(\'/\')">' +
        '<img class="{{me.class}}" ' +
        'style="background-color: {{me.backgroundcolor}}; width: {{me.width}}; height: {{me.height}};  padding: {{me.padding}}" '+
        'ng-src="{{me.imgsrc}}" /></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div class="imgAlignContainer" style="justify-content: ' + props.imageAlign + ';"><img class="{{me.class}}" twx-visible ' +
        'style="background-color: {{me.backgroundcolor}}; width: {{me.width}}; height: {{me.height}};  padding: {{me.padding}}" ' +
        'ng-src="{{me.imgsrc}}"' +
        'twx-native-events/></div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxImage2', twxImage2);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxImage() {
  return {
    elementTag: 'twx-image',

    label: 'ves-basic-web-widgets-extension:URL Image',

    /**
     * DT-5295 Obsolete widget definition as of 2/7/2018. Will migrate at some future release.
     * Keeping widget definition around so any older projects using this widget may continue to work
     */
    category: 'obsolete',
    isVisibleInPalette: false,

    properties: [
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
      },
      {
        name: 'src',
        label: 'ves-basic-web-widgets-extension:Source',
        datatype: 'string',
        default: '',
        isBindingTarget: true
      },
      {
        name: 'backgroundColor',
        label: 'ves-basic-web-widgets-extension:Background Color',
        datatype: 'string',
        isBindingTarget: true
      },
      {
        name: 'width',
        label: 'ves-basic-web-widgets-extension:Width',
        datatype: 'string'
      },
      {
        name: 'height',
        label: 'ves-basic-web-widgets-extension:Height',
        datatype: 'string'
      },
      /*{
        name: 'alignment',
        label: 'ves-basic-web-widgets-extension:Alignment',
        datatype: 'string',
        default: 'left'
      },*/
      {
        name: 'imageAlign',
        label: 'ves-basic-web-widgets-extension:Alignment',
        datatype: 'string',
        default: 'flex-start',
        editor: 'select',
        options: [
          { label: 'ves-basic-web-widgets-extension:Left', value: 'flex-start' },
          { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
          { label: 'ves-basic-web-widgets-extension:Right', value: 'flex-end' }
        ]
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'padding',
        label: 'ves-basic-web-widgets-extension:Padding',
        datatype: 'string',
        default: ''
      }
    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    designTemplate: function () {
      var template = '<div class="imgAlignContainer" style="justify-content: {{me.imageAlign}};" ng-if="me.src == \'\' || me.src.endsWith(\'/\')">' +
          '<img class="{{me.class}} img-placeholder" src="../../../extensions/images/Resource Image.png" /></div>' +
        '<div class="imgAlignContainer" style="justify-content: {{me.imageAlign}};" ng-if="me.src !== \'\' && !me.src.endsWith(\'/\')">' +
        '<img class="{{me.class}}" style="padding: {{me.padding}}; width: {{me.width}}; height: {{me.height}};" ng-src="{{me.src}}" /></div>';
      return template;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div class="imgAlignContainer" style="justify-content: ' + props.imageAlign + ';"><img class="{{me.class}}" ' +
        'twx-visible ' +
        'style="background-color: {{me.backgroundColor}}; width: {{me.width}}; height: {{me.height}}; padding:'+ props.padding +';" ' +
        'ng-src="{{me.src}}" ' +
        'twx-native-events/></div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxImage', twxImage);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxLabel() {
  var defaultText = 'Label';
  try {
    defaultText = i18next.t('ves-basic-web-widgets-extension:Label');
  }
  catch(e){
    //Running on the server
  }
  return {
    elementTag: 'twx-label',

    label: 'ves-basic-web-widgets-extension:Label',

    category: 'basic-html',

    properties: addStateFormattingProperties([
      {
        name: 'text',
        label: 'ves-basic-web-widgets-extension:Text',
        datatype: 'string',
        default: defaultText,
        isBindingTarget: true,
        defaultDependentField: true
      },
      {
        name: 'class',
        label: 'ves-basic-web-widgets-extension:Class',
        datatype: 'string',
        default: 'simple-label',
        isBindingTarget: true
      },
      {
        name: 'padding',
        label: 'ves-basic-web-widgets-extension:Padding',
        datatype: 'string'
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'margin',
        label: 'ves-basic-web-widgets-extension:Margin',
        datatype: 'string',
        default: ''
      },
      {
        name: 'wrap',
        label: 'ves-basic-web-widgets-extension:Wrap Label Text',
        datatype: 'boolean',
        default: true
      }
    ]),

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    designTemplate: function () {
      return '<span class="labelWidget {{me.class}}" style="padding: {{me.padding}}; margin: {{me.margin}};">{{me.text}}</span>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var voiceCommand = '';
      if (projectSettings && projectSettings.projectType === 'HMT') {
        voiceCommand =  ' data-wml-speech-command="{{me.text}}" ';
      }

      var wrapSettingsClass = '';
      if(props.wrap === 'false'){
        wrapSettingsClass = 'noWrap';
      } else {
        wrapSettingsClass =  props.wrap + '-' + typeof props.wrap;
      }
      var margin = '';
      if (props.margin) {
        margin = 'margin:'+ props.margin + '; ';
      }
      var padding = '';
      if (props.padding) {
        padding = 'padding:'+ props.padding + '; ';
      }
      var cssClasses = ['labelWidget'];
      if(props.enableStateFormatting) {
        cssClasses = cssClasses.concat(['basic-state-formatting', 'basic-state-formatting-image']);
      }
      cssClasses = cssClasses.concat(['{{me.class}}', 'wrapSettingsClass']);

      var tmpl = '<div twx-visible ' + voiceCommand +
        'class="' + cssClasses.join(' ') + '" ' +
        'style="' + padding + margin +'" ' +
        'twx-native-events>{{me.text}}</div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxLabel', twxLabel);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder) {

  function twxMap() {
    return {
      elementTag: 'twx-map',
      label: 'ves-basic-web-widgets-extension:Map',
      category: 'basic-html',
      isVisibleInPalette: false,
      properties: [
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'string',
          default: false,
          isBindingTarget: true
        },
        {
          name: 'height',
          label: 'ves-basic-web-widgets-extension:Height',
          datatype: 'number',
          default: 400,
          isBindingTarget: true
        },
        {
          name: 'locationsData',
          label: 'ves-basic-web-widgets-extension:Locations Data Source',
          datatype: 'infotable',
          default: [],
          isBindingTarget: true
        },
        {
          name: 'locationsField',
          label: 'ves-basic-web-widgets-extension:Locations Data Field',
          datatype: 'string',
          default: '',
          isBindingTarget: false,
          editor: 'select',
          fieldDefinitions: 'locationsData'
        },
        {
          name: 'mapCenterLong',
          label: 'ves-basic-web-widgets-extension:Map Center Long',
          datatype: 'number',
          default: 0,
          isBindingTarget: true
        },
        {
          name: 'mapCenterLat',
          label: 'ves-basic-web-widgets-extension:Map Center Lat',
          datatype: 'number',
          default: 0,
          isBindingTarget: true
        },
        {
          name: 'zoom',
          label: 'ves-basic-web-widgets-extension:Zoom',
          datatype: 'number',
          default: 10,
          isBindingTarget: true
        },
        {
          name: 'enableToolTips',
          label: 'ves-basic-web-widgets-extension:Enable Tooltips',
          datatype: 'boolean',
          isBindingTarget: true,
          default: false
        },
        {
          name: 'apiKey',
          label: 'ves-basic-web-widgets-extension:API Key',
          datatype: 'string',
          default: '',
          isBindingTarget: true
        },
        {
          name: 'centerLoc',
          label: 'ves-basic-web-widgets-extension:Center Location',
          datatype: 'location',
          default: '',
          isBindingTarget: true
        },
        {
          name: 'mapType',
          label: 'ves-basic-web-widgets-extension:Map Type',
          datatype: 'string',
          default: 'roads',
          editor: 'select',
          isBindingTarget: true,
          options: [
            {label: 'ves-basic-web-widgets-extension:Roads', value: 'roads'},
            {label: 'ves-basic-web-widgets-extension:Satellite', value: 'satellite'},
            {label: 'ves-basic-web-widgets-extension:Hybrid', value: 'hybrid'},
            {label: 'ves-basic-web-widgets-extension:Terrain', value: 'terrain'}
          ]
        },
        {
          name: 'autoZoom',
          label: 'ves-basic-web-widgets-extension:Auto Zoom Behavior',
          datatype: 'string',
          default: 'always',
          editor: 'select',
          options: [
            {label: 'ves-basic-web-widgets-extension:Always', value: 'always'},
            {label: 'ves-basic-web-widgets-extension:Never', value: 'never'},
            {label: 'ves-basic-web-widgets-extension:Inital Data', value: 'initial'},
            {label: 'ves-basic-web-widgets-extension:Data Refresh', value: 'refresh'}
          ]
        },
        {
          name: 'enableDrag',
          label: 'ves-basic-web-widgets-extension:Enable Drag',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'margin',
          label: 'ves-basic-web-widgets-extension:Margin',
          datatype: 'string',
          default: ''
        }

      ],

      events: [
        {
          name: 'boundsChanged',
          label: 'ves-basic-web-widgets-extension:Bounds Changed'
        },
        {
          name: 'doubleClicked',
          label: 'ves-basic-web-widgets-extension:Double Clicked'
        }
      ],

      designTemplate: function(props) {
        return '<div class="mapContainer" style="height: {{me.height}}px; margin: {{me.margin}};">MAP<twx-container-content></twx-container-content></div>';
      },

      runtimeTemplate: function(props) {
        var tmpl = '<div style="height: {{me.height}}px; margin:'+ props.margin +';">' +
          '<div id="eventTrigger" ng-click="fireEvent();"></div>' +
          '<twx-map-widget map-height="' + props.height + '" enable-tool-tips="' + props.enableToolTips + '" enable-drag="' + props.enableDrag + '" api-key="' + props.apiKey + '" auto-zoom="' + props.autoZoom + '" data="{{me.locationsData}}" center-location="{{me.centerLoc}}" locations-field="' + props.locationsField + '" map-type-id="' + props.mapType + '" map-type="{{me.mapType}}" center-lat="' + props.mapCenterLat + '" center-long="' + props.mapCenterLong + '" zoom="{{me.zoom}}"></twx-map>' +
          '</div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxMap', twxMap);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxPanel(){
    return {
      elementTag: 'twx-panel',

      label: 'ves-basic-web-widgets-extension:Panel',

      category: 'basic-html',

      groups : ["Containers"],

      isContainer: true,

      isVisibleInPalette: true,

      properties: [
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string',
            //default: '',
            isBindingTarget: true
        },
        {
          name: 'width',
          label: 'ves-basic-web-widgets-extension:width-css-units',
          datatype: 'string',
          default: ''
        },
        {
          name: 'height',
          label: 'ves-basic-web-widgets-extension:height-css-units',
          datatype: 'string',
          default: ''
        },
        {
            name: 'padding',
            label: 'ves-basic-web-widgets-extension:Padding',
            datatype: 'string'
        },
        {
          name: 'flexdirection',
          label: 'ves-basic-web-widgets-extension:Flex Direction',
          datatype: 'string',
          default: 'column',
          editor: 'select',
          options: [
            {label: 'ves-basic-web-widgets-extension:Row', value: 'row'},
            {label: 'ves-basic-web-widgets-extension:Column', value: 'column'}
          ]
        },
        {
          name: 'justification',
          label: 'ves-basic-web-widgets-extension:Justification',
          datatype: 'string',
          default: 'flex-start',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Start', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:End', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Even Space Between', value: 'space-between' },
            { label: 'ves-basic-web-widgets-extension:Even Space Around', value: 'space-around' }
          ]
        },
        {
          name: 'alignment',
          label: 'ves-basic-web-widgets-extension:Alignment',
          datatype: 'string',
          default: 'stretch',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Start', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:End', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Stretch', value: 'stretch' },
            { label: 'ves-basic-web-widgets-extension:Baseline', value: 'baseline' }
          ]
        },
        {
          name: 'wrap',
          label: 'ves-basic-web-widgets-extension:Content Wrap',
          datatype: 'string',
          default: 'wrap',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Wrap', value: 'wrap' },
            { label: 'ves-basic-web-widgets-extension:No Wrap', value: 'nowrap' }
          ]
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        }
      ],

      getFlexValue: function(me) {
        if (me.width === '') {
          return '1';
        }
        return '0 0 ' + me.width;
      },

      designTemplate: function(props){
        return '<twx-container-content class="twx-panel {{me.class}}" style="padding: {{me.padding}}; flex-direction:{{me.flexdirection}}; justify-content:{{me.justification}}; align-items: {{me.alignment}}; padding:{{me.padding}}; flex-wrap:{{me.wrap}}; flex: {{ctrl.$widgetDef.getFlexValue(me)}}; height: {{me.height}};"></twx-container-content>';
      },

      runtimeTemplate: function(props){
        var height = '';
        if (props.height) {
          height = 'height: ' + props.height + ';';
        }
        var width = '';
        if (props.width) {
          width = 'width: ' + props.width + ';';
        }
        var padding = '';
        if (props.padding) {
          padding = 'padding:' + props.padding + ';';
        }

        var tmpl = '<div twx-visible class="twx-panel {{me.class}}" style="'+ height + width + padding + '">' +
          '<twx-container-content ' +
            'style="' +
            'flex-direction:' + props.flexdirection + '; ' +
            'justify-content: '+ props.justification + '; ' +
            'align-items: '+ props.alignment + '; ' +
            'flex-wrap: '+ props.wrap + ';"> '  +
          '</twx-container-content></div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxPanel', twxPanel);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function centeredCheck(props){
    return (props.centered === false);
  }

  function twxPopup(){
    return {
      elementTag: 'twx-popup',

      label: 'ves-basic-web-widgets-extension:Popup',

      category: 'basic-html',

      groups : ["Containers"],

      isContainer: true,

      isVisibleInPalette: true,

      properties: [
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string',
            //default: '',
            isBindingTarget: true
        },
        {
          name: 'width',
          label: 'ves-basic-web-widgets-extension:width-css-units',
          datatype: 'string',
          default: '80%'
        },
        {
          name: 'height',
          label: 'ves-basic-web-widgets-extension:height-css-units',
          datatype: 'string',
          default: 'auto'
        },
        {
            name: 'padding',
            label: 'ves-basic-web-widgets-extension:Padding',
            datatype: 'string'
        },
        {
          name: 'type',
          label: 'ves-basic-web-widgets-extension:Type',
          datatype: 'string',
          editor: 'select',
          options: [
                { label: 'ves-basic-web-widgets-extension:Floating Popup', value: 'floatingpopup' },
                { label: 'ves-basic-web-widgets-extension:Modal', value: 'modal' }
            ],
          default: 'floatingpopup'
        },
        {
          name: 'centered',
          label: 'ves-basic-web-widgets-extension:Centered',
          datatype: 'boolean',
          default: true
        },
        {
          name: 'top',
          label: 'ves-basic-web-widgets-extension:widget-prop-alignment-top',
          datatype: 'string',
          default: '',
          isVisible: centeredCheck
        },
        {
          name: 'bottom',
          label: 'ves-basic-web-widgets-extension:widget-prop-alignment-bottom',
          datatype: 'string',
          default: '',
          isVisible: centeredCheck
        },
        {
          name: 'left',
          label: 'ves-basic-web-widgets-extension:widget-prop-alignment-left',
          datatype: 'string',
          default: '',
          isVisible: centeredCheck
        },
        {
          name: 'right',
          label: 'ves-basic-web-widgets-extension:widget-prop-alignment-right',
          datatype: 'string',
          default: '',
          isVisible: centeredCheck
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: false,
          isBindingTarget: true
        },
        {
          name: 'isVisibleAtDesigntime',
          label: 'ves-basic-web-widgets-extension:Is Visible at Designtime',
          datatype: 'boolean',
          default: true,
          isVisible: false
        }
      ],
      services: [
          {
              name: 'hidepopup',
              label: 'ves-basic-web-widgets-extension:Hide Popup'
          },
          {
              name: 'showpopup',
              label: 'ves-basic-web-widgets-extension:Show Popup'
          }
      ],

      cssPosition: function(me) {
        if(me.centered === true) {
          return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        } else {
          return 'top:'+ me.top +';' +
                  'bottom:'+ me.bottom +';' +
                  'left:'+ me.left +';' +
                  'right:'+ me.right +';';
        }
      },

      dependencies: {
        files: ['js/common-html-widgets-ng.js'],
        angularModules: ['common-html-widgets-ng']
      },

      designTemplate: function(props){
        return '<div class="twx-popup-container" ng-show="me.isVisibleAtDesigntime">' +
                 '<div class="popup-overlay" ng-if="me.type === \'modal\'"></div>' +
                 '<div class="twx-popup {{me.class}}" ' +
                      'style="{{ctrl.$widgetDef.cssPosition(me)}} padding: {{me.padding}}; width: {{me.width}}; height: {{me.height}};">' +
                   '<twx-container-content></twx-container-content>' +
                 '</div>' +
               '</div>';
      },

      runtimeTemplate: function(props){
        var height = '';
        if (props.height) {
          height = 'height: ' + props.height + ';';
        }
        var width = '';
        if (props.width) {
          width = 'width: ' + props.width + ';';
        }
        var padding = '';
        if (props.padding) {
          padding = 'padding:' + props.padding + ';';
        }
        var position = '';
        if (props.centered === true){
          position = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
        } else {
          position = 'top:'+ props.top +';' +
                      'bottom:'+ props.bottom +';' +
                      'left:'+ props.left +';' +
                      'right:'+ props.right +';';
        }
        var modalBackdrop = '';
        if (props.type === 'modal') {
          modalBackdrop = '<div class="popup-overlay"></div>';
        }

        var tmpl = '<div class="twx-popup-container" twx-visible twx-popup-service>' +
                     modalBackdrop +
                     '<div class="twx-popup {{me.class}}" style="' + height + width + padding + position + '">' +
                       '<twx-container-content></twx-container-content>' +
                     '</div>' +
                   '</div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxPopup', twxPopup);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxRadioButton() {
    var defaultLabel = 'Radio Label';
    try {
        defaultLabel = i18next.t('ves-basic-web-widgets-extension:Radio Label');
    }
    catch(e){
        //Running on the server
    }
  return {
    elementTag: 'twx-radiobutton',

    label: 'ves-basic-web-widgets-extension:Radio Button',

    category: 'basic-html',

    // until we figure out more about how this should be configured
    isVisibleInPalette: false,

    properties: [
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
      },
      {
        name: 'group',
        label: 'ves-basic-web-widgets-extension:Group',
        datatype: 'string',
        default: 'group'
      },
      {
        name: 'label',
        label: 'ves-basic-web-widgets-extension:Label',
        datatype: 'string',
        default: defaultLabel
      },
      {
        name: 'selected',
        label: 'ves-basic-web-widgets-extension:Selected',
        datatype: 'boolean',
        default: false
      },
      {
        name: 'value',
        label: 'ves-basic-web-widgets-extension:Value',
        datatype: 'string',
        default: 'value'
      }
    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    designTemplate: function () {
      return '<div class="item item-radio {{me.class}}"><input type="radio" name="{{me.group}}" value="{{me.value}}"><div class="item-content">{{me.label}}</div><i class="radio-icon ion-checkmark"></i></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ' +
        'class="item item-radio {{me.class}}" twx-native-events>' +
        '<input type="radio" name="{{me.group}}" value="{{me.value}}">' +
        '<div class="item-content">{{me.label}}</div>' +
        '<i class="radio-icon ion-checkmark"></i></div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxRadioButton', twxRadioButton);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxRange() {
  return {
    elementTag: 'twx-range',

    label: 'ves-basic-web-widgets-extension:Slider',

    category: 'basic-html',

    groups : ["Input"],

    properties: [
      {
        name: 'class',
        label: 'ves-basic-web-widgets-extension:Class',
        datatype: 'string',
        //default: '',
        isBindingTarget: true
      },
      {
        name: 'min',
        label: 'ves-basic-web-widgets-extension:Minimum',
        datatype: 'string',
        default: '0',
        isBindingTarget: true
      },
      {
        name: 'max',
        label: 'ves-basic-web-widgets-extension:Maximum',
        datatype: 'string',
        default: '10',
        isBindingTarget: true
      },
      {
        name: 'step',
        label: 'ves-basic-web-widgets-extension:Step',
        datatype: 'string',
        default: '1'
      },
      {
        name: 'value',
        label: 'ves-basic-web-widgets-extension:Value',
        datatype: 'string',
        default: '5',
        isBindingSource: true,
        isBindingTarget: true
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'disabled',
        label: 'ves-basic-web-widgets-extension:Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true
      },
      {
        name: 'iconleft',
        label: 'ves-basic-web-widgets-extension:Icon Left of Slider',
        datatype: 'string',
        default: 'ion-minus-round'
      },
      {
        name: 'iconright',
        label: 'ves-basic-web-widgets-extension:Icon Right of Slider',
        datatype: 'string',
        default: 'ion-plus-round'
      },
      {
        name: 'padding',
        label: 'ves-basic-web-widgets-extension:Padding',
        datatype: 'string',
        default: ''
      },
      {
        name: 'margin',
        label: 'ves-basic-web-widgets-extension:Margin',
        datatype: 'string',
        default: ''
      }
    ],

    events: [
      {
        name: 'change',
        label: 'ves-basic-web-widgets-extension:Value Changed'
      },
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    dependencies: {
      files: ['js/common-html-widgets-ng.js'],
      angularModules: ['common-html-widgets-ng']
    },

    designTemplate: function() {
      return '<div class="item range {{me.class}}" style="padding:{{me.padding}}; margin:{{me.margin}};">' +
        '<i class="icon {{me.iconleft}}"></i>' +
        '<input type="range" name="volume">' +
        '<i class="icon {{me.iconright}}"></i>' +
        '</div>';
    },

    runtimeTemplate: function(props) {
      var tmpl = '<div ' +
        'ng-show="app.fn.isTrue(me.visible)" ' +
        'class="item range {{me.class}}" ' +
        'style="margin:' + props.margin + '; padding:' + props.padding + ';" ' +
        'twx-native-events="click">' +
        '<i class="icon ' + props.iconleft + '"></i>' +
        '<input twx-range ng-disabled="app.fn.isTrue(me.disabled)" type="range" name="volume" minvalue="{{me.min}}" maxvalue="{{me.max}}" ' +
          'stepvalue="{{me.step}}" ' +
          'ng-model="me.value" ng-change="fireEvent(\'change\', me.value)">' +
        '<i class="icon ' + props.iconright + '"></i>' +
        '</div>';

      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxRange', twxRange);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxRepeater() {
    return {
      elementTag: 'twx-repeater',

      label: 'ves-basic-web-widgets-extension:Repeater',

      category: 'basic-html',

      groups : ["Containers"],

      isRepeater: true,

      properties: [
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string',
            //default: '',
            isBindingTarget: true
        },
        {
          name: 'data',
          label: 'ves-basic-web-widgets-extension:Data',
          datatype: 'infotable',
          isBindingTarget: true
        },
        {
            name: 'repeatercontentclass',
            label: 'ves-basic-web-widgets-extension:Repeater Cell Class',
            datatype: 'string'
        },
        {
          name: 'repeatercontentwidth',
          label: 'ves-basic-web-widgets-extension:Repeater Cell Width (in px or %)',
          datatype: 'string',
          default: '100%'
        },
        {
          name: 'repeatercontentheight',
          label: 'ves-basic-web-widgets-extension:Repeater Cell Height (in px or %)',
          datatype: 'string',
          default: 'auto'
        },
        {
          name: 'repeatercontentpadding',
          label: 'ves-basic-web-widgets-extension:Repeater Cell Padding (in px or %)',
          datatype: 'string'
        },
        {
          name: 'repeatercontentmargin',
          label: 'ves-basic-web-widgets-extension:Repeater Cell Margin (in px or %)',
          datatype: 'string'
        },
        {
          name: 'width',
          label: 'ves-basic-web-widgets-extension:Width',
          datatype: 'string',
          default: '100%'
        },
        {
          name: 'selection',
          label: 'ves-basic-web-widgets-extension:Selection',
          datatype: 'boolean',
          default: false
        },
        {
          name: 'multiselect',
          label: 'ves-basic-web-widgets-extension:Multi-Select',
          datatype: 'boolean',
          default: false,
          isVisible: function(props){
            return (props.selection === true);
          }
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'scrollable',
          label: 'ves-basic-web-widgets-extension:Scrollable',
          datatype: 'boolean',
          default: true,
          isVisible: false
        },
        {
          name: 'direction',
          label: 'ves-basic-web-widgets-extension:Flex Direction',
          datatype: 'string',
          default: 'column',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Top Down', value: 'column' },
            { label: 'ves-basic-web-widgets-extension:Left to Right', value: 'row' },
            { label: 'ves-basic-web-widgets-extension:Bottom Up', value: 'column-reverse' },
            { label: 'ves-basic-web-widgets-extension:Right to Left', value: 'row-reverse' }
          ]
        },
        {
          name: 'justification',
          label: 'ves-basic-web-widgets-extension:Justification',
          datatype: 'string',
          default: 'flex-start',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Stack to Left', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:Stack to Right', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Even Space Between', value: 'space-between' },
            { label: 'ves-basic-web-widgets-extension:Even Space Around', value: 'space-around' }
          ]
        },
        {
          name: 'alignment',
          label: 'ves-basic-web-widgets-extension:Alignment',
          datatype: 'string',
          default: 'stretch',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Start', value: 'flex-start' },
            { label: 'ves-basic-web-widgets-extension:End', value: 'flex-end' },
            { label: 'ves-basic-web-widgets-extension:center-align', value: 'center' },
            { label: 'ves-basic-web-widgets-extension:Stretch', value: 'stretch' },
            { label: 'ves-basic-web-widgets-extension:Baseline', value: 'baseline' }
          ]
        },
        {
          name: 'wrap',
          label: 'ves-basic-web-widgets-extension:Content Wrap',
          datatype: 'string',
          default: 'nowrap',
          editor: 'select',
          options: [
            { label: 'ves-basic-web-widgets-extension:Wrap', value: 'wrap' },
            { label: 'ves-basic-web-widgets-extension:No Wrap', value: 'nowrap' }
          ]
        }
      ],

      events: [
        {
          name: 'itemclick',
          label: 'ves-basic-web-widgets-extension:Item Click'
        }
      ],

      designTemplate: function () {
        return '<div class="{{me.class}}" style="flex-wrap: {{me.wrap}}; -webkit-flex-wrap: {{me.wrap}}; width: {{me.width}};"><div class="repeater-cell {{me.repeatercontentclass}}" style="height: {{me.repeatercontentheight}}; display: flex; justify-content: {{me.justification}}; width: {{me.repeatercontentwidth}}; padding: {{me.repeatercontentpadding}}; margin: {{me.repeatercontentmargin}};"><twx-repeater-content style="display: flex; flex-direction: {{me.direction}}; justify-content: {{me.justification}}; -webkit-justify-content: {{me.justification}}; align-self: {{me.alignment}}; width: {{me.repeatercontentwidth}};"></twx-repeater-content></div></div>';
      },

      runtimeTemplate: function (properties) {
        var selection = '';
        if(properties.selection === 'true'){
          selection = 'selection';
        }
        var scrollableClass = (properties.scrollable === 'true') ? 'scrollable' : '';

        var padding = "";
        if (properties.repeatercontentpadding) {
            padding = "padding: " + properties.repeatercontentpadding + "; ";
        }

        var margin = "";
        if (properties.margin) {
            margin = "margin: " + properties.margin + "; ";
        }

        var tmpl = '<div twx-visible class="repeater {{me.class}} '+ selection +' '+ scrollableClass +'" style="flex-wrap: {{me.wrap}}; -webkit-flex-wrap: {{me.wrap}}; width: {{me.width}};">' +
                      '<div class="repeater-cell {{me.repeatercontentclass}} ng-class:{\'selected\': app.fn.isItemSelected(item)}" ng-click="app.fn.clickItemInRepeater(item,me.data,me.multiselect);fireEvent(\'itemclick\', item,me.data,me.multiselect); "' +
                        'style="height: {{me.repeatercontentheight}}; display: flex; justify-content: {{me.justification}};' +
                        'width: {{me.repeatercontentwidth}}; ' + padding + margin + '" ' +
                        'ng-repeat="item in me.data">' +
                          '<twx-repeater-content style="display: flex; flex-direction: {{me.direction}}; justify-content: {{me.justification}}; -webkit-justify-content: {{me.justification}}; align-self: {{me.alignment}}; width: {{me.repeatercontentwidth}};"></twx-repeater-content>' +
                      '</div>' +
                    '</div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxRepeater', twxRepeater);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxRow() {
    return {
      elementTag: 'twx-row',

      label: 'ves-basic-web-widgets-extension:Row',

      category: 'basic-html',

      outputElementsOnly: true,

      isValidDropTarget: function (targetEl, sourceEl) {
        return targetEl && targetEl.tagName.toLowerCase() === 'twx-gridlayout';
      },

      isVisibleInPalette: false,

      isContainer: true,

      properties: [
        {
          name: 'rowclass',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string'
        },
        {
          name: 'rowheight',
          label: 'ves-basic-web-widgets-extension:Row Height (in px)',
          datatype: 'string',
          default: ''
        }
      ],

      designTemplate: function () {
        return '<twx-container-content class="{{me.rowclass}}" style="height:{{me.rowheight}};"></twx-container-content>';
      },

      runtimeTemplate: function (properties) {
        var height = '';
        if (properties.rowheight) {
          height = 'height: '+ properties.rowheight;
        }
        var tmpl = '<div class="row ' + properties.rowclass + '" style="'+height+'"></div>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxRow', twxRow);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {
  var defaultText = 'Dropdown Label';
  try {
    defaultText = i18next.t('ves-basic-web-widgets-extension:Dropdown Label');
  }
  catch(e){
    //Running on the server
  }

  function twxSelect() {

    return {
      elementTag: 'twx-select',

      label: 'ves-basic-web-widgets-extension:Select',

      category: 'basic-html',

      groups : ["Input"],

      properties: [
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string',
            //default: '',
            isBindingTarget: true
        },
        {
          name: 'value',
          label: 'ves-basic-web-widgets-extension:Value',
          datatype: 'string',
          isBindingTarget: true,
          isBindingSource: true,
          default: ''
        },
        {
          name: 'list',
          label: 'ves-basic-web-widgets-extension:List',
          datatype: 'infotable',
          isBindingTarget: true
        },
        {
          name: 'valuefield',
          label: 'ves-basic-web-widgets-extension:Value Field',
          datatype: 'string',
          editor: 'select',
          default: '',
          applyFieldsFromDataSource: 'list'
        },
        {
          name: 'displayfield',
          label: 'ves-basic-web-widgets-extension:Display Field',
          datatype: 'string',
          editor: 'select',
          default: '',
          applyFieldsFromDataSource: 'list'
        },
        //{
        //  name: 'multiselect',
        //  label: 'ves-basic-web-widgets-extension:Multi-Select',
        //  datatype: 'boolean',
        //  default: false
        //},
        {
          name: 'label',
          label: 'ves-basic-web-widgets-extension:Label',
          datatype: 'string',
          default: defaultText
        },
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'disabled',
          label: 'ves-basic-web-widgets-extension:Disabled',
          datatype: 'boolean',
          default: false,
          isBindingTarget: true
        },
        {
          name: 'itempadding',
          label: 'ves-basic-web-widgets-extension:List Item Padding',
          datatype: 'string',
          default: ''
        }
      ],

      events: [
        {
          name: 'change',
          label: 'ves-basic-web-widgets-extension:Value Changed'
        }
      ],

      designTemplate: function () {
        return '<div class="item item-input item-select {{me.class}}" style="padding:{{me.itempadding}};">' +
                      '<div class="input-label">' +
                        '{{me.label}}' +
                      '</div>' +
                      '<select>' +
                        '<option>{{me.valuefield}}</option>' +
                      '</select>' +
                    '</div>';

      },

      runtimeTemplate: function (props) {
        if (!props.valuefield) {
          props.valuefield = 'value';
        }

        if (!props.displayfield) {
          props.displayfield = 'display';
        }
        var tmpl = '<div twx-visible class="item item-input item-select {{me.class}}"  style="padding: '+ props.itempadding +';">' +
                      '<div class="input-label">' +
                        props.label +
                      '</div>' +
                      '<select twx-disabled ng-model="me.value" ng-change="app.fn.clickItemInSelect(me.list,me.multiselect,me.value,me.valuefield);fireEvent(\'change\', me.value)" >' +
                        '<option ng-repeat="item in me.list" class="item" value="{{item.' + props.valuefield + '}}">{{item.'+ props.displayfield +'}}</option>' +
                      '</select>' +
                    '</div>';

        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxSelect', twxSelect);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxTab() {
    var defaultTitle = 'Tab';
    try {
      defaultTitle = i18next.t('ves-basic-web-widgets-extension:Tab');
    }
    catch(e){
      //Running on the server
    }

    return {
      elementTag: 'twx-tab',

      label: 'ves-basic-web-widgets-extension:Tab',

      category: 'basic-html',

      outputElementsOnly: true,

      isValidDropTarget: function (targetEl, sourceEl) {
        return targetEl && targetEl.tagName.toLowerCase() === 'twx-tabs';
      },

      isVisibleInPalette: false,

      isContainer: true,

      widgetTreeCls: 'not-draggable',

      properties: [
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string'
        },
        {
          name: 'title',
          label: 'ves-basic-web-widgets-extension:Title',
          datatype: 'string',
          default: defaultTitle
        },
        {
          name: 'padding',
          label: 'ves-basic-web-widgets-extension:Padding',
          datatype: 'string'
        }
      ],

      dependencies: {
        files: ['js/common-html-widgets-ng.js'],
        angularModules: ['common-html-widgets-ng']
      },

      designTemplate: function () {
        return '<twx-tab-designer title="{{me.title}}" padding="{{me.padding}}" class="not-draggable {{me.class}}"><twx-container-content></twx-container-content><span class="tab-designer-label">{{"ves-basic-web-widgets-extension:Tab Content" | i18next: {tabTitle: me.title } }}</span></twx-tab-designer>';
      },

      runtimeTemplate: function (props) {
        var tmpl = '<twx-tab class="' + props.class + '" title="' + props.title + '" style="padding:'+ props.padding +';" ></twx-tab>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxTab', twxTab);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function (twxAppBuilder) {

  function twxTabs() {
    return {
      elementTag: 'twx-tabs',

      label: 'ves-basic-web-widgets-extension:Tabs',

      category: 'basic-html',

      groups : ["Containers"],

      isContainer: true,

      properties: [
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true
        },
        {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
        },
        {
          name: 'taborientation',
          label: 'ves-basic-web-widgets-extension:Tab Orientation',
          datatype: 'string',
          default: 'horizontal',
          editor: 'select',
          options: [
            {label: 'ves-basic-web-widgets-extension:Horizontal', value: 'horizontal'},
            {label: 'ves-basic-web-widgets-extension:Vertical', value: 'vertical'}
          ],
          alwaysWriteAttribute: true
        },
        {
          name: 'tabpadding',
          label: 'ves-basic-web-widgets-extension:Tab Padding',
          datatype: 'string'
        },
        {
          name: 'stripclass',
          label: 'ves-basic-web-widgets-extension:Tab Strip Class',
          datatype: 'string',
          default: ''
        },
        {
          name: 'margin',
          label: 'ves-basic-web-widgets-extension:Margin',
          datatype: 'string',
          default: ''
        }
      ],

      events: [
        {
          name: 'clicktab',
          label: 'ves-basic-web-widgets-extension:Tab Click'
        }
      ],

      initialContent: function(){
        return '<twx-tab twx-widget><twx-container-content></twx-container-content></twx-tab>';
      },

      dependencies: {
        files: ['js/common-html-widgets-ng.js'],
        angularModules: ['common-html-widgets-ng']
      },

      designTemplate: function () {
        return '<twx-tabs-designer class="{{me.taborientation}} {{me.class}}" stripclass="{{me.stripclass}}" style="padding: {{me.tabpadding}}; margin: {{me.margin}};"><twx-container-content></twx-container-content></twx-tabs-designer>';
      },

      runtimeTemplate: function (properties) {
        var tmpl = '<twx-tabs stripclass="'+ properties.stripclass +'" clicktab="fireEvent(\'clicktab\');" twx-visible class="twx-tabs {{me.class}} '+ properties.taborientation +'" style="padding:'+ properties.tabpadding +'; margin: '+ properties.margin +';"><twx-container-content></twx-container-content></twx-tabs>';
        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxTabs', twxTabs);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxTextArea() {
    return {
        elementTag: 'twx-textarea',

        label: 'ves-basic-web-widgets-extension:Text Area',

        category: 'basic-html',

        groups : ["Input"],

        properties: [
        {
            name: 'class',
            label: 'ves-basic-web-widgets-extension:Class',
            datatype: 'string',
            //default: '',
            isBindingTarget: true
        },
        {
            name: 'text',
            label: 'ves-basic-web-widgets-extension:Text',
            datatype: 'string',
            default: '',
            isBindingTarget: true,
            isBindingSource: true
        },
        {
            name: 'placeholder',
            label: 'ves-basic-web-widgets-extension:Placeholder',
            datatype: 'string',
            default: '',
            isBindingTarget: true
        },
        {
            name: 'label',
            label: 'ves-basic-web-widgets-extension:Label',
            datatype: 'string',
            default: ''
        },
        {
            name: 'rows',
            label: 'ves-basic-web-widgets-extension:Rows',
            datatype: 'number',
            validationRegex: '^[\\d]+$',
            min: 1,
            default: 3
        },
        {
            name: 'readonly',
            label: 'ves-basic-web-widgets-extension:Read Only',
            datatype: 'boolean',
            default: false
        },
        {
            name: 'disabled',
            label: 'ves-basic-web-widgets-extension:Disabled',
            datatype: 'boolean',
            default: false,
            isBindingTarget: true
        },
        {
            name: 'maxlength',
            label: 'ves-basic-web-widgets-extension:Max Length',
            datatype: 'number',
            min: 0
        },
        {
            name: 'visible',
            label: 'ves-basic-web-widgets-extension:Visible',
            datatype: 'boolean',
            default: true,
            isBindingTarget: true
        },
          {
            name: 'padding',
            label: 'ves-basic-web-widgets-extension:Padding',
            datatype: 'string',
            default: ''
          },
          {
            name: 'margin',
            label: 'ves-basic-web-widgets-extension:Margin',
            datatype: 'string',
            default: ''
          }
      ],

        events: [
            {
                name: 'change',
                label: 'ves-basic-web-widgets-extension:Value Changed'
            },
            {
              name: 'click',
              label: 'ves-basic-web-widgets-extension:Click'
            }
        ],

        designTemplate: function(props) {
            return '<div class="textarea-widget {{me.class}}" style="margin: {{me.margin}}; padding: {{me.padding}};"><label>{{me.label}}</label><textarea maxlength="{{me.maxlength}}" rows="{{me.rows}}" placeholder="{{me.placeholder}}">{{me.text}}</textarea></div>';
        },

        runtimeTemplate: function(props) {

            var tmpl = '<div ' +
              'twx-visible ' +
              'class="twxTextArea {{me.class}}" ' +
              'style="margin:'+ props.margin +'; padding: '+ props.padding +';"' +
              'twx-native-events="click">' +
              '<label>{{me.label}}</label>' +
              '<textarea ' + ((props.disabled === true) ? 'disabled' : '') + ((props.readonly === true) ? 'readonly' : '') + ' maxlength="{{me.maxlength}}" rows="{{me.rows}}" placeholder="{{me.placeholder}}" ' +
              'twx-disabled ' +
              'ng-model="me.text" ' +
              'onchange="twx.app.fn.triggerStudioEvent(event, \'change\', event.target.value)"></textarea></div>';
            return tmpl;

        }
    };
}

twxAppBuilder.widget('twxTextArea', twxTextArea);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxTextInput() {
  /**
   * @param {Object} widgetProps - key/value pairs for the properties on the widget
   * @return {boolean} True when the widget is set to be a numeric input, otherwise false is returned
   */
  function isNumericInput (widgetProps) {
    return (widgetProps && widgetProps.inputType === 'number');
  }
  var placeholderText = 'placeholder text';
  var defaultLabel = 'Input Label';
  try {
    placeholderText = i18next.t('ves-basic-web-widgets-extension:placeholder text');
      defaultLabel = i18next.t('ves-basic-web-widgets-extension:Input Label');
  }
  catch(e){
    //Running on the server
  }

  return {
    elementTag: 'twx-text-input',

    label: 'ves-basic-web-widgets-extension:Text Input',

    category: 'basic-html',

    groups : ["Input"],

    properties: [
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
      },
      {
        name: 'text',
        label: 'ves-basic-web-widgets-extension:Text',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        isBindingSource: true
      },
      {
        name: 'inputType',
        label: 'ves-basic-web-widgets-extension:Type',
        datatype: 'string',
        editor: 'select',
        default: 'text',
        options: [
          {label: 'ves-basic-web-widgets-extension:Text', value: 'text'},
          {label: 'ves-basic-web-widgets-extension:Number', value: 'number'}
        ]
      },
      {
        name: 'minValue',
        label: 'ves-basic-web-widgets-extension:Minimum',
        datatype: 'number',
        default: 0,
        isVisible: isNumericInput
      },
      {
        name: 'maxValue',
        label: 'ves-basic-web-widgets-extension:Maximum',
        datatype: 'number',
        isVisible: isNumericInput
      },
      {
        name: 'stepValue',
        label: 'ves-basic-web-widgets-extension:Step',
        datatype: 'number',
        default: 1,
        isVisible: isNumericInput
      },
      {
        name: 'type',
        label: 'ves-basic-web-widgets-extension:Label Position',
        datatype: 'string',
        default: 'placeholder',
        editor: 'select',
        options: [
              { label: 'ves-basic-web-widgets-extension:Placeholder', value: 'placeholder' },
              { label: 'ves-basic-web-widgets-extension:Inline Label', value: 'inlinelabel' },
              { label: 'ves-basic-web-widgets-extension:Stacked Label', value: 'stackedlabel' },
              { label: 'ves-basic-web-widgets-extension:Floating Label', value: 'floatinglabel' }
          ]
      },
      {
        name: 'textalign',
        label: 'ves-basic-web-widgets-extension:Align',
        datatype: 'string',
        default: 'left',
        editor: 'textalign',
        options: [
              { label: 'ves-basic-web-widgets-extension:Left', value: 'left' },
              { label: 'ves-basic-web-widgets-extension:Center', value: 'center' },
              { label: 'ves-basic-web-widgets-extension:Right', value: 'right' }
              //{ label: 'ves-basic-web-widgets-extension:Justify', value: 'justify' }
          ]
      },
      {
        name: 'placeholder',
        label: 'ves-basic-web-widgets-extension:Placeholder',
        datatype: 'string',
        default: placeholderText,
        isBindingTarget: true
      },
      {
        name: 'label',
        label: 'ves-basic-web-widgets-extension:Label',
        datatype: 'string',
        default: defaultLabel
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'disabled',
        label: 'ves-basic-web-widgets-extension:Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true
      },
      {
        name: 'padding',
        label: 'ves-basic-web-widgets-extension:Padding',
        datatype: 'string',
        default: ''
      },
      {
        name: 'margin',
        label: 'ves-basic-web-widgets-extension:Margin',
        datatype: 'string',
        default: ''
      }
    ],

    events: [
      {
        name: 'change',
        label: 'ves-basic-web-widgets-extension:Value Changed'
      },
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    designTemplate: function () {
      return '<div ng-switch on="me.type">' +
                '<label ng-switch-when="placeholder"   class="item item-input {{me.class}}"                     style="margin:{{me.margin}}; padding:{{me.padding}};">                                             <input style="text-align: {{me.textalign}}" type="text" placeholder="{{me.placeholder}}" /></label>' +
                '<label ng-switch-when="inlinelabel"   class="item item-input {{me.class}}"                     style="margin:{{me.margin}}; padding:{{me.padding}};"><span class="input-label">{{me.label}}</span><input style="text-align: {{me.textalign}}" type="text" placeholder="{{me.placeholder}}" /></label>' +
                '<label ng-switch-when="stackedlabel"  class="item item-input item-stacked-label {{me.class}}"  style="margin:{{me.margin}}; padding:{{me.padding}};"><span class="input-label">{{me.label}}</span><input style="text-align: {{me.textalign}}" type="text" placeholder="{{me.placeholder}}" /></label>' +
                '<label ng-switch-when="floatinglabel" class="item item-input item-floating-label {{me.class}}" style="margin:{{me.margin}}; padding:{{me.padding}};"><span class="input-label">{{me.label}}</span><input style="text-align: {{me.textalign}}" type="text" placeholder="{{me.placeholder}}" /></label>' +
              '</div>';
    },

    runtimeTemplate: function (props) {
      var type = props.type;
      var labelCls = 'item item-input ';
      if (type === 'stackedlabel') {
        labelCls += 'item-stacked-label ';
      }
      else if (type === 'floatinglabel') {
        labelCls += 'item-floating-label ';
      }
      labelCls += '{{me.class}}';

      var labelSpan = '';
      if (type === 'floatinglabel' || type === 'inlinelabel' || type === 'stackedlabel') {
        labelSpan = '<span class="input-label">{{me.label}}</span>';
      }

      //jshint multistr:true
      var tmpl = '<label twx-visible class="' + labelCls + '" '+
                   'twx-native-events="click"> '+ labelSpan +
                   '<input style="text-align: {{me.textalign}};" type="' + (props.inputType || 'text') + '" '+
                     'twx-disabled '+
                     'placeholder="{{me.placeholder}}" '+
                     'twx-model="me.text" '+
                     'data-wml-speech-command="' + (props.label|| '') + '" ' +
                     'onchange="twx.app.fn.triggerStudioEvent(event, \'change\', event.target.value)"';

      if(props.inputType === 'number') {
        // add the attributes for a numeric input
        tmpl += ' min="{{me.minValue}}" max="{{me.maxValue}}" step="{{me.stepValue}}"';
      }

      // close the <input> and <label> tags
      tmpl += '/></label>';

      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxTextInput', twxTextInput);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxToggle() {
    var defaultLabel = 'Input Label';
    try {
        defaultLabel = i18next.t('ves-basic-web-widgets-extension:Input Label');
    }
    catch(e){
        //Running on the server
    }
  return {
    elementTag: 'twx-toggle',

    label: 'ves-basic-web-widgets-extension:Toggle',

    category: 'basic-html',

    groups : ["Input"],

    properties: [
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
      },
      {
        name: 'value',
        label: 'ves-basic-web-widgets-extension:Value',
        datatype: 'boolean',
        isBindingTarget: true,
        isBindingSource: true,
        default: false
      },
      {
        name: 'label',
        label: 'ves-basic-web-widgets-extension:Label',
        datatype: 'string',
        default: defaultLabel
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'disabled',
        label: 'ves-basic-web-widgets-extension:Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true
      },
      {
        name: 'margin',
        label: 'ves-basic-web-widgets-extension:Margin',
        datatype: 'string',
        default: ''
      }

    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    designTemplate: function () {
      return '<div class="item item-toggle {{me.class}}" style="margin: {{me.margin}};">{{me.label}}<label class="toggle toggle-assertive"><input type="checkbox"><div class="track"><div class="handle"></div></div></label></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div twx-visible ' +
        'class="item item-toggle {{me.class}}" ' +
        'style="margin:'+ props.margin +';">' +
        '{{me.label}}' +
        '<label class="toggle toggle-assertive">' +
        '<input type="checkbox" ' +
        'twx-disabled ' +
        'twx-model="me.value" ' +
        'onchange="twx.app.fn.triggerStudioEvent(event, \'click\');">' +
        '<div class="track"><div class="handle"></div></div></label></div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxToggle', twxToggle);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxTimeSeriesChart() {
  return {
    elementTag: 'twx-time-series-chart',

    label: 'ves-basic-web-widgets-extension:Time Series Chart',

    category: 'basic-html',

    properties: [
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
      },
      {
        name: 'data',
        label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
        isBindingTarget: true
      },
      {
        name: 'autoUpdate',
        label: 'ves-basic-web-widgets-extension:Auto Update',
        datatype: 'boolean',
        default: true,
        isVisible: false
      },
      {
        name: 'labelsField',
        label: 'ves-basic-web-widgets-extension:X-axis Field',
        datatype: 'string',
        editor: 'select',
        applyFieldsFromDataSource: 'data',
        default: ''
      },
      {
        name: 'valuesField',
        label: 'ves-basic-web-widgets-extension:Y-axis Field',
        datatype: 'string',
        editor: 'select',
        applyFieldsFromDataSource: 'data',
        default: ''
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'margin',
        label: 'ves-basic-web-widgets-extension:Margin',
        datatype: 'string',
        default: ''
      }
    ],

    services: [
      {
        name: 'updateChart',
        label: 'ves-basic-web-widgets-extension:Update Chart'
      }
    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    dependencies: {
      files: ['js/moment.min.js', 'js/Chart.min.js', 'js/chartjs-ng.js'],
      angularModules: ['chartjs-ng']
    },

    designTemplate: function () {
      return '<div class="chart-placeholder {{me.class}} time-series-chart" style="padding: {{me.margin}};">' +
          '<p class="chart-placeholder-text">{{::"ves-basic-web-widgets-extension:Time Series Chart" | i18next}}</p></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl =
        '<div twx-visible>' +
          '<div class="chart-placeholder {{me.class}} time-series-chart" ng-if="!me.data.length">' +
            '<p class="chart-placeholder-text">Data is not loaded yet.</p>' +
          '</div>' +
          '<div ng-if="me.data.length" ' +
            'class="chart-size {{me.class}} time-series-chart" ' +
            'style="margin:'+ props.margin +';" ' +
            'cjs-chart ' +
            'auto-update="'+ props.autoUpdate +'" ' +
            'chart-type="timeseries" ' +
            'data="me.data" ' +
            'labels-field="{{me.labelsField}}" ' +
            'values-field="{{me.valuesField}}"' +
            'twx-native-events>' +
          '</div>' +
        '</div>';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxTimeSeriesChart', twxTimeSeriesChart);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxToggleButton() {
  return {
    elementTag: 'twx-toggle-button',

    label: 'ves-basic-web-widgets-extension:Toggle Button',

    category: 'basic-html',

    groups : ["Input"],

    properties: [
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          //default: '',
          isBindingTarget: true
      },
      {
        name: 'pressed',
        label: 'ves-basic-web-widgets-extension:Pressed',
        datatype: 'boolean',
        isBindingSource: true,
        isBindingTarget: true,
        default: false
      },
      {
        name: 'notpressed',
        label: 'ves-basic-web-widgets-extension:Not Pressed',
        datatype: 'boolean',
        isBindingSource: true,
        isBindingTarget: true,
        default: true
      },
      {
        name: 'src',
        label: 'ves-basic-web-widgets-extension:Image when Pressed',
        datatype: 'resource_url',
        resource_image: true,
        allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
        default: '',
        isBindingTarget: true
      },
      {
        name: 'srcnotpressed',
        label: 'ves-basic-web-widgets-extension:Image when Not Pressed',
        datatype: 'resource_url',
        allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
        resource_image: true,
        default: '',
        isBindingTarget: true
      },
      {
        name: 'backgroundColor',
        label: 'ves-basic-web-widgets-extension:Background Color',
        datatype: 'string',
        isBindingTarget: true,
        default: '#c2c2c2'
      },
      {
        name: 'backgroundColorPressed',
        label: 'ves-basic-web-widgets-extension:Background Color Pressed',
        datatype: 'string',
        isBindingTarget: true,
        default: '#000'
      },
      {
        name: 'width',
        label: 'ves-basic-web-widgets-extension:Width',
        datatype: 'string',
        default: '48px'
      },
      {
        name: 'height',
        label: 'ves-basic-web-widgets-extension:Height',
        datatype: 'string',
        default: '48px'
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'disabled',
        label: 'ves-basic-web-widgets-extension:Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true
      }
    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      },
      {
        name: 'pressed',
        label: 'ves-basic-web-widgets-extension:Pressed'
      },
      {
        name: 'unpressed',
        label: 'ves-basic-web-widgets-extension:Unpressed'
      }
    ],

    designTemplate: function () {
      return '<img class="{{me.class}}" style="width: {{me.width}}; height: {{me.height}}; background: {{me.backgroundColor}}" ng-src="{{me.src}}" />';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<img class="{{me.class}}" twx-visible ' +
        'style="background: {{app.fn.isTrue(me.pressed) ? me.backgroundColorPressed : me.backgroundColor}}; width: {{me.width}}; height: {{me.height}};" ' +
        'ng-src="{{me.pressed ? me.src : me.srcnotpressed}}" ' +
        'ng-click="me.pressed = app.fn.isTrue(me.disabled) ? me.pressed : !app.fn.isTrue(me.pressed); me.notpressed = app.fn.isTrue(me.disabled) ? me.notpressed : !me.pressed; ' +
        'fireEvent(\'click\'); ' +
        'fireEvent((app.fn.isTrue(me.pressed) ? \'pressed\' : \'unpressed\'))" />';
      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxToggleButton', twxToggleButton);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
(function(twxAppBuilder){

  function twxToolbar(){
    return {
      elementTag: 'twx-toolbar',

      label: 'ves-basic-web-widgets-extension:Toolbar',

      category: 'basic-html',

      isContainer: true,

      isVisibleInPalette: false,

      outputElementsOnly: true,

      properties: [
        {
          name: 'visible',
          label: 'ves-basic-web-widgets-extension:Visible',
          datatype: 'boolean',
          default: true,
          isBindingTarget: true,
        },
        {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string'
        }
      ],

      designTemplate: function(props){
        return '<div class="toolbar {{me.class}}"><twx-container-content></twx-container-content></div>';
      },

      runtimeTemplate: function(props){
        var tmpl = '<div twx-visible class="toolbar ' + props.class + '"><twx-container-content></twx-container-content></div>';

        return tmpl;
      }
    };
  }

  twxAppBuilder.widget('twxToolbar', twxToolbar);

})(twxAppBuilder);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxValueDisplay() {
  var defaultText = 'Label';
  var valueText = 'Value';
  try {
    defaultText = i18next.t('ves-basic-web-widgets-extension:Label');
    valueText = i18next.t('ves-basic-web-widgets-extension:Value');
  }
  catch(e){
    //Running on the server
  }
  return {
    elementTag: 'twx-valuedisplay',

    label: 'ves-basic-web-widgets-extension:Value Display',

    category: 'basic-html',

    properties: addStateFormattingProperties([
      {
          name: 'class',
          label: 'ves-basic-web-widgets-extension:Class',
          datatype: 'string',
          isBindingTarget: true
      },
      {
        name: 'value',
        label: 'ves-basic-web-widgets-extension:Value',
        datatype: 'string',
        default: valueText,
        isBindingTarget: true,
        defaultDependentField: true
      },
      {
        name: 'label',
        label: 'ves-basic-web-widgets-extension:Label',
        datatype: 'string',
        default: defaultText,
        isBindingTarget: true
      },
      {
        name: 'class',
        label: 'ves-basic-web-widgets-extension:Class',
        datatype: 'string',
        default: 'simple-label',
        isBindingTarget: true
      },
      {
        name: 'visible',
        label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
        default: true,
        isBindingTarget: true
      },
      {
        name: 'padding',
        label: 'ves-basic-web-widgets-extension:Padding',
        datatype: 'string',
        default: ''
      },
      {
        name: 'margin',
        label: 'ves-basic-web-widgets-extension:Margin',
        datatype: 'string',
        default: ''
      },
      {
        name: 'type',
        label: 'ves-basic-web-widgets-extension:Type',
        datatype: 'string',
        editor: 'select',
        options: [
              { label: 'ves-basic-web-widgets-extension:Inline', value: 'inline' },
              { label: 'ves-basic-web-widgets-extension:Inline With Label', value: 'inlinelabel' },
              { label: 'ves-basic-web-widgets-extension:Stacked Label', value: 'stackedlabel' },
              { label: 'ves-basic-web-widgets-extension:Stacked Label KPI', value: 'stackedlabelkpi' }
          ],
        default: 'inlinelabel'
      }
    ]),

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    designTemplate: function () {
      return '<div ng-switch on="me.type">' +
                  '<div ng-switch-when="inline" class="{{me.class}}" style="margin:{{me.margin}}; padding:{{me.padding}};">{{me.value}}</div>' +
                  '<div ng-switch-when="inlinelabel" class="item {{me.class}}" style="margin:{{me.margin}}; padding:{{me.padding}};">{{me.label}}<span class="item-note">{{me.value}}</span></div>' +
                  '<div ng-switch-when="stackedlabel" class="item {{me.class}}" style="margin:{{me.margin}}; padding:{{me.padding}};"><div class="valuedisplay-label">{{me.label}}</div><div class="valuedisplay-value">{{me.value}}</div></div>' +
                  '<div ng-switch-when="stackedlabelkpi" class="item {{me.class}}" style="margin:{{me.margin}}; padding:{{me.padding}};"><div class="valuedisplay-label">{{me.label}}</div><div class="valuedisplay-value">{{me.value}}</div></div>' +
              '</div>';
    },

    runtimeTemplate: function (props) {
      var cssClasses = ['item', 'valuedisplay-container'];
      if(props.enableStateFormatting) {
        cssClasses = cssClasses.concat(['basic-state-formatting']);
      }
      cssClasses = cssClasses.concat(['{{me.class}}']);

      var tmpl = '<div twx-visible  ';
      switch(props.type) {
        case 'inline':
          // remove the 'item' class from this case
          cssClasses.splice(cssClasses.indexOf('item'), 1);
          tmpl += ' ' +
            'class="' + cssClasses.join(' ') + '" ' +
            'twx-native-events ' +
            'style="margin:'+ props.margin +'; padding:'+ props.padding +';">{{me.value}}</div>';
          break;
        case 'stackedlabel':
          cssClasses.push('stackedlabel');
          tmpl += ' class="' + cssClasses.join(' ') + '" ' +
                    'twx-native-events ' +
                    'style="margin:'+ props.margin +'; padding:'+ props.padding +';"> ' +
                    '<div class="valuedisplay-label">{{me.label}}</div>' +
                    '<div class="valuedisplay-value">{{me.value}}</div>' +
                  '</div>';
          break;
        case 'stackedlabelkpi':
          cssClasses.push('stackedlabelkpi');
          tmpl += ' ' +
                    'class="' + cssClasses.join(' ') + '" ' +
                    'style="margin:'+ props.margin +'; padding:'+ props.padding +';"' +
                    'twx-native-events>' +
                    '<div class="valuedisplay-label">{{me.label}}</div>' +
                    '<div class="valuedisplay-value-kpi">{{me.value}}</div>' +
                  '</div>';
          break;
        default:
          //inlinelabel is the default value, so it come through as blank
          cssClasses.push('inlinelabel');
          tmpl += ' twx-native-events ' +
                    'class="' + cssClasses.join(' ') + '" ' +
                    'style="margin:'+ props.margin +'; padding:'+ props.padding +';">' +
                    '{{me.label}}' +
                    '<span class="item-note">{{me.value}}</span>' +
                  '</div>';
          break;
      }

      return tmpl;
    }
  };
}

twxAppBuilder.widget('twxValueDisplay', twxValueDisplay);

/* begin copyright text
 *
 * Copyright © 2016 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */
function twxVideo() {
    return {
        elementTag: 'twx-video',

        label: 'ves-basic-web-widgets-extension:Video',

        category: 'basic-html',

        properties: [
            {
                name: 'videosrc',
                label: 'ves-basic-web-widgets-extension:Video Source',
                datatype: 'resource_url',
                allowedPatterns: ['.mp4','.webm'],
                default: '',
                isBindingTarget: true
            },
            {
                name: 'class',
                label: 'ves-basic-web-widgets-extension:Class',
                datatype: 'string',
                //default: '',
                isBindingTarget: true
            },
            {
                name: 'width',
                label: 'ves-basic-web-widgets-extension:Width',
                datatype: 'string',
                default: '',
                isBindingTarget: true
            },
            {
                name: 'height',
                label: 'ves-basic-web-widgets-extension:Height',
                datatype: 'string',
                default: '',
                isBindingTarget: true
            },
            {
                name: 'showcontrols',
                label: 'ves-basic-web-widgets-extension:Show Controls',
                datatype: 'boolean',
                alwaysWriteAttribute: true,
                default: true,
                isBindingTarget: true
            },
            {
                name: 'preload',
                label: 'ves-basic-web-widgets-extension:Preload',
                datatype: 'string',
                default: 'none',
                editor: 'select',
                options: [
                    {label: 'ves-basic-web-widgets-extension:Content', value: 'auto'},
                    {label: 'ves-basic-web-widgets-extension:Metadata Only', value: 'metadata'},
                    {label: 'ves-basic-web-widgets-extension:None', value: 'none'}
                ]
            },
            {
                name: 'isPlaying',
                label: 'ves-basic-web-widgets-extension:Playing',
                datatype: 'boolean',
                default: false,
                isBindingSource: true,
                isBindingTarget: false,
                showInput: false
            },
            {
                name: 'visible',
                label: 'ves-basic-web-widgets-extension:Visible',
                datatype: 'boolean',
                default: true,
                isBindingTarget: true
            }
        ],

        services: [
            {
                name: 'play',
                label: 'ves-basic-web-widgets-extension:Play'
            },
            {
                name: 'pause',
                label: 'ves-basic-web-widgets-extension:Pause'
            }
        ],

        events: [
            {
                name: 'playStarted',
                label: 'ves-basic-web-widgets-extension:Play Started'
            },
            {
                name: 'playPaused',
                label: 'ves-basic-web-widgets-extension:Play Paused'
            },
            {
                name: 'playEnded',
                label: 'ves-basic-web-widgets-extension:Play Ended'
            }
        ],

        designTemplate: function () {
            return '<div class="{{me.class}}"><video width="{{me.width}}" height="{{me.height}}" controls/></div>';
        },

        runtimeTemplate: function (props) {
            var tmpl = '<div twx-visible class="{{me.class}}">' +
                       '<video ng-src="{{me.videosrc | trustUrl}}" src="'+props.videosrc+'" ng-attr-width="{{me.width}}" ng-attr-height="{{me.height}}" ' +
                        (props.showcontrols.toString() === 'true' ? 'controls ' : '') +
                        'preload="{{me.preload}}" ' +
                        'twx-service-handler ' +
                        'onPlay="twx.app.fn.triggerStudioEvent(event, \'playStarted\', undefined, \'me.isPlaying=true\')" ' +
                        'onPause="twx.app.fn.triggerStudioEvent(event, \'playPaused\', undefined, \'me.isPlaying=false\')" ' +
                        'onEnded="twx.app.fn.triggerStudioEvent(event, \'playEnded\', undefined, \'me.isPlaying=false\')"' +
                        '></video></div>';
            return tmpl;
        }
    };
}

twxAppBuilder.widget('twxVideo', twxVideo);
twxAppBuilder.addTemplate('twxDateInput', 'design', '<input class="{{me.class}}" ng-disabled="me.disabled" ng-show="me.visible" type="date" ng-model="me.value"/>');
twxAppBuilder.addTemplate('twxDateInput', 'runtime', '<twx-date-input twx-native-events input-cls="{{me.class}}" value="{{me.value}}" disabled-value="{{me.disabled}}" visible="{{me.visible}}"/>');
