The following example creates two vector indexes: one with `MAX_SIM_COSINE` for EmbeddingList search, and one with `COSINE` for element-level search. Use `AUTOINDEX` for StructArray vector subfields.

<div class="multipleCode">
    <a href="#python">Python</a>
    <a href="#java">Java</a>
    <a href="#go">Go</a>
    <a href="#rust">Rust</a>
    <a href="#cpp">C++</a>
    <a href="#javascript">NodeJS</a>
    <a href="#csharp">C#</a>
    <a href="#bash">cURL</a>
</div>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[emb_list_vector]",
    index_name="chunks_emb_list_max_sim",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
)

index_params.add_index(
    field_name="chunks[emb]",
    index_name="chunks_emb_cosine",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Arrays;

client.createIndex(CreateIndexReq.builder()
        .collectionName("tech_articles")
        .indexParams(Arrays.asList(
                IndexParam.builder().fieldName("chunks[emb_list_vector]")
                        .indexType(IndexParam.IndexType.AUTOINDEX)
                        .metricType(IndexParam.MetricType.MAX_SIM_COSINE)
                        .indexName("chunks_emb_list_max_sim")
                        .build(),
                IndexParam.builder().fieldName("chunks[emb]")
                        .indexType(IndexParam.IndexType.AUTOINDEX)
                        .metricType(IndexParam.MetricType.COSINE)
                        .indexName("chunks_emb_cosine")
                        .build()))
        .build());
```

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[emb_list_vector]", index.NewAutoIndex(entity.MaxSimCosine)).WithIndexName("chunks_emb_list_max_sim"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[emb]", index.NewAutoIndex(entity.COSINE)).WithIndexName("chunks_emb_cosine"))
if err != nil {
    fmt.Println(err.Error())
    return
}
```

```rust
use milvus::v2::prelude::*;

    let request = CreateIndexRequest::builder()
        .collection_name("tech_articles")
        .index_params(vec![
            IndexParam::new().field_name("chunks[emb_list_vector]")
                .index_name("chunks_emb_list_max_sim")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::MaxSimCosine),
            IndexParam::new().field_name("chunks[emb]")
                .index_name("chunks_emb_cosine")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::Cosine),
        ])
        .build()?;
    client.create_index(request).await?;
```

```cpp
#include <stdexcept>
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::IndexDesc emb_list_index("chunks[emb_list_vector]", "chunks_emb_list_max_sim",
    milvus::IndexType::AUTOINDEX, milvus::MetricType::MAX_SIM_COSINE);
milvus::IndexDesc emb_index("chunks[emb]", "chunks_emb_cosine",
    milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);

milvus::CreateIndexRequest create_request;
create_request.WithCollectionName("tech_articles");
create_request.WithIndexes({emb_list_index, emb_index});

status = client->CreateIndex(create_request);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

```javascript
await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[emb_list_vector]",
  index_name: "chunks_emb_list_max_sim",
  index_type: "AUTOINDEX",
  metric_type: "MAX_SIM_COSINE",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[emb]",
  index_name: "chunks_emb_cosine",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});
```

```csharp
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "tech_articles",
    Indexes = new[]
    {
        new IndexParam("chunks[emb_list_vector]", "chunks_emb_list_max_sim", IndexType.AutoIndex, MetricType.MaxSimCosine),
        new IndexParam("chunks[emb]", "chunks_emb_cosine", IndexType.AutoIndex, MetricType.Cosine)
    }
});
```

```bash
curl --request POST \
--url "{{var.example_endpoint}}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer {{var.example_token}}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "indexParams": [
        {
            "fieldName": "chunks[emb_list_vector]",
            "indexName": "chunks_emb_list_max_sim",
            "metricType": "MAX_SIM_COSINE",
            "params": { "index_type": "AUTOINDEX" }
        },
        {
            "fieldName": "chunks[emb]",
            "indexName": "chunks_emb_cosine",
            "metricType": "COSINE",
            "params": { "index_type": "AUTOINDEX" }
        }
    ]
}'
```

<div class="alert note">

Do not create both index families on the same vector subfield. Use separate vector subfields for the two search modes.

</div>
