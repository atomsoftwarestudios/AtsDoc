namespace function_generics {

    interface IName {
        name: string;
    }

    class C {
    }

    declare function fn1<K, I>(s: K, cb: I): K;
    function fn1_2<K, I>(s: K, cb: I): K { return null };
    let j: <K, I>(s: K, cb: I) => K;

    declare function fn2<T extends IName>(s: T): T;

    declare function fn3<K, I extends keyof K>(s: K, cb: I): void;

    declare function fn4<T>(t: { new (): T; }): T;


    /**
     * mother of all functions
     * @param a param a
     * @param b param b
     * @param c param c
     * @param T type param T
     * @param U type param U
     * @param T type param V
     */
    export function fn5<T, U extends number, V extends keyof T>(a: T, b: U, c: V): V {
        return null;
    }
}