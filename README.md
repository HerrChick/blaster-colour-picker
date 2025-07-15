# OBJ Viewer Web Component

A TypeScript web component that uses Three.js to load and display OBJ files with interactive camera controls, mesh visibility toggles, material editing, and advanced viewing features.

## Features

- 🎮 **Interactive Camera Controls**: Pan, tilt, and zoom with mouse/touch
- 👁️ **Mesh Visibility Controls**: Show/hide individual meshes with checkboxes
- 🎨 **Material Editing**: Click on meshes to edit colors and materials
- 📁 **File Loading**: Load OBJ files with optional MTL material files
- 📸 **Screenshot Capture**: Capture and download viewport screenshots
- 🔄 **Coordinate System Support**: Switch between Y-up and Z-up coordinate systems
- 🎨 **Customizable**: Background colors, grid toggle, and more
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔧 **TypeScript**: Fully typed with modern ES2020 features

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the component:
```bash
npm run build
```

3. Start a local server:
```bash
npm run serve
```

4. Open `http://localhost:8000` in your browser

## Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="./dist/obj-viewer.js"></script>
</head>
<body>
    <obj-viewer></obj-viewer>
</body>
</html>
```

### Advanced Usage

```html
<obj-viewer id="viewer"></obj-viewer>

<script type="module">
    import './dist/obj-viewer.js';
    
    const viewer = document.getElementById('viewer');
    
    // Load a model from URL
    viewer.loadModelFromUrl('./path/to/model.obj', './path/to/materials.mtl');
    
    // Change background color
    viewer.setBackgroundColor('#ffffff');
    
    // Toggle grid visibility
    viewer.toggleGrid(false);
    
    // Capture screenshot
    const screenshot = viewer.captureViewport('png', 0.9);
    
    // Download viewport
    viewer.downloadViewport('my-screenshot.png');
    
    // Set coordinate system
    viewer.setCoordinateSystem('z-up');
</script>
```

## API Reference

### Properties

The component automatically provides these features:

- **File Picker**: Upload OBJ files from your filesystem (with optional MTL files)
- **Mesh Controls**: Checkboxes to show/hide individual meshes
- **Interactive Mesh Editing**: Click on meshes to open material editing modal
- **Camera Controls**: 
  - Left click + drag: Rotate
  - Right click + drag: Pan
  - Scroll: Zoom

### Methods

#### `loadModelFromUrl(objUrl: string, mtlUrl?: string)`
Loads an OBJ model from a URL with optional MTL material file.

```javascript
// Load OBJ with materials
viewer.loadModelFromUrl('./model.obj', './materials.mtl');

// Load OBJ without materials
viewer.loadModelFromUrl('./model.obj');
```

#### `setBackgroundColor(color: string)`
Sets the background color of the scene.

```javascript
viewer.setBackgroundColor('#1a1a1a'); // Dark theme
viewer.setBackgroundColor('#ffffff');  // Light theme
```

#### `toggleGrid(visible: boolean)`
Shows or hides the grid helper.

```javascript
viewer.toggleGrid(false); // Hide grid
viewer.toggleGrid(true);  // Show grid
```

#### `captureViewport(format: 'png' | 'jpeg', quality: number)`
Captures the current viewport as a data URL.

```javascript
// Capture as PNG
const pngData = viewer.captureViewport('png', 0.9);

// Capture as JPEG
const jpegData = viewer.captureViewport('jpeg', 0.8);
```

#### `downloadViewport(filename: string)`
Downloads the current viewport as an image file.

```javascript
viewer.downloadViewport('screenshot.png');
viewer.downloadViewport('model-view.jpg');
```

#### `setCoordinateSystem(system: 'y-up' | 'z-up')`
Sets the coordinate system for the viewer and adjusts model orientation accordingly.

```javascript
// For Blender-style Z-up models
viewer.setCoordinateSystem('z-up');

// For Maya/3ds Max-style Y-up models (default)
viewer.setCoordinateSystem('y-up');
```

#### `getCoordinateSystem(): 'y-up' | 'z-up'`
Gets the current coordinate system setting.

```javascript
const currentSystem = viewer.getCoordinateSystem();
console.log(`Current coordinate system: ${currentSystem}`);
```

## Interactive Features

### Mesh Material Editing

- **Click on any mesh** in the 3D view to open the material editing modal
- **Change colors** using the color picker
- **Reset to original** material if needed
- **Apply changes** to see them immediately in the viewport

### File Loading

- **OBJ Files**: Load standard OBJ geometry files
- **MTL Files**: Optional material files for textures and materials
- **Drag & Drop**: Use the file picker panel to load models
- **URL Loading**: Load models from URLs programmatically

## Development

### Project Structure

```
├── src/
│   ├── 
```
