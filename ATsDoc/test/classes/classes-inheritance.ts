namespace classes_inheritance {

    namespace test {

        export interface IA {
        }

        export interface IB {
        }

        export class A {
        }

    }

    import t = test;

    class B {
    }

    /*class C extends t.A implements t.IA, t.IB {
    }*/

    class C extends B {
    }

}