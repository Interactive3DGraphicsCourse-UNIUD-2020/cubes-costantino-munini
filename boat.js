import { VoxelWorld } from './voxelWorld.js'

const vertexShader =
`
    varying vec3 vNormal;
    varying vec3 vColor;
	  varying vec2 vUv;

    attribute float voxelValues;

    vec3 toColor(float vVal) { // TODO
      if (vVal == 1.0) {
        return vec3(1,0,0);
      } else if (vVal == 2.0) {
        return vec3(0,1,0);
      } else if (vVal > 4.0) {
        return vec3(0,0,1);
      } else {
        return vec3(0.1);
      }
    }

    void main() {
        vNormal = normal;
				vUv = uv;

        vColor = toColor(voxelValues);

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`

const fragmentShader =
`
    varying vec3 vNormal;
    varying vec3 vColor;

    uniform vec3 color;

    uniform sampler2D texture;
		varying vec2 vUv;

    void main() {
        // Decomment for no texture
        gl_FragColor = texture2D( texture, vUv );

        // Uncomment for no texture
        //gl_FragColor = vec4( vColor, 1.0);

    }
`


let world, cellSize;

let loader, texture;

//our texture nums
const boatTexture = 2;
const oarsTexture = 5;

const sailsTexture = 3;

const ramBodyTexture = 5;
const ramHeadTexture = 6;
const ramHornsTexture = 7;

export function addBoat(scene, Render) {

  // TEXTURE LOADING
  loader = new THREE.TextureLoader();
  texture = loader.load('textures/our_textures.png', Render);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;


  cellSize = 64;

  const tileSize = 16;
  const tileTextureWidth = 256;
  const tileTextureHeight = 64;

  world = new VoxelWorld({
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  });

  // Inspired by
  // https://sketchfab.com/3d-models/boat-voxel-0ecad35f37504ca3b54679494f0a23ba

  let offsetX = 15;
  let offsetY = 0;
  let offsetZ = 15;

  // BODY
  let bodyOffsetX = 15;
  let bodyOffsetY = 0;
  let bodyOffsetZ = 15;

  let boatLength = 34;
  let boatWidths = [5, 7, 9, 11];
  let boatHeight = boatWidths.length;

  for (let y = 0; y < boatHeight; ++y) {
    for (let z = 0; z < boatLength; ++z) {
      for (let x = 0; x < boatWidths[y]; ++x) {
        world.setVoxel(x + bodyOffsetX, y + offsetY, z + offsetZ, boatTexture);
      }
    }
    bodyOffsetX -= 1;
  }

  // BOW (prua)
  let bowOffsetY = 0;
  let bowOffsetZ = offsetZ + boatLength;
  let bowOffsetX = [1, -1, -2];

  let bowLengths = 3;
  let bowWidths = [3, 7, 9, 5, 7, 5];
  let bowHeights = [3, 2, 1];

  for (let z = 0; z < bowLengths; ++z) {
    bowOffsetY += 1;
    for (let y = 0; y < bowHeights[z]; ++y) {
      for (let x = 0; x < bowWidths[y]; ++x) {
        world.setVoxel(x + offsetX + bowOffsetX[y], y + bowOffsetY, z + bowOffsetZ, boatTexture);
      }
    }
  }

  let baseWidths = [3, 9, 7, 5, 3, 1];
  let baseOffsetX = [1, -2, -1, 0, 1, 2];

  for (let z = 0; z < 7; ++z) {
    for (let x = 0; x < baseWidths[z]; ++x) {
      world.setVoxel(x + offsetX + baseOffsetX[z], 4, z + bowOffsetZ - 2, boatTexture);
    }
  }

  // SPUNTONE
  var spuntoneOffsetX = Math.floor(boatWidths[3] / 2) + bodyOffsetX + 1;
  var spuntoneOffsetY = 5;
  var spuntoneOffsetZ = boatLength + offsetZ;

  var gradini = [4, 3, 3];

  for (let y = 0; y < 3; ++y) {
    for (let z = 0; z < gradini[y]; ++z) {
      world.setVoxel(spuntoneOffsetX, spuntoneOffsetY + y, spuntoneOffsetZ + z, ramBodyTexture);
    }
    spuntoneOffsetZ++;
  }

  world.setVoxel(spuntoneOffsetX, spuntoneOffsetY + 3, spuntoneOffsetZ + 1, ramHeadTexture);

  // CORNI
  for (let y = 0; y < 3; ++y) {
    if (y < 2) {
      world.setVoxel(spuntoneOffsetX - 1, spuntoneOffsetY + y + 2, spuntoneOffsetZ, ramHornsTexture);
      world.setVoxel(spuntoneOffsetX + 1, spuntoneOffsetY + y + 2, spuntoneOffsetZ, ramHornsTexture);
    } else {
      world.setVoxel(spuntoneOffsetX - 1, spuntoneOffsetY + y + 1, spuntoneOffsetZ + 1, ramHornsTexture);
      world.setVoxel(spuntoneOffsetX + 1, spuntoneOffsetY + y + 1, spuntoneOffsetZ + 1, ramHornsTexture);
    }
  }

  // STERN (poppa)
  let sternOffsetY = 3;
  let sternOffsetZ = 12;
  let sternOffsetX = [1, -1, -2];

  let sternLengths = 3;
  let sternWidths = [3, 7, 9, 5, 7, 5];
  let sternHeights = [1, 2, 3];

  for (let z = 0; z < sternLengths; ++z) {
    for (let y = 0; y < sternHeights[z]; ++y) {
      for (let x = 0; x < sternWidths[y]; ++x) {
        world.setVoxel(x + offsetX + sternOffsetX[y], y + sternOffsetY, z + sternOffsetZ, boatTexture);
        // console.log("coor: ", x + offsetX + sternOffsetX[y], y + sternOffsetY, z + sternOffsetZ);
      }
    }
    sternOffsetY -= 1;
  }

  let baseWidthsInv = [1, 3, 5, 7, 9, 3];
  let baseOffsetXInv = [2, 1, 0, -1, -2, 1];

  for (let z = 0; z < 7; ++z) {
    for (let x = 0; x < baseWidthsInv[z]; ++x) {
      world.setVoxel(x + offsetX + baseOffsetXInv[z], 4, z + sternOffsetZ - 2, boatTexture);
    }
  }

  // SPUNTONE
  var spuntoneOffsetX = offsetX + 2;
  var spuntoneOffsetY = 5;
  var spuntoneOffsetZ = offsetZ - 6;

  var gradini = [4, 3, 3];

  for (let y = 0; y < 3; ++y) {
    if (y === 2) {
      spuntoneOffsetZ--;
    }
    for (let z = gradini[y]; z > 0; z--) {
      world.setVoxel(spuntoneOffsetX, spuntoneOffsetY + y, spuntoneOffsetZ + z, ramBodyTexture);
    }
  }

  world.setVoxel(spuntoneOffsetX, spuntoneOffsetY + 3, spuntoneOffsetZ + 1, ramHeadTexture);

  // CORNI
  for (let y = 0; y < 3; ++y) {
    if (y < 2) {
      world.setVoxel(spuntoneOffsetX - 1, spuntoneOffsetY + y + 2, spuntoneOffsetZ + 2, ramHornsTexture);
      world.setVoxel(spuntoneOffsetX + 1, spuntoneOffsetY + y + 2, spuntoneOffsetZ + 2, ramHornsTexture);
    } else {
      world.setVoxel(spuntoneOffsetX - 1, spuntoneOffsetY + y + 1, spuntoneOffsetZ + 1, ramHornsTexture);
      world.setVoxel(spuntoneOffsetX + 1, spuntoneOffsetY + y + 1, spuntoneOffsetZ + 1, ramHornsTexture);
    }
  }

  // PARAPET (parapetto)
  let parapetLength = boatLength;

  let parapetOffsetX = 12;
  let parapetOffsetY = 4;
  let parapetOffsetZ = 15;

  for (let z = 0; z < parapetLength; ++z) {
    world.setVoxel(parapetOffsetX, parapetOffsetY, z + parapetOffsetZ, boatTexture);
    world.setVoxel(parapetOffsetX + 10, parapetOffsetY, z + parapetOffsetZ, boatTexture);
    if (z % 3 == 0) {
      world.setVoxel(parapetOffsetX, parapetOffsetY + 1, z + parapetOffsetZ, boatTexture);
      world.setVoxel(parapetOffsetX + 10, parapetOffsetY + 1, z + parapetOffsetZ, boatTexture);
    }
  }


  // TREE (albero maestro)
  let treeHeight = 26;
  let treeBaseLength = 2;
  let treeBaseWidth = 3;

  let treeOffsetX = Math.floor(boatWidths[3] / 2) + bodyOffsetX;
  let treeOffsetY = boatHeight; // + bodyOffsetU;
  let treeOffsetZ = Math.floor(boatLength / 2) + bodyOffsetZ;

  for (let y = 0; y < treeHeight; ++y) {
    for (let z = 0; z < treeBaseLength; ++z) {
      for (let x = 0; x < treeBaseWidth; ++x) {
        world.setVoxel(x + treeOffsetX,
          y + treeOffsetY,
          z + treeOffsetZ, boatTexture);
      }
    }
  }

  let horizontalVSpace = [8, treeHeight - 5];
  let horizontalLen = [15, 21];

  for (let i = 0; i < horizontalVSpace.length; i++) {
    let y = horizontalVSpace[i];
    for (let x = 0; x < horizontalLen[i]; ++x) {
      world.setVoxel(x + treeOffsetX - Math.floor(horizontalLen[i] / 2) + 1,
        y + treeOffsetY,
        treeOffsetZ + 1, boatTexture);
    }
  }

  // SAIL (vela)
  let sailWidth = 21;

  let sailOffsetX = treeOffsetX - Math.floor(horizontalLen[1] / 2) + 1;
  let sailOffsetY = horizontalVSpace[0] + treeOffsetY;
  let sailOffsetZ = treeOffsetZ + 2;

  let sailYs = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  let sailZs = [0, 1, 2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 1, 0, 0];

  for (let i = 0; i < sailYs.length; i++) {
    let y = sailYs[i];
    let z = sailZs[i];
    for (let x = 0; x < sailWidth; ++x) {
      world.setVoxel(x + sailOffsetX,
        y + sailOffsetY,
        z + sailOffsetZ, sailsTexture);
    }
  }





  // OARS (remi)
  var oar = generateOar();

  var oarsOffsetX = 14;
  var oarsOffsetY = 2;
  var oarsOffsetZ = 15 + 8;

  for (let z = 0; z < 5; z++) {
    var oar_clone = oar.clone();
    oar_clone.position.x = oarsOffsetX + boatWidths[2] - 2;
    oar_clone.position.y = oarsOffsetY;
    oar_clone.position.z = z * 5 + oarsOffsetZ;
    oar_clone.name = `oar_left_${z}`;
    scene.add(oar_clone);

    oar_clone = oar.clone();
    oar_clone.position.x = oarsOffsetX;
    oar_clone.position.y = oarsOffsetY;
    oar_clone.position.z = z * 5 + oarsOffsetZ;
    oar_clone.rotation.y = 180 * Math.PI / 180;
    oar_clone.name = `oar_right_${z}`;
    scene.add(oar_clone);
  }



  // GENERATE BOAT MESH
  const { positions, normals, voxelValues, uvs, indices, } = world.generateGeometryDataForCell(0, 0, 0);
  const geometry = new THREE.BufferGeometry();


  // // START old material
  // const material = new THREE.MeshLambertMaterial({
  //   map: texture,
  //   side: THREE.DoubleSide,
  //   alphaTest: 0.1,
  //   transparent: true,
  // });
  // // END old material


  var uniforms = {
    "color": { value: new THREE.Color(0xff0000) },
    //"texture": { type: "t", value: texture },
  };

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, // TODO
    uniforms: uniforms,
    vertexShader:   vertexShader,
    fragmentShader: fragmentShader,
  });

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));

  geometry.setAttribute(
    'voxelValues',
    new THREE.BufferAttribute(new Float32Array(voxelValues), 1));

  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
  geometry.setIndex(indices);

  var boatMesh = new THREE.Mesh(geometry, material);

  scene.add(boatMesh);
}


export function updateBoat(scene, time) {
  for (let z = 0; z < 5; z++) {
    var oar = scene.getObjectByName(`oar_left_${z}`);
    oar.rotation.z = 0.25 * Math.sin(0.5 * time);
    oar.rotation.y = 0.3 * Math.cos(0.5 * time);

    oar = scene.getObjectByName(`oar_right_${z}`);
    oar.rotation.z = 0.25 * Math.sin(0.5 * time);
    oar.rotation.y = Math.PI;
    oar.rotation.y -= 0.3 * Math.cos(0.5 * time);
  }
}



function generateOar() {
  var oar = new THREE.Object3D();

  var oarsOffsetX  = cellSize;
  var oarsOffsetY  = 0;
  var oarsOffsetZ  = 0;

  var oarLength = 9;

  for (let x = 0; x < oarLength; x++) {
    world.setVoxel(
      x + oarsOffsetX,
      oarsOffsetY,
      oarsOffsetZ,
      oarsTexture
    );
  }

  const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(1, 0, 0);
  const geometry = new THREE.BufferGeometry();

  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    transparent: true,
  });

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
  geometry.setIndex(indices);


  var mesh = new THREE.Mesh(geometry, material);

  mesh.position.x = - 0.5;
  mesh.position.y = - 0.5;
  mesh.position.z = - 0.5;

  oar.add(mesh);
  return oar;
}
