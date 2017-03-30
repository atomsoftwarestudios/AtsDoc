namespace function_default_params {

    class C {
    }

    function fn1(a: C = new C()) {}

    function fn2(a: number = 1) { };

    function fn3(a = 1) { };

}
