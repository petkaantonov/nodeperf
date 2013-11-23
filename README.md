    $ nodex64 ./src/run.js test.js
    Found 3 issues.

    Critical (2):

        - Function `doPhase` was hard deoptimized 11 times:
            1. An assumption failed: Expected a value not to be an integer. (check-non-smi) At bailout position 2
            2. An assumption failed: Expected a value to be an integer. (check-smi) At bailout position 4
            3. An assumption failed: Expected a value to be an integer. (check-smi) At bailout position 2

        - Function `doPhase` cannot be optimized because it has been reoptimized too many times.

    High (1):

        - Function `THISISTHEFUNCTION` was hard deoptimized 4 times:
            1. An assumption failed: Expected a value not to be an integer. (check-non-smi) At bailout position 14
            2. An assumption failed: Expected integer division operation not to be passed a 0 dividend, negative zero, not to overflow signed int32 range or have a non-zero remainder. (div-i) At bailout position 10
            3. An assumption failed: Expected an object to have a certain hidden class. (check-maps) At bailout position 8
            4. An assumption failed: Expected numeric property access not to be made out of bounds. (bounds-check) At bailout position 1


    Medium (0):


    Low (0):

