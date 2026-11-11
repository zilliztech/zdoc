| Limit | Details |
| --- | --- |
| Struct is not a top-level field type. | Create a StructArray field as `datatype=DataType.ARRAY` with `element_type=DataType.STRUCT` and a `struct_schema`. |
| All elements share one schema. | Every Struct element in a StructArray field follows the same subfield list and subfield data types. |
| `max_capacity` is required. | The number of Struct elements in one entity must not exceed the `max_capacity` configured for the StructArray field. |
| Scalar `ARRAY` subfields have per-subfield `max_capacity`. | A scalar `ARRAY` subfield declares a `max_capacity` for its inner array, and Zilliz Cloud rejects a Struct element whose inner array exceeds that subfield's declared capacity. Values do not need to match across subfields. The value must be greater than 0 and must not exceed `proxy.maxArrayCapacity`, which defaults to 4096. |
| Subfields can evolve. | Add an element-nullable subfield, or drop a subfield by its path, such as `chunks[lang]`. You cannot drop the last subfield of a StructArray field, the last vector field of the collection, or a subfield used by a Function. |
| Nested Struct is not supported. | A Struct cannot contain nested `Struct`, `ArrayOfStruct`, or JSON subfields. A Struct can contain scalar `ARRAY` subfields with one nesting level. An `ARRAY` subfield cannot hold vectors. |
| Functions are not supported inside StructArray. | Do not define field functions for StructArray fields or their subfields. |
| Field properties are limited on StructArray fields. | `alter_collection_field()` on a StructArray field or on a subfield path accepts only `mmap.enabled`, `field.description`, and `warmup`. Other properties, such as `max_capacity` and `max_length`, are rejected. |
| Text analysis is not supported on subfields. | Setting `enable_match` or `enable_analyzer` on a Struct subfield is rejected. Text indexes are built only for top-level fields. |
