# Memory Analyzer for Java (Visual Studio Code extension)
Visualize Java object memory allocations and duplicates line-by-line.

**IMPORTANT:** In the current version, this tool provides **only the data visualization** of the output of an [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser) and **does not analyze the application by itself**.

## Features
![Extension demo|300](readme%2Fdemo.gif)

- Visualize data provided by an [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser).
- Highlight lines that allocated memory on the heap at runtime.
- Display how many objects, what types and how much memory has each line allocated.
- Aggregate line data to see a method and class total allocation size.
- Tables containing detailed information with interactive links.
- Trace duplicates to their sources.
- Customize highlight color settings.

## Requirements
Plugin is made for the desktop application [Visual Studio Code](https://code.visualstudio.com/) 1.86.0 and newer.

Before using, ensure that [Language Support for Java(TM) by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.java) is also installed.

## How to install
### Obtaining VSIX file
In order to install the extension, you have to acquire VSIX (Visual Studio extension installer) file. You can either create it from this source code yourself, or download it from [release folder](https://github.com/Teemo6/Visualization_of_Allocations/tree/main/release), where is the latest build.

### Creating VSIX from the source code
If you have decided to download the VSIX file from the [release folder](https://github.com/Teemo6/Visualization_of_Allocations/tree/main/release), **skip this section**.

To build the souce code yourself, you will need a [Node.js](https://nodejs.org/en) with `npm` (node package manager) installed on your machine. If you have `npm` ready, follow these steps:

1. Download the source code from this repository.
2. Build the extension:
  ```
  npm install
  ```

 After you have successfully built the project, you will have to create VSIX file using `vsce` (Visual Studio Code extension). Do the following:

1. To install the `vsce` tool, run:
  ```
  npm install -g @vscode/vsce
  ```
2. In the root folder of the built extension, run:
  ```
  vsce package
  ```
2. Alternatively you can run a prepared script, which will create the VSIX file in the `release` folder:
  ```
  npm run pack-vsix
  ```

Doing the steps above will provide you with `java-memory-analyzer.vsix`.

### Installing the extension in Visual Studio Code
If you have the VSIX file ready, you can install the extension inside Visual Studio Code:
1. Open Visual Studio Code.
2. Click **Extensions**.
3. Click **Views and more actions...**
4. Select **Install from VSIX...**

![Extension installation|200](readme%2Finstall.gif)

## How to use 
In order to visualize allocation data, you have to provide a JSON file that can be generated with an [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser). If you have the data ready, you can do the following:

1. Open your Java project in Visual Studio Code and wait for Java symbols to fully load (indicated by **Java: ready** in the bottom status bar).
2. Run command **Memory Analyzer: Load JSON file**.
3. To show more details, run **Memory Analyzer: Show line details** with a line selected.
4. Clicking on the link of the details table will move the cursor to the position of that particular allocation.

If you get prompted with a warning **Found no Java symbols in files**, Java language support could not find any class, method or constructor in the file, therefore no allocation data will be shown for these files. If the file contains some of these symbols, be sure that you run **Memory Analyzer: Load JSON file** with the language support fully loaded (indicated by **Java: ready**).

**Tips:**
- Commands can be found in the context menu with shortcut `ctrl + shift + P`.
- To quickly navigate, search for **Memory Analyzer**.

## How to obtain JSON file
This repository includes [demo applications](https://github.com/Teemo6/Visualization_of_Allocations/tree/main/demo), each featuring pre-generated `data.json` that you can use for a quick demonstration of this extension.

In order to create `data.json` yourself, you will need to build the [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser) using [Maven](https://maven.apache.org/). Instructions are available in the project repository.

To build the [demo applications](https://github.com/Teemo6/Visualization_of_Allocations/tree/main/demo), you can call the following command from root folder of this repository, which will create a JAR file `<demoApp>/target/app.jar` for each demo respectively:

```
mvn -f demo clean install
```

Each demo in this repository contains configuration `.vscode/launch.json` that can be used to easily run compiled memory analyzer application.

## Commands
- `Memory Analyzer: Load JSON file`: load the generated JSON file
- `Memory Analyzer: Toggle visualization`: toggle the visualization on/off
- `Memory Analyzer: Show line details`: show allocation and duplicate details for the currently selected line
  * this option is also available under mouse right-click context menu

**Tip:**
- It is recommended to map the commands to key bindings for personal convenience, refer to the [official Visual Studio Code documentation](https://code.visualstudio.com/docs/getstarted/keybindings).

## Settings
### JSON load settings
- `java-memory-analyzer.json.defaultPath`: absolute path where the JSON is located. If not empty, this path will be always have priority over the popup window
- `java-memory-analyzer.json.askToSavePath`: turn off to stop asking if you want to set currently loaded path as default

**Tips:**
- It is recommended to keep these settings to their default values under User settings and change only Workspace settings, refer to the [official Visual Studio Code documentation](https://code.visualstudio.com/docs/getstarted/settings).
- If you are unable to load a proper JSON file and no popup appeared, check settings if there is a valid **Default path**.
- If you leave **Default path** empty and set **Ask to save path** to false, the analyzer will always ask for the location of the JSON file.

### Line details settings
- `java-memory-analyzer.details.goToLineImmediately`: turn on to show a newly selected line details when the reference link is clicked
- `java-memory-analyzer.details.showDetailsAfterLineIsSelected`: after a line is selected and both visualisation and table panel are toggled on, the tables will show details of the selected line

### Color settings
- `java-memory-analyzer.color.lineBackground`: background color of line allocation
- `java-memory-analyzer.color.lineText`: text color of line allocation
- `java-memory-analyzer.color.methodBackground`: background color of method allocation
- `java-memory-analyzer.color.methodText`: text color of method allocation
- `java-memory-analyzer.color.classBackground`: background color of class allocation
- `java-memory-analyzer.color.classText`: text color of class allocation
- `java-memory-analyzer.color.emptyBackground`: background color of no allocation (only for method/class)
- `java-memory-analyzer.color.emptyText`: text color of no allocation (only for method/class)

**Tips:** 
- All colors accept a string in the [CSS color format](https://www.w3schools.com/css/css_colors.asp).
- If you have the visualization toggled on, the changes can be seen immediately.

![Extension color change|300](readme%2Fcolor.gif)

### Highlight font settings
- `java-memory-analyzer.highlightFont.bold`: turn on to have bold highlight font
- `java-memory-analyzer.highlightFont.itelic`: turn on to have italic highlight font

## Known Issues and limitations
- The format of JSON file is same as an output of the [external Memory Analyzer application](https://gitlab.kiv.zcu.cz/lipka/java-memory-allocation-analyser), no other JSON format is supported.
- The visualization can only show as much data as it is provided with the JSON file. 
- Extension does not actually detect the keyword responsible for memory allocation (such as `new`), as it only highlights lines according to the provided file.
- No support for visualization of nested classes, nested methods and enumerations.
- If you try to run **Load JSON file** without the Java language support fully loaded (indicated by **Java: ready**), some files may be missing allocation data. If this problem persists, the best solution is to restart the Visual Studio Code.
