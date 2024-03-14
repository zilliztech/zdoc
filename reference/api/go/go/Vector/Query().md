# Query()

Queries one or more entities based on scalar fields filtered by boolean expressions.

> 📘 Note
>
> The order of the returned entities cannot be guaranteed.

```go
client.Query(ctx, collectionName, partitionNames, expr, outputFields, opts)
```

## Examples

```go
ctx := context.Background()

collectionName := "book"

partitionNames := []string{}

expr := "book_id in [2,4,6,8]"

outputFields := []string{"book_id"}

queryResult, err := client.Query(
    ctx,
    collectionName,
    partitionNames,
    expr,
    outputFields
)
if err != nil {
    log.Fatal("failed to query data:", err.Error())
}
fmt.Printf("%#v\n", queryResult)
for _, sr := range queryResult {
    fmt.Println(sr.IDs)
    fmt.Println(sr.Scores)
}
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collectionName` | Name of the collection to query data. | String |
| `partitionNames` | Names of the partitions to query data. | list[String] |
| `expr` | Filter expression used to query data. | String |
| `outputFields` | A list of fields to return. If you leave this parameter empty, all fields excluding the vector field will be returned. | list[String] |
| `opts` | Additional options to query data. | ...SearchQueryOptionFunc |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.

- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.

## Returns

Data records that meet specific criteria.