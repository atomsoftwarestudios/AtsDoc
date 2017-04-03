namespace function_this_param {

    /**
     * @param this
     * @param b
     */
    function fn1(this: void, b: string): void {
        // empty
    };

    /**
     * @param this
     */
    function fn2(this: string) {
        // empty
    };
}
