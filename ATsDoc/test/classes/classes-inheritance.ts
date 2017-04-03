/**
 * This is a short description of the classes_inheritance namespace
 * This is a long description of the classes_inheritance namespace
 */
namespace classes_inheritance {

   /**
    * This is a short description of the test namespace
    * This is a long description of the test namespace
    */
    namespace test {

        /**
         * This is a short description of the IA interface
         * This is a long description of the IA interface
         */
        export interface IA {
        }

        /**
         * This is a short description of the IB interface
         * This is a long description of the IB interface
         */
        export interface IB {
        }

        /**
         * This is a short description of the A class
         * This is a long description of the A class
         */
        export class A {
        }

    }

    import t = test;

    /**
     * This is a short description of the B class
     * This is a long description of the B class
     */
    class B extends test.A {
    }

    /**
     * This is a short description of the C class
     * This is a long description of the C class
     */
    class C extends B {
    }

    /**
     * This is a short description of the D class
     * This is a long description of the D class
     */
    class D extends t.A implements t.IA, t.IB {
    }

    /**
     * This is a short description of the E class
     * This is a long description of the E class
     */
    class E {
    }

    /**
     * This is a short description of the F class
     * This is a long description of the F class
     */
    class F extends E {
    }

}
