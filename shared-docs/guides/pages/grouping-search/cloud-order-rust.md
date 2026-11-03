```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("{{var.example_endpoint}}").token("{{var.example_token}}");
let client = ClientV2::new(&config).await?;

// Prerequisite: client is connected to the project endpoint;
// cluster_id identifies the on-demand cluster containing product_catalog.
let cluster_id = "YOUR_CLUSTER_ID";
let session = client.session(cluster_id)?;

let query_vectors = vec![
    vec![0.14529211512077012, 0.9147257273453546, 0.7965055218724449, 0.7009258593102812, 0.5605206522382088],
];

let res = session.search(SearchRequest::builder()
    .collection_name("product_catalog")
    .vector_field("embedding")
    .vectors(SearchVectors::Float(query_vectors))
    .limit(20)
    .group_by_field("category")
    .group_size(3)
    .strict_group_size(true)
    .output_fields(["category", "price", "rating"])
    .order_by_fields([OrderByField::new()
        .field_name("price")
        .direction(AggDirection::Asc)])
    .build()?)
    .await?;

for result in res.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}
```
