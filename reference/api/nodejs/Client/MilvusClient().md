# MilvusClient()

Creates a Milvus client.

```javascript
MilvusClient(
    address,
    username,
    password,
    maxRetries,
    retryDelay,
    channelOptions
)
```

## Examples

```javascript
const address = "cluster-endpoint";
const username = "username"; // Username specified when you created the cluster
const password = "password"; // Password specified when you created the cluster

const client = new MilvusClient({ address, username, password });
```

## Parameters

| Parameters      | Description                                                                                                              | Type   | Example             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------- |
| `address`         |  Endpoint used to connect to your cluster.                                                                                                    | String | 'https://in03-81d60685a921326.api.aws-us-west-2.cloud-sit.zilliz.com' |
| `username`       | Username used to connect to your cluster.                                                                                   | String | `db_admin`              |
| `password`        | Password used to connect to your cluster.                                                                                    | String | `mypassword`              |
| `maxRetries`     | Max. number of retries for the gRPC method. Default value: **3**.                                                               | Number | 3                   |
| `retryDelay`     | Delay between attempts to retry a failed gRPC method, in milliseconds. Default value: **30**.                                        | Number | 30                  |
| `channelOptions` | Optional configuration object that can be passed to a gRPC client when creating a channel to connect to a gRPC server. | Number | 30                  |

## Raises

None

## Returns

A MilvusClient.
