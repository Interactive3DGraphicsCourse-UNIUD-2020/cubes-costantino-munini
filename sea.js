import { VoxelWorld } from './voxelWorld.js';


const seaVertexShader =
`
	  varying vec2 vUv;

    attribute float waveGroup;
    uniform float amplitude;
    uniform float speed;
    uniform float time;

    void main() {
				vUv = uv;

        float displacement = amplitude * sin(speed * (waveGroup + time));

        vec3 upVec = vec3(0,1,0);
        vec3 newPosition = position + upVec * vec3( displacement );

        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    }
`

const seaFragmentShader =
`
    uniform sampler2D texture;
		varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D( texture, vUv );
    }
`


let loader, texture;

let seaWidth, seaLength, seaMesh;

export function addSea(scene, Render) {

    // TEXTURE LOADING
    loader = new THREE.TextureLoader();
    texture = loader.load('textures/our_textures.png', Render);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    //const cellSize = 64;
    const cellSize = 300;

    const tileSize = 16;
    const tileTextureWidth = 256;
    const tileTextureHeight = 64;

    var world = new VoxelWorld({
        cellSize,
        tileSize,
        tileTextureWidth,
        tileTextureHeight,
    });

    var seaTextureNum = 4;

    seaWidth  = Math.floor((cellSize - 1) / 2);
    seaLength = cellSize - 1;

    var seaDeepness = 1;
    var seaOffsetX = cellSize;
    var seaOffsetZ = cellSize;

    for (let y = 0; y < seaDeepness; ++y) {
      for (let x = 0; x < seaWidth; ++x) {
        for (let z = 0; z < seaLength; ++z) {
          world.setVoxel(x + seaOffsetX, y, z + seaOffsetZ, seaTextureNum);
        }
      }
    }

    // CREATE MESH FOR SEA
    const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(1, 0, 1, { full: true });
    //const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(1, 0, 1);
    var seaGeometry = new THREE.BufferGeometry();


    var seaUniforms = {
        "time": { value: 0.0 },
        "amplitude": { value: 0.4 },
        "speed"    : { value: 0.4 },
        "texture": { type: "t", value: texture },
    };

    const seaMaterial = new THREE.ShaderMaterial({
        side: THREE.DoubleSide, // TODO
        uniforms: seaUniforms,
        transparent: true, // TODO
        vertexShader: seaVertexShader,
        fragmentShader: seaFragmentShader,
    });

    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;
    seaGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
    seaGeometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
    seaGeometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
    seaGeometry.setIndex(indices);

    var group = 0;
    var groupNum = 4 * 6 * seaWidth; // full = true // 4 vertici per faccia per 6 facce per righe del mare
    var waveGroups = new Float32Array(seaGeometry.attributes.position.count);
    for (let i = 1; i <= waveGroups.length; i++) { // TODO start from 0 or 1??
      waveGroups[i-1] = group;
      if (i % groupNum == 0) {
        group++;
      }
    }
    seaGeometry.setAttribute('waveGroup', new THREE.BufferAttribute(waveGroups, 1));


    seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);
    seaMesh.position.x = - seaWidth / 2 + 15;
    seaMesh.position.y = -seaDeepness + 1;

    scene.add(seaMesh);

}


export function updateSea(time) {
  seaMesh.material.uniforms.time.value = time % 360;
}
