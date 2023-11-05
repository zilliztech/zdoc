# NewClient()

Creates a Milvus client.

```go
client.NewClient(ctx, config)
```

## Examples

```go
ctx := context.Background()

config := Config{
    Address: "endpoint", // Cluster endpoint.
    Username: "myuser", // Username for auth.
    Password: "mypassword", // Password for auth.
    Identifier: "myconnection", // Identifier for this connection.
    EnableTLSAuth: true, // Enable TLS Auth for transport security.
    APIKey: "myapikey", // API key.
    DialOptions: []grpc.DialOption{...}, // Dial options for GRPC.
    DisableConn: false, // Whether to contain filtered or unexported fields.
  }

milvusClient, err := client.NewClient(ctx, config)

if err != nil {
  log.Fatal("failed to connect to cluster:", err.Error())
}
```

## Parameters

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `ctx` | Context to control API invocation process. | context.Context |
| `config` | Configuration options for the Milvus client. | Config |

## Config

| Parameter          | Description                          | Type     |
|--------------------|--------------------------------------|----------|
| `Address` | Endpoint of the cluster to connect. | String |
| `Username` | Username for cluster authentication. | String |
| `Password` | Password for cluster authentication. | String |
| `Identifier` | Identifier for the connection. | String |
| `EnableTLSAuth` | Whether to enable TLS Auth for transport security. | Boolean |
| `APIKey` | API key used to connect to the cluster. | String |
| `DialOptions` | Dial options for GRPC. | grpc.DialOption |
| `DisableConn` | Whether to contain filtered or unexported fields. | Boolean |

## Raises

None

## Returns

A Milvus client instance.