namespace function_default_params {

    class C {
    }

    /**
     * fn1 short
     * fn1 long
     * @param a param a with default value
     */
    function fn1(a: C = new C()) {
        // empty
    }

    /**
     * fn2 short
     * fn2 long
     * @param a param a with default value
     */
    function fn2(a: number = 1) {
        // empty
    };

    /**
     * fn3 short
     * fn3 long
     * @param a param a with default value
     */
    function fn3(a = 1) {
        // empty
    };

}
