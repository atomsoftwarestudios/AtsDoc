/**
 * namespace nsa
 */
namespace nsa {

    "use strict";

    /**
     * Class C
     */
    export class C {
    }

    export class D {
    }

    /**
     * Test jsDoc
     */
    /**
     * function fn(a: string, b: number): void {
     * This is function long text decsription
     * split over multiple lines with @see {@link https://github.com|GitHub} see tag
     * @param a param a
     * @param b param b
     */
    export function fn(a: string, b: number): void;

    /**
     * function fn(a: string): void {
     * @param a
     */
    export function fn(a: string): D {
        return new D();
    }

    export let a: any = { a: 1, b: 2, c: 3 };
    fn1(a, a, "c");

    /**
     * @param a param a
     * @param b param b
     * @param c param c
     * @param T type param T
     * @param U type param U
     * @param T type param V
     */
    export function fn1<T, U extends number, V extends keyof T>(a: T, b: U, c: V): V {
        return null;
    }
}

/**
 * namespace nsa.nsb
 */
namespace nsa.nsb {

    "use strict";

    export let a: number = 0;

    /**
     * Class D
     */
    export class D {
    }
}

import n = nsa.nsb;

let q: n.D = new n.D();

nsa.a = 1;
nsa.nsb.a = 1;

let d: nsa.nsb.D = new nsa.nsb.D();
