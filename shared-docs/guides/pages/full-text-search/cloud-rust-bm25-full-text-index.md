```rust
use std::collections::HashMap;

let index_params = IndexParam::new()
    .field_name("sparse")
    .index_type(IndexType::SparseInvertedIndex)
    .metric_type(MetricType::Bm25)
    .extra_params(HashMap::from([
        ("inverted_index_algo".into(), "DAAT_MAXSCORE".into()),
        ("bm25_k1".into(), "1.2".into()),
        ("bm25_b".into(), "0.75".into()),
    ]));
```
