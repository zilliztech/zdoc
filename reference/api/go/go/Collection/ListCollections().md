# ListCollections()

Lists all the collections in a cluster. Note that the schema information is not provided in the collection list.

```go
client.ListCollections(ctx)
```

## Examples

```go
ctx := context.Background()

listColl, err := client.ListCollections(ctx)

if err != nil {
  log.Fatal("failed to list all collections:", err.Error())
}

log.Println(listColl)
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |

## Raises

`ErrClientNotReady`: Error if the client is not connected.

## Returns

Collection objects that contain information about each of the collections in the cluster.