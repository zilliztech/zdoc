```rust
use milvus::v2::prelude::*;

let uri = "YOUR_CLUSTER_ENDPOINT";
let token = "YOUR_CLUSTER_TOKEN";

let client = ClientV2::new(
    &ConnectConfig::new().uri(uri).token(token),
)
.await?;

// Match entities with `keyword1` or `keyword2`
let filter = "TEXT_MATCH(text, 'keyword1 keyword2')";

// Assuming 'embeddings' is the vector field and 'text' is the VARCHAR field
let query_vector = vec![0.19886812562848388f32, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104];

let result = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection") // Your collection name
            .vector_field("embeddings") // Vector field name
            .vectors(SearchVectors::Float(vec![query_vector])) // Query vector
            .filter(filter)
            .output_fields(["id", "text"]) // Fields to return
            .limit(10) // Max. number of results to return
            .build()?,
    )
    .await?;
```
