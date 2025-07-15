import '/dist/obj-viewer.js';

window.downloadViewport = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.downloadViewport) {
        viewer.downloadViewport();
    }
};

// Wait for the component to be ready
window.addEventListener('DOMContentLoaded', () => {
    const viewer = document.getElementById('viewer');
    
    // Load the demo model automatically
    setTimeout(() => {
        loadDemoModel();
    }, 100);
});

// Demo functions
window.loadDemoModel = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.loadModelFromUrl) {
        viewer.loadModelFromUrl('./ms-gnk-v11.obj', './ms-gnk-v11.mtl');
    }
};

window.toggleGrid = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.toggleGrid) {
        // This will toggle the grid visibility
        // You might need to track the current state in a real implementation
        viewer.toggleGrid(false);
        setTimeout(() => viewer.toggleGrid(true), 1000);
    }
};

window.resetCamera = function() {
    const viewer = document.getElementById('viewer');
    if (viewer && viewer.loadModelFromUrl) {
        // Reload the model to reset camera
        viewer.loadModelFromUrl('./ms-gnk-v11.obj', './ms-gnk-v11.mtl');
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
        
        // Update button text to show next action
        button.textContent = newSystem === 'y-up' ? 'Switch to Z-Up' : 'Switch to Y-Up';
        
        console.log(`Coordinate system changed to: ${newSystem}`);
    }
}; 