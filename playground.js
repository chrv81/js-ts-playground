'use strict';

// initialize
let editor, monacoEditor, eslintInstance;

// constants
const AUTO_RUN_TIME = 30000;
const INIT_JS_CODE = `// Start coding!\nconst greeting = (name) => console.log('Hello ' + name + '!');\ngreeting('World');`;
const INIT_TS_CODE = `// Start coding!\nconst greeting: (name: string) => void = (name) => console.log('Hello ' + name + '!');\ngreeting('World');`;

// local storage keys
const LOCAL_STORAGE_LANG = 'PLAYGROUND__lang';
const LOCAL_STORAGE_THEME = 'PLAYGROUND__theme';
const LOCAL_STORAGE_AUTO_SAVE = 'PLAYGROUND__auto_save';
const LOCAL_STORAGE_AUTO_RUN = 'PLAYGROUND__auto_run';
const LOCAL_STORAGE_SAVE_CODE = 'PLAYGROUND__save_code';

// functions to handle editor operations
const initCodeEditor = (language = 'javascript') => {
  switch (language) {
    case 'javascript':
      return INIT_JS_CODE;
    case 'typescript':
      return INIT_TS_CODE;
    default: // if no language is specified, default to JavaScript
      return INIT_JS_CODE;
  }
};

// Monaco Editor configuration
const defaultSetting = {
  code: initCodeEditor(),
  language: 'javascript',
  theme: 'vs-dark',
  autoSave: true,
  autoRun: false,
};

let settings = { ...defaultSetting };

/**
 * Load settings from localStorage
 * If settings are not found, use default settings
 */
const loadSettings = () => {
  settings.language =
    localStorage.getItem(LOCAL_STORAGE_LANG) || defaultSetting.language;
  settings.theme =
    localStorage.getItem(LOCAL_STORAGE_THEME) || defaultSetting.theme;
  settings.autoSave =
    localStorage.getItem(LOCAL_STORAGE_AUTO_SAVE) || defaultSetting.autoSave;
  settings.autoRun =
    localStorage.getItem(LOCAL_STORAGE_AUTO_RUN) || defaultSetting.autoRun;
  settings.code =
    localStorage.getItem(LOCAL_STORAGE_SAVE_CODE) || defaultSetting.code;
};

/**
 * Save settings to localStorage
 */
const saveSettings = () => {
  localStorage.setItem(LOCAL_STORAGE_LANG, settings.language);
  localStorage.setItem(LOCAL_STORAGE_THEME, settings.theme);
  localStorage.setItem(LOCAL_STORAGE_AUTO_SAVE, settings.autoSave);
  localStorage.setItem(LOCAL_STORAGE_AUTO_RUN, settings.autoRun);
  localStorage.setItem(LOCAL_STORAGE_SAVE_CODE, settings.code);
};

/**
 * Watching for changes in settings or editor events
 */
const watchSetting = () => {
  document
    .getElementById('language-selector')
    .addEventListener('change', (e) => {
      alert('Language changed to: ' + e.target.value);
      settings.language = e.target.value;
      monacoEditor.editor.setModelLanguage(
        editor.getModel(),
        settings.language
      );
      saveSettings();
    });
};

window.require.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs',
  },
});

window.require(['vs/editor/editor.main'], async (monaco) => {
  monacoEditor = monaco;

  editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: defaultMonacoConfig.code,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: {
      enabled: true,
    },
    tabSize: 2,
    insertSpaces: true,
    autoIndent: 'advanced',
  });
});

// Run Code
const runCode = () => {
  alert('Run Code function called');
};

// Download code
const downloadCode = () => {
  alert('Download Code function called');
};
