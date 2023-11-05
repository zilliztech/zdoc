# DescribeCollection()

Shows the details of a collection, including the collection name, schema, and more.

```go
client.DescribeCollection(ctx, collName)
```

## Examples

```go
ctx := context.Background()

collName := "book"

collDesc, err := client.DescribeCollection(ctx, collName)

if err != nil {
  log.Fatal("failed to check collection schema:", err.Error())
}

log.Printf("%v\n", collDesc)
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collName` | Name of the collection to describe. | String |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.
- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.

## Returns

Pointer to a Collection object that contains the schema and other information for the specified collection.