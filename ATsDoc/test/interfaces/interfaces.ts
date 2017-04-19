namespace interfaces {

    /**
     * IIndexedSignature short
     * IIndexedSignature long
     */
    export interface IIndexedSignature {
        /**
         * Idx1 sign doc short
         * Idx1 sign doc long
         * @param key param key
         */
        [key: string]: any;
        /**
         * Idx2 sign doc short
         * Idx2 sign doc long
         * @param key param key
         */
        [key: number]: any;
        /**
         * prop a doc short
         * prop a doc long
         */
        a: string;
    }

    /**
     * ICallSignature short
     * ICallSignature long
     */
    export interface ICallSignature {
        /**
         * Call sign 1 doc short
         * Call sign 1 doc long
         * @param a param a
         * @param b param b
         */
        (a: string, b: number): void;
        /**
         * Call sign 2 doc short
         * Call sign 2 doc long
         * @param a param a
         */
        (a: string): number;
    }

    let iis: IIndexedSignature = {
        a: "aaa"
    };

    iis["a"] = "a";
    iis["b"] = "b";
    iis[0] = 1;
    iis.a = "c";

    function icsimpl(a: string, b: number): void;
    function icsimpl(a: string): number;
    function icsimpl(): void | number {
    }

    let ics: ICallSignature = icsimpl;

}
