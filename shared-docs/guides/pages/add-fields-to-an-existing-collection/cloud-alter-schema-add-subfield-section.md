
<a id="add-a-sub-field-to-an-existing-structarray-field--milvus-306"></a>

### Add a sub-field to an existing StructArray field | PUBLIC

Use `add_collection_field()` with the sub-field path as the field name to add a sub-field to a StructArray field that already holds data. This workflow is supported on Dedicated Clusters compatible with Milvus v3.0.x; it is not yet available on On-Demand Clusters. To add a sub-field, do as follows:

1. Name the field with the path `structArrayField[subField]`, such as `chunks[lang]`.

1. Choose a scalar, vector, or scalar array data type supported by StructArray.

1. Set `nullable=True` on the added sub-field. This is required for every added sub-field and is what allows element-level null. On an array sub-field, additionally set `element_nullable=True` to allow null values inside the inner array. The sub-field inherits the row-level `nullable` setting and the `max_capacity` of the StructArray field.

**Example: Add an element-nullable sub-field**

<div class="multipleCode">
    <a href="#python">Python</a>
    <a href="#go">Go</a>
    <a href="#bash">cURL</a>
</div>
```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="{{var.example_endpoint}}")

# highlight-start
client.add_collection_field(
    collection_name="books",
    field_name="chunks[lang]",
    data_type=DataType.VARCHAR,
    max_length=16,
    nullable=True,
)
# highlight-end
```

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
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
err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("books",
        entity.NewField().
                WithName("chunks[lang]").
                WithDataType(entity.FieldTypeVarChar).
                WithMaxLength(16).
                WithNullable(true)))
// highlight-end
if err != nil {
    fmt.Println(err)
    return
}
```

```bash
curl --request POST \
  --url "{{var.example_endpoint}}/v2/vectordb/collections/fields/add" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "books",
    "schema": {
      "fieldName": "chunks[lang]",
      "dataType": "Array",
      "elementDataType": "VarChar",
      "nullable": true,
      "elementNullable": true,
      "elementTypeParams": {"max_length": "16"}
    }
  }'
```

After the sub-field is added, entities that already exist return `NULL` for `chunks[lang]` in each of their Struct elements, and entities whose `chunks` field is `NULL` stay `NULL`. New entities can omit the sub-field or set it to `NULL` in any Struct element.

The following rules apply:

- The added sub-field must be created with `nullable=True`, and an added array sub-field additionally takes `element_nullable=True` to allow null values inside the inner array. It cannot have a default value.

- You cannot bind an index while adding the sub-field. Create the index with a separate `create_index()` call. An added vector sub-field supports element-level metrics only, not `MAX_SIM*`, and the collection must have an index on it before you load the collection with the new sub-field included.

- History segments receive the added sub-field and its index through schema-version compaction. Set `dataCoord.compaction.bumpSchemaVersion.enabled` to `true` (it is `false` by default); otherwise the added sub-field's index does not cover history segments.

- Adding a sub-field to a loaded collection does not release the collection. Queries can return the new sub-field before its index exists.

