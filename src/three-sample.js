import * as Three from 'three';
import Stats from 'stats.js';
import Detector from 'three/examples/js/Detector';
import OrbitControls from 'three-orbitcontrols';

let cube;
let renderer;
let scene;
let camera;
let stats;
let controls;
let pointLight;

const init = () => {
  // Example converted from https://Threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene
  	scene = new Three.Scene();

  	// renderer setup
  	renderer = new Three.WebGLRenderer({antialias: true});
    window.renderer = renderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = Three.PCFSoftShadowMap;
  	renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("root").appendChild(renderer.domElement);

  	// update viewport on resize
  	window.addEventListener('resize', () => {
  		const width = window.innerWidth;
  		const height = window.innerHeight;

  		renderer.setSize(width, height);
  		camera.aspect = width / height;
  		camera.updateProjectionMatrix();
  	});

  	// camera setup
  	camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  	camera.position.set(0, 0, 5);

  	// fps bar setup
  	stats = new Stats();
  	document.body.appendChild(stats.dom);

  	// orbit controls setup
  	controls = new OrbitControls(camera, renderer.domElement);
  	controls.enableDamping = true;
  	controls.dampingFactor = 0.25;
  	controls.enableZoom = true;

  	// lights
  	const ambientLight = new Three.AmbientLight(0xffffff, 0.20);
  	scene.add(ambientLight);

  	pointLight = new Three.PointLight(0xffffff, 1);
    pointLight.castShadow = true;
    // 4096 x 4096
    pointLight.shadow.mapSize.width = Math.pow(2,12);
    pointLight.shadow.mapSize.height = Math.pow(2,12);
    pointLight.shadow.camera.near = .5;
    pointLight.shadow.camera.far = 500;
  	pointLight.position.set(-3, 3, 10);
  	scene.add(pointLight);

    window.p = pointLight;

    // point light helper
    let pointLightHelper = new Three.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);

  	// custom materials
  	const basicMaterial = new Three.MeshBasicMaterial({color: 0x00fff0});
  	const lineMaterial = new Three.LineDashedMaterial({
  		color: 0xf00fff,
  		linewidth: 1,
  		scale: 1,
  		dashSize: 3,
  		gapSize: 1
  	});
  	const meshDepthMaterial = new Three.MeshDepthMaterial();
  	const meshNormalMaterial = new Three.MeshNormalMaterial();
  	const meshLambertMaterial = new Three.MeshLambertMaterial({
  		color: 0x5f002f
  	});
  	const meshPhongMaterial = new Three.MeshPhongMaterial({
  		color: 0x4515f0
  	});

  	// custom geometry
  	const boxGeometry = new Three.BoxGeometry(1, 1, 1);
  	cube = new Three.Mesh(boxGeometry, meshLambertMaterial);
    cube.castShadow = true;
  	cube.position.set(-2, 0, 0);
  	scene.add(cube);

  	const newMaterial = meshNormalMaterial.clone();
  	newMaterial.wireframe = true;
  	const another = new Three.Mesh(boxGeometry, newMaterial);
    another.castShadow = true;
  	another.position.set(0, 0, 0);
  	another.rotation.z = Three.Math.degToRad(45);
  	another.rotation.x = Math.PI / 4;
  	scene.add(another);

  	const another2 = new Three.Mesh(boxGeometry, meshPhongMaterial);
    another2.castShadow = true;
  	another2.position.set(2, 0, 0);
  	scene.add(another2);

  	// floor
  	const floorGeometry = new Three.PlaneGeometry(100, 100);
  	const floorMaterial = new Three.MeshLambertMaterial({
  		color: 0x00ff00,
  		side: Three.DoubleSide}
  	);
  	const floorMesh = new Three.Mesh(floorGeometry, floorMaterial);
    floorMesh.receiveShadow = true;
  	floorMesh.rotation.x = Math.PI / 2;
    // when cude roatate, only one vertex will touch the floor at most (or none)
  	floorMesh.position.y = -(Math.sqrt(Math.sqrt(2)*Math.sqrt(2)+1)/2);
  	scene.add(floorMesh);
};

const updateLights = () => {
	const time = Date.now() * 0.0005;
	const value = Math.sin(time * 0.7) * 20;
	pointLight.position.x = -2 + value;

  const anotherValue = Math.cos(time * 0.7) * 20;
  pointLight.position.z = anotherValue + value;

  pointLight.intensity = Math.abs(value *.08) + .2;
};

const render = () => {
	controls.update();
	updateLights();
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render(scene, camera);
};

const animationLoop = () => {
	stats.begin();
	render();
	stats.end();
	requestAnimationFrame(animationLoop);
};

if (Detector.webgl) {
	init();
	// Initiate function or other initializations here
	animationLoop();
} else {
	const warning = Detector.getWebGLErrorMessage();
	document.getElementById('root').appendChild(warning);
}
