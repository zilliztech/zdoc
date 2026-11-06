```rust
use milvus::v2::prelude::*;
use serde_json::json;

client.insert(
    InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            json!({"text": "information retrieval is a field of study."}),
            json!({"text": "information retrieval focuses on finding relevant information in large datasets."}),
            json!({"text": "data mining and information retrieval overlap in research."}),
        ])
        .build()?,
)
.await?;
```
