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
    field_name="chunks[section]",
    index_name="chunks_section_inverted",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[has_code]",
    index_name="chunks_has_code_inverted",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[quality_score]",
    index_name="chunks_quality_score_sort",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[page]",
    index_name="chunks_page_sort",
    index_type="AUTOINDEX",
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
                IndexParam.builder().fieldName("chunks[section]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_section_inverted").build(),
                IndexParam.builder().fieldName("chunks[has_code]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_has_code_inverted").build(),
                IndexParam.builder().fieldName("chunks[quality_score]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_quality_score_sort").build(),
                IndexParam.builder().fieldName("chunks[page]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_page_sort").build()))
        .build());
```

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[section]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_section_inverted"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[has_code]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_has_code_inverted"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[quality_score]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_quality_score_sort"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[page]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_page_sort"))
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
            IndexParam::new().field_name("chunks[section]").index_name("chunks_section_inverted").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[has_code]").index_name("chunks_has_code_inverted").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[quality_score]").index_name("chunks_quality_score_sort").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[page]").index_name("chunks_page_sort").index_type(IndexType::AutoIndex),
        ])
        .build()?;
client.create_index(request).await?;
```

```cpp
#include <stdexcept>
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::IndexDesc section_index("chunks[section]", "chunks_section_inverted",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc has_code_index("chunks[has_code]", "chunks_has_code_inverted",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc quality_index("chunks[quality_score]", "chunks_quality_score_sort",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc page_index("chunks[page]", "chunks_page_sort",
    milvus::IndexType::AUTOINDEX);

milvus::CreateIndexRequest scalar_request;
scalar_request.WithCollectionName("tech_articles");
scalar_request.WithIndexes({section_index, has_code_index, quality_index, page_index});

status = client->CreateIndex(scalar_request);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

```javascript
await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[section]",
  index_name: "chunks_section_inverted",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[has_code]",
  index_name: "chunks_has_code_inverted",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[quality_score]",
  index_name: "chunks_quality_score_sort",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[page]",
  index_name: "chunks_page_sort",
  index_type: "AUTOINDEX",
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
        new IndexParam("chunks[section]", "chunks_section_inverted", IndexType.AutoIndex),
        new IndexParam("chunks[has_code]", "chunks_has_code_inverted", IndexType.AutoIndex),
        new IndexParam("chunks[quality_score]", "chunks_quality_score_sort", IndexType.AutoIndex),
        new IndexParam("chunks[page]", "chunks_page_sort", IndexType.AutoIndex)
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
        { "fieldName": "chunks[section]", "indexName": "chunks_section_inverted", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[has_code]", "indexName": "chunks_has_code_inverted", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[quality_score]", "indexName": "chunks_quality_score_sort", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[page]", "indexName": "chunks_page_sort", "params": { "index_type": "AUTOINDEX" } }
    ]
}'
```
