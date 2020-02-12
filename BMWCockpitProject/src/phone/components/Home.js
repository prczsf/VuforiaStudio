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
  $scope.ScriptInject('https://cdn.jsdelivr.net/npm/image-capture@0.4.0/lib/imagecapture.min.js').then(() => {
    console.log('ScriptInject: imagecapture.js loaded.');
	angular.element(document).ready($scope.init);
	angular.element(document).ready($scope.initCanvas);
  	}).catch(error => {
  		console.log('ScriptInject: ' + error);
	});
  $scope.ScriptInject('https://cdn.jsdelivr.net/npm/webcamjs@1.0.25/webcam.min.js').then(() => {
    console.log('ScriptInject: webcam.js loaded.');
	angular.element(document).ready($scope.init);
	angular.element(document).ready($scope.initCanvas);
  	}).catch(error => {
  		console.log('ScriptInject: ' + error);
	});

};

angular.element(document).ready($scope.DoInject);

class PdfRendererPopup {
    constructor(background) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
      
      	this.loadPdf("app/resources/Uploaded/license_agree.pdf");
    }

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    async renderPage(num) {
        this.pageRendering = true;
        this.canvas.height = 500;
        this.canvas.width = 500;

        // Render PDF page into canvas context
        let renderContext = {
            canvasContext: this.ctx
        };
        let renderTask = page.render(renderContext);

        // Wait for rendering to finish
        await renderTask.promise;

        this.pageRendering = false;
        tml3dRenderer.setTexture(this.background.widgetName, this.canvas.toDataURL());
    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    /**
     * Asynchronously downloads PDF.
     */
    async loadPdf(path) {
        this.pdfDoc = await this.pdfjsLib.getDocument(path);
      	this.documentPages = this.pdfDoc.numPages;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        $scope.view.wdg ['pageNumber'].text = this.pageNum + '/' + this.documentPages;
        // Initial/first page rendering
        this.renderPage(this.pageNum);
    }
}


var script = document.createElement('script');
script.onload = function () {
  $scope.checklistPdfPopup = new PdfRendererPopup($scope.view.wdg['photo']);
};
document.head.appendChild(script);


$scope.turnCameraOn = function() {
  var my_camera = document.createElement('div');
  my_camera.id = 'my_camera';
  
  document.body.appendChild(my_camera);
  
  Webcam.set({
    width: 500,
    height: 400,
    image_format: "jpeg",
    jpeg_quality: 90,
    force_flash: false,
    flip_horiz: true,
    fps: 45
  });

  Webcam.set("constraints", {
      optional: [{ minWidth: 600 }]
  });
  
  Webcam.attach( my_camera );
  
  setTimeout(function () {
    Webcam.snap( function(data_uri) {
      console.log(data_uri);
      // display results in page
      $scope.view.wdg ['photo'].src = data_uri;
    });
    
    Webcam.reset();
   }, 3000);
}