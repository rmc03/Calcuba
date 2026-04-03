const { withAndroidStyles } = require('@expo/config-plugins');

/**
 * Config plugin para forzar que Android (especialmente Xiaomi/MIUI/HyperOS)
 * renderice la app en el área del notch/display cutout.
 * 
 * Sin esto, Xiaomi ignora SafeAreaView y el contenido queda detrás del notch.
 * 
 * Agrega a styles.xml:
 *   - windowTranslucentStatus = true
 *   - windowLayoutInDisplayCutoutMode = shortEdges (API 27+)
 */
module.exports = function withAndroidNotchSupport(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults;

    // Buscar o crear el tema AppTheme
    let appTheme = styles.resources.style?.find(
      (s) => s.$.name === 'AppTheme'
    );

    if (!appTheme) {
      if (!styles.resources.style) styles.resources.style = [];
      appTheme = {
        $: { name: 'AppTheme', parent: 'Theme.AppCompat.Light.NoActionBar' },
        item: [],
      };
      styles.resources.style.push(appTheme);
    }

    if (!appTheme.item) appTheme.item = [];

    // Helper para agregar o actualizar un item
    const setItem = (name, value) => {
      const existing = appTheme.item.find((i) => i.$.name === name);
      if (existing) {
        existing._ = value;
      } else {
        appTheme.item.push({ $: { name }, _: value });
      }
    };

    // Barra de estado translúcida → permite que SafeAreaView mida el inset correcto
    setItem('android:windowTranslucentStatus', 'true');

    // Modo display cutout: renderizar en el área del notch
    // "shortEdges" funciona en API 27+ (Android 8.1+) que cubre todos los Xiaomi con notch
    setItem('android:windowLayoutInDisplayCutoutMode', 'shortEdges');

    return config;
  });
};
