(People who see this, `nodex64` are debug binaries for node which you need to build yourself. Debug build is required. I will add more elaborate instructions later).

Example:

    $ nodex64 ./src/run.js test.js
    In total 46 (8 unique) optimizations were done taking 0.74 seconds of compiler time.

    Found 7 issues.

    Critical (3):

        - Function `doPhase` was hard deoptimized 11 times:
            1. At bailout position 2 an assumption failed: Expected a value not to be an integer. (check-non-smi)
            2. At bailout position 4 an assumption failed: Expected a value to be an integer. (check-smi)
            3. At bailout position 2 an assumption failed: Expected a value to be an integer. (check-smi)

        - Function `disabled` cannot be optimized because it contains a switch-statement that has case clauses that are either not integer literals or string literals
        - Function `doPhase` cannot be optimized because it has been reoptimized too many times.

    High (2):

        - Function `THISISTHEFUNCTION` was hard deoptimized 4 times:
            1. At bailout position 14 an assumption failed: Expected a value not to be an integer. (check-non-smi)
            2. At bailout position 10 an assumption failed: Expected integer division operation not to be passed a 0 dividend, negative zero, not to overflow signed int32 range or have a non-zero remainder. (div-i)
            3. At bailout position 8 an assumption failed: Expected an object to have a certain hidden class. (check-maps)
            4. At bailout position 1 an assumption failed: Expected numeric property access not to be made out of bounds. (bounds-check)

        - The small function `noInline2` when called from the function `MissingInlineOpportunities` cannot be inlined because the former creates closures.

    Medium (2):

        - The function `[anonymous]` when called from the function `MissingInlineOpportunities` cannot be inlined because they do not share the same scope.
        - The function `[anonymous]` when called from the function `[anonymous]` cannot be inlined because they do not share the same scope.

    Low (0):


