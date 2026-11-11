| Rule | Explanation |
| --- | --- |
| Use an array of objects for a StructArray field. | The value of `chunks` is a list, and each item in the list is a Struct element. |
| Use subfield names inside each Struct element. | Insert `{"text": "...", "emb": [...]}` inside `chunks`, not `{"chunks[text]": "..."}`. |
| Match the Struct schema. | Each Struct element must use the subfields defined in the Struct schema. An element-nullable subfield can be omitted or set to `None` in a Struct element. |
| Match vector dimensions. | Vector values must match the `dim` configured for their vector subfields. |
| Respect `max_capacity`. | The number of Struct elements in one entity must not exceed the `max_capacity` of the StructArray field. |
| Use separate vector subfields for separate search modes. | If both EmbeddingList search and element-level search are required, write vector values to both vector subfields. |
| Use `null` only when the field is nullable. | Non-nullable StructArray fields require valid StructArray values. |
