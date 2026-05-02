# Google Snake Local

This project runs the actual local Google Snake files inside a simple desktop-style shell.

## Start

Run `start-google-snake.bat`.

That starts the local server and opens:

`http://127.0.0.1:8787`

Do not open `index.html` directly from the filesystem.
Do not use GitHub Pages for this build.
The game relies on local root-style paths, so direct file opens and subpath hosting will break it.

## Features

- Actual local Google Snake game files
- Light, dark, and hybrid shell themes
- Bigger, smaller, reset size, and fullscreen controls
- Quick hide overlay for school or work
- Clean local asset routing through `server.js`

## Project Layout

- `index.html` - shell UI
- `google-snake-local.html` - local Google Snake page
- `assets/css/styles.css` - shell styling
- `assets/js/app.js` - shell controls
- `assets/vendor/` - local patched loader files
- `vendor/google/` - local Google assets and game resources
- `server.js` - local static server and path routing
