```rust
use milvus::v2::prelude::*;

let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(
        FieldSchema::new()
            .name("id")
            .data_type(DataType::Int64)
            .primary_key(true)
            .auto_id(true),
    )
    .add_field(
        FieldSchema::new()
            .name("text")
            .data_type(DataType::VarChar)
            .max_length(1000)
            .enable_analyzer(true) // Whether to enable text analysis for this field
            .enable_match(true), // Whether to enable text match
    )
    .add_field(
        FieldSchema::new()
            .name("embeddings")
            .data_type(DataType::FloatVector)
            .dimension(5),
    );
```
