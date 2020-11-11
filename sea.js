
    import {VoxelWorld} from './voxelWorld.js';



    let seaDim, seaMesh;
    let displacement;
    
 export function addSea(scene) {
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

    var seaTextureNum = 13;
    seaDim = cellSize - 2;
    var seaOffsetX = cellSize;
    var seaOffsetZ = cellSize;

    for (let x = 0; x < seaDim; ++x) {
      for (let z = 0; z < seaDim; ++z) {
        world.setVoxel(x + seaOffsetX, 0, z + seaOffsetZ, seaTextureNum);
      }
    }

    // CREATE MESH FOR SEA
    const {positions, normals, uvs, indices} = world.generateGeometryDataForCell(1, 0, 1, {full:true});
    var seaGeometry = new THREE.BufferGeometry();

   var seaUniforms = {
      "color": { value: new THREE.Color( 0x006994 ) }, // TODO add texture
    };

    const seaMaterial = new THREE.ShaderMaterial( {
      side: THREE.DoubleSide, // TODO
      //alphaTest: 0.1,
      //transparent: true,
      uniforms: seaUniforms,
      vertexShader: document.getElementById( 'seaVertexshader' ).textContent,
      fragmentShader: document.getElementById( 'seaFragmentshader' ).textContent
    } );

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

    displacement = new Float32Array( seaGeometry.attributes.position.count );
    seaGeometry.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 1 ) );

    seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);
    seaMesh.position.x = - seaDim / 4;

    scene.add(seaMesh);
  }


  export function updateSea(time) {
    var group = 0;
    var groupNum = 4 * 6 * seaDim; // 4 vertici per faccia per 6 facce per righe del mare

    for ( let i = 1; i <= displacement.length; i ++ ) {
      displacement[ i ] = 0.3 * Math.sin( 0.5 * (group + time));

      if (i % groupNum == 0) {
        group++;
      }
    }
    seaMesh.geometry.attributes.displacement.needsUpdate = true;
  }