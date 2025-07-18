'use strict';

// initialize
let editor, monacoLibrary, eslintInstance;

// constants
const AUTO_RUN_TIME = 30000;
const AUTO_SAVE_INTERVAL_MS = 1500;
const INIT_JS_CODE = `// Start coding!\nconst greeting = (name) => console.log('Hello ' + name + '!');\ngreeting('World');`;
const INIT_TS_CODE = `// Start coding!\nconst greeting: (name: string) => void = (name) => console.log('Hello ' + name + '!');\ngreeting('World');`;

// local storage keys
const LOCAL_STORAGE_SETTINGS = 'PLAYGROUND__settings';

// cookie
const PLAGROROUND_DEV = 'PLAYGROUND__dev_debug';
const isDevDebug = document.cookie.includes(`${PLAGROROUND_DEV}=true`);

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
  if (stored) {
    settings = { ...settings, ...stored };

    // Update language selector
    const langSelector = getEl('language-selector');
    if (langSelector && stored.language) {
      langSelector.value = stored.language;
    }

    // Update theme toggle
    const themeToggle = getEl('theme-toggle');
    if (themeToggle && typeof stored.theme === 'string') {
      // If theme is 'vs' (light), checked = true; if 'vs-dark', checked = false
      themeToggle.checked = stored.theme === 'vs';
    }

    // Update autoSave checkbox
    const saveCodeCheckbox = getEl('save-code');
    if (saveCodeCheckbox && typeof stored.autoSave === 'boolean') {
      saveCodeCheckbox.checked = stored.autoSave;
    }

    // Update autoRun checkbox
    const autoRunCheckbox = getEl('auto-run');
    if (autoRunCheckbox && typeof stored.autoRun === 'boolean') {
      autoRunCheckbox.checked = stored.autoRun;
    }
  }
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

  // Parse localStorage once and reuse
  const storedSettings = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_SETTINGS)
  );
  loadSettings();

  outputEl = getEl('output-container');

  editor = monaco.editor.create(getEl('editor-container'), {
    value:
      settings.autoSave && storedSettings?.code
        ? storedSettings?.code
        : settings.code,
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
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    parameterHints: { enabled: true },
    folding: true,
    foldingStrategy: 'auto',
    bracketPairColorization: { enabled: true },
    find: {
      addExtraSpaceOnTop: true,
      seedSearchStringFromSelection: true,
    },
    hover: { enabled: true },
    contextmenu: true,
  });

  // Auto-save code every 1.5 seconds if saveCode is enabled
  setInterval(() => {
    if (settings.autoSave) {
      settings.code = editor.getValue();
      saveSettings();
    }
  }, AUTO_SAVE_INTERVAL_MS);
});

/**
 * Watching for changes in settings or editor events
 */
window.addEventListener('change', (e) => {
  const target = e.target;
  if (target.id === 'language-selector') {
    settings.language = target.value;
    monacoLibrary.editor.setModelLanguage(editor.getModel(), target.value);

    // Only save settings if autoRun is enabled
    settings.autoSave && saveSettings();

    // Show popup debug for dev
    isDevDebug &&
      showSettingsPopup(
        `Language changed to <b>${
          target.value
        }</b><br><br>Settings: <pre>${JSON.stringify(settings, null, 2)}</pre>`
      );
  }

  if (target.id === 'save-code') {
    settings.autoSave = target.checked;
    saveSettings();

    // Show popup debug for dev
    isDevDebug &&
      showSettingsPopup(
        `Auto Save is now <b>${settings.autoSave ? 'enabled' : 'disabled'}</b>`
      );
  }

  if (target.id === 'auto-run') {
    settings.autoRun = target.checked;
    saveSettings();

    // Show popup debug for dev
    isDevDebug &&
      showSettingsPopup(
        `Auto Run is now <b>${settings.autoRun ? 'enabled' : 'disabled'}</b>`
      );
  }

  if (target.id === 'theme-toggle') {
    const themeValue = target.checked ? 'vs' : 'vs-dark';
    settings.theme = themeValue;
    monacoLibrary.editor.setTheme(themeValue);
    saveSettings();

    // Show popup debug for dev
    isDevDebug && showSettingsPopup(`Theme changed to <b>${themeValue}</b>`);

    applyThemeToContainers(target.checked);
  }
});

/**
 * Quick Pop-up for dev debug
 */
const MessageType = {
  SUCCESS: 'positive',
  INFO: 'blue',
  WARNING: 'negative',
  CAUTION: 'orange',
};

const IconMappingMessageType = {
  [MessageType.SUCCESS]: 'thumbs up outline icon',
  [MessageType.INFO]: 'info',
  [MessageType.WARNING]: 'exclamation triangle',
  [MessageType.CAUTION]: 'exclamation circle',
};

const showSettingsPopup = (
  message,
  sec = 5000,
  messageType = MessageType.INFO
) => {
  const popup = document.getElementById('settings-popup');

  // Remove previous type classes
  popup.classList.remove('positive', 'blue', 'negative', 'black', 'orange');
  // Add the new type class
  popup.classList.add(messageType);

  // Use the icon that matches the type, fallback to INFO icon if not found
  const iconClass = IconMappingMessageType[messageType];

  popup.innerHTML = `<i class="${iconClass} icon"></i> ${message}`;
  popup.style.display = 'block';

  setTimeout(() => {
    popup.style.display = 'none';
  }, sec);
};

/**
 * Change background color and text color
 */
const applyThemeToContainers = (isLight) => {
  const editorEl = getEl('editor-container');
  outputEl = getEl('output-container');

  if (isLight) {
    editorEl.classList.add('bg-light', 'text-dark');
    editorEl.classList.remove('bg-dark', 'text-light');
    outputEl.classList.add('bg-light', 'text-dark');
    outputEl.classList.remove('bg-dark', 'text-light');
  } else {
    editorEl.classList.add('bg-dark', 'text-light');
    editorEl.classList.remove('bg-light', 'text-dark');
    outputEl.classList.add('bg-dark', 'text-light');
    outputEl.classList.remove('bg-light', 'text-dark');
  }
};

/**
 * Run code is called when the "Run Code" button is clicked
 */
const runCode = async () => {
  // alert('Run Code function called');
  outputEl.innerHTML = '';
  try {
    outputEl.classList.remove('error-text');
    const code = editor.getValue();

    executeCode(code);
  } catch (error) {
    outputEl.textContent += '❗️ Error: ' + error.message + '\n';
    outputEl.classList.add('error-text');
  }
};

/**
 * Execute the code in the editor
 * This function captures console.log output and displays it in the output container
 */
const executeCode = async (code) => {
  // if programming language is not supported, show error
  if (!settings.language || !compilerLanguage[settings.language]) {
    outputEl.textContent = `❗️ Error: Unsupported language "${settings.language}"\n`;
    outputEl.classList.add('error-text');
    return;
  }

  // compile/transpile code if necessary
  const compiler = compilerLanguage[settings.language];
  if (compiler.compile) {
    await compiler.compile(code);
  } else {
    outputEl.textContent = `❗️ Error: No compile function defined for "${settings.language}"\n`;
    outputEl.classList.add('error-text');
  }
};

/**
 * Object mapping for each programming language
 * Each language has its way to compile/transpile code
 */
const compilerLanguage = {
  javascript: {
    compile: async (code) => {
      const originalLog = console.log;
      let output = '';
      console.log = function (...args) {
        output += args.join(' ') + '\n';
      };

      try {
        new Function(code)();
        outputEl.classList.remove('error-text');
        outputEl.textContent = output;
      } catch (error) {
        outputEl.textContent = '❗️ Error: ' + error.message + '\n';
        outputEl.classList.add('error-text');
      }

      console.log = originalLog;
    },
    extension: 'js',
  },
  typescript: {
    compile: async () => {
      outputEl.textContent =
        '❗️ Error: TypeScript execution is not supported yet.\n';
      outputEl.classList.add('error-text');
    },
    extension: 'ts',
  },
};

/**
 * Download code as a file
 * This function is called when the "Download Code" button is clicked
 */
const downloadCode = () => {
  showSettingsPopup(
    'Sorry, download feature is not implemented yet.',
    2500,
    MessageType.WARNING
  );
};
