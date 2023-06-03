import * as THREE from 'three';

export function loadAlphaImageToMaterial(mat, imageURL) {
  let loader = new THREE.ImageBitmapLoader();
  loader.load(imageURL, function(imageBitmap) {
    const tex = new THREE.CanvasTexture( imageBitmap );
    tex.center.set(0.5, 0.5);
    mat.emissiveMap = tex;
    mat.alphaMap = tex;
    mat.alphaTest = 0.1;
    mat.transparent = true;  
    mat.needsUpdate = true;
  });
}

export function loadImageToMaterial(mat, imageURL) {
  let loader = new THREE.TextureLoader();
  loader.load(imageURL, function(tex) {
    tex.flipY = false;
    tex.center.set(0.5, 0.5);
    mat.emissiveMap = tex;
  }, undefined, x => { console.log('litmerr', x) });
}

export function setAlphaToEmissive(mat) {
  
  if(mat.emissiveMap) {
    console.log('EM', mat.emissiveMap);
    mat.emissiveMap.center.set(0.5, 0.5);
    mat.alphaMap = mat.emissiveMap;
    mat.alphaTest = 0.1; 
    mat.transparent = true;  
    mat.needsUpdate = true;
  }
}

export function hueToColor(hueIndex) {
  let hue = hueIndex * 45;
  let colorStr = hue ? `hsl(${hue}, 100%, 40%)` : '#ffffff';
  return colorStr;
}

export function hexColorToInt(hexColor) {
  let intColor = 0;

  if(hexColor.length === 7) {
    try {
      intColor = parseInt(hexColor.substring(1), 16)
    } catch(e) {}
  }

  return intColor;
}

export function intToHexColor(intColor) {
  let hexColor = intColor.toString(16)
  if(hexColor.length <= 6) {
    hexColor = hexColor.padStart(6, 0);
  }
  else {
    hexColor = '000000';
  }

  return '#' + hexColor;
}

export class HitTester {
  /**
   * @param {*} conf e.g. { id: 'door', geometry: { type: "sphere", radius: 0.5 } }
   * @param {*} obj Obj must have interface { position: { x: xPos, y: yPos, z: zPos }}
   * @param {*} callback method that takes (id, isColliding)
   */
  constructor(conf, obj, callback) {
    this.id = conf.id;
    this.obj = obj;
    this.geometry = conf.geometry;
    this.callback = callback;
    this.position = new THREE.Vector3();
    this.isColliding = false;
  }

  test(otherModel, initialTest=false) {
    if(this.obj?.visible) {
      this.position.set(this.obj.position.x, 0, this.obj.position.z);
      this.position.sub(otherModel.position)
      let dist = this.position.length();

      if(this.geometry.type === 'sphere') {
        if(dist < this.geometry.radius) {
          if(!this.isColliding) {
            this.isColliding = true;
            if(!initialTest) {
              this._trigger(this.id, this.isColliding);
            }
          }
        }
        else {
          if(this.isColliding) {
            this.isColliding = false;
            if(!initialTest) {
              this._trigger(this.id, this.isColliding);
            }
          }
        }
      }
    }
  }

  _trigger(id, isColliding) {
    if(this.callback) {
      this.callback(id, isColliding);
    }
  }
}
