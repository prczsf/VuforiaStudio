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