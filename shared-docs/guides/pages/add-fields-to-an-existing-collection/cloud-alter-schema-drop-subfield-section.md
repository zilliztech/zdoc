
<a id="drop-a-structarray-sub-field--milvus-306"></a>

### Drop a StructArray sub-field | PUBLIC

On Dedicated Clusters compatible with Milvus v3.0.x, you can drop an individual sub-field from a StructArray field with `drop_collection_field()` by passing the sub-field path; this capability is not yet available on On-Demand Clusters. {{var.product_name}} removes the sub-field from the schema together with its index; its data is reclaimed as described in [When is storage space reclaimed after dropping a field?](#When-is-storage-space-reclaimed-after-dropping-a-field).

The following example assumes that `chunks` is a StructArray field in `my_collection` with a `lang` sub-field, and drops only that sub-field.

<div class="multipleCode">
    <a href="#python">Python</a>
    <a href="#go">Go</a>
    <a href="#bash">cURL</a>
</div>
```python
from pymilvus import MilvusClient

client = MilvusClient(uri="{{var.example_endpoint}}")

# highlight-start
client.drop_collection_field(
    collection_name="my_collection",
    field_name="chunks[lang]",
)
# highlight-end
```

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "{{var.example_endpoint}}",
})
if err != nil {
    fmt.Println(err)
    return
}

// highlight-start
err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("my_collection", "chunks[lang]"))
// highlight-end
if err != nil {
    fmt.Println(err)
    return
}
```

```bash
curl --request POST \
  --url "{{var.example_endpoint}}/v2/vectordb/collections/fields/drop" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "my_collection",
    "fieldName": "chunks[lang]"
  }'
```

You cannot drop the last sub-field of a StructArray field, the last vector field of the collection, or a sub-field used by a Function. To remove the whole StructArray field, drop it by name, as shown in the previous example. After a sub-field is dropped, insert and upsert requests that still carry the sub-field are rejected.

Dropping a sub-field while queries are still running against it can fail transiently: query plans that were built on the older schema keep executing for a short time and fail with an internal error. Finish queries against a sub-field before dropping it, or retry the drop after the running queries finish.

