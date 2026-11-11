#### Access array subfields by position

A positional path can also reference a scalar `ARRAY` subfield. `chunks[0][tags]` is the inner array of the first Struct element. It supports `==` and `!=` with an array literal, `array_contains`, `array_contains_any`, `array_contains_all`, and `array_length`. Comparison operators, `in`, `like`, and arithmetic on it are rejected.
