```rust
use milvus::v2::prelude::*;

// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
let request = SearchRequest::builder()
    .collection_name("my_collection")
    .vector_field("sparse")
    .vectors(SearchVectors::EmbeddedText(vec!["query text".to_string()]))
    .limit(3)
    .output_fields(["text"])
    .build()?;
```
