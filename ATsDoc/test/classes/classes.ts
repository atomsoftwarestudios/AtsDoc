namespace classes {

    namespace t {

        export namespace q {

            export class C {
            }

            export interface IA {
            }
        }

    }


    export abstract class abstr {
    }

    export class Hovno<T> {

        public constructor(h: abstr) {
        }

        private __a: string = ""

        private readonly __b: string = "";

        protected _a: number = 0;

        protected readonly _b: string = "";

        public a: string = "";

        public readonly b: string = "";

        aa: string;

        readonly bb: number;

        public get aaa(): number { return 1; }

        public set aaa(value: number) { }

        public static aaaa;

        m1(num: string): void {
        }

        public m2(num: string): string {
            return "";
        }

        public static m3(num: string): string {
            return "";
        }
    }

    interface IA {
        firstName?: string;
    }

    interface IB extends IA {
        lastName?: string;
    }

    class C implements IB {
    }

    import qq = t.q;

    class D extends qq.C  implements qq.IA, IA, IB {
    }


}