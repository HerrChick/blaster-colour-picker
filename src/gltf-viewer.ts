import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface MeshInfo {
  name: string;
  mesh: THREE.Mesh;
  visible: boolean;
}

export class GltfViewer extends HTMLElement {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private loader!: GLTFLoader;
  private meshes: MeshInfo[] = [];
  private currentModel: THREE.Group | null = null; // Add this
  private container!: HTMLDivElement;
  private controlsPanel!: HTMLDivElement;
  private animationId: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  private init(): void {
    if (!this.shadowRoot) return;

    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 400px;
      }
      
      .viewer-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
      }
      
      .controls-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 1000;
        min-width: 200px;
      }
      
      .controls-panel h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: #fff;
      }
      
      .mesh-control {
        display: flex;
        align-items: center;
        margin: 5px 0;
        padding: 5px;
        border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
      }
      
      .mesh-control:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .mesh-control input[type="checkbox"] {
        margin-right: 8px;
        cursor: pointer;
      }
      
      .mesh-control label {
        cursor: pointer;
        flex: 1;
        user-select: none;
      }
      
      .file-input {
        margin-bottom: 15px;
      }
      
      .file-input input {
        width: 100%;
        padding: 5px;
        border: 1px solid #555;
        border-radius: 4px;
        background: #333;
        color: white;
      }
      
      .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 18px;
        z-index: 1001;
      }
    `;

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'viewer-container';

    // Create controls panel
    this.controlsPanel = document.createElement('div');
    this.controlsPanel.className = 'controls-panel';
    this.controlsPanel.innerHTML = `
      <h3>Model Controls</h3>
      <div class="file-input">
        <input type="file" accept=".gltf,.glb" id="fileInput">
      </div>
      <div id="meshControls">
        <p>Load a glTF file to see mesh controls</p>
      </div>
    `;

    // Add elements to shadow DOM
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.container);
    this.shadowRoot.appendChild(this.controlsPanel);

    // Initialize Three.js
    this.initThreeJS();
    this.setupEventListeners();
    this._animate();
  }

  private initThreeJS(): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(5, 5, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    // Loader
    this.loader = new GLTFLoader();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupEventListeners(): void {
    const fileInput = this.shadowRoot?.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          this.loadGltfFile(target.files[0]);
        }
      });
    }
  }

  private loadGltfFile(file: File): void {
    const url = URL.createObjectURL(file);
    this.showLoading(true);

    this.loader.load(
      url,
      (gltf) => {
        this.onGltfLoaded(gltf);
        this.showLoading(false);
        URL.revokeObjectURL(url);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading glTF file:', error);
        this.showLoading(false);
        URL.revokeObjectURL(url);
      }
    );
  }

  private onGltfLoaded(gltf: any): void {
    // Clear existing model
    this.clearModel();

    // Store reference to current model
    this.currentModel = gltf.scene;

    // Add the loaded model to the scene
    this.scene.add(gltf.scene);

    // Extract all meshes and create controls
    this.extractMeshes(gltf.scene);

    // Update controls panel
    this.updateControlsPanel();

    // Auto-adjust camera to fit the model
    this.fitCameraToModel(gltf.scene);
  }

  private extractMeshes(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshInfo: MeshInfo = {
          name: child.name || `Mesh_${this.meshes.length}`,
          mesh: child,
          visible: true
        };
        this.meshes.push(meshInfo);
      }
    });
  }

  private clearMeshes(): void {
    // Remove existing meshes from scene
    this.meshes.forEach(meshInfo => {
      if (meshInfo.mesh.parent) {
        meshInfo.mesh.parent.remove(meshInfo.mesh);
      }
    });
    this.meshes = [];
  }

  private clearModel(): void {
    // Remove the entire current model from scene
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel = null;
    }
    
    // Clear meshes array
    this.meshes = [];
  }

  private updateControlsPanel(): void {
    const meshControlsContainer = this.shadowRoot?.getElementById('meshControls');
    if (!meshControlsContainer) return;

    if (this.meshes.length === 0) {
      meshControlsContainer.innerHTML = '<p>No meshes found in the model</p>';
      return;
    }

    let controlsHTML = '<h4>Meshes:</h4>';
    this.meshes.forEach((meshInfo, index) => {
      controlsHTML += `
        <div class="mesh-control">
          <input type="checkbox" id="mesh_${index}" ${meshInfo.visible ? 'checked' : ''}>
          <label for="mesh_${index}">${meshInfo.name}</label>
        </div>
      `;
    });

    meshControlsContainer.innerHTML = controlsHTML;

    // Add event listeners to checkboxes
    this.meshes.forEach((meshInfo, index) => {
      const checkbox = this.shadowRoot?.getElementById(`mesh_${index}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.addEventListener('change', (event) => {
          const target = event.target as HTMLInputElement;
          meshInfo.visible = target.checked;
          meshInfo.mesh.visible = target.checked;
        });
      }
    });
  }

  private fitCameraToModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= 1.5; // Add some padding

    this.camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
    this.camera.lookAt(center);
    this.controls.target.copy(center);
    this.controls.update();
  }

  private showLoading(show: boolean): void {
    let loadingElement = this.shadowRoot?.querySelector('.loading') as HTMLElement;
    
    if (show) {
      if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.className = 'loading';
        loadingElement.textContent = 'Loading model...';
        this.shadowRoot?.appendChild(loadingElement);
      }
    } else {
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }

  private onWindowResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private _animate(): void {
    this.animationId = requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    window.removeEventListener('resize', () => this.onWindowResize());
  }

  // Public methods
  public loadModelFromUrl(url: string): void {
    this.showLoading(true);
    
    this.loader.load(
      url,
      (gltf) => {
        this.onGltfLoaded(gltf);
        this.showLoading(false);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading glTF file:', error);
        this.showLoading(false);
      }
    );
  }

  public setBackgroundColor(color: string): void {
    this.scene.background = new THREE.Color(color);
  }

  public toggleGrid(visible: boolean): void {
    const gridHelper = this.scene.children.find(child => child instanceof THREE.GridHelper);
    if (gridHelper) {
      gridHelper.visible = visible;
    }
  }
}

// Register the custom element
customElements.define('gltf-viewer', GltfViewer); 