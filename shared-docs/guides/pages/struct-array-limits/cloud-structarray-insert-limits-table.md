| Limit | Details |
| --- | --- |
| Payload shape | Insert the StructArray field as an array of Struct objects, such as `chunks: [{"text": "...", "emb": [...]}]`. |
| Subfield names | Inside each Struct object, use subfield names such as `text` and `emb`, not paths such as `chunks[text]`. |
| Schema alignment | Each Struct element must match the Struct schema. An element-nullable subfield can be omitted or set to `null` in a Struct element. |
| Capacity | The number of Struct elements in one entity must not exceed `max_capacity`. |
| Vector dimensions | Vector values must match the `dim` configured for their vector subfields. |
| Search-mode duplication | If you need both EmbeddingList search and element-level search, write vectors to two separate vector subfields. |
