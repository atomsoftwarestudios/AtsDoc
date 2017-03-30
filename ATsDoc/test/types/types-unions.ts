namespace types_unions {

    let bool: true | false;
    let str: "a" | "b";
    let num: 1 | 2;

    let boolstrnum: boolean | string | number;
    let boolstrlitnumlit: boolean | "a" | "b" | 1 | 2;
    let boollitstrlitnumlit: true | false | "a" | "b" | 1 | 2;

}