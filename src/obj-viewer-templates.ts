export const fileInputPanelTemplate = `
<h3>Load Model</h3>
<div class="file-input">
  <input type="file" accept=".obj" id="objFileInput" placeholder="Select OBJ file">
  <input type="file" accept=".mtl" id="mtlFileInput" placeholder="Select MTL file (optional)">
  <div class="file-info">Select an OBJ file and optionally an MTL material file</div>
</div>
<div style="font-size: 12px; color: #ccc;">
  Click on any mesh in the model to edit its properties
</div>
`;

export const modalTemplate = `
<div class="modal-content">
  <div class="modal-header">
    <h3 class="modal-title">Mesh Properties</h3>
    <button class="close-btn" id="closeModal">&times;</button>
  </div>
  <div class="modal-body">
    <div class="control-group">
      <label>Mesh Name:</label>
      <div id="meshName">-</div>
    </div>
    <div class="control-group">
      <label>Visibility:</label>
      <div class="visibility-control">
        <input type="checkbox" id="visibilityToggle" checked>
        <span>Visible</span>
      </div>
    </div>
    <div class="control-group">
      <label>Color:</label>
      <div class="color-control">
        <input type="color" id="colorPicker" class="color-picker" value="#ffffff">
        <button class="reset-color-btn" id="resetColor">Reset</button>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
    <button class="btn btn-primary" id="applyBtn">Apply</button>
  </div>
</div>
`;