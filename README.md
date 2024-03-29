**Jan 22, 2022** — This plugin is being retired as there are now better options available out there for customization. My focus will remain on [Minimal Theme](https://github.com/kepano/obsidian-minimal), and [Minimal Theme Settings plugin](https://github.com/kepano/obsidian-minimal-settings). When I created Advanced Appearance in January 2021, the landscape of Obsidian themes was much less advanced than it is today. The good news is that we now have so many great themes to choose from, many of which support the Style Settings plugin for much deeper customization. Thank you! ❤️ [@kepano](https://twitter.com/kepano)

---

## Features

Advanced Appearance enables you to customize various aspects of Obsidian:

- Colors
- Typography
  - Custom fonts
  - Underlining links
  - Line width
  - Font sizes
- Extra details
  - Relationship lines
  - Trimming long file names
- Automatically switch to dark mode based on OS preference

Advanced Appearance works hand-in-hand with [Hider Plugin](https://github.com/kepano/obsidian-hider) which allows you to remove elements of the Obsidian UI such as the menu ribbon, tooltips, title bar, scrollbars, etc.

### Compatible themes

- Obsidian default theme by Obsidian team
- Minimal theme by @kepano

## Developer documentation

You can access the user's settings via the following CSS variables and classes.

### CSS variables

The following CSS variables are defined on the `body` tag from the user's input:

| Variable | Description |
| ------ | ----- |
| `--accent-h` | Accent color hue, in `deg` |
| `--accent-s` | Accent color saturation, in `%` |
| `--accent-l` | Accent color lightness, in `%` |
| `--accent-d` | Accent color lightness in Dark mode, in `%` |
| `--base-h` | Base color hue, in `deg` |
| `--base-s` | Base color saturation, in `%` |
| `--base-l` | Base color lightness, in `%` |
| `--base-d` | Base color lightness in Dark mode, in `%` |
| `--font-preview` | Font used in Preview mode |
| `--font-editor` | Font used in Edit mode |
| `--font-monospace` | Font used for monospace text |
| `--font-ui` | Font used for UI elements |
| `--font-size-primary` | Font size for body |
| `--font-size-secondary` | Font size for sidebars |
| `--line-width` | Number of characters per line  |
| `--max-width` | Maximum width per line |

### CSS classes for toggles

The following classes are applied to the `body` tag when the user turns on a feature:

| Class | Description |
| ------ | ----- |
| `.advanced-appearance` | Advanced Appearance plugin is on |
| `.fancy-cursor` | Fancy cursor is on |
| `.links-int-on` | Underline internal links is on |
| `.links-ext-on` | Underline external links is on |
| `.full-file-names` | Show full file names is on |
| `.rel-lines-edit` | Relationship lines in Edit mode is on |
| `.rel-lines-preview` | Relationship lines in Preview mode is on |
| `.system-shade` | System-level dark mode is on |

### CSS classes for theme variants

The following classes are applied to the `body` tag based on the selected theme variant:

| Class | Description |
| ------ | ----- |
| `.advanced-light` | Light theme: Default |
| `.advanced-light-tonal` | Light theme: Low contrast |
| `.advanced-light-contrast` | Light theme: High contrast |
| `.advanced-light-white` | Light theme: White |
| `.advanced-dark` | Dark theme: Default |
| `.advanced-dark-tonal` | Dark theme: Low contrast |
| `.advanced-dark-black` | Dark theme: Black |

---

## Overriding Advanced Appearance styles

Advanced Appearance styles are loosely scoped, making it possible for you to override them by  scoping your overrides to `html body`, e.g. `html body.theme-light`.

### Modifying color variables

Advanced Appearance allows users to set an accent color and a base color, using HSL sliders. These HSL values are then mapped to Obsidian's default CSS color variables. HSL is used because the values can be easily modified using `calc()` to generate variations of that color. 

You can use these variables to compute shades using `calc()` in your CSS, for example, the code below generates a color that is 10% darker than the base color:

```
--background-secondary:hsl(var(--base-h),var(--base-s),calc(var(--base-l) - 10%));
```

You can use this approach to modify the hue and saturation as well.

### Theme variants

Advanced Appearance allows users to choose theme variants for both light and dark modes. This allows you create additional styles for accessibility or cosmetic differences. 

You can support these by overriding the defaults using the following scope:

```
body.theme-dark.advanced-dark-black
```

Make sure to scope your changes to `body` and `.theme-light` or `.theme-dark`.
