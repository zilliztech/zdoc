# QueryByPks()

Queries one or more entities by primary keys.

> 📘 Note
>
> The order of the returned entities cannot be guaranteed.

```go
client.QueryByPks(ctx, collectionName, partitionNames, ids, outputFields, opts)
```

## Examples

```go
ctx := context.Background()

collectionName := "my_collection"

partitionNames := []string{}

ids := []int64{1, 3, 5}

outputFields := []string{"name", "age", "height"}

result, err := client.QueryByPks(
    ctx,
    collectionName,
    partitionNames,
    ids,
    outputFields
)
if err != nil {
    log.Fatal("failed to retrieve data records:", err)
}

for i := 0; i < result.RowCount(); i++ {
    name, _ := result.GetString(i, "name")
    age, _ := result.GetInt32(i, "age")
    height, _ := result.GetFloat(i, "height")
    log.Printf("Record %d: Name=%s, Age=%d, Height=%f", i, name, age, height)
}
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collectionName` | Name of the collection to query data. | String |
| `partitionNames` | Names of the partitions to query data. | list[String] |
| `ids` | Primary keys of the entities to query. | entity.Column |
| `outputFields` | A list of fields to return. If you leave this parameter empty, all fields excluding the vector field will be returned. | list[String] |
| `opts` | Additional options to query data. | ...SearchQueryOptionFunc |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.

- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.

## Returns

Data records that meet specific criteria.