# ATsDoc
#### TypeScript documentation extractor for AjsDoc

Copyright &copy;2016-2017 Atom Software Studios<br>
Released under the MIT License

---

### Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Usage](#usage)
- [Known bugs](#known-bugs)
- [License](#license)
- [Contribution](#contribution)

---

### Introduction

ATsDoc is a Node.js command line utility using the TypeScript API to AST tree nodes from the TypeScript
program and exports the program nodes including the documentation to the JSON file consumable by the
[AjsDoc](https://github.com/atomsoftwarestudios/AjsDoc/).

It is designed to be transparent to the TypeScript compiler and it sshould not be a problem to switch to new
version of it if there will not be any breaking changes in the API itself.

AtsDoc also uses the TSLint and warns for potential problems and coding issues.

Currently, its not included to the NPM repository.

---

### Usage

Prior the AtsDoc will be published through the NPM the following procedure is about to be followed:

clone the project and open in Visual Studio (this will ensure all required dependencies such as TSLint
and TypeScript will be installed from NPM)

To run the code:
```
node [path-to-vs-project-dir]\dist\atsdoc.js <params> <files|dir>
```

**TypeScript Compiler Parameters**

It is possible almost all available tsc parameters (see [Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
for details) except those directing the compiler how to output the transpilled code.

Additionally the following parameters are available:

Option                   | Parameters         | Descritption
------------------------ | ------------------ | ------------
--help                   |                    | Prints the usage screen
--version                |                    | Prints version of the AtsDoc, TypeScript Compiler and TSLint in use
--includeDefinitionFiles |                    | Directs the atsdoc to include AST nodes from all .d.ts files used by the program being documented
--jsonFile               |                    | Output json filename. If not specified the stdout is used instead

**Planned parameters**

Option                   | Parameters         | Descritption
------------------------ | ------------------ | ------------
--programName            |                    | Specified the root node name
--programKind [kind]     | program<br>library | Specifies if the source code is a stanalone program or a library
--includeSourceFileNodes |                    | Specifies if the source file nodes will be included in the program
--tslintOut              |                    | Specifies the file where log from TSLint will be stored

---

### Known bugs

For known bugs please reffer to [reported issues](https://github.com/atomsoftwarestudios/AtsDoc/issues) or to the [project management](https://github.com/atomsoftwarestudios/AtsDoc/projects/1) sites.

---


### License

See the [License](https://github.com/atomsoftwarestudios/AtsDoc/blob/master/LICENSE) file for details.

### Contribution

Contibution is more than welcome.
