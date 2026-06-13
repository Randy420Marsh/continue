# Building the VS Code Extension

## Prerequisites

Node.js 20.20.1 (LTS) or higher. If you use nvm:

```bash
nvm use
```

## Dev build

Compiles `src/extension.ts` → `out/extension.js`. Fast, no `.vsix` produced.

```bash
cd extensions/vscode
npm run esbuild
```

Expected output:

```
VS Code Extension esbuild complete
```

## Full package build

Runs prepackage (copies GUI assets, native binaries, sqlite, LanceDB) then calls `vsce package` to produce a `.vsix`.

```bash
cd extensions/vscode
npm run package
```

Expected output:

```
vsce package completed - extension created at extensions/vscode/build/continue-{VERSION}.vsix
```

The `.vsix` is written to `extensions/vscode/build/continue-{VERSION}.vsix`, where `{VERSION}` is the value of `version` in `extensions/vscode/package.json`.

### Prerequisites for the full build

The GUI must be built before packaging:

```bash
cd gui
npm install
npm run build
```

If native modules (onnxruntime, sqlite3, LanceDB) are not already present in `node_modules`, the prepackage script downloads and installs them automatically on first run.

## Bumping the version

Edit `version` in `extensions/vscode/package.json`, then run the full package build. The output `.vsix` filename will reflect the new version.

## Installing the built extension

In VS Code: right-click `extensions/vscode/build/continue-{VERSION}.vsix` → **Install Extension VSIX**.

Or from the command line:

```bash
code --install-extension extensions/vscode/build/continue-{VERSION}.vsix
```
