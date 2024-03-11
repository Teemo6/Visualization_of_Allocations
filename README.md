# Memory Analyzer for Java (Visual Studio Code extension)
Visualize object memory allocations and duplicates line-by-line.

**IMPORTANT:** In the current version, this tool provides **only the data visualization** of an [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser) and **does not analyze the application by itself**.

## Features
- Visualize data provided by an [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser).
- Highlight lines that allocated memory on the heap at runtime.
- Display how many objects and how much memory has each line allocated.
- Show table containing detailed information with interactive links.
- Trace duplicates to their sources.
- Customize highlight color settings.

![Memory Analyzer demo](https://gitlab.kiv.zcu.cz/lipka/visualisation-of-allocations/-/raw/main/readme/demo.gif?ref_type=heads)

## Requirements
Before using this extension, ensure that [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java) is also installed.

## How to install
1. Go to the [release folder](https://gitlab.kiv.zcu.cz/lipka/visualisation-of-allocations/-/tree/main/release?ref_type=heads) and download the VSIX (Visual Studio extension installer) file.
2. Open Visual Studio Code.
3. Click **Extensions**.
4. Click **Views and more actions...**
5. Select **Install from VSIX...**

<img src="https://gitlab.kiv.zcu.cz/lipka/visualisation-of-allocations/-/raw/main/readme/install.gif?ref_type=heads" width=50% height=50%>

**Note:** 
- After downloading the VSIX file, you can also install the extension from the terminal with the following command:

  ```
  code --install-extension path/to/extension.vsix
  ```

## How to use 
1. Create a JAR archive of your Java project and run it with an [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser), which will generate a `data.json` file.
2. Open your Java project in Visual Studio Code and wait for Java symbols to fully load (indicated by "Java: ready" in the bottom status bar).
3. Run command **Memory Analyzer: Load JSON file**.
4. To show currently selected line details, run **Memory Analyzer: Show line details**.
5. Clicking on the link of the details table will move the cursor to the position of that particular allocation.

**Tips:**
- Commands can be found in context menu of using `ctrl + shift + P`.
- This repository also contains [PluginDemo](https://gitlab.kiv.zcu.cz/lipka/visualisation-of-allocations/-/tree/main/PluginDemo?ref_type=heads) with gerenated `data.json` that you can use for small demonstration.
- You can create a run configuration similliar to `.vscode/launch.json` of [PluginDemo](https://gitlab.kiv.zcu.cz/lipka/visualisation-of-allocations/-/tree/main/PluginDemo?ref_type=heads) to easily generate a JSON file within Visual Studio Code (this will require more extensions for full Visual Studio Code Java IDE).

## Commands
- `Memory Analyzer: Load JSON file`: load the generated JSON file
- `Memory Analyzer: Toggle visualization`: toggle the visualization on/off
- `Memory Analyzer: Show line details`: show allocation and duplicate details for the currently selected line
  * this option is also available under mouse right-click context menu

**Tip:**
- It is recommended to map commands to key bindings for personal convenience, refer to the [official Visual Studio Code documentation](https://code.visualstudio.com/docs/getstarted/keybindings).

## Settings
### JSON load settings
- `java-memory-analyzer.json.defaultPath`: absolute path where the JSON is located. If not empty, this path will be always have priority over the popup window
- `java-memory-analyzer.json.askToSavePath`: turn off to stop asking if you want to set currently loaded path as default

**Tips:**
- It is recommended to keep these settings to their default values under User settings and change only Workspace settings, refer to the [official Visual Studio Code documentation](https://code.visualstudio.com/docs/getstarted/settings).
- If you are unable to load a proper JSON file and no popup appeared, check settings if there is a valid **Default path**.
- If you leave **Default path** empty and set **Ask to save path** to false, the analyzer will always ask for the location of the JSON file.

### Line details settings
- `java-memory-analyzer.details.goToLineImmediately`: turn off to stop showing a newly selected line details when the reference link is clicked

### Color settings
- `java-memory-analyzer.color.lineBackground`: background color of line allocation
- `java-memory-analyzer.color.lineText`: text color of line allocation
- `java-memory-analyzer.color.methodBackground`: background color of method allocation
- `java-memory-analyzer.color.methodText`: text color of method allocation
- `java-memory-analyzer.color.classBackground`: background color of class allocation
- `java-memory-analyzer.color.classText`: text color of class allocation
- `java-memory-analyzer.color.emptyBackground`: background color of no allocation (only for method/class)
- `java-memory-analyzer.color.emptyText`: text color of no allocation (only for method/class)

**Tip:** 
- All colors accept a string in the [CSS color format](https://www.w3schools.com/css/css_colors.asp).

## Known Issues and limitations
- The format of JSON file is same as an output of an [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser), no other format is supported.
- If you try to run **Load JSON file** without the language support fully loaded, some files will be missing allocation data.
- **Show line details** panel must be manually resized, as there is no way to change its width within Visual Studio Code API.
- No support for visualization of nested classes, nested methods and enumerations.