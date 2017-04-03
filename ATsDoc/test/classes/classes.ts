/**
 * This is a short description of the classes namespace
 * This is a long description of the classes namespace
 */
namespace classes {

    /**
     * This is a short description of the t namespace
     * This is a long description of the t namespace
     */
    namespace t {

       /**
        * This is a short description of the q namespace
        * This is a long description of the q namespace
        */
        export namespace q {

            /**
             * This is a short description of the C class
             * This is a long description of the C class
             */
            export class C {
            }

            /**
             * This is a short description of the IA interface
             * This is a long description of the IA interface
             */
            export interface IA {
            }
        }

    }

    export abstract class Abstr {
    }

    export class A<T> {

        public constructor(h: Abstr) {
            // empty
        }

        private __a: string = "";

        private readonly __b: string = "";

        protected _a: number = 0;

        protected readonly _b: string = "";

        public a: string = "";

        public readonly b: string = "";

        aa: string;

        readonly bb: number;

        /**
         * Get accessor aaa short
         * Get accessor aaa long
         */
        public get aaa(): number { return 1; }

        /**
         * Set accessor aaa short
         * Set accessor aaa long
         * @param value value to be set
         */
        public set aaa(value: number) {
            // empty
        }

        public static aaaa;

        /**
         * m1 short
         * m1 long
         * @param num Param doc
         * @returns void
         */
        m1(num: string): void {
            // empty
        }

        /**
         * m2 short
         * m2 long
         * @param num Param doc
         * @returns converted number to string
         */
        public m2(num: string): string {
            return "";
        }

        /**
         * m3 short
         * m3 long
         * @param num Param doc
         * @returns random string
         */
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
