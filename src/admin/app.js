// app/src/admin/app.js
import {
  setPluginConfig,
  defaultHtmlPreset,
  StrapiMediaLib,
  StrapiUploadAdapter
} from '@_sh/strapi-plugin-ckeditor';

export default {
  register() {
    // 1) Load your front-site stylesheet for WYSIWYG parity.
    //    You already host /bp/css/strapi.css on the same origin.
    //    This <link> guarantees it loads even if CKEditor theme import fails.
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/bp/css/strapi.css';
    document.head.appendChild(link);

    // 2) Build the CKEditor preset
    const preset = {
      ...defaultHtmlPreset,
      editorConfig: {
        ...defaultHtmlPreset.editorConfig,

        // Make sure the plugins you reference in the toolbar are actually present.
        plugins: [
          ...(defaultHtmlPreset.editorConfig.plugins || []),
          StrapiMediaLib,
          StrapiUploadAdapter
        ],

        toolbar: [
          'undo','redo','|','heading',
          '|','bold','italic','link',
          '|','bulletedList','numberedList','outdent','indent',
          '|','blockQuote','insertTable','imageUpload','strapiMediaLib',
          '|','htmlEmbed','sourceEditing','fontFamily','|','style'
        ],

        // Stock heading models only. Your special look goes in the Style dropdown below.
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
          ]
        },

        // Style plugin: add a button that applies your site class
        // Requires the `Style` plugin to be present in the build used by the @_sh preset.
        style: {
          definitions: [
            {
              name: 'Marketing Guide Header',
              element: 'p',
              classes: [ 'marketing-guide-header' ]
            }
          ]
        },

        // Fonts
        fontFamily: {
          options: ['Acumin Pro, sans-serif'],
          supportAllValues: false
        },

        // Links: default to same-page. No auto “target=_blank”.
        link: {
          addTargetToExternalLinks: false,
          decorators: {
            // You can still choose to open in a new tab manually.
            openInNewTab: {
              mode: 'manual',
              label: 'Open in new tab',
              attributes: {
                target: '_blank',
                rel: 'noopener noreferrer'
              }
            }
          }
        },

        // Keep HTML intact, whitelist your common elements and classes
        htmlSupport: {
          allow: [
            { name: /.*/, attributes: true, classes: true, styles: true },
            { name: /(p|h[1-6]|ul|ol|li|a|blockquote|table|thead|tbody|tr|th|td|figure|figcaption|span|div|code|pre|hr)/, attributes: true, classes: true, styles: true },
            { name: 'p', classes: ['marketing-guide-header'] },
            { name: 'img', attributes: ['src','srcset','sizes','width','height','alt','loading','decoding','fetchpriority','class','style','data-*'] },
            { name: 'a',   attributes: ['href','target','rel','download','class','style','data-*'] },
            { name: 'iframe', attributes: ['src','allow','allowfullscreen','width','height','title','class','style'] }
          ],
          disallow: [
            { name: 'script', attributes: true, classes: true, styles: true },
            { name: /.*/, attributes: [/^on.*/i] } // nuke onclick/javascript URLs
          ]
        }
      }
    };

    // 3) Editor theme: normalize preview so bullets aren’t weird arrows, images are responsive, etc.
    const theme = {
      common: `
        @import url("/bp/css/strapi.css");

        :root { --ck-font-face: "Acumin Pro", sans-serif !important; }
        .ck-editor__main { --ck-font-face: "Acumin Pro", sans-serif !important; }

        .ck-editor__main .ck-content,
        .ck-editor__main .ck-content * { font-family: "Acumin Pro", sans-serif !important; }

        /* Lists render as actual bullets/numbers in the editor */
        .ck-editor__main .ck-content ul { list-style: disc; padding-left: 1.25rem; }
        .ck-editor__main .ck-content ol { list-style: decimal; padding-left: 1.25rem; }

        /* Tables with breathing room */
        .ck-editor__main .ck-content table { width: 100%; border-collapse: collapse; }
        .ck-editor__main .ck-content th,
        .ck-editor__main .ck-content td { border: 1px solid #e3e3e3; padding: 8px 10px; }

        /* Responsive images in preview */
        .ck-editor__main .ck-content img { max-width: 100%; height: auto; display: block; }
        .ck-editor__main .ck-content figure.image.image_resized img { width: 100% !important; height: auto !important; }
      `,
      additional: `
        .ck-editor__main .ck-content h1 { font-size: 32px !important; line-height: 1.25 !important; font-weight: 700 !important; margin: 0 0 .5em !important; }
        .ck-editor__main .ck-content h2 { font-size: 26px !important; line-height: 1.25 !important; font-weight: 700 !important; margin: 0 0 .5em !important; }
        .ck-editor__main .ck-content h3 { font-size: 20px !important; line-height: 1.25 !important; font-weight: 700 !important; margin: 0 0 .5em !important; }
      `
    };

    // 4) Let your site CSS be the source of truth. Don’t double-style via defaultHtmlPreset.
    defaultHtmlPreset.styles = ``;

    setPluginConfig({ presets: [preset], theme });
  },
  bootstrap() {},
  config: {}
};
