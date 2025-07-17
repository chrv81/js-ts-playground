'use strict';

// initialize
let editor, monacoLibrary, eslintInstance;

// constants
const AUTO_RUN_TIME = 30000;
const INIT_JS_CODE = `// Start coding!\nconst greeting = (name) => console.log('Hello ' + name + '!');\ngreeting('World');`;
const INIT_TS_CODE = `// Start coding!\nconst greeting: (name: string) => void = (name) => console.log('Hello ' + name + '!');\ngreeting('World');`;

// local storage keys
const LOCAL_STORAGE_SAVED_CODE = 'PLAYGROUND__save_code';
const LOCAL_STORAGE_SETTINGS = 'PLAYGROUND__settings';

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
  autoSave: false,
  autoRun: false,
};

let settings = { ...defaultSetting };

// utilities
const getEl = (id) => document.getElementById(id);
let outputEl;

/**
 * Load settings from localStorage
 * If settings are not found, use default settings
 */
const loadSettings = () => {
  const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SETTINGS));
  if (stored) settings = { ...settings, ...stored };
};

/**
 * Save settings to localStorage
 */
const saveSettings = () => {
  localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(settings));
};

// Initialize Monaco
window.require.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs',
  },
});

window.require(['vs/editor/editor.main'], async (monaco) => {
  monacoLibrary = monaco;
  loadSettings();

  outputEl = getEl('output-container');

  editor = monaco.editor.create(getEl('editor-container'), {
    value: settings.saveCode ? localStorage.getItem(LS_KEY) : settings.code,
    language: settings.language,
    theme: settings.theme,
    automaticLayout: true,
    fontSize: 14,
    minimap: {
      enabled: false,
    },
    tabSize: 2,
    insertSpaces: true,
    autoIndent: 'advanced',
  });
});

/**
 * Watching for changes in settings or editor events
 */
window.addEventListener('change', (e) => {
  const target = e.target;
  if (target.id === 'language-selector') {
    settings.language = target.value;
  }
});

// Run Code
const runCode = async () => {
  // alert('Run Code function called');
  outputEl.innerHTML = '';
  try {
    const code = editor.getValue();

    executeCode(code);
  } catch (error) {
    outputEl.textContent += 'Error: ' + error.message + '\n';
  }
};

// Execute Code
const executeCode = (code) => {
  // Save original console.log
  const originalLog = console.log;
  let output = '';
  console.log = function (...args) {
    output += args.join(' ') + '\n';
  };

  try {
    eval(code);
    outputEl.textContent = output;
  } catch (err) {
    outputEl.textContent = 'Error: ' + err.message;
  }

  // Restore original console.log
  console.log = originalLog;
};

// Download code
const downloadCode = () => {
  alert('Download Code function called');
};
