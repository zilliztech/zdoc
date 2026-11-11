## Add a scalar array subfield

A Struct subfield can be a scalar `ARRAY`. Each Struct element then holds one inner array, such as a list of tags for each chunk. Define the subfield with `DataType.ARRAY`, a scalar `element_type`, and a `max_capacity` for the inner array.
