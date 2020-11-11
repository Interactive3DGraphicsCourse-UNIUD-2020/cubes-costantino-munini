import { VoxelWorld } from './voxelWorld.js';


const seaVertexShader =
`
    attribute float displacement;
    varying vec3 vNormal;
	  varying vec2 vUv;

    void main() {
        vNormal = normal;
				vUv = uv;

        vec3 upVec = vec3(0,1,0);
        vec3 newPosition = position + upVec * vec3( displacement );

        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    }
`

const seaFragmentShader =
`
    varying vec3 vNormal;
    uniform vec3 color;

    uniform sampler2D texture;
		varying vec2 vUv;

    void main() {
        //vec3 light = vec3( 0.5, 0.2, 1.0 );
        //light = normalize( light );
        //float dProd = dot( vNormal, light ) * 0.5 + 0.5;

        //gl_FragColor = vec4( vec3( dProd ) * vec3( color ), 1.0 );

        gl_FragColor = texture2D( texture, vUv );
    }
`


let loader, texture;

let seaDim, seaMesh;
let displacement;



export function addSea(scene, Render) {

    // TEXTURE LOADING
    loader = new THREE.TextureLoader();
    texture = loader.load('textures/our_textures.png', Render);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const cellSize = 64;

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
    seaDim = cellSize - 1;
    //seaDim = 4;
    var seaOffsetX = cellSize;
    var seaOffsetZ = cellSize;

    //for (let y = 0; y < 3; ++y) { // TODO mare profondo?
    for (let x = 0; x < seaDim; ++x) {
        for (let z = 0; z < seaDim; ++z) {

            world.setVoxel(x + seaOffsetX, 0, z + seaOffsetZ, seaTextureNum);
        }
    }
    //}

    // CREATE MESH FOR SEA
    const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(1, 0, 1, { full: true });
    //const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(1, 0, 1);
    var seaGeometry = new THREE.BufferGeometry();




    var seaUniforms = {
        "color": { value: new THREE.Color(0x006994) },
        //"texture": { type: "t", value: texture },
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

    displacement = new Float32Array(seaGeometry.attributes.position.count);
    seaGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1));

    seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);
    seaMesh.position.x = - seaDim / 4;
    //seaMesh.position.x = - 63 / 4;
    //seaMesh.position.y = - 3;

    scene.add(seaMesh);

}


export function updateSea(time) {
  var group = 0;
  var groupNum = 4 * 6 * seaDim; // full = true // 4 vertici per faccia per 6 facce per righe del mare

  //var faceVertexesNum = 4;

  var amplitude = 0.3;
  var speed = 0.5;

  for (let i = 1; i <= displacement.length; i++) {
    displacement[i] = amplitude * Math.sin(speed * (group + time));

    if (i % groupNum == 0) {
      group++;
    }

    //displacement[i - 1] = amplitude * Math.sin(speed * (group + time));
    //if (i == ((seaDim - 2) * 3 * faceVertexesNum + faceVertexesNum * 4 * 2)) {
    //  group++;
    //} else if (0 ==  i % ((seaDim - 2) * 2 * faceVertexesNum + 2 * 3 * faceVertexesNum)) {
    //  group++;
    //}
  }

  seaMesh.geometry.attributes.displacement.needsUpdate = true;
}
