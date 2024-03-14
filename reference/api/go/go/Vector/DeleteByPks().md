# DeleteByPks()

Deletes one or more entities from a collection by filtering primary key fields with boolean expressions.

```go
client.DeleteByPks(ctx, collName, partitionName, ids)
```

## Examples
<!-- to check -->
```go
ctx := context.Background()

collName := my_collection

partitionName := my_partition

ids := entity.Column{
    PKFieldName: "id",
    DataType:  entity.Int64,
    Int64Data: []int64{1, 2, 3},
}

err := client.DeleteByPks(
    ctx,
    collName,
    partitionName,
    ids
)

if err != nil {
    log.Fatal("failed to delete data records:", err)
}
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collName` | Name of the collection from which data is to be deleted. | String |
| `partitionName` | Name of the partition from which data is to be deleted. | String |
| `ids` | Primary keys of the entities to be deleted. | entity.Column |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.

- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.

## Returns

None