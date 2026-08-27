/**
 * Custom Preset Manager for managing simulation presets in LocalStorage,
 * importing/exporting JSON files, and managing custom preset life cycle.
 */
export class CustomPresetManager {
  constructor(app) {
    this.app = app;
    this.storageKey = 'relative_motion_custom_presets_v1';
    this.activePresetId = null;
    this.isUnsaved = false;
  }

  getAllCustomPresets() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error('Failed to read custom presets from localStorage:', err);
      return {};
    }
  }

  getPreset(id) {
    const presets = this.getAllCustomPresets();
    return presets[id] || null;
  }

  savePreset(name, description, config) {
    const presets = this.getAllCustomPresets();
    const id = this.activePresetId && presets[this.activePresetId]
      ? this.activePresetId
      : `custom_${Date.now()}`;

    const presetData = {
      id,
      name,
      description: description || '',
      updatedAt: new Date().toISOString(),
      config
    };

    presets[id] = presetData;
    localStorage.setItem(this.storageKey, JSON.stringify(presets));
    this.activePresetId = id;
    this.isUnsaved = false;
    return presetData;
  }

  deletePreset(id) {
    const presets = this.getAllCustomPresets();
    if (presets[id]) {
      delete presets[id];
      localStorage.setItem(this.storageKey, JSON.stringify(presets));
      if (this.activePresetId === id) {
        this.activePresetId = null;
      }
      return true;
    }
    return false;
  }

  exportPresetToJson(id) {
    const preset = this.getPreset(id);
    if (!preset) throw new Error('Preset not found');
    return JSON.stringify(preset, null, 2);
  }

  importPresetFromJson(jsonString) {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (err) {
      throw new Error('Could not import preset. Reason: Invalid JSON format.');
    }

    if (!data.name || !data.config || !data.config.particles) {
      throw new Error('Could not import preset. Reason: Missing required preset fields (name or particle configuration).');
    }

    const name = data.name;
    const desc = data.description || 'Imported custom preset';
    return this.savePreset(name, desc, data.config);
  }

  markUnsaved() {
    this.isUnsaved = true;
  }

  clearUnsaved() {
    this.isUnsaved = false;
  }
}
