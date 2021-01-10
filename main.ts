import { App, Workspace, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

export default class AdvancedAppearance extends Plugin {
  settings: AdvancedAppearanceSettings;

  async onload() {

    await this.loadSettings();

    this.addSettingTab(new AdvancedAppearanceSettingTab(this.app, this));

    this.addStyle();

    // Watch for system changes to color theme 

    let media = window.matchMedia('(prefers-color-scheme: dark)');

    let callback = () => {
      if (media.matches) {
        console.log('Dark mode active');
        this.updateDarkStyle()
      } else {
        console.log('Light mode active');
        this.updateLightStyle()
      }
    }

    media.addEventListener('change', callback);

    // Remove listener when we unload

    this.register(() => media.removeEventListener('change', callback));

    const lightStyles = ['advanced-light', 'advanced-light-tonal', 'advanced-light-contrast', 'advanced-light-white'];
    const darkStyles = ['advanced-dark', 'advanced-dark-tonal', 'advanced-dark-black'];
    const theme = ['theme-light', 'theme-dark'];

    this.addCommand({
        id: 'toggle-advanced-dark-cycle',
        name: 'Cycle between dark mode styles',
        callback: () => {
          this.settings.darkStyle = darkStyles[(darkStyles.indexOf(this.settings.darkStyle) + 1) % darkStyles.length];
          this.saveData(this.settings);
          this.updateDarkStyle();
        }
      });  

    this.addCommand({
        id: 'toggle-advanced-light-cycle',
        name: 'Cycle between light mode styles',
        callback: () => {
          this.settings.lightStyle = lightStyles[(lightStyles.indexOf(this.settings.lightStyle) + 1) % lightStyles.length];
          this.saveData(this.settings);
          this.updateLightStyle();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-switch',
        name: 'Switch between light and dark mode',
        callback: () => {
          this.settings.theme = theme[(theme.indexOf(this.settings.theme) + 1) % theme.length];
          this.saveData(this.settings);
          this.updateTheme();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-light-default',
        name: 'Use light mode (default)',
        callback: () => {
          this.settings.lightStyle = 'advanced-light';
          this.saveData(this.settings);
          this.updateLightStyle();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-light-white',
        name: 'Use light mode (white)',
        callback: () => {
          this.settings.lightStyle = 'advanced-light-white';
          this.saveData(this.settings);
          this.updateLightStyle();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-light-tonal',
        name: 'Use light mode (low contrast)',
        callback: () => {
          this.settings.lightStyle = 'advanced-light-tonal';
          this.saveData(this.settings);
          this.updateLightStyle();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-light-contrast',
        name: 'Use light mode (high contrast)',
        callback: () => {
          this.settings.lightStyle = 'advanced-light-contrast';
          this.saveData(this.settings);
          this.updateLightStyle();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-dark-default',
        name: 'Use dark mode (default)',
        callback: () => {
          this.settings.darkStyle = 'advanced-dark';
          this.saveData(this.settings);
          this.updateDarkStyle();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-dark-tonal',
        name: 'Use dark mode (low contrast)',
        callback: () => {
          this.settings.darkStyle = 'advanced-dark-tonal';
          this.saveData(this.settings);
          this.updateDarkStyle();
        }
      });

    this.addCommand({
        id: 'toggle-advanced-dark-black',
        name: 'Use dark mode (black)',
        callback: () => {
          this.settings.darkStyle = 'advanced-dark-black';
          this.saveData(this.settings);
          this.updateDarkStyle();
        }
      });

    this.refresh()

    if (this.settings.useSystemTheme) {
      this.enableSystemTheme();
    }

  }

  onunload() {
    console.log('Unloading Advanced Appearance plugin');
  }

  async loadSettings() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // refresh function for when we change settings
  refresh() {
    // re-load the style
    this.updateStyle()
  }

  // add the styling elements we need
  addStyle() {
    // add a css block for our settings-dependent styles
    const css = document.createElement('style');
    css.id = 'advanced-appearance';
    document.getElementsByTagName("head")[0].appendChild(css);

    // add the main class
    document.body.classList.add('advanced-appearance');

    // update the style with the settings-dependent styles
    this.updateStyle();
  }

  // update the styles (at the start, or as the result of a settings change)
  updateStyle() {
    this.removeStyle();
    document.body.classList.toggle('fancy-cursor', this.settings.fancyCursor);
    document.body.classList.toggle('links-int-on', this.settings.underlineInternal);
    document.body.classList.toggle('links-ext-on', this.settings.underlineExternal);
    document.body.classList.toggle('system-shade', this.settings.useSystemTheme);
    document.body.classList.toggle('full-file-names', !this.settings.trimNames);
    document.body.classList.toggle('rel-lines-edit', this.settings.relationLinesEdit);
    document.body.classList.toggle('rel-lines-preview', this.settings.relationLinesPreview);

    // get the custom css element
    const el = document.getElementById('advanced-appearance');
    if (!el) throw "advanced-appearance element not found!";
    else {
      // set the settings-dependent css
      el.innerText = `
        body{
          --font-size-primary:${this.settings.textNormal}px;
          --font-size-secondary:${this.settings.textSmall}px;
          --line-width:${this.settings.lineWidth}rem;
          --font-monospace:${this.settings.monoFont};
          --font-ui:${this.settings.uiFont};
          --font-preview:${this.settings.textFont};
          --font-editor:${this.settings.editorFont};
          --base-h:${this.settings.bgHue};
          --base-s:${this.settings.bgSat}%;
          --base-l:${this.settings.bgLight}%;
          --accent-h:${this.settings.accentHue};
          --accent-s:${this.settings.accentSat}%;
          --accent-d:calc(${this.settings.accentLight}% + 10%);
          --accent-l:${this.settings.accentLight}%;}
      `;
    }
  }

  enableSystemTheme() {
    (this.app.workspace as any).layoutReady ? this.refreshSystemTheme() : this.app.workspace.on('layout-ready', this.refreshSystemTheme);
  }

  refreshSystemTheme() {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

    if (isDarkMode && this.settings.useSystemTheme) {
        console.log('Dark mode active');
        this.updateDarkStyle()
      } else if (this.settings.useSystemTheme) {
        console.log('Light mode active');
        this.updateLightStyle()
      }
  }

  updateDarkStyle() {
    document.body.removeClass('theme-light','advanced-dark','advanced-dark-tonal','advanced-dark-black');
    document.body.addClass('theme-dark',this.settings.darkStyle);
    this.app.workspace.trigger('css-change');
  }

  updateLightStyle() {
    document.body.removeClass('theme-dark','advanced-light','advanced-light-tonal','advanced-light-contrast','advanced-light-white');
    document.body.addClass('theme-light',this.settings.lightStyle);
    this.app.workspace.trigger('css-change');
  }

  updateTheme() {
    document.body.removeClass('theme-dark','theme-light');
    document.body.addClass(this.settings.theme);
    this.app.workspace.trigger('css-change');
  }

  removeStyle() {
    document.body.removeClass('advanced-light','advanced-light-tonal','advanced-light-contrast','advanced-light-white','advanced-dark','advanced-dark-tonal','advanced-dark-black');
    document.body.addClass(this.settings.lightStyle,this.settings.darkStyle);
  }

}

interface AdvancedAppearanceSettings {
  theme: string;
  accentHue: number;
  accentSat: number;
  accentLight: number;
  bgHue: number;
  bgSat: number;
  bgLight: number;
  lightStyle: string;
  darkStyle: string;
  uiFont: string;
  textFont: string;
  editorFont: string;
  monoFont: string;
  fancyCursor: boolean;
  trimNames: boolean;
  lineWidth: number;
  textNormal: number;
  textSmall: number;
  underlineInternal: boolean;
  underlineExternal: boolean;
  useSystemTheme: boolean;
  relationLinesPreview: boolean;
  relationLinesEdit: boolean;
}

const DEFAULT_SETTINGS: AdvancedAppearanceSettings = {
  theme: 'theme-light',
  accentHue: 201,
  accentSat: 17,
  accentLight: 50,
  bgHue: 0,
  bgSat: 0,
  bgLight: 97,
  trimNames: false,
  lightStyle: 'advanced-light',
  darkStyle: 'advanced-dark',
  uiFont: '-apple-system,BlinkMacSystemFont,"Segoe UI Emoji","Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif',
  textFont: '-apple-system,BlinkMacSystemFont,"Segoe UI Emoji","Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif',
  editorFont: '-apple-system,BlinkMacSystemFont,"Segoe UI Emoji","Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif',
  monoFont: 'Menlo,SFMono-Regular,Consolas,Roboto Mono,monospace',
  fancyCursor: true,
  lineWidth: 40,
  textNormal: 16,
  textSmall: 13,
  underlineInternal: true,
  underlineExternal: true,
  useSystemTheme: false,
  relationLinesPreview: false,
  relationLinesEdit: false
}

class AdvancedAppearanceSettingTab extends PluginSettingTab {

  plugin: AdvancedAppearance;
  constructor(app: App, plugin: AdvancedAppearance) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let {containerEl} = this;

    containerEl.empty();
    containerEl.createEl('h3', {text: 'Advanced Appearance Settings'});
    containerEl.createEl('span', {text: '♥ Support development my plugins and themes '});
    containerEl.createEl('strong', {text: '@kepano'});
    containerEl.createEl('span', {text: ' on '});
    containerEl.createEl('a', {text: 'Patreon', href:"https://www.patreon.com/kepano"});
    containerEl.createEl('span', {text: ' and '});
    containerEl.createEl('a', {text: 'Twitter', href:"https://www.twitter.com/kepano"});

    let myEl = containerEl.createDiv('my-class');
    let myParagraph = myEl.createEl('p', 'my-child-class');

    containerEl.createEl('h3');
    containerEl.createEl('br');
    containerEl.createEl('h3', {text: 'Theme variations'});

      new Setting(containerEl)
        .setName('Light mode style')
        .setDesc('Background colors in light mode, can be toggled via hotkey')
        .addDropdown(dropdown => dropdown
          .addOption('advanced-light','Default')
          .addOption('advanced-light-white','White')
          .addOption('advanced-light-tonal','Low contrast')
          .addOption('advanced-light-contrast','High contrast')
          .setValue(this.plugin.settings.lightStyle)
        .onChange((value) => {
          this.plugin.settings.lightStyle = value;
          this.plugin.saveData(this.plugin.settings);
          this.plugin.removeStyle();
        }));

      new Setting(containerEl)
        .setName('Dark mode style')
        .setDesc('Background colors in dark mode, can be toggled via hotkey')
        .addDropdown(dropdown => dropdown
          .addOption('advanced-dark','Default')
          .addOption('advanced-dark-tonal','Low contrast')
          .addOption('advanced-dark-black','Black')
          .setValue(this.plugin.settings.darkStyle)
          .onChange((value) => {
            this.plugin.settings.darkStyle = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.removeStyle();
          }));

    new Setting(containerEl)
      .setName('Use system setting for light or dark mode')
      .setDesc('Automatically switch based on your operating system settings')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.useSystemTheme)
          .onChange((value) => {
            this.plugin.settings.useSystemTheme = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refreshSystemTheme();
            })
          );

    containerEl.createEl('br');
    containerEl.createEl('h3', {text: 'Accent color'});

      new Setting(containerEl)
        .setName('Accent color hue')
        .addSlider(slider => slider
            .setLimits(0, 360, 1)
            .setValue(this.plugin.settings.accentHue)
          .onChange((value) => {
            this.plugin.settings.accentHue = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

      new Setting(containerEl)
        .setName('Accent color saturation')
        .addSlider(slider => slider
            .setLimits(0, 100, 1)
            .setValue(this.plugin.settings.accentSat)
          .onChange((value) => {
            this.plugin.settings.accentSat = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

      new Setting(containerEl)
        .setName('Accent color darkness')
        .addSlider(slider => slider
            .setLimits(40, 70, 1)
            .setValue(this.plugin.settings.accentLight)
          .onChange((value) => {
            this.plugin.settings.accentLight = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

    containerEl.createEl('br');
    containerEl.createEl('h3', {text: 'Base color'});

      new Setting(containerEl)
        .setName('Base color hue')
        .addSlider(slider => slider
            .setLimits(0, 360, 1)
            .setValue(this.plugin.settings.bgHue)
          .onChange((value) => {
            this.plugin.settings.bgHue = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

      new Setting(containerEl)
        .setName('Base color saturation')
        .addSlider(slider => slider
            .setLimits(0, 100, 1)
            .setValue(this.plugin.settings.bgSat)
          .onChange((value) => {
            this.plugin.settings.bgSat = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

      new Setting(containerEl)
        .setName('Base color darkness')
        .addSlider(slider => slider
            .setLimits(2, 40, 1)
            .setValue(100 - this.plugin.settings.bgLight)
          .onChange((value) => {
            this.plugin.settings.bgLight = 100 - value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

    containerEl.createEl('br');
    containerEl.createEl('h3', {text: 'Appearance'});

    new Setting(containerEl)
      .setName('Fancy cursor')
      .setDesc('The editor cursor takes on your accent color')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.fancyCursor)
          .onChange((value) => {
            this.plugin.settings.fancyCursor = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
            })
          );

    new Setting(containerEl)
      .setName('Trim file names in sidebars')
      .setDesc('Use ellipses to fits file names on a single line')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.trimNames)
          .onChange((value) => {
            this.plugin.settings.trimNames = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

    new Setting(containerEl)
      .setName('Relationship lines in preview')
      .setDesc('Show vertical lines that connect related bullet points and task lists')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.relationLinesPreview)
          .onChange((value) => {
            this.plugin.settings.relationLinesPreview = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

    new Setting(containerEl)
      .setName('Relationship lines in edit mode')
      .setDesc('Show vertical lines that connect related bullet points and task lists')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.relationLinesEdit)
          .onChange((value) => {
            this.plugin.settings.relationLinesEdit = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
          }));

    containerEl.createEl('br');
    containerEl.createEl('h3', {text: 'Typography'});

    new Setting(containerEl)
      .setName('Underline internal links')
      .setDesc('Show underlines on internal links')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.underlineInternal)
          .onChange((value) => {
            this.plugin.settings.underlineInternal = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
            })
          );

    new Setting(containerEl)
      .setName('Underline external links')
      .setDesc('Show underlines on external links')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.underlineExternal)
          .onChange((value) => {
            this.plugin.settings.underlineExternal = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refresh();
            })
          );

    new Setting(containerEl)
      .setName('Line width')
      .setDesc('The maximum number of characters per line (default 40)')
      .addText(text => text.setPlaceholder('40')
        .setValue((this.plugin.settings.lineWidth || '') + '')
        .onChange((value) => {
          this.plugin.settings.lineWidth = parseInt(value.trim());
          this.plugin.saveData(this.plugin.settings);
          this.plugin.refresh();
        }));

    new Setting(containerEl)
      .setName('Body font size')
      .setDesc('Used for the main text (default 16)')
      .addText(text => text.setPlaceholder('16')
        .setValue((this.plugin.settings.textNormal || '') + '')
        .onChange((value) => {
          this.plugin.settings.textNormal = parseInt(value.trim());
          this.plugin.saveData(this.plugin.settings);
          this.plugin.refresh();
        }));

    new Setting(containerEl)
      .setName('Sidebar font size')
      .setDesc('Used for text in the sidebars (default 13)')
      .addText(text => text.setPlaceholder('13')
        .setValue((this.plugin.settings.textSmall || '') + '')
        .onChange((value) => {
          this.plugin.settings.textSmall = parseInt(value.trim());
          this.plugin.saveData(this.plugin.settings);
          this.plugin.refresh();
        }));

    containerEl.createEl('br');
    containerEl.createEl('h3', {text: 'Fonts'});

      new Setting(containerEl)
        .setName('Text font')
        .setDesc('Used in preview mode — the font must also be installed on your computer')
        .addDropdown(dropdown => dropdown
          .addOption('-apple-system,BlinkMacSystemFont,"Segoe UI Emoji","Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif','System font')
          .addOption('Inter','Inter')
          .addOption('iA Writer Mono S','iA Mono')
          .addOption('iA Writer Duo S','iA Duo')
          .addOption('iA Writer Quattro S','iA Quattro')
          .addOption('SFMono-Regular','SF Mono')
          .addOption('Consolas','Consolas')
          .addOption('Roboto Mono','Roboto Mono')
          .setValue(this.plugin.settings.textFont)
            .onChange((value) => {
              this.plugin.settings.textFont = value;
              this.plugin.saveData(this.plugin.settings);
              this.plugin.refresh();
            })
          );

      new Setting(containerEl)
        .setName('UI font')
        .setDesc('Used for UI elements')
        .addDropdown(dropdown => dropdown
          .addOption('-apple-system,BlinkMacSystemFont,"Segoe UI Emoji","Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif','System font')
          .addOption('Inter','Inter')
          .addOption('iA Writer Mono S','iA Mono')
          .addOption('iA Writer Duo S','iA Duo')
          .addOption('iA Writer Quattro S','iA Quattro')
          .addOption('SFMono-Regular','SF Mono')
          .addOption('Consolas','Consolas')
          .addOption('Roboto Mono','Roboto Mono')
          .setValue(this.plugin.settings.uiFont)
            .onChange((value) => {
              this.plugin.settings.uiFont = value;
              this.plugin.saveData(this.plugin.settings);
              this.plugin.refresh();
            })
          );

      new Setting(containerEl)
        .setName('Editor font')
        .setDesc('Used in edit mode')
        .addDropdown(dropdown => dropdown
          .addOption('-apple-system,BlinkMacSystemFont,"Segoe UI Emoji","Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,sans-serif','System font')
          .addOption('Inter','Inter')
          .addOption('iA Writer Mono S','iA Mono')
          .addOption('iA Writer Duo S','iA Duo')
          .addOption('iA Writer Quattro S','iA Quattro')
          .addOption('SFMono-Regular','SF Mono')
          .addOption('Consolas','Consolas')
          .addOption('Roboto Mono','Roboto Mono')
          .setValue(this.plugin.settings.editorFont)
            .onChange((value) => {
              this.plugin.settings.editorFont = value;
              this.plugin.saveData(this.plugin.settings);
              this.plugin.refresh();
            })
          );

      new Setting(containerEl)
        .setName('Monospace font')
        .setDesc('Used for code blocks, front matter, etc')
        .addDropdown(dropdown => dropdown
          .addOption('Menlo,SFMono-Regular,Consolas,Roboto Mono,monospace','System font')
          .addOption('iA Writer Mono S','iA Mono')
          .addOption('iA Writer Duo S','iA Duo')
          .addOption('iA Writer Quattro S','iA Quattro')
          .addOption('SFMono-Regular','SF Mono')
          .addOption('Consolas','Consolas')
          .addOption('Roboto Mono','Roboto Mono')
          .setValue(this.plugin.settings.monoFont)
            .onChange((value) => {
              this.plugin.settings.monoFont = value;
              this.plugin.saveData(this.plugin.settings);
              this.plugin.refresh();
            })
          );

    containerEl.createEl('br');
    containerEl.createEl('h3', {text: 'Custom fonts'});
    containerEl.createEl('p', {text: 'These settings override the dropdowns above. Make sure to use the exact name of the font as it appears on your system.'});

    new Setting(containerEl)
      .setName('Custom text font')
      .setDesc('Used in preview mode')
      .addText(text => text.setPlaceholder('')
        .setValue((this.plugin.settings.textFont || '') + '')
        .onChange((value) => {
          this.plugin.settings.textFont = value;
          this.plugin.saveData(this.plugin.settings);
          this.plugin.refresh();
        }));

    new Setting(containerEl)
      .setName('Custom UI font')
      .setDesc('Used for UI elements')
      .addText(text => text.setPlaceholder('')
        .setValue((this.plugin.settings.uiFont || '') + '')
        .onChange((value) => {
          this.plugin.settings.uiFont = value;
          this.plugin.saveData(this.plugin.settings);
          this.plugin.refresh();
        }));

    new Setting(containerEl)
      .setName('Custom editor font')
      .setDesc('Used in edit mode')
      .addText(text => text.setPlaceholder('')
        .setValue((this.plugin.settings.editorFont || '') + '')
        .onChange((value) => {
          this.plugin.settings.editorFont = value;
          this.plugin.saveData(this.plugin.settings);
          this.plugin.refresh();
        }));

    new Setting(containerEl)
      .setName('Custom monospace font')
      .setDesc('Used for code blocks, front matter, etc')
      .addText(text => text.setPlaceholder('')
        .setValue((this.plugin.settings.monoFont || '') + '')
        .onChange((value) => {
          this.plugin.settings.monoFont = value;
          this.plugin.saveData(this.plugin.settings);
          this.plugin.refresh();
        }));

  }
}
