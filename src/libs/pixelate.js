export default function pixelateImg(croppedImageSrc, xBlocks, yBlocks) {

  // Set canvas size
  return new Promise((resolve, reject) => {
    const croppedImage = new Image();
    croppedImage.src = croppedImageSrc;

    croppedImage.onload = () => {
      let ctxSettings = {
        willReadFrequently: true,
        mozImageSmoothingEnabled: false,
        webkitImageSmoothingEnabled: false,
        imageSmoothingEnabled: false,
      };   


      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", ctxSettings);

      let croppedWidth = croppedImage.width;
      let croppedHeight = croppedImage.height;
      let ratio = croppedWidth / croppedHeight;

      let canvasWidth = 500;
      let canvasHeight = canvasWidth / ratio;

      //este es el tamaño del bloque en pixeles
      //xBlocks va a depender del tamaño en "pulgadas" que se seleccionó en la interfaz puede ser (1,2,3)
      //si pulgas es igual a 2, xBlock va a ser la mitad los bloque cuando había 1 pulgada
      // xBlockSize seria el tamaño en píxeles de la base(cuadrada) del bloque que se va a pintar

      let xBlockSize = Math.max(Math.floor(canvasWidth / xBlocks), 1);
      let yBlockSize = Math.max(Math.floor(canvasHeight / yBlocks), 1);

      let width = xBlockSize * xBlocks;
      let height = yBlockSize * yBlocks;
      canvas.width = width;
      canvas.height = height;

      // Draw initial image (en el canvas que esta oculto se dibuja la image con crop)
      ctx.drawImage(
        croppedImage,
        0,
        0,
        croppedImage.width,
        croppedImage.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      // Get image data in form of array of pixels (RGBA) not array of arrays
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const imData = imageData.data;
      let workerUrl = 'woodxel-resources/js/pixelWorker.js';
      if (import.meta.env.MODE !== 'development') {
        workerUrl = new URL(workerUrl, import.meta.url).href;
      }	
      //const worker = new Worker('woodxel-resources/js/pixelWorker.js');
      const worker = new Worker(workerUrl,{ type: 'module' });
      worker.postMessage({ 
          imData: imData,         
          width: width,
          height: height,
          xBlockSize: xBlockSize,
          yBlockSize: yBlockSize,
          kMeansClusters: 30
      });

      worker.onmessage = function(e) {
        const { allColors, colorDetails} = e.data;
        worker.terminate();

      //construir la imagen pixelada
      let i = 0;
        for (let y = 0; y < height; y += yBlockSize) {
          for (let x = 0; x < width; x += xBlockSize) {
            
            ctx.clearRect(x, y, xBlockSize, yBlockSize);
            
            ctx.fillStyle =  "rgb(" + allColors[i][0] + "," + allColors[i][1] + "," +allColors[i][2] + ")";
            ctx.fillRect(x, y, xBlockSize, yBlockSize);
            i++;
          }
        }



        resolve({
          imageURL: canvas.toDataURL(),
          allColors: allColors,
          colorDetails: colorDetails
        });

      };
  
      worker.onerror = function(error) {
        worker.terminate();
        reject(error);
      };
      
    };
    croppedImage.onerror = (error) => {
      reject(error);
    };
  });

}




