# Insert()

Inserts entities into a specified collection in a list of columns.

```go
client.Insert(ctx, collName, partitionName, columns)
```

## Examples

```go
ctx := context.Background()

collName := my_collection

ageColumn := entity.Column{
    FieldName: "age",
    DataType:  entity.Int32,
    Int32Data: []int32{28, 35, 42},
}

heightColumn := entity.Column{
    FieldName: "height",
    DataType:  entity.Float,
    FloatData: []float32{1.75, 1.82, 1.69},
}

result, err := client.Insert(
    ctx,
    collName,
    ageColumn,
    heightColumn
)
if err != nil {
    log.Fatal("failed to insert data records:", err)
}

log.Printf(result)
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collName` | Name of the collection to insert. | String |
| `partitionName` | Name of the partition to insert. | String |
| `columns` | Column objects that represent the data to be inserted. | ...entity.Column |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.

- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.

## Returns

Primary keys of the inserted data records.