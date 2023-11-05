# CreateCollection()

Creates a collection with a specified schema.

```go
client.CreateCollection(ctx, collSchema, shardNum, opts)
```

## Examples

```go
var (
        collectionName = "book"
    )
schema := &entity.Schema{
  CollectionName: collectionName,
  Description:    "Test book search",
  Fields: []*entity.Field{
    {
      Name:       "book_id",
      DataType:   entity.FieldTypeInt64,
      PrimaryKey: true,
      AutoID:     false,
    },
    {
      Name:       "word_count",
      DataType:   entity.FieldTypeInt64,
      PrimaryKey: false,
      AutoID:     false,
    },
    {
      Name:     "book_intro",
      DataType: entity.FieldTypeFloatVector,
      TypeParams: map[string]string{
          "dim": "2",
      },
    },
  },
}
err = client.CreateCollection(
    context.Background(),
    schema,
    2,
)
if err != nil {
    log.Fatal("failed to create collection:", err.Error())
}
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collSchema` | Schema of the collection to create. | Pointer to a Schema object that specifies the schema of the collection.|
| `shardNum` | Shard number of the collection to create. | INT32 |
| `opts` | Additional options for creating the collection. As to this method, you can set the consistency level of the collection to be created. | ...CreateCollectionOption |

## Schema

A schema specifies the features of the collection to create and the fields within the collection.

### Collection schema

A collection schema is the logical definition of a collection.

| Parameter |   Description |  Type |
| --------- | ------ | ---------- |
| `Collection Name` | Name of the collection to create. | String |
| `Description` | Description of the collection to create. | String |
| `AutoID` | Automatically assigns IDs to entities in the collection if it is set to `true`. | Boolean |
| `Fields` | Defines the fields in the collection.  | See [Field Schema of Milvus](https://github.com/milvus-io/milvus-sdk-go/blob/7410632233597d4af58df727682ffb29f1d1d51d/entity/schema.go#L54-L63) for more information. |

### Field schema

A field schema is the logical definition of a field.

| Parameter  |   Description                                  |  Type        |
| ---------- | ---------------------------------------------- | ------------ |
|  `ID`      | Field ID generated when collection is created. | int64        |
| `Name`     | Name of the field.                             | int64        |
| `PrimaryKey` | Switch value of primary key enablement.      | Boolean      |
| `AutoID`   | Switch value of auto-generated ID enablement.  | Boolean |
| `Description` | Description of the field.                   | String       |
| `DataType` | Data type of the field. | See [FieldType](https://github.com/milvus-io/milvus-sdk-go/blob/9a7ab65299b4281cc24ad9da7834f6e25866f435/entity/schema.go#L116) for more information. |
| `TypeParams` | Type parameters for the field.               | Map of key string value string |
| `IndexParams` | Index parameters for the field.             | Map of key string value string |

## Raises

`ErrClientNotReady`: Error if the client is not connected.

## Returns

None