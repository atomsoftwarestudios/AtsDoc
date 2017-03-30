// *********************************************************
// Namespaces and modules
// *********************************************************

/**
 * namespace nsa {
 */
namespace nsa {
}

module moda {
    /**
    * Internal module
    */
    export module modb {
    }
}

/**
 * Module with exported module
 */
module modc {
    export module moda {
    }
}

// *********************************************************
// Variable and constant declarations
// *********************************************************

/**
 * var a;
 */
var a;


/**
 * var anum: number;
 */
var anum: number;


var a1, a2, a3;


/**
 * let b;
 */
let b;

let b1, b2, b3;


/**
 * let bstr: string;
 */
let bstr: string;

let c1: string, c2: string, c3: string = "";

/**
 * const ca = 0;
 */
const ca = 0;


/**
 * const castr: string = "castr";
 */
const castr: string = "castr";


const cafn: Function = function () {
}

// *********************************************************
// Enumerations
// *********************************************************

/**
 * Enum1
 */
enum Enum1 {
    /** Enum1Val1 */
    Enum1Val1,
    /** Enum1Val2 */
    Enum2Val2
}


// *********************************************************
// Function declarations and overloading
// *********************************************************


/**
 * Function with undefined type result
 */
function fn1() {
}


/**
 * Function
 */
function fn2(): void {
}


/**
 * Function with return value
 */
function fn3(): string {
    return "";
}


/**
 * Function with two parameters returning array of numbers
 * @param p1
 * @param p2
 */
function fn4(p1: number, p2: string[]): number[] {
    return [];
}


/**
 * Function with optional parameters
 * @param p1
 * @param p2
 */
function fn5(p1: number | string | undefined): void {
}


/**
 * Function returning value of variable type
 */
function fn6(): number | string | undefined {
    return "";
}


/**
 * overloaded function fno1(p1: string): void;
 * @param p1 param1
 */
function fno1(p1: string): void;
/**
 * overloaded function fno1(p1: number): void;
 * @param p1 param1
 */
function fno1(p1: number): void;
/**
 * overloaded function fno1(p1: Function, ...p2: number[]): void;
 * @param p1 param1
 * @param p2 param2
 */
function fno1(p1: Function, ...p2: number[]): void;
/**
 * overloaded function fno1(): void {
 */
function fno1(): void {
}


/**
 * overloaded function fno2(): void | string;
 */
function fno2(): void | string;
/**
 * overloaded function fno2(p1: number): void;
 * @param p1 param1
 */
function fno2(p1: number): void;
/**
 * overloaded function fno2(p1: number, ...p2: number[]): string;
 * @param p1 param1
 * @param p2 param2
 */
function fno2(p1: number, ...p2: number[]): string;
/**
 * overloaded function fno2(): void | string {
 */
function fno2(): void | string {
}

// *********************************************************
// Interfaces
// *********************************************************

/**
 * interface IInt1
 */
interface IInt1 {
    m1: number;
    m2: string;
}


/**
 * interface IInt2 with optional members
 */
interface IInt2 {
    m1?: number;
    m2: string;
}

/**
 * interface IInt3 extends IInt2 with optional members
 */
interface IInt3 extends IInt2 {
    m3: number;
    m4?: string;
}

/**
 * function interface
 */
interface IInt4 {
    (p1: number, p2?: number | string, ...p3: any[]): number | string[];
}

/**
 * indexed interface
 */
interface IInt5 {
    [index: string]: number;
}

// *********************************************************
// Classes
// *********************************************************

class A {

    private __priv: string;

    private static __privstat;


    protected _prot: string;

    protected static _protstat: string


    public pub: string;

    public static pubstat: number;


    private __privm(): void {
    }

    private static __privstatm(): void {
    }


    protected _protm(): void {
    }

    protected static _protstatm(): void {
    }


    public pubm(): void {
    }


    public static pubstatm(): void {
    }


    private set __privset(value: string) { }

    private static set __privstatet(value: string) { }


    private get __privget(): string { return ""; }

    private static get __privstatget(): string { return ""; }


    protected set _protset(value: string) { }

    protected static set _protstatset(value: string) { }


    protected get _protget(): string { return ""; }

    protected static get _protstatget(): string { return ""; }


    public set pubset(value: string) { }

    public get pubget(): string { return ""; }


}


class B implements IInt1 {

    public m1: number;
    public m2: string;

}

class C {
    public c: string;
}

class D extends C {
    public d: number;
}

class E extends D implements IInt1, IInt2 {

    public m1: number;
    public m2: string;

}

if (1 === 1) {
}
