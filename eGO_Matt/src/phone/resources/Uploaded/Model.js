    
(function(window) {
  class Model {
    constructor(id, element, modelUrl, tml3dRenderer) {
      this.id = id;
      this.element = element;
      this.modelUrl = modelUrl;
      this.tml3dRenderer = tml3dRenderer;
      this.transform = {
        position: [0, 0, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0]
      };

      this.removed = false;
      this.synchronized = true;
      this.selected = false;
      this.selectable = true;
    }

    setTranslation(x, y, z) {
      this.setTranslationInternal(x, y, z);
      this.sendModelUpdate({ position: this.transform.position });
    }

    setTranslationInternal(x, y, z) {
      this.tml3dRenderer.setTranslation(this.id, x, y, z);
      this.transform.position = [x, y, z];
    }

    translateBy(x, y, z) {
      let pos = this.transform.position;
      pos[0] += x;
      pos[1] += y;
      pos[2] += z;
      this.setTranslation(...pos);
    }

    setScale(x, y, z) {
      this.setScaleInternal(x, y, z);
      this.sendModelUpdate({ scale: this.transform.scale });
    }

    setUniformScale(scale) {
      this.setScale(scale, scale, scale);
    }

    setScaleInternal(x, y, z) {
      this.tml3dRenderer.setScale(this.id, x, y, z);
      this.transform.scale = [x, y, z];
    }

    setRotation(x, y, z) {
      this.setRotationInternal(x, y, z);
      this.sendModelUpdate({ rotation: this.transform.rotation });
    }

    setRotationInternal(x, y, z) {
      this.tml3dRenderer.setRotation(this.id, x, y, z);
      this.transform.rotation = [x, y, z];
    }

    remove(fromRemote) {

      _removeModel(this);
      this.removed = true;
      if (!this.synchronized) {
        _removeModelReference(this);
      } else if (!fromRemote) {
        this.sendModelUpdate({ removed: true });
      }
    }

    sendModelUpdate(packet) {
      if (this.synchronized) {
        this.updatePacket = _.assign(this.updatePacket || { id: this.id }, packet);
      }
    }

    sendFullUpdate(additionalData) {
      if (this.synchronized) {
        this.sendModelUpdate(_.assign({
          position: this.transform.position,
          scale: this.transform.scale,
          rotation: this.transform.rotation,
          selected: this.selected,
          wrapped: this.wrapped,
          modelUrl: this.modelUrl,
          removed: this.removed
        }, additionalData || {}));
      }
    }

    sendModelCreatedUpdate() {
      this.sendModelUpdate(_.assign({ created: true, modelUrl: this.modelUrl }, this.transform));
    }

    setSelected(selected) {
      if (selected !== this.selected) {
        this.selected = selected;
        if (this.selected) {
          this.setColor(PickColor);
        } else if (this.remoteSelected) {
          this.setColor(RemotePickColor);
        } else {
          this.setColor(undefined);
        }

        this.sendModelUpdate({ selected: this.selected });
      }
    }

    setRemoteSelected(selectedBy) {
      this.remoteSelected = selectedBy;

      if (selectedBy) {
        this.setColor(RemotePickColor);
      } else if (!this.selected) {
        this.setColor(undefined);
      }
    }

    setColor(color) {
      try {
        this.tml3dRenderer.setColor(this.id, color);
      } catch (e) {
        // In preview setColor fails when passing null as color (for resetting it).
        console.log(e);
      }
    }
  }

  if (typeof define === 'function' && define.amd) {
    define( function() { return Model; } );
  } 
  else if (typeof module === 'object' && Model.exports) {
    module.exports = Model;
  } 
  else {
    window.Model = Model;
  }
}(window))