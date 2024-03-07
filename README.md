# Memory Analyzer for Java
Visualize line-by-line memory allocations and object duplicates data provided by external [Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser).
![Memory Analyzer demo](readme/demo.gif)

## Requirements
Requires [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java) extension to run.

## How to install
### VSIX file
1. Go to releases and download latest VSIX file
2. Open Visual Studio Code
3. Go to Extensions view
4. Click **Views and More actions...**
5. Select **Install from VSIX...**

### Manual installation
1. clone this repository
2. `npm run install`

If you do not have [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java) installed, VSIX installation will prompt you to install required extension.

## Extension Settings
Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues
If you try to run **Load JSON file** without language support fully loaded, some files will be missing allocation data. 
