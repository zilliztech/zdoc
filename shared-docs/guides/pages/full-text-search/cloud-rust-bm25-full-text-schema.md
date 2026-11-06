```rust
use milvus::v2::prelude::*;

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(true))
    .add_field(FieldSchema::new().name("text").data_type(DataType::VarChar).max_length(1000).enable_analyzer(true))
    .add_field(FieldSchema::new().name("sparse").data_type(DataType::SparseFloatVector));
```
