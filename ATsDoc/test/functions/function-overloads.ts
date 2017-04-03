namespace function_overloads {

    /**
     * Short (a, b)
     * Long (a, b)
     * @param a param a (a, b)
     * @param b param b (a, b)
     */
    function fn(a: string, b: number): void;

    /**
     * Short (a)
     * Long (a)
     * @param a param a (a)
     */
    function fn(a: string): void;

    /**
     * Short ()
     * Long ()
     */
    function fn(): void {
        // empty
    }

}
