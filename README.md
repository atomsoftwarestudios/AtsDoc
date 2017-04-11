# ATsDoc
#### TypeScript documentation extractor for AjsDoc

Copyright &copy;2016-2017 Atom Software Studios<br>
Released under the MIT License

---

### Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Usage](#usage)
- [Examples](#examples)
- [Known bugs](#known-bugs)
- [License](#license)
- [Contribution](#contribution)

---

### Introduction

ATsDoc is a Node.js command line utility designed to extract the TypeScript AST tree including the documentation to the JSON file consumable by the
[AjsDoc](https://github.com/atomsoftwarestudios/AjsDoc/).

The extractor is using the TypeScript compiler API to extract the AST tree and is designed to be transparent to the TypeScript compiler and it should not be a problem to switch to new version of the compiler if there will not be any breaking changes in the API itself.

AtsDoc also uses the TSLint to warn against potential coding style problems.

Currently, its not included to the NPM repository.

---

### Usage

Prior the AtsDoc will be published through the NPM the following procedure is about to be followed:

clone the project and open in Visual Studio (this will ensure all required dependencies such as TSLint
and TypeScript will be installed from NPM)

To run the code use the following command:
```
node [path-to-vs-project-dir]\dist\atsdoc.js <params> <files|dir>
```

RootPath parameter can be ommited when single file is used as the tsc output as .ts file nodes are not included in the output.

**TypeScript Compiler Parameters**

It is possible to pass almost all available tsc parameters (see [Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
for details) except those directing the compiler how to output the transpilled code.

Additionally the following parameters are available:

Option                   | Parameters         | Descritption
------------------------ | ------------------ | ------------
--help                   |                    | Prints the usage screen
--version                |                    | Prints version of the AtsDoc, TypeScript Compiler and TSLint in use
--includeDefinitionFiles |                    | Directs the atsdoc to include AST nodes from all .d.ts files used by the program being documented
--jsonFile               | \<filename>        | Output json filename. If not specified the stdout is used instead
--rootPath               | \<path>            | Used to determine relative path to .ts files
--rootNodeName           | \<name>            | Specifies the root node name (default name is Program)
--rootNodeKind           | \<name>            | Specifies the kinf of the root node to be set (default name is Program)

**Planned parameters**

Option                   | Parameters         | Descritption
------------------------ | ------------------ | ------------
--includeSourceFileNodes |                    | Specifies if the source file nodes will be included in the program
--tslintOut              |                    | Specifies the file where log from TSLint will be stored

---

### Examples

RootPath parameter can be ommited when single file is used as the tsc output as .ts file nodes are not included in the output.

```
node .\dist\atsdoc.js -p "d:\Documents\Visual Studio 2015\Projects\AjsDev\Ajs" --rootNodeName ajs.d.ts --rootNodeKind library --jsonFile "d:\Documents\Visual Studio 2015\Projects\AjsDev\AjsDoc\wwwroot\resources\program.json"
```

Source file nodes are included in output tree if no single file output is specified. In this case the --rootPath should be specified, otherwise
fqdns will contain the full .ts files paths and will not work correctly with AtsDoc browser.

```
node .\dist\atsdoc.js --m commonjs ".\test\modules\module-exports.ts" --rootPath ".\test" --jsonFile "d:\Documents\Visual Studio 2015\Projects\AjsDev\AjsDoc\wwwroot\resources\program.json"
```
---

### Known bugs

For known bugs please reffer to [reported issues](https://github.com/atomsoftwarestudios/AtsDoc/issues) or to the [project management](https://github.com/atomsoftwarestudios/AtsDoc/projects/1) sites.

---


### License

See the [License](https://github.com/atomsoftwarestudios/AtsDoc/blob/master/LICENSE) file for details.

### Contribution

Contibution is more than welcome.
