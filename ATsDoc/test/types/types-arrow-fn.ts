namespace types_arrowfn {

    export interface IName {
        name: string;
    }

    export class C {
    }

    export let af1: (a: number, b: number) => number;

    let af2: (n: IName, b: string) => undefined;

    let af3: (f: (a: number | boolean) => null) => string;

    let af4: (f: (a: number | false | true) => null) => string = null;

    let af5: <K, I>(s: K, cb: I) => null;

    let af6: <T extends IName>(s: T) => T;

    let af7: <K, I extends keyof K>(s: K, cb: I) => null;

    let af8: <T>(t: { new (): T; }) => T;

    let af9: (obj: IName) => typeof C;

    let af10: (a: typeof C) => void;
}
