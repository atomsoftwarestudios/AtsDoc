namespace types_enums {

    enum Enum1 { R, G, B };
    enum Enum2 { R = 5, G, B };

    /** Enum 3 */
    enum Enum3 {
        /**
         * A = 1,
         * This is a long A1 comment
         */
        A = 1,
        /** B = 2, */
        B = 2,
        /** C = 4, */
        C = 4,
        /** D = 8 */
        D = 8
    }

    enum Enum4 {
        A = 1 << 5
    }

}
