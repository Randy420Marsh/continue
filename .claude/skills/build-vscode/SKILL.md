---
name: build-vscode
description: Build the Continue VS Code extension. Use when asked to build, package, or produce a .vsix for the VS Code extension.
---

# Build VS Code Extension

## Dev build (fast, no .vsix)

```bash
cd extensions/vscode
npm run esbuild
```

Success indicator: `VS Code Extension esbuild complete`

Output: `extensions/vscode/out/extension.js`

## Full package build (produces .vsix)

```bash
cd extensions/vscode
npm run package
```

Success indicator: `vsce package completed - extension created at extensions/vscode/build/continue-{VERSION}.vsix`

Output: `extensions/vscode/build/continue-{VERSION}.vsix`

The version in the filename comes from `"version"` in `extensions/vscode/package.json`. If the user says the version should match, verify that field first.

### What prepackage does

`npm run package` runs `scripts/prepackage.js` first, which:

- Copies `gui/dist/` assets into `extensions/vscode/gui/`
- Copies onnxruntime, tree-sitter-wasm, sqlite3, and LanceDB binaries
- Copies node_modules entries (`@lancedb`, `@vscode/ripgrep`, `workerpool`) into `out/node_modules/`
- Validates all required files are present before calling `vsce package`

If the GUI has not been built yet (`gui/dist/assets/index.js` missing), build it first:

```bash
cd gui && npm install && npm run build
```

## Version mismatch

If `build/` contains a `.vsix` from an older version, it is stale — run `npm run package` to produce one matching the current `package.json` version.

## Installing the .vsix

```bash
code --install-extension extensions/vscode/build/continue-{VERSION}.vsix
```
