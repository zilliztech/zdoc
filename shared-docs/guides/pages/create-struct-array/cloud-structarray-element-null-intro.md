## Allow null values in Struct elements

A scalar, vector, or array subfield can allow a null value for that subfield in individual Struct elements (an **element-nullable subfield**). Set `nullable=True` on a scalar or vector subfield. On an array subfield, set `nullable=True` to allow a null inner array and `element_nullable=True` to allow null values inside the inner array. For example, a chunk can have no detected language while its other subfields hold values.
