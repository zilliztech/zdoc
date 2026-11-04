```rust
use milvus::v2::prelude::*;

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .index_param(index_params)
        .build()?,
)
.await?;

client.load_collection(LoadCollectionRequest::builder().collection_name("my_collection").build()?).await?;
```
