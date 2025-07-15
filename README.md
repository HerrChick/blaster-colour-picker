# glTF Viewer Web Component

A TypeScript web component that uses Three.js to load and display glTF files with interactive camera controls and mesh visibility toggles.

## Features

- 🎮 **Interactive Camera Controls**: Pan, tilt, and zoom with mouse/touch
- 👁️ **Mesh Visibility Controls**: Show/hide individual meshes with checkboxes
- 📁 **File Loading**: Load glTF files from the filesystem
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
    <script type="module" src="./dist/gltf-viewer.js"></script>
</head>
<body>
    <gltf-viewer></gltf-viewer>
</body>
</html>
```

### Advanced Usage

```html
<gltf-viewer id="viewer"></gltf-viewer>

<script type="module">
    import './dist/gltf-viewer.js';
    
    const viewer = document.getElementById('viewer');
    
    // Load a model from URL
    viewer.loadModelFromUrl('./path/to/model.gltf');
    
    // Change background color
    viewer.setBackgroundColor('#ffffff');
    
    // Toggle grid visibility
    viewer.toggleGrid(false);
</script>
```

## API Reference

### Properties

The component automatically provides these features:

- **File Picker**: Upload glTF files from your filesystem
- **Mesh Controls**: Checkboxes to show/hide individual meshes
- **Camera Controls**: 
  - Left click + drag: Rotate
  - Right click + drag: Pan
  - Scroll: Zoom

### Methods

#### `loadModelFromUrl(url: string)`
Loads a glTF model from a URL.

```javascript
viewer.loadModelFromUrl('./model.gltf');
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

## Development

### Project Structure

```
├── src/
│   └── gltf-viewer.ts      # Main component source
├── dist/                   # Built files (generated)
├── index.html             # Demo page
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

### Build Commands

- `npm run build` - Build the component once
- `npm run dev` - Watch for changes and rebuild automatically
- `npm run serve` - Start a local development server

### Customization

The component uses Shadow DOM for encapsulation. You can customize the appearance by modifying the CSS in the `init()` method of the component.

## Browser Support

- Chrome 67+
- Firefox 63+
- Safari 11.1+
- Edge 79+

## Dependencies

- **Three.js**: 3D graphics library
- **TypeScript**: Type safety and modern JavaScript features

## License

MIT License - feel free to use this component in your projects!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Module not found errors**: Make sure to run `npm install` first
2. **CORS errors**: Use a local server (like `npm run serve`) instead of opening files directly
3. **Model not loading**: Check that the glTF file is valid and accessible
4. **Performance issues**: Large models may take time to load and render

### Debug Mode

Open the browser console to see loading progress and any error messages. 