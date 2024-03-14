# Search()

Conducts an approximate nearest neighbor (ANN) search on a vector field and pairs up with boolean expressions to conduct filtering on scalar fields before searching.

```go
client.Search(ctx, collName, partitions, expr, outputFields, vectors, vectorField, metricType, topK, sp, opts)
```

## Examples

```go
ctx := context.Background()

collName := "book"

partitions := []string{}

expr := ""

outputFields := []string{"book_id"}

vectors := []entity.Vector{entity.FloatVector([]float32{0.1, 0.2})}

vectorField := "book_intro"

metricType := entity.L2

topK := 2

searchResult, err := client.Search(
    ctx,
    collName,
    partitions,
    expr,
    outputFields,
    vectors,
    vectorField,
    metricType,
    topK
)
if err != nil {
    log.Fatal("fail to search collection:", err.Error())
}
fmt.Printf("%#v\n", searchResult)
for _, sr := range searchResult {
    fmt.Println(sr.IDs)
    fmt.Println(sr.Scores)
}
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collName` | Name of the collection to search. | String |
| `partitions` | Names of the partitions to search. | list[String] |
| `expr` | Filter expression used to search data. | String |
| `outputFields` | A list of fields to return. If you leave this parameter empty, all fields excluding the vector field will be returned. | list[String] |
| `vectors` | Vectors to search with. | entity.Vector |
| `vectorField` | Name of the vector field to search on. | String |
| `metricType` | Metric type to calculate distance with. | entity.MetricType |
| `topK` | Number of nearest records to return. | Integer |
| `sp` | Specific search parameters of the index on the vector field. | entity.SearchParam |
| `opts` | Additional options. | ...SearchQueryOptionFunc |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.

- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.

## Returns

A slice of SearchResult that contains the search result.