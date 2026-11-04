```rust
use milvus::v2::prelude::*;

let analyzer_params = serde_json::json!({"type": "english"});

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
            .max_length(200)
            .enable_analyzer(true)
            .analyzer_params(analyzer_params)
            .enable_match(true),
    )
    .add_field(
        FieldSchema::new()
            .name("embeddings")
            .data_type(DataType::FloatVector)
            .dimension(5),
    );
```
