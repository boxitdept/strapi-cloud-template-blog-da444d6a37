// app/src/admin/app.js
import { setPluginConfig, defaultHtmlPreset } from '@_sh/strapi-plugin-ckeditor';

export default {
  register() {
    // Build a preset that keeps real HTML and shows Source.
const preset = {
  ...defaultHtmlPreset,
  editorConfig: {
    ...defaultHtmlPreset.editorConfig,
    toolbar: [
      'undo','redo','|','heading',
      '|','bold','italic','link',
      '|','bulletedList','numberedList','outdent','indent',
      '|','blockQuote','insertTable','imageUpload',
      '|','htmlEmbed','sourceEditing','fontFamily'
    ],
    fontFamily: { options: ['Acumin Pro, sans-serif'], supportAllValues: false },
    htmlSupport: {
      allow: [
        { name: /.*/, attributes: true, classes: true, styles: true },
        { name: 'img', attributes: ['src','srcset','sizes','width','height','alt','loading','decoding','fetchpriority','class','style','data-*'] },
        { name: 'a',   attributes: ['href','target','rel','download','class','style','data-*'] },
        { name: 'iframe', attributes: ['src','allow','allowfullscreen','width','height','title','class','style'] }
      ],
      disallow: [
        { name: 'script', attributes: true, classes: true, styles: true },
        { name: /.*/, attributes: [/^on.*/i] }
      ]
    }
  },
  styles: ``
};

    // Official way per docs: theme.common is injected before the editor mounts.
const theme = {
  common: `
    @import url("/bp/css/strapi.css");

    :root { --ck-font-face: "Acumin Pro", sans-serif !important; }
    .ck-editor__main { --ck-font-face: "Acumin Pro", sans-serif !important; }

    .ck-editor__main .ck-content,
    .ck-editor__main .ck-content * { font-family: "Acumin Pro", sans-serif !important; }
    .ck-editor__main .ck-content * { margin: revert; }

    /* Make bullets/numbers actually visible */
    .ck-editor__main .ck-content ul { list-style: disc; padding-left: 1.25rem; }
    .ck-editor__main .ck-content ol { list-style: decimal; padding-left: 1.25rem; }

    /* Tables not crammed to death */
    .ck-editor__main .ck-content table { width: 100%; border-collapse: collapse; }
    .ck-editor__main .ck-content th,
    .ck-editor__main .ck-content td { border: 1px solid #e3e3e3; padding: 8px 10px; }

    /* Images stay responsive in preview */
    .ck-editor__main .ck-content img { max-width: 100%; height: auto; display: block; }
    .ck-editor__main .ck-content figure.image.image_resized img { width: 100% !important; height: auto !important; }
  `,
  additional: `
    /* Headings that look like headings */
    .ck-editor__main .ck-content h1 { font-size: 32px !important; line-height: 1.25 !important; font-weight: 700 !important; margin: 0 0 .5em !important; }
    .ck-editor__main .ck-content h2 { font-size: 26px !important; line-height: 1.25 !important; font-weight: 700 !important; margin: 0 0 .5em !important; }
    .ck-editor__main .ck-content h3 { font-size: 20px !important; line-height: 1.25 !important; font-weight: 700 !important; margin: 0 0 .5em !important; }
  `
};


    setPluginConfig({ presets: [preset], theme });
  },
  bootstrap() {},
  config: {}
};
