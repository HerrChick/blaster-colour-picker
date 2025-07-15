import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { fileInputPanelTemplate, modalTemplate } from './obj-viewer-templates.js';
import objViewerStyles from './obj-viewer.css?inline';

interface MeshInfo {
  name: string;
  mesh: THREE.Mesh;
  visible: boolean;
  originalMaterial?: THREE.Material;
  customColor?: string;
}

export class ObjViewer extends HTMLElement {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private objLoader!: OBJLoader;
  private mtlLoader!: MTLLoader;
  private meshes: MeshInfo[] = [];
  private currentModel: THREE.Group | null = null;
  private container!: HTMLDivElement;
  private fileInputPanel!: HTMLDivElement;
  private modal!: HTMLDivElement;
  private animationId: number | null = null;
  private raycaster!: THREE.Raycaster;
  private mouse!: THREE.Vector2;
  private selectedMeshInfo: MeshInfo | null = null;

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

    // Create and add styles
    const style = document.createElement('style');
    style.textContent = objViewerStyles;

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'viewer-container';

    // Create file input panel
    this.fileInputPanel = document.createElement('div');
    this.fileInputPanel.className = 'file-input-panel';
    this.fileInputPanel.innerHTML = fileInputPanelTemplate;

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.innerHTML = modalTemplate;

    // Add elements to shadow DOM
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.container);
    this.shadowRoot.appendChild(this.modal);
    this.container.appendChild(this.fileInputPanel);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(0, 0, 10);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-10, 5, -10);
    this.scene.add(rimLight);

    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupEventListeners(): void {
    const objFileInput = this.shadowRoot?.getElementById('objFileInput') as HTMLInputElement;
    const mtlFileInput = this.shadowRoot?.getElementById('mtlFileInput') as HTMLInputElement;
    
    if (objFileInput) {
      objFileInput.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          const mtlFile = mtlFileInput?.files?.[0] || null;
          this.loadObjFile(target.files[0], mtlFile);
        }
      });
    }

    if (mtlFileInput) {
      mtlFileInput.addEventListener('change', (event) => {
        const objFile = objFileInput?.files?.[0];
        const target = event.target as HTMLInputElement;
        if (objFile && target.files?.[0]) {
          this.loadObjFile(objFile, target.files[0]);
        }
      });
    }

    // Modal event listeners
    const closeModal = this.shadowRoot?.getElementById('closeModal');
    const cancelBtn = this.shadowRoot?.getElementById('cancelBtn');
    const applyBtn = this.shadowRoot?.getElementById('applyBtn');
    const resetColorBtn = this.shadowRoot?.getElementById('resetColor');

    if (closeModal) {
      closeModal.addEventListener('click', () => this.hideModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideModal());
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyMeshChanges());
    }

    if (resetColorBtn) {
      resetColorBtn.addEventListener('click', () => this.resetMeshColor());
    }

    // Click detection on renderer
    this.renderer.domElement.addEventListener('click', (event) => this.onMeshClick(event));
  }

  private onMeshClick(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      
      // Find the mesh info for the clicked object
      const meshInfo = this.meshes.find(info => info.mesh === intersectedObject);
      
      if (meshInfo) {
        this.selectedMeshInfo = meshInfo;
        this.showMeshModal(meshInfo);
      }
    }
  }

  private showMeshModal(meshInfo: MeshInfo): void {
    const meshName = this.shadowRoot?.getElementById('meshName') as HTMLElement;
    const visibilityToggle = this.shadowRoot?.getElementById('visibilityToggle') as HTMLInputElement;
    const colorPicker = this.shadowRoot?.getElementById('colorPicker') as HTMLInputElement;

    if (meshName) meshName.textContent = meshInfo.name;
    if (visibilityToggle) visibilityToggle.checked = meshInfo.visible;
    if (colorPicker) {
      colorPicker.value = meshInfo.customColor || '#ffffff';
    }

    this.modal.classList.add('show');
  }

  private hideModal(): void {
    this.modal.classList.remove('show');
    this.selectedMeshInfo = null;
  }

  private applyMeshChanges(): void {
    if (!this.selectedMeshInfo) return;

    const visibilityToggle = this.shadowRoot?.getElementById('visibilityToggle') as HTMLInputElement;
    const colorPicker = this.shadowRoot?.getElementById('colorPicker') as HTMLInputElement;

    this.selectedMeshInfo.visible = visibilityToggle.checked;
    this.selectedMeshInfo.mesh.visible = visibilityToggle.checked;

    const newColor = colorPicker.value;
    this.selectedMeshInfo.customColor = newColor;
    
    this.applyColorToMesh(this.selectedMeshInfo.mesh, newColor);

    this.hideModal();
  }

  private resetMeshColor(): void {
    if (!this.selectedMeshInfo) return;

    const colorPicker = this.shadowRoot?.getElementById('colorPicker') as HTMLInputElement;
    
    // Reset to original material or default white
    if (this.selectedMeshInfo.originalMaterial) {
      this.selectedMeshInfo.mesh.material = this.selectedMeshInfo.originalMaterial;
    } else {
      this.selectedMeshInfo.mesh.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    }
    
    delete this.selectedMeshInfo.customColor;
    colorPicker.value = '#ffffff';
  }

  private applyColorToMesh(mesh: THREE.Mesh, color: string): void {
    // Create a new material with the selected color
    const newMaterial = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color),
    });
    
    mesh.material = newMaterial;
  }

  private loadObjFile(objFile: File, mtlFile: File | null = null): void {
    this.showLoading(true);

    if (mtlFile) {
      const mtlUrl = URL.createObjectURL(mtlFile);
      
      this.mtlLoader.load(
        mtlUrl,
        (materials) => {
          materials.preload();
          this.objLoader.setMaterials(materials);
          
          const objUrl = URL.createObjectURL(objFile);
          this.objLoader.load(
            objUrl,
            (object) => {
              this.onObjLoaded(object);
              this.showLoading(false);
              URL.revokeObjectURL(objUrl);
              URL.revokeObjectURL(mtlUrl);
            },
            (progress) => {
              console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
              console.error('Error loading OBJ file:', error);
              this.showLoading(false);
              URL.revokeObjectURL(objUrl);
              URL.revokeObjectURL(mtlUrl);
            }
          );
        },
        (progress) => {
          console.log('Loading MTL progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading MTL file:', error);
          this.loadObjWithoutMaterials(objFile);
        }
      );
    } else {
      this.loadObjWithoutMaterials(objFile);
    }
  }

  private loadObjWithoutMaterials(objFile: File): void {
    const objUrl = URL.createObjectURL(objFile);
    
    this.objLoader.load(
      objUrl,
      (object) => {
        this.onObjLoaded(object);
        this.showLoading(false);
        URL.revokeObjectURL(objUrl);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading OBJ file:', error);
        this.showLoading(false);
        URL.revokeObjectURL(objUrl);
      }
    );
  }

  private onObjLoaded(object: THREE.Group): void {
    this.clearModel();

    this.currentModel = object;

    this.scene.add(object);

    this.extractMeshes(object);

    this.fitCameraToModel(object);
  }

  private extractMeshes(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Store original material for potential reset
        const originalMaterial = child.material.clone();
        
        const meshInfo: MeshInfo = {
          name: child.name || `Mesh_${this.meshes.length}`,
          mesh: child,
          visible: true,
          originalMaterial: originalMaterial
        };
        this.meshes.push(meshInfo);
      }
    });
  }

  private clearModel(): void {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel = null;
    }
    
    this.meshes = [];
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

  public loadModelFromUrl(objUrl: string, mtlUrl?: string): void {
    this.showLoading(true);
    
    if (mtlUrl) {
      this.mtlLoader.load(
        mtlUrl,
        (materials) => {
          materials.preload();
          this.objLoader.setMaterials(materials);
          
          this.objLoader.load(
            objUrl,
            (object) => {
              this.onObjLoaded(object);
              this.showLoading(false);
            },
            undefined,
            (error) => {
              console.error('Error loading OBJ file:', error);
              this.showLoading(false);
            }
          );
        },
        undefined,
        (error) => {
          console.error('Error loading MTL file:', error);
          this.showLoading(false);
        }
      );
    } else {
      this.objLoader.load(
        objUrl,
        (object) => {
          this.onObjLoaded(object);
          this.showLoading(false);
        },
        undefined,
        (error) => {
          console.error('Error loading OBJ file:', error);
          this.showLoading(false);
        }
      );
    }
  }

  public setBackgroundColor(color: string): void {
    this.scene.background = new THREE.Color(color);
  }

  public captureViewport(format: 'png' | 'jpeg' = 'png', quality: number = 0.9): string {
    this.renderer.render(this.scene, this.camera);
    
    const canvas = this.renderer.domElement;
    return canvas.toDataURL(`image/${format}`, quality);
  }

  public downloadViewport(filename: string = 'screenshot.png'): void {
    const imageData = this.captureViewport();
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageData;
    link.click();
  }


  public setCoordinateSystem(system: 'y-up' | 'z-up'): void {
    if (!this.currentModel) {
      console.warn('No model loaded. Load a model first before changing coordinate system.');
      return;
    }

    // Reset any previous rotations
    this.currentModel.rotation.set(0, 0, 0);

    // Apply rotation based on coordinate system
    if (system === 'z-up') {
      // Convert from Y-up to Z-up: rotate -90 degrees around X axis
      this.currentModel.rotation.x = -Math.PI / 2;
    } else if (system === 'y-up') {
      // Keep Y-up (default Three.js coordinate system)
      this.currentModel.rotation.x = 0;
    }

    // Update camera and controls to fit the reoriented model
    this.fitCameraToModel(this.currentModel);
  }


  public getCoordinateSystem(): 'y-up' | 'z-up' {
    if (!this.currentModel) {
      return 'y-up'; // Default
    }
    
    // Check the current rotation to determine coordinate system
    const rotation = this.currentModel.rotation.x;
    return Math.abs(rotation + Math.PI / 2) < 0.01 ? 'z-up' : 'y-up';
  }
}

customElements.define('obj-viewer', ObjViewer); 