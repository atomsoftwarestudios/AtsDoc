namespace types_object_interfaces {

    namespace test {

        export interface Ii1 {
            name: string;
        }

        export interface Ii2 {
            street: string;
        }

        export interface Ii3 {
            (a: string, b?: number, c?: Ii1 | Ii2): void;
        }

        export interface Ii4<T> {
            (a: T): T;
        }

    }

    import t = test;

    let i1: test.Ii1;
    let i2: t.Ii2;

}
