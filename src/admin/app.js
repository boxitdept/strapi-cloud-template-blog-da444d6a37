// app/src/admin/app.js
import { setPluginConfig, defaultHtmlPreset } from '@_sh/strapi-plugin-ckeditor';

export default {
  register() {
    // load the canonical editor styles via our proxy (avoids CORS)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/bp/css/strapi.css'; // was /bp/css/Common.css
    document.head.appendChild(link);

    // lock CKEditor to Acumin only
    defaultHtmlPreset.editorConfig = {
      ...defaultHtmlPreset.editorConfig,
      toolbar: [
        ...(defaultHtmlPreset.editorConfig.toolbar || []),
        'fontFamily',
      ],
      fontFamily: {
        options: ['Acumin Pro, sans-serif'],
        supportAllValues: false,
      },
    };

    // let strapi.css be the source of truth — no extra overrides
    defaultHtmlPreset.styles = ``;

    setPluginConfig({ presets: [defaultHtmlPreset] });
  },
  bootstrap() {},
  config: {},
};
