namespace function_params {

    interface IName {
        name: string;
    }

    class C {
    }

    function fn1(): void { };

    function fn2(a: number, b: string, c: Date, d: IName, e: C, f: typeof C): void { };

    function fn3(a: number | string | Date | IName | C | typeof C): void { };

    function fn4(a: any) { };

}