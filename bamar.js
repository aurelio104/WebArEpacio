(function () {
    const BAMAR = (() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
      const init = async (options) => {
        const mode = options.mode || "marker";
        switch (mode) {
          case "marker": return initMarkerMode(options);
          case "geo": return initGeoMode(options);
          case "face": return initFaceMode(options);
          case "surface": return initSurfaceMode(options);
          default: console.warn("Modo no reconocido en BAMAR.js:", mode);
        }
      };
  
      const initMarkerMode = ({ model, target }) => {
        document.body.innerHTML = `
          <a-scene mindar-image="imageTargetSrc: ${target}" embedded color-space="sRGB"
                   renderer="antialias: true; alpha: true" vr-mode-ui="enabled: false"
                   device-orientation-permission-ui="enabled: true">
  
            <a-assets><a-asset-item id="model" src="${model}"></a-asset-item></a-assets>
            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
  
            <a-entity light="type: ambient; intensity: 0.5"></a-entity>
            <a-entity light="type: point; intensity: 2; distance: 10" position="0 2 2"></a-entity>
  
            <a-entity mindar-image-target="targetIndex: 0">
              <a-entity gltf-model="#model" scale="0.5 0.5 0.5"></a-entity>
            </a-entity>
          </a-scene>
        `;
      };
  
      const initGeoMode = ({ modelFolder = "assets/", pointsUrl }) => {
        fetch(pointsUrl)
          .then(res => res.json())
          .then(puntos => {
            document.body.innerHTML = `
              <a-scene embedded vr-mode-ui="enabled: false" renderer="logarithmicDepthBuffer: true;">
                <a-camera gps-camera rotation-reader></a-camera>
                ${puntos.map((p, i) => `
                  <a-entity gps-entity-place="latitude: ${p.lat}; longitude: ${p.lon};" gltf-model="${modelFolder + p.modelo}" scale="1 1 1"></a-entity>
                `).join('')}
              </a-scene>
            `;
          });
      };
  
      const initFaceMode = ({ model, anchorIndex = 1, scale = "5 5 5", rotation = "0 0 0", position = "0 0 0" }) => {
        document.body.innerHTML = `
          <a-scene mindar-face embedded color-space="sRGB"
                   renderer="antialias: true; alpha: true" vr-mode-ui="enabled: false"
                   device-orientation-permission-ui="enabled: true">
  
            <a-assets><a-asset-item id="face-model" src="${model}"></a-asset-item></a-assets>
            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
  
            <a-entity light="type: ambient; intensity: 1.0"></a-entity>
            <a-entity light="type: directional; intensity: 1.5" position="1 2 1"></a-entity>
  
            <a-entity mindar-face-target>
              <a-entity mindar-face-attachment="anchorIndex: ${anchorIndex}">
                <a-entity gltf-model="#face-model" scale="${scale}" rotation="${rotation}" position="${position}"></a-entity>
              </a-entity>
            </a-entity>
          </a-scene>
        `;
      };
  
      const initSurfaceMode = ({ model, usdzFallback, fallback = "plane", autoPlace = true }) => {
        if (isIOS && fallback === "quicklook") {
          document.body.innerHTML = `
            <a rel="ar" href="${usdzFallback}">
              <img src="placeholder.jpg" alt="Abrir en AR" style="width:100%;height:auto;">
            </a>
          `;
          return;
        }
  
        document.body.innerHTML = `
          <a-scene embedded renderer="antialias: true; alpha: true; colorManagement: true; physicallyCorrectLights: true;" background="transparent: true" vr-mode-ui="enabled: false">
            <a-assets>
              <a-asset-item id="surface-model" src="${model}"></a-asset-item>
            </a-assets>
            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
  
            <a-entity light="type: ambient; intensity: 1"></a-entity>
            <a-entity light="type: directional; intensity: 1.5" position="0 2 1"></a-entity>
  
            <a-entity id="model-holder" visible="true" gltf-model="#surface-model"
                      material="opacity: 0.2; transparent: true" scale="0.5 0.5 0.5"></a-entity>
          </a-scene>
  
          <video id="video-fondo" autoplay playsinline muted webkit-playsinline
                 style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"></video>
        `;
  
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            const video = document.getElementById('video-fondo');
            video.srcObject = stream;
            video.onloadeddata = () => video.play();
          })
          .catch(err => console.error('❌ Error al activar cámara:', err));
  
        setTimeout(() => {
          const model = document.getElementById("model-holder");
          model.setAttribute("position", "0 0 -2");
          model.setAttribute("material", "opacity: 1; transparent: false");
        }, 3000);
      };
  
      return { init };
    })();
  
    if (typeof window !== 'undefined') {
      window.BAMAR = BAMAR;
    }
  })();