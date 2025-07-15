export declare class ObjViewer extends HTMLElement {
    private scene;
    private camera;
    private renderer;
    private controls;
    private objLoader;
    private mtlLoader;
    private meshes;
    private currentModel;
    private container;
    private fileInputPanel;
    private modal;
    private animationId;
    private raycaster;
    private mouse;
    private selectedMeshInfo;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private init;
    private initThreeJS;
    private setupEventListeners;
    private onMeshClick;
    private showMeshModal;
    private hideModal;
    private applyMeshChanges;
    private resetMeshColor;
    private applyColorToMesh;
    private loadObjFile;
    private loadObjWithoutMaterials;
    private onObjLoaded;
    private extractMeshes;
    private clearModel;
    private fitCameraToModel;
    private showLoading;
    private onWindowResize;
    private _animate;
    private cleanup;
    loadModelFromUrl(objUrl: string, mtlUrl?: string): void;
    setBackgroundColor(color: string): void;
    toggleGrid(visible: boolean): void;
    captureViewport(format?: 'png' | 'jpeg', quality?: number): string;
    downloadViewport(filename?: string): void;
    /**
     * Sets the coordinate system for the viewer and adjusts model orientation accordingly
     * @param system - 'y-up' for Y-up coordinate system (Maya, 3ds Max style) or 'z-up' for Z-up coordinate system (Blender style)
     */
    setCoordinateSystem(system: 'y-up' | 'z-up'): void;
    /**
     * Updates the grid helper orientation based on coordinate system
     * @param system - The coordinate system being used
     */
    private updateGridHelper;
    /**
     * Gets the current coordinate system setting
     * @returns The current coordinate system ('y-up' or 'z-up')
     */
    getCoordinateSystem(): 'y-up' | 'z-up';
}
