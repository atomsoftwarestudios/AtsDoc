namespace function_params {

    interface IName {
        name: string;
    }

    class C {
    }

    function fn1(): void {
        // empty
    };

    /**
     * fn2 short
     * fn2 long
     * @param a param a
     * @param b param b
     * @param c param c
     * @param d param d
     * @param e param e
     * @param f param f
     */
    function fn2(a: number, b: string, c: Date, d: IName, e: C, f: typeof C): void {
        // empty
    };

    function fn3(a: number | string | Date | IName | C | typeof C): void {
        // empty
    };

    function fn4(a: any) {
        // empty
    };
}
