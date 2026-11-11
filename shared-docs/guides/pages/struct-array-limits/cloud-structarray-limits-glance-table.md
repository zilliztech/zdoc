| Area | Limit |
| --- | --- |
| Schema shape | A Struct can be used only as the element type of an Array field. Struct is not supported as a top-level collection field. |
| Subfield schema | All Struct elements in the same StructArray field share one predefined Struct schema. |
| Nested subfields | a Struct can contain scalar `ARRAY` subfields with one nesting level. Nested `Struct`, `ArrayOfStruct`, and JSON subfields are not supported in any version. |
| Capacity | `max_capacity` is required and limits how many Struct elements one entity can store in the StructArray field. |
| Subfield changes | you can add an element-nullable subfield to an existing StructArray field or drop a subfield from it. |
| Subfield path | Use `structArray[subfield]` paths, such as `chunks[emb]`, for indexes, search targets, output fields, and filters. Do not use `chunks.emb`. |
| Insert shape | Insert a StructArray field as an array of objects. Do not use path syntax inside insert payloads. |
| Vector indexes | A vector field or vector subfield accepts only one index. Use separate vector subfields for EmbeddingList search and element-level search. |
| Functions | Field functions are not supported for fields or subfields inside a StructArray field. |
| Nullable fields | Nullable StructArray fields are version-gated. Row-level null applies to the whole StructArray field. A subfield can additionally allow a null value in an individual Struct element: `nullable=True` on a scalar or vector subfield, `element_nullable=True` on an array subfield. A Struct element itself cannot be null. |
| Dynamic add field | Adding a StructArray field to an existing collection is version-gated and requires the added field to be nullable. |
