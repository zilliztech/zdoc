# DropCollection()

Drops a specified collection.

> 📘 Note
>
> This method drops all data in a collection.

```go
client.DropCollection(ctx, collName)
```

## Examples

```go
ctx := context.Background()

collName := "book"

err = client.DropCollection(ctx, collName)

if err != nil {
    log.Fatal("failed to drop collection:", err.Error())
}
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `collName` | Name of the collection to drop. | String |

## Raises

- `ErrClientNotReady`: Error if the client is not connected.

- `ErrCollectionNotExists`: Error if the collection with the specified name does not exist.

## Returns

None