import { ObjViewer } from './obj-viewer.js';


window.downloadViewport = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.downloadViewport) {
        viewer.downloadViewport();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const viewer = document.getElementById('viewer');
    
    setTimeout(() => {
        loadDemoModel();
    }, 100);
});

window.loadDemoModel = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.loadModelFromUrl) {
        viewer.loadModelFromUrl('https://opnqkhpyffevwdf1.public.blob.vercel-storage.com/ms-gnk-v11-combined.obj', 
            'https://opnqkhpyffevwdf1.public.blob.vercel-storage.com/ms-gnk-v11-combined.mtl');
    }
};


window.resetCamera = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.resetCamera) {
        viewer.resetCamera();
    }
};

window.setDarkTheme = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.setBackgroundColor) {
        viewer.setBackgroundColor('#1a1a1a');
    }
};

window.setLightTheme = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.setBackgroundColor) {
        viewer.setBackgroundColor('#f0f0f0');
    }
};

window.toggleCoordinateSystem = function() {
    const viewer = document.getElementById('viewer');
    const button = document.getElementById('coordinateBtn');
    
    if (viewer && viewer.setCoordinateSystem && viewer.getCoordinateSystem) {
        const currentSystem = viewer.getCoordinateSystem();
        const newSystem = currentSystem === 'y-up' ? 'z-up' : 'y-up';
        
        viewer.setCoordinateSystem(newSystem);
        
        button.textContent = newSystem === 'y-up' ? 'Switch to Z-Up' : 'Switch to Y-Up';
        
        console.log(`Coordinate system changed to: ${newSystem}`);
    }
}; 