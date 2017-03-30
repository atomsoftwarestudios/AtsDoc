namespace function_return {

    namespace test {

        export interface Ii1 {
            name: string;
        }

        export interface Ii2 {
            street: string;
        }

        export class C1 {
            name: string;
        }

    }

    import t = test;

    /**
     * Undefined type of return value
     */
    function testfn() {
    }

    /**
     * Void return value
     */
    function testfn1(): void {
    }

    /**
     * Never return value
     */
    function textfn3(): never {
        throw new Error("Never");
    }

    /**
     * Boolean return value
     * @returns boolean value
     */
    function testfn2(): boolean {
        return true;
    }

    /**
     * Number return value
     * @returns number value
     */
    function testfn3(): number {
        return 0;
    }

    /**
     * String return value
     * @returns string value
     */
    function testfn4(): string {
        return "a";
    }

    /**
     * Union bool/string return value
     * @returns union value
     */
    function testfn5(): boolean | string {
        return true;
    }

    /**
     * Union number/string return value
     * @returns union value
     */
    function testfn6(): number | string {
        return "a";
    }

    /**
     * Intersection
     * @returns intersection value
     */
    function testfn7(): test.Ii1 & t.Ii2 {
        return null;
    }

    /**
     * Interfaced object
     * @returns interfaced object
     */
    function testfn8(): test.Ii1 {
        return { name: "a" };
    }

    /**
     * Object of class
     * @returns Object of class
     */
    function testfn9(): test.C1 {
        return { name: "a" };
    }

    /**
     * Intersestion / Union
     * @returns Intersestion / Union
     */    
    function testfn12(): t.Ii1 & t.Ii2 | string {
        return "";
    }

    /**
     * Complex union
     * @returns complex union
     */
    function testfn13(): string | ((a: number) => void) | boolean {

        return (n: number) => {
        }

    }

    /**
     * Complex union 2
     * @returns complex union
     */
    function testfn14(): { name?: string } | boolean {
        return {};
    }

    /**
     * String literal
     * @returns string literal
     */
    function testfn15(): "aaa" | "bbb" {
        return "aaa";
    }

    /**
     * Number literal
     * @returns number literal
     */
    function testfn16(): 1 | 2 {
        return 1;
    }

    /**
     * Boolean literal
     * @returns boolean literal
     */
    function testfn17(): true | false {
        return true;
    }

}