```rust
use milvus::v2::prelude::*;

let res = client.search(
    SearchRequest::builder()
        .collection_name("my_collection")
        .vector_field("sparse")
        .vectors(SearchVectors::EmbeddedText(vec!["whats the focus of information retrieval?".to_string()]))
        .metric_type(MetricType::Bm25)
        .limit(3)
        .output_fields(["text"])
        .build()?,
)
.await?;

println!("{:?}", res.results());
```
