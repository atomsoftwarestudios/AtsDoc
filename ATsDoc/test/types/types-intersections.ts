namespace types_intersections {

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

    let its1: test.Ii1 & test.Ii2;
    let its2: t.Ii1 & t.Ii2;

}