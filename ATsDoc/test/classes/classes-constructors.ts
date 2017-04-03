/**
 * This is a short description of the classes namespace
 * This is a long description of the classes namespace
 */
namespace classes_constructors {

    /**
     * Class A short
     * <i>Class A</i> long
     */
    class A {

        /**
         * Constructor a number short
         * Constructor a number long
         * @param a a number
         */
        constructor(a: number);

        /**
         * Constructor a string short
         * Constructor a string long
         * @param a a string
         */
        constructor(a: string);

        /**
         * Constructor short
         * Constructor long
         */
        constructor() {
        }

    }

    /**
     * Class B short
     * <b>Class B</b> long
     */
    class B {

        /**
         * Constructor short
         * Constructor long
         * @param a param a
         * param a long
         * @param b param b
         * param b long
         * @param c param c
         * param c long
         * @param d param d
         * param d long
         */
        constructor(a: number, b: A, c?: Date, ...d: any[]) {
        }
    }

}
