namespace types_object_classes {

    namespace test {

        export interface Ii1 {
            name: string;
        }

        export interface Ii2 {
            street: string;
        }

        export class C1 {
            public name: string;
        }

    }

    import t = test;

    let class1: test.C1;
    let class2: t.C1;

}