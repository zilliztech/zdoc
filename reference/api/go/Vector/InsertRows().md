# InsertRows()

Inserts entities into a specified collection in a list of rows.

```go
client.InsertRows(ctx, collName, partitionName, rows)
```

## Examples

```go
ctx := context.Background()

collName := "my_collection"

rows := [][]interface{}{
    {"John", 28, 1.75},
    {"Jane", 35, 1.82},
    {"Bob", 42, 1.69},
}

result, err := client.InsertRows(
    ctx,
    collName,
    rows
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
| `rows` | Data rows to be inserted. | Any |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.

- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.


## Returns

Primary keys of the inserted data records.