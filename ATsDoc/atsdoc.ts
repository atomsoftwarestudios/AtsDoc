﻿/* *************************************************************************
The MIT License (MIT)
Copyright (c)2016-2017 Atom Software Studios. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
**************************************************************************** */

/// <reference path="Scripts/typings/node/node.d.ts" />

import * as ts from "typescript";
import * as fs from "fs";
import * as nodepath from "path";
import * as tslint from "tslint";

namespace atsdoc {

    "use strict";

    /**
     * ATsDoc Error codes
     */
    enum ReturnCode {
        Ok = 0,
        MissingTSCParams,
        InvalidTSCParams,
        InvalidTSConfig,
        TscError,
        The_current_host_does_not_support_the_0_option = 5001,
        Option_project_cannot_be_mixed_with_source_files_on_a_command_line,
        Cannot_find_a_tsconfig_json_file_at_the_specified_directory_Colon_0,
        The_specified_path_does_not_exist_Colon_0
    }

    /**
     * atsdoc configuration
     */
    interface IAtsdocConfig {
        /** Specifies if logging to console is enabled */
        logToConsole?: boolean;
        /** outout json file */
        jsonFile?: string;
        /** root path to the project */
        rootPath?: string;
        /** renames root node name to the name passed from the console */
        rootNodeName?: string;
        /** sets the root node kind string to valie passed from console */
        rootNodeKind?: string;
    }

    /**
     * ignored TypeScript compiler command line options
     */
    interface ITscIgnoredCommandLineArguments {
        /** option */
        argument: string;
        /** number of arguments follwing the option to be skipped */
        arguments: number;
        /** description of the TypeScript command line argument */
        description?: string;
    }

    /**
     * List of tsc command line arguments to be ignored
     */
    const tscIgnoredCommandLineArguments: ITscIgnoredCommandLineArguments[] = [
        { argument: "--init", arguments: 0 },
        { argument: "--locale", arguments: 1 }
    ];

    /* **************************************************************************** */
    /* Global variables
    /* **************************************************************************** */

    // parsed atsdoc configuration
    let atsdocConfig: IAtsdocConfig;

    // specifies if source files will be included in the output
    let includeSources: boolean = false;

    // parsed tsc command line parameters
    let tscCommandLine: ts.ParsedCommandLine;

    /* **************************************************************************** */
    /* Information print out
    /* **************************************************************************** */

    function log(...args: any[]): void {
        if (atsdocConfig.logToConsole) {
            console.log.apply(console, args);
        }
    }

    /**
     * Prints version
     */
    function version(): void {
        log("");
        log("ATsDoc TypeScritpt JSON documentation generator");
        log("Copyright (c)2017 Atom Software Studios");
        log("Version 0.1");
        log("");
        log("TypeScript compiler & TypeScript compiler API");
        log("Copyright (c) Microsoft");
        log("Version: %s", ts.version);
        log("");
        log("tslint TypeScript linter library");
        log("Copyright (c) Palantir Technologies, Inc.");
        log("Version: %s", tslint.Linter.VERSION);
        log("");
    }

    /**
     * Prints usage
     */
    function usage(): void {
        log("Syntax: atsdoc [options] [file ...]|<-p projectPath>");
        log("");
        log("Examples: atsdoc hello.ts");
        log("          atsdoc --rootPath ./tsproject --p ./tsproject/tsconfig.json");
        log("          atsdoc --rootPath ./tsfiles ./tsfiles/tsfile.ts --jsonFile file.json");
        log("");
        log("--help                                  Prints this help");
        log("--version                               Prints version");
        log("");
        log("TypeScript compiler options:");
        log("");
        log("   All tsc (TypeScript compiler) options (run tsc --help for details) excluding the output modification options (ignored)");
        log("");

        /*
        for (let argument of tscIgnoredCommandLineArguments) {
            var desc: string = argument.description || "";
            log(
                "   %s%s",
                argument.argument + "                                     ".substr(0, 40),
                desc
            );
        }
        */

        log("");
        log("ATsDoc configuration options:");
        log("");
        log("   --rootPath                               Used to determine relative path to .ts files. Must be used otherwise links are wrong");
        log("   --includeDefinitionFiles                 Includes definitions from definition files in use to the output");
        log("   --rootNodeName <name>                    Renames root node from 'program' to passed value");
        log("   --rootNodeKind <program|library|module>  Sets kind of the root node to passed value");
        log("");
        log("Output & logging options:");
        log("");
        log("   --jsonFile                               File to which the program structure should be written (default stdout)");
        log("");
    }

    /* **************************************************************************** */
    /* TSC execution
    /* **************************************************************************** */

    /**
     * Checks if JSON object and JSON.parse function exits
     */
    function isJSONSupported(): boolean {
        return typeof JSON === "object" && typeof JSON.parse === "function";
    }

    /**
     * Checks if the directory exists
     * @param directory
     */
    function directoryExists(directory: string): boolean {
        if (fs.existsSync(directory)) {
            return fs.statSync(directory).isDirectory();
        }

        return false;
    }


    /**
     * Returns length of path root (i.e. length of "/", "x:/", "//server/share/, file:///user/files")
     */
    export function getRootLength(path: string): number {
        if (path.charCodeAt(0) === "/".charCodeAt(0)) {
            if (path.charCodeAt(1) !== "/".charCodeAt(0)) {
                return 1;
            }
            const p1: number = path.indexOf("/", 2);
            if (p1 < 0) {
                return 2;
            }
            const p2: number = path.indexOf("/", p1 + 1);
            if (p2 < 0) {
                return p1 + 1;
            }
            return p2 + 1;
        }
        if (path.charCodeAt(1) === ":".charCodeAt(0)) {
            if (path.charCodeAt(2) === "/".charCodeAt(0)) {
                return 3;
            }
            return 2;
        }
        // per RFC 1738 'file' URI schema has the shape file://<host>/<path>
        // if <host> is omitted then it is assumed that host value is 'localhost',
        // however slash after the omitted <host> is not removed.
        // file:///folder1/file1 - this is a correct URI
        // file://folder2/file2 - this is an incorrect URI
        if (path.lastIndexOf("file:///", 0) === 0) {
            return "file:///".length;
        }
        const idx: number = path.indexOf("://");
        if (idx !== -1) {
            return idx + "://".length;
        }
        return 0;
    }

    /**
     * Combine paths to resultant path
     * @param path1
     * @param path2
     */
    function combinePaths(path1: string, path2: string): string {
        if (!(path1 && path1.length)) { return path2; }
        if (!(path2 && path2.length)) { return path1; }
        if (getRootLength(path2) !== 0) { return path2; }
        if (path1.charAt(path1.length - 1) === nodepath.sep) { return path1 + path2; }
        return path1 + nodepath.sep + path2;
    }

    /**
     * Finds tsconfig.json on the search path if exists
     * @param searchPath
     * @param fileExists
     * @param configName
     */
    function findConfigFile(searchPath: string, fileExists: (fileName: string) => boolean, configName: string = "tsconfig.json"): string {
        while (true) {
            const fileName: string = combinePaths(searchPath, configName);
            if (fileExists(fileName)) {
                return fileName;
            }
            const parentPath: string = getDirectoryPath(searchPath);
            if (parentPath === searchPath) {
                break;
            }
            searchPath = parentPath;
        }
        return undefined;
    }

    function readFile(filename: string): string {
        return fs.readFileSync(filename, "utf8");
    }

    /**
     * Returns directory path from the full file path
     * @param path
     */
    function getDirectoryPath(path: string): string {
        return path.substr(0, Math.max(getRootLength(path), path.lastIndexOf(nodepath.sep)));
    }

    /**
     * Executes TSC compiler with arguments passed from command line
     */
    function processProgram(): ReturnCode {

        /** configuration file name (if any) */
        let configFileName: string;
        /** tsc options parsed from config file or from the command line */
        let programOptions: ts.ParsedCommandLine;
        /** paths of input files from command line or path to the project used to filter out external libraries used */
        let tsPaths: string[] = [];

        if (tscCommandLine.options.project) {

            // if arguments are specyfying project

            // json must be supported on the platform to parse the project tsconfig file

            if (!isJSONSupported()) {
                log("--project option is not supported on the current host");
                return ReturnCode.The_current_host_does_not_support_the_0_option;
            }

            // project can't  be passed together with project

            if (tscCommandLine.fileNames.length !== 0) {
                log("--project option cannot be mixed with source files on a command line");
                return ReturnCode.Option_project_cannot_be_mixed_with_source_files_on_a_command_line;
            }

            // prepare tsconfig to be loaded

            const fileOrDirectory: string = nodepath.resolve(tscCommandLine.options.project);

            if (!fileOrDirectory /* current directory "." */ || directoryExists(fileOrDirectory)) {

                configFileName = combinePaths(fileOrDirectory, "tsconfig.json");
                if (!fs.existsSync(configFileName)) {
                    log("Cannot find a tsconfig.json file at the specified directory.");
                    return ReturnCode.Cannot_find_a_tsconfig_json_file_at_the_specified_directory_Colon_0;
                }

            } else {

                configFileName = fileOrDirectory;
                if (!fs.existsSync(configFileName)) {
                    log("The specified path does not exist");
                    return ReturnCode.The_specified_path_does_not_exist_Colon_0;
                }

            }

        } else {

            // otherwise files to be compiled are passed as command line parameters

            if (tscCommandLine.fileNames.length === 0 && isJSONSupported()) {
                const searchPath: string = nodepath.normalize(__dirname);
                configFileName = findConfigFile(searchPath, fs.existsSync);
            }
        }

        // if no project or files to be processed are specified print out the usage;

        if (tscCommandLine.fileNames.length === 0 && !configFileName) {
            usage();
            return ReturnCode.Ok;
        }

        if (configFileName) {

            // if config is about to be loaded, load it (including extending configs), otherwise get files and options from command line

            let tsconfig: { config?: any, error?: ts.Diagnostic } = ts.readConfigFile(configFileName, readFile);
            if (tsconfig.error) {
                return ReturnCode.InvalidTSConfig;
            }

            programOptions = ts.parseJsonConfigFileContent(tsconfig.config, ts.sys, nodepath.dirname(configFileName));

            if (tsconfig.error) {
                return ReturnCode.InvalidTSConfig;
            }

            // get path to config file

            tsPaths.push(nodepath.dirname(configFileName));

        } else {
            programOptions = tscCommandLine;

            // get paths to files passed as args from command line

            for (let f of programOptions.fileNames) {
                tsPaths.push(nodepath.resolve(nodepath.dirname(f)));
            }
        }

        // convert program to IATsDocNodeTree
        return convertProgram(programOptions.fileNames, tsPaths, programOptions.options);

    }

    /* **************************************************************************** */
    /* TS to ATS node converters
    /* **************************************************************************** */

    /* tslint:disable */
    enum ATsDocNodeFlags {
        let = 1 << 0,
        var = 1 << 1,
        const = 1 << 2,
    }
    /* tslint:enable */

    /**
     * Documentation type node (simplified AST node)
     */
    interface IATsDocType {
        name: string;
        commentShort?: string;
        commentLong?: string;
        fqdn?: string;
        flags: ts.TypeFlags;
        flagsString: string[];
        objectFlags?: ts.ObjectFlags;
        objectFlagsString?: string[];
        types?: IATsDocType[];
        constraint?: IATsDocType;
        callSignatures?: IATsDocNode[];
    }

    /**
     * Documentation node (simplified AST node)
     */
    interface IATsDocNode {
        kind: number;
        kindString: string;
        commentShort?: string;
        commentLong?: string;
        files?: {
            file: string;
        }[];

        name?: string;
        fqdn?: string;
        atsNodeFlags?: ATsDocNodeFlags;
        atsNodeFlagsString?: string[];
        nodeFlags?: ts.NodeFlags;
        nodeFlagsString?: string[];
        modifierFlags?: ts.ModifierFlags;
        modifierFlagsString?: string[];
        type?: IATsDocType;
        initializer?: string;
        constraint?: IATsDocType;
        moduleReference?: string;
        members?: IATsDocNode[];
        parameters?: IATsDocNode[];
        typeParameters?: IATsDocType[];
        returnType?: IATsDocType;
        optional?: boolean;
        restParameter?: boolean;
        extends?: IATsDocType;
        implements?: IATsDocType[];
        children?: IATsDocNode[];
    }

    /**
     * Data to be collected from a Node
     */

    let program: ts.Program;
    let checker: ts.TypeChecker;
    let lastNodeId: number;
    let allowedNodes: ts.SyntaxKind[];

    allowedNodes = [
        ts.SyntaxKind.ModuleDeclaration,
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.TypeParameter,
        ts.SyntaxKind.VariableStatement,
        ts.SyntaxKind.EnumDeclaration,
        ts.SyntaxKind.InterfaceDeclaration,
        ts.SyntaxKind.ClassDeclaration,
        ts.SyntaxKind.Constructor,
        ts.SyntaxKind.CallSignature,
        ts.SyntaxKind.EnumMember
        // ts.SyntaxKind.ImportEqualsDeclaration
    ];

    /* tslint:disable */
    /* tslint:enable */

    /**
     * Extracts jsDoc from ts.Node
     * First line of comment is used as short text, the rest is long text
     * If multiple jsDocs exists the first one is used as primary and second is merged to long comment
     * @param node Node from which the documentation will be extracted
     * @param atsNode Result node where the documentation should be stored
     */
    function extractJsDoc(node: ts.Node, atsNode: IATsDocNode): void {

        if (!node.hasOwnProperty("jsDoc")) {
            if ((<any>node).symbol) {
                let comment: string[] = ts.displayPartsToString((<any>node).symbol.getDocumentationComment()).split("\n");
                if (comment instanceof Array && comment.length > 0) {
                    if (comment[0]) {
                        atsNode.commentShort = comment[0];
                    }
                    if (comment[1]) {
                        comment.shift();
                        atsNode.commentLong = comment.join("\n");
                    }
                }
            }
            return;
        }

        let jsDoc: ts.JSDoc[] = (<any>node).jsDoc;
        let jsDocComment: string = "";

        // merge multiple jsDocs together first (correct way is not to use multiple jsDoc comments for single statement)
        for (let jsDocNode of jsDoc) {
            if (jsDocNode.comment) {
                jsDocComment += jsDocNode.comment + "\n";
            }
        }

        // populate comment properties of the atsNode with appropriate values
        if (jsDocComment !== "") {
            // only cr will be stored so replace crlf with cr only
            jsDocComment = jsDocComment.replace(/\r/g, "");
            // split jsDoc to short and long comments
            let commentLines: string[] = jsDocComment.split("\n");

            if (commentLines.length > 0) {
                atsNode.commentShort = commentLines[0];
                if (commentLines.length > 1) {
                    commentLines.shift();
                    let comment: string = commentLines.join("\n");
                    if (comment !== "") {
                        atsNode.commentLong = comment;
                    }
                }
            } else {
                atsNode.commentShort = jsDocComment;
            }

        }
    }

    /**
     * Extracts parameters documentation from the parent node jsDoc tags of the node passed
     * @param node The parameter node
     * @param atsNode Result node where the documentation should be stored
     */
    function extractParamDoc(node: ts.Node, atsNode: IATsDocNode): void {

        if (!node.hasOwnProperty("name") ||
            !node.hasOwnProperty("parent") ||
            !node.parent.hasOwnProperty("jsDoc") ||
            !((<any>node.parent).jsDoc instanceof Array) ||
            ((<any>node.parent).jsDoc.length === 0)) {
            return;
        }

        let jsDocNode: any = (<any>node.parent).jsDoc[0];

        if (!jsDocNode.hasOwnProperty("tags") || !(jsDocNode.tags instanceof Array) || jsDocNode.tags.length === 0) {
            return;
        }

        let jsDocNodeTags: any = (<any>node.parent).jsDoc[0].tags;

        for (const tag of jsDocNodeTags) {

            if (tag.parameterName &&
                tag.parameterName.text &&
                tag.parameterName.text === (<any>node).name.getText() &&
                tag.hasOwnProperty("comment")) {

                let comment: string[] = tag.comment.split("\n");
                if (comment[0]) {
                    atsNode.commentShort = comment[0];
                }
                if (comment[1]) {
                    comment.shift();
                    atsNode.commentLong = comment.join("\n");
                }
            }

        }

    }

    /**
     * Returns fully qualified node name of the node or type
     * @param anyNode node or type to be checked for fqdn
     */
    function getFqdn(anyNode: any): string | undefined {
        let fqdn: string = "";
        if (anyNode.hasOwnProperty("symbol")) {
            let n: any = anyNode;
            while (n !== null) {
                if (n.kind === ts.SyntaxKind.SourceFile && includeSources) {
                    if (n.fileName) {
                        let fn: string = nodepath.resolve(n.fileName).substr(atsdocConfig.rootPath.length).replace(/\\/g, "/");
                        fqdn = fqdn === "" ? fn : fn + "." + fqdn;
                    }
                } else {
                    if (n.symbol && n.symbol.name) {
                        fqdn = fqdn === "" ? n.symbol.name : n.symbol.name + "." + fqdn;
                    }
                }

                if (n.symbol && n.symbol.declarations && n.symbol.declarations[0] && n.symbol.declarations[0].parent) {
                    n = n.symbol.declarations[0].parent;
                } else {
                    if (n.parent) {
                        n = n.parent;
                    } else {
                        n = null;
                    }
                }
            }
        }

        if (fqdn !== "") {
            return fqdn;
        } else {
            return;
        }
    }

    /**
     * Extracts type information
     * @param type 
     * @param atsNodeType type array where information will be pushed
     */
    function collectTypes(t: ts.Type, atsType: IATsDocType, node?: ts.Node): void {

        // type flags & name

        if (t.flags) {
            atsType.flags = t.flags;

            if (atsType.flags &&
                /* tslint:disable */
                (atsType.flags === (ts.TypeFlags.Boolean | ts.TypeFlags.Union) || (atsType.flags === ts.TypeFlags.Boolean)) &&
                /* tslint:enable */
                node && node.getText() === "boolean") {

                atsType.flags = ts.TypeFlags.Boolean;
                atsType.name = "boolean";

            } else {
                atsType.name = checker.typeToString(t);
            }

            if (atsType.flags && atsType.flags > 0) {
                atsType.flagsString = [];
                for (var item in ts.TypeFlags) {
                    /* tslint:disable */
                    if ((atsType.flags & parseInt(item)) === parseInt(item)) {
                        /* tslint:enable */
                        atsType.flagsString.push(ts.TypeFlags[item]);
                    }
                }
            }
        } else {
            atsType.name = (<any>t).getText();
        }

        // object flags

        if ((<any>t).objectFlags) {
            atsType.objectFlags = (<any>t).objectFlags;
        }

        if (atsType.objectFlags && atsType.objectFlags > 0) {
            atsType.objectFlagsString = [];
            for (var item in ts.ObjectFlags) {
                /* tslint:disable */
                if ((atsType.objectFlags & parseInt(item)) === parseInt(item)) {
                    /* tslint:enable */
                    atsType.objectFlagsString.push(ts.ObjectFlags[item]);
                }
            }
        }

        // fqdn

        if (t.symbol) {
            let fqdn: string = checker.getFullyQualifiedName(t.symbol);
            if (fqdn !== "__type") {
                atsType.fqdn = getFqdn(t);
            }
        }

        // children types

        if ((<any>t).types && atsType.flags !== ts.TypeFlags.Boolean) {
            atsType.types = [];
            let hasBooleanLiteral: boolean = false;
            for (let tt of (<any>t).types) {
                let atsT: IATsDocType = <any>{};
                collectTypes(tt, atsT);
                atsType.types.push(atsT);
                hasBooleanLiteral = hasBooleanLiteral || (atsT.flags === ts.TypeFlags.BooleanLiteral);
            }

            // fix boolean literal to boolean if neccessary
            if (atsType.flags === ts.TypeFlags.Union && hasBooleanLiteral && atsType.name.indexOf("boolean") !== -1) {
                for (let i: number = 0; i < atsType.types.length; i++) {
                    if (atsType.types[i].flags === ts.TypeFlags.BooleanLiteral) {
                        atsType.types.splice(i, 1);
                        i--;
                    }
                }
                atsType.types.push({ flags: ts.TypeFlags.Boolean, name: "boolean", flagsString: ["Boolean"] });
            }

        }

        // constraint

        if ((<any>t).constraint) {
            atsType.constraint = <any>{};
            collectTypes((<any>t).constraint, atsType.constraint);
        }

        // call signatures

        if ((<any>t).callSignatures && (<any>t).callSignatures.length > 0) {
            atsType.callSignatures = [];
            for (let cs of (<any>t).callSignatures) {
                let aNode: IATsDocNode = <any>{};
                collectNodeData(cs, aNode);
                atsType.callSignatures.push(aNode);
            }
        }

    }

    /**
     * Converts symbol of given DeclatationStatement type and stores info to atsNode
     * @param node node to be obtained symbol from and converted to atsNode
     * @param atsNode atsNode to be extended with the converted information
     */
    function collectNodeData(node: ts.Node, atsNode: IATsDocNode): void {

        let anyNode: any = node;

        // kind
        if (anyNode.kind) {
            atsNode.kind = anyNode.kind;
            atsNode.kindString = ts.SyntaxKind[anyNode.kind];
        }

        // name

        if (anyNode.name) {
            atsNode.name = anyNode.name.getText();
            atsNode.fqdn = getFqdn(anyNode);
        }

        // documentation

        // for nested (. separated namespaces) collect doc from top ns
        /* tslint:disable */
        if ((anyNode.flags & ts.NodeFlags.NestedNamespace) === ts.NodeFlags.NestedNamespace) {
        /* tslint:enable */
            let n: any = anyNode;
            /* tslint:disable */
            while ((n.flags & ts.NodeFlags.NestedNamespace) === ts.NodeFlags.NestedNamespace) {
            /* tslint:enable */
                n = n.parent;
            }
            if (n.jsDoc) {
                extractJsDoc(n, atsNode);
            }
        } else {
            // for other nodes and namespaces without nested namespaces collect doc directly from the node
            let hasNestedNamespaces: boolean = false;
            ts.forEachChild(anyNode, (n: ts.Node) => {
                hasNestedNamespaces =
                    /* tslint:disable */
                    hasNestedNamespaces || (n.hasOwnProperty("flags") && ((n.flags & ts.NodeFlags.NestedNamespace) === ts.NodeFlags.NestedNamespace));
                    /* tslint:enable */
            });

            if (!hasNestedNamespaces) {
                extractJsDoc(node, atsNode);
            }
        }

        // type

        if (anyNode.type) {
            atsNode.type = <any>{};
            let t: ts.Type = checker.getTypeAtLocation(anyNode.type);
            collectTypes(t, atsNode.type, anyNode.type);

            // if type is a return value, collect jsdoc from parent
            if (atsNode.type &&
                (anyNode.kind === ts.SyntaxKind.FunctionDeclaration ||
                anyNode.kind === ts.SyntaxKind.MethodDeclaration ||
                anyNode.kind === ts.SyntaxKind.MethodSignature)) {

                if (anyNode.jsDoc && anyNode.jsDoc[0] && anyNode.jsDoc[0].tags) {
                    for (const tag of anyNode.jsDoc[0].tags) {
                        if (tag.tagName && tag.tagName.text === "returns") {
                            atsNode.type.commentShort = tag.comment;
                            break;
                        }
                    }
                }
            }
        }

        // flags

        if (anyNode.flags) {
            let flags: ts.NodeFlags = ts.getCombinedNodeFlags(anyNode);
            if (flags > 0) {
                atsNode.nodeFlags = flags;
                atsNode.nodeFlagsString = [];
                for (var item in ts.NodeFlags) {
                    /* tslint:disable */
                    if ((atsNode.nodeFlags & parseInt(item)) === parseInt(item)) {
                        /* tslint:enable */
                        atsNode.nodeFlagsString.push(ts.NodeFlags[item]);
                    }
                }
                if (atsNode.nodeFlagsString.length > 1) {
                    atsNode.nodeFlagsString.shift();
                }
            }
        }

        // modifiers

        if (anyNode.modifiers) {
            let flags: ts.ModifierFlags = ts.getCombinedModifierFlags(anyNode);
            if (flags > 0) {
                atsNode.modifierFlags = flags;
                atsNode.modifierFlagsString = [];
                for (var item in ts.ModifierFlags) {
                    /* tslint:disable */
                    if ((atsNode.modifierFlags & parseInt(item)) === parseInt(item)) {
                        /* tslint:enable */
                        atsNode.modifierFlagsString.push(ts.ModifierFlags[item]);
                    }
                }
                if (atsNode.modifierFlagsString.length > 1) {
                    atsNode.modifierFlagsString.shift();
                }
            }
        }

        // constraint

        if (anyNode.constraint) {
            let t: ts.Type = checker.getTypeAtLocation(anyNode.constraint);
            atsNode.constraint = <any>{};
            collectTypes(t, atsNode.constraint);
        }

        // module / namespace (module reference)

        if (anyNode.moduleReference) {
            atsNode.moduleReference = anyNode.moduleReference.getText();
        }

        // members

        if (anyNode.members instanceof Array && anyNode.members.length > 0) {
            if (atsNode.children === undefined) {
                atsNode.children = [];
            }
            for (let p of anyNode.members) {
                let an: IATsDocNode = <any>{};
                collectNodeData(p, an);
                if (p.questionToken) {
                    an.optional = true;
                }

                // - Constructor is special case, add constructor name and fqdn
                if (p.kind === ts.SyntaxKind.Constructor) {
                    an.name = "constructor";
                    an.fqdn = getFqdn(p);
                }

                atsNode.children.push(an);
            }
        }

        // type parameters

        if (anyNode.typeParameters instanceof Array) {
            atsNode.typeParameters = [];
            for (let p of anyNode.typeParameters) {
                let t: IATsDocType = <any>{};
                collectTypes(p, t);
                atsNode.typeParameters.push(t);
            }
        }

        // parameters

        if (anyNode.parameters instanceof Array) {
            atsNode.parameters = [];
            for (let p of anyNode.parameters) {
                let an: IATsDocNode = <any>{};
                if (p.questionToken) {
                    an.optional = true;
                }
                if (p.dotDotDotToken) {
                    an.restParameter = true;
                }
                if (p.declarations instanceof Array) {
                    for (let decl of p.declarations) {
                        extractParamDoc(decl, an);
                        collectNodeData(decl, an);
                        atsNode.parameters.push(an);
                    }
                } else {
                    extractParamDoc(p, an);
                    collectNodeData(p, an);
                    atsNode.parameters.push(an);
                }
            }
        }

        // return value

        if (anyNode.resolvedReturnType) {
            atsNode.returnType = <any>{};
            collectTypes(anyNode.resolvedReturnType, atsNode.returnType, anyNode.returnValue);
        }

        // initializer

        if (anyNode.initializer) {
            if (anyNode.kind === ts.SyntaxKind.EnumMember ||
                anyNode.kind === ts.SyntaxKind.Parameter ||
                anyNode.kind === ts.SyntaxKind.VariableStatement ||
                anyNode.kind === ts.SyntaxKind.VariableDeclaration) {
                atsNode.initializer = anyNode.initializer.getText();
            }
        }

        // extends, implements

        if (anyNode.heritageClauses instanceof Array) {
            let exts: IATsDocType = <any>{};
            let imps: IATsDocType[] = [];
            for (let hc of anyNode.heritageClauses) {
                if (hc._children[0].getText() === "extends") {
                    collectTypes(checker.getTypeAtLocation(hc.types[0]), exts);
                }

                if (hc._children[0].getText() === "implements") {
                    for (let t of hc.types) {
                        let imp: IATsDocType = <any>{};
                        collectTypes(checker.getTypeAtLocation(t), imp);
                        imps.push(imp);
                    }
                }
            }

            if (exts) {
                atsNode.extends = exts;
            }

            if (imps.length > 0) {
                atsNode.implements = imps;
            }
        }

        // let, var or const

        if (anyNode.kind === ts.SyntaxKind.VariableStatement) {
            let ps: string = anyNode.getFullText();
            atsNode.atsNodeFlags = atsNode.atsNodeFlags || 0;
            /* tslint:disable */
            if (ps.indexOf("let ") !== -1) {
                atsNode.atsNodeFlags = atsNode.atsNodeFlags | ATsDocNodeFlags.let;
                delete atsNode.initializer;
            }
            if (ps.indexOf("var ") !== -1) {
                atsNode.atsNodeFlags = atsNode.atsNodeFlags | ATsDocNodeFlags.var;
                delete atsNode.initializer;
            }
            if (ps.indexOf("const ") !== -1) atsNode.atsNodeFlags = atsNode.atsNodeFlags | ATsDocNodeFlags.const;
            /* tslint:denable */
        }

        if (atsNode.atsNodeFlags && atsNode.atsNodeFlags > 0) {
            atsNode.atsNodeFlagsString = [];
            for (var item in ATsDocNodeFlags) {
                /* tslint:disable */
                if ((atsNode.atsNodeFlags & parseInt(item)) === parseInt(item)) {
                    /* tslint:enable */
                    atsNode.atsNodeFlagsString.push(ATsDocNodeFlags[item]);
                }
            }
        }
    }

    /**
     * Creates a new AtsDocNode and populates it with information from the TSC node
     * @param filename
     * @param node
     */
    function newAtsDocNode(node: ts.Node): IATsDocNode {

        let file: ts.SourceFile = node.getSourceFile();
        let pos: ts.LineAndCharacter =  file.getLineAndCharacterOfPosition(node.getFullStart() + node.getLeadingTriviaWidth());

        let n: IATsDocNode = {
            kind: node.kind,
            kindString: ts.SyntaxKind[node.kind],
            files: []
        };

        let fn: string = nodepath.resolve(file.fileName).substr(atsdocConfig.rootPath.length).replace(/\\/g, "/");
        n.files.push({ file: fn + ":" + (pos.line + 1) + ":" + (pos.character + 1) });

        return n;
    }


    /**
     * Merges new ats node with already existing ats node
     * @param parentAtsNode parent node to be searched for already existing node
     * @param atsNode ats node to be merged to existing or added to parent node
     */
    function mergeAtsNodes(parentAtsNode: IATsDocNode, atsNode: IATsDocNode): IATsDocNode {

        /*log("Merging nodes:");
        log("   Parent node:  %s(%s): %s", parentAtsNode.name, ts.SyntaxKind[parentAtsNode.kind]);
        log("   Current node: %s: %s", atsNode.name, ts.SyntaxKind[atsNode.kind]);*/

        let mergeIgnore: ts.SyntaxKind[] = [
            ts.SyntaxKind.FunctionDeclaration
        ];


        // if children with given name exists already and is of the same king, megre and return
        if (parentAtsNode.children instanceof Array) {
            for (let n of parentAtsNode.children) {
                if (n.kind === atsNode.kind && n.name === atsNode.name && mergeIgnore.indexOf(n.kind) === -1) {
                    return n;
                }
            }
        }

        // otherwise add atsNode to parent

        if (!(parentAtsNode.children instanceof Array)) {
            parentAtsNode.children = [];
        }
        parentAtsNode.children.push(atsNode);
        return atsNode;
    }

    /**
     * Merges children from node1 to node 2
     * @param node1 Source node
     * @param node2 Target node
     */
    function mergeNodesPropertiesAndChildren(node1: IATsDocNode, node2: IATsDocNode): void {
        if (node1.children instanceof Array) {
            for (let nn of node1.children) {
                if (!(node2.children instanceof Array)) {
                    node2.children = [];
                }
                node2.children.push(nn);
            }
        }
        for (let key in node1) {
            if (node1.hasOwnProperty(key)) {
                if (!node2.hasOwnProperty(key)) {
                    node2[key] = node1[key];
                } else {

                    if (key === "files") {
                        for (let file of node1.files) {
                            node2.files.push({ file: file.file });
                        }
                    }

                }
            }
        }
    }

    /**
     * Converts node if the node converter is registered
     * @param filename
     * @param node
     * @param parentAtsNode
     */
    function convertNode(node: ts.Node, parentAtsNode: IATsDocNode): void {
        /*
        let nodeKind: string = node.kind.toString();
        log(
        "Trying to convert node: %s:%s - %s",
        nodeKind,
        ts.SyntaxKind[nodeKind],
        (<any>node).name ? (<any>node).name.getText() : "notext"
        );
        */

        // if converter exists for given node kind
        if (allowedNodes.indexOf(node.kind) !== -1) {

            // prepare a new atsdoc node 
            let atsNode: IATsDocNode = newAtsDocNode(node);

            // convert the node to atsdoc format
            collectNodeData(node, atsNode);

            // - VariableStatement is special case and VariableDeclaration need to be merged to it if exists
            if (node.kind === ts.SyntaxKind.VariableStatement) {
                for (let ch of (<any>node)._children) {
                    if (ch.kind === ts.SyntaxKind.VariableDeclarationList && ch.declarations.length > 0) {
                        collectNodeData(ch.declarations[0], atsNode);
                    }
                }
            }

            // - Constructor is special case, add constructor name and fqdn
            if (node.kind === ts.SyntaxKind.Constructor) {
                atsNode.name = "constructor";
                atsNode.fqdn = getFqdn(node);
            }

            // add converted node to parent
            let n: IATsDocNode = mergeAtsNodes(parentAtsNode, atsNode);

            // find defined children nodes
            childrenVisitor(node, n);

            // merge node properties & children if necessary
            if (n !== atsNode) {
                mergeNodesPropertiesAndChildren(atsNode, n);
            }

        } else {

            childrenVisitor(node, parentAtsNode);

        }

    }

    /**
     * Visits each child node under given node branch
     * @param filename
     * @param node
     * @param parentAtsNode
     */
    function childrenVisitor(node: ts.Node, parentAtsNode: IATsDocNode, filter?: ts.SyntaxKind[]): void {
        ts.forEachChild(node, (childNode: ts.Node) => {
            convertNode(childNode, parentAtsNode);
        });
    }

    /**
     * Reports tsc errors and returns number of them
     * @param program
     */
    function reportTsErrors(program: ts.Program): number {

        // get all possible diag messages
        let globalDiagnostics: ts.Diagnostic[] = program.getGlobalDiagnostics();
        let optionsDiagnostics: ts.Diagnostic[] = program.getOptionsDiagnostics();
        let declarationDiagnostics: ts.Diagnostic[] = program.getDeclarationDiagnostics();
        let semanticDiagnostics: ts.Diagnostic[] = program.getSemanticDiagnostics();
        let syntacticDiagnostics: ts.Diagnostic[] = program.getSyntacticDiagnostics();

        // concat all diagnostics
        let diagnostics: ts.Diagnostic[] = [].concat(
            globalDiagnostics,
            optionsDiagnostics,
            declarationDiagnostics,
            semanticDiagnostics,
            syntacticDiagnostics
        );

        // report errors
        for (let d of diagnostics) {

            let lch: { line: number, character: number };
            let fn: string;

            if (d.file) {
                fn = d.file.fileName;
                lch = d.file.getLineAndCharacterOfPosition(d.start);
            } else {
                fn = "";
                lch = { line: 0, character: 0 };
            }

            log(
                "TS%s: %s (File: '%s' , Line: %s, Character: %s)",
                d.code,
                d.messageText,
                fn,
                lch.line ? lch.line : "",
                lch.character ? lch.character : "");

            console.log(
                "TS%s: %s (File: '%s' , Line: %s, Character: %s)",
                d.code,
                d.messageText,
                fn,
                lch.line ? lch.line : "",
                lch.character ? lch.character : "");
        }

        return diagnostics.length;

    }

    /**
     * Performs linting of all program files
     * @param program
     */
    function lintts(program: ts.Program): void {

        // tslint path
        let tslintDir: string = nodepath.resolve(__dirname + "/../node_modules/tslint/");
        // initialize linter
        let tsLintOptions: tslint.ILinterOptions = {
            rulesDirectory: nodepath.resolve(tslintDir + "/lib/rules"),
            formattersDirectory: nodepath.resolve(tslintDir + "/lib/formatters"),
            formatter: "json",
            fix: false
        };

        // load recommended tslint config
        let configPath: string = nodepath.resolve(tslintDir + "/lib/configs/recommended.js");
        let tsLintConfig: tslint.Configuration.IConfigurationFile = tslint.Configuration.loadConfigurationFromPath(configPath);

        // rewrite some rules
        tsLintConfig.rules["max-classes-per-file"][0] = false;
        tsLintConfig.rules["no-namespace"] = false;
        tsLintConfig.rules["member-ordering"][0] = false;
        tsLintConfig.rules["variable-name"][0] = false;
        tsLintConfig.rules["trailing-comma"] = false;
        tsLintConfig.rules["no-reference"] = false;
        tsLintConfig.rules["max-line-length"][1] = 140;
        tsLintConfig.rules["no-console"] = false;
        tsLintConfig.rules["object-literal-shorthand"] = false;
        tsLintConfig.rules["object-literal-sort-keys"] = false;
        tsLintConfig.rules["array-type"] = false;


        // lint all files in the program
        let lintResults: tslint.LintResult[] = [];
        let linter: tslint.Linter = new tslint.Linter(tsLintOptions, program);
        for (let sourceFile of program.getSourceFiles()) {
            if (!sourceFile.isDeclarationFile) {
                // log("Linting file %s", sourceFile.fileName);
                linter.lint(sourceFile.fileName, sourceFile.getFullText(), tsLintConfig);
                lintResults.push(linter.getResult());
            }
        }

        // undouble report tslint failures
        let failures: string[] = [];
        for (let fileResult of lintResults) {
            for (let failure of fileResult.failures) {
                let f: string = "Warning: tslint rule '" + failure.getRuleName()
                    + "' failed with '" + failure.getFailure()
                    + "' error in '" + failure.getFileName()
                    + "' at " + (failure.getStartPosition().getLineAndCharacter().line + 1)
                    + ":" + (failure.getStartPosition().getLineAndCharacter().character + 1)
                    + "'";
                if (failures.indexOf(f) === -1) {
                    failures.push(f);
                }
            }
        }

        if (failures.length > 0) {
            for (let f of failures) {
                log(f);
            }
            log("");
        }

    }

    /**
     * Converts program AST to atsdoc simplified serializable node structure
     * @param rootNames Files to be processed
     * @param path/s to project or passed ts files (used to detect only program files, not external libraries)
     * @param options TypeScript compiler options
     */
    function convertProgram(rootNames: string[], tsPaths: string[], options: ts.CompilerOptions): ReturnCode {

        // initialize last node id
        lastNodeId = 0;

        // initialize program and type checker
        program = ts.createProgram(rootNames, options);
        checker = program.getTypeChecker();

        // report errors and exit (if any)
        if (reportTsErrors(program) > 0) {
            return ReturnCode.TscError;
        }

        // lint program and print warnings related to linter
        lintts(program);

        // prepare program root node
        let atsDocRootNode: IATsDocNode = {
            kind: -1,
            kindString: "program"
        };

        if (atsdocConfig.rootNodeKind) {
            atsDocRootNode.kindString = atsdocConfig.rootNodeKind;
        }

        if (atsdocConfig.rootNodeName) {
            atsDocRootNode.name = atsdocConfig.rootNodeName;
        }

        includeSources = options.outFile === undefined;

        // go through all configured files and visit each ts.node
        for (const sourceFile of program.getSourceFiles()) {

            if (!sourceFile.isDeclarationFile) {

                log("Processing file %s", sourceFile.fileName);

                if (includeSources) {

                    let fn: string = nodepath.resolve(sourceFile.fileName).substr(atsdocConfig.rootPath.length).replace(/\\/g, "/");

                    // if output is set to single file don't use the program doc node directly but use the file rather
                    let tsFile: IATsDocNode = {
                        kind: sourceFile.kind,
                        kindString: ts.SyntaxKind[sourceFile.kind],
                        fqdn: fn,
                        files: []
                    };

                    tsFile.files.push({ file: fn });

                    if (!(atsDocRootNode.children instanceof Array)) {
                        atsDocRootNode.children = [];
                    }
                    atsDocRootNode.children.push(tsFile);
                    childrenVisitor(sourceFile, tsFile);

                } else {
                    // otherwise merge all files to program doc node directly
                    childrenVisitor(sourceFile, atsDocRootNode);
                }
            }

        }

        let output: string = JSON.stringify(atsDocRootNode, null, 2);

        if (atsdocConfig.jsonFile) {
            let fileName: string = nodepath.resolve(nodepath.normalize(atsdocConfig.jsonFile));
            log("");
            log("Writing result to %s", atsdocConfig.jsonFile);
            fs.writeFileSync(fileName, output, "utf8");
        } else {
            console.log(output);
        }

        return ReturnCode.Ok;

    }

    /* **************************************************************************** */
    /* Command line arguments parsing & validation
    /* **************************************************************************** */

    /**
     * Validates TypeScript compiler command line parameters
     * @param args
     */
    function validateTscCommandlineArgs(args: string[]): ReturnCode {

        // try to parse TypeScript compiler command line parameters 
        tscCommandLine = ts.parseCommandLine(args);

        // if there are errors in the output, report it and return error
        if (tscCommandLine.errors.length > 0) {
            log("");
            log("Error parsing tsc command line parameters:\n");
            for (let i: number = 0; i < tscCommandLine.errors.length; i++) {
                log("TS%d: %s",
                    tscCommandLine.errors[i].code,
                    tscCommandLine.errors[i].messageText
                );
            }
            return ReturnCode.InvalidTSCParams;
        }

        return ReturnCode.Ok;
    }

    /**
     * Normalizes the atsdoc configuration
     * @param config atsdoc configuration options
     */
    function normalizeAtsdocConfig(config: IAtsdocConfig): IAtsdocConfig {

        let cfg: IAtsdocConfig = {};
        cfg.logToConsole = config.logToConsole;

        if (config.jsonFile) {
            cfg.jsonFile = config.jsonFile;
        } else {
            cfg.jsonFile = null;
        }

        if (config.rootNodeKind) {
            cfg.rootNodeKind = config.rootNodeKind;
        } else {
            cfg.rootNodeKind = "Program";
        }

        if (config.rootNodeName) {
            cfg.rootNodeName = config.rootNodeName;
        } else {
            cfg.rootNodeName = "Program";
        }

        if (config.rootPath) {
            cfg.rootPath = config.rootPath;
        } else {
            cfg.rootPath = "";
        }

        return cfg;

    }

    /**
     * Remove ignored tsc arguments
     * @param args Command line arguments
     */
    function removeTscIgnoredArgs(args: string[]): void {
        let i: number = 0;
        while (i < args.length) {
            for (let o of tscIgnoredCommandLineArguments) {
                if (o.argument === args[i]) {
                    log("Command line argument %s is ignored.", args[i]);
                    args.splice(i, 1);
                    for (let j: number = 0; j < o.arguments; j++) {
                        args.splice(i, 1);
                    }
                    continue;
                }
            }
            i++;
        }
    }

    /**
     * Executes documentation generation with command line arguments passed
     * @param args Command line arguments
     */
    function execCommandLine(args: string[]): ReturnCode {

        atsdocConfig = {};
        atsdocConfig.logToConsole = true;

        let tscArgs: string[] = [];

        removeTscIgnoredArgs(args);

        // parse atsdoc args and filter out tsc args
        let arg: number = 0;
        while (arg < args.length) {

            switch (args[arg]) {

                // atsdoc options
                case "--help":
                    version();
                    usage();
                    return ReturnCode.Ok;
                case "--version":
                    version();
                    return ReturnCode.Ok;
                case "--jsonFile":
                    atsdocConfig.jsonFile = args[arg + 1];
                    arg += 2;
                    break;
                case "--rootPath":
                    atsdocConfig.rootPath = nodepath.resolve(args[arg + 1]);
                    console.log(atsdocConfig.rootPath);
                    arg += 2;
                    break;
                case "--rootNodeName":
                    atsdocConfig.rootNodeName = args[arg + 1];
                    arg += 2;
                    break;
                case "--rootNodeKind":
                    atsdocConfig.rootNodeKind = args[arg + 1];
                    arg += 2;
                    break;

                // the rest will be passed to the tsc

                default:
                    tscArgs.push(args[arg]);
                    arg++;
            }

        }

        // validate tsc args (parsed tsc command line options are stored to tscCommandLineOptions)
        if (tscArgs.length > 0) {
            var rv: number = validateTscCommandlineArgs(tscArgs);
            if (rv !== 0) {
                version();
                usage();
                return rv;
            } else {

                atsdocConfig = normalizeAtsdocConfig(atsdocConfig);

                if (atsdocConfig.jsonFile !== null) {
                    atsdocConfig.logToConsole = true;
                    version();
                } else {
                    atsdocConfig.logToConsole = false;
                }

                return processProgram();

            }
        } else {
            version();
            usage();
            return ReturnCode.MissingTSCParams;
        }
    }

    // exit ATsDoc with a return code
    process.exit(
        execCommandLine(process.argv.splice(2))
    );


}