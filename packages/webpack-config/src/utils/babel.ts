interface BabelConfigOptions {
  presets: Array<string | [string, Record<string, any>]>;
  plugins: Array<string | [string, Record<string, any>]>;
}

export function findPresetConfigIndex(presets: BabelConfigOptions['presets'], targetPresetName: string) {
  return presets.findIndex((item) => {
    if (typeof item === 'string' && item === targetPresetName) return true;
    if (Array.isArray(item) && item[0] === targetPresetName) return true;
    return false;
  });
}

export function findPluginConfigIndex(presets: BabelConfigOptions['presets'], targetPresetName: string) {
  return presets.findIndex((item) => {
    if (typeof item === 'string' && item === targetPresetName) return true;
    if (Array.isArray(item) && item[0] === targetPresetName) return true;
    return false;
  });
}
