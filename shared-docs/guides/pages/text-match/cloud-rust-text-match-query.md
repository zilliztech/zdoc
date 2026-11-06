```rust
use milvus::v2::prelude::*;

let uri = "YOUR_CLUSTER_ENDPOINT";
let token = "YOUR_CLUSTER_TOKEN";

let client = ClientV2::new(
    &ConnectConfig::new().uri(uri).token(token),
)
.await?;

// Match entities with both `keyword1` and `keyword2`
let filter = "TEXT_MATCH(text, 'keyword1') and TEXT_MATCH(text, 'keyword2')";

let result = client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter(filter)
            .output_fields(["id", "text"])
            .build()?,
    )
    .await?;
```
