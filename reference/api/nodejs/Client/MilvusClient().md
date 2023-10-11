---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /nodejs/milvus-client
---

# MilvusClient()

调用接口创建 MilvusClient 实例。

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

## 请求示例

```javascript
const address = "cluster-endpoint";
const username = "username"; // 创建集群时指定的用户名
const password = "password"; // 创建集群时指定的用户名密码

const client = new MilvusClient({ address, username, password });
```

## 请求参数

| 参数      | 描述                                                                                                              | 类型   | 示例值             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------- |
| `address`         |  用于连接到集群的公网地址。                                                                                                    | String | 'https://in03-81d60685a921326.api.aws-us-west-2.cloud-sit.zilliz.com' |
| `username`       | 用于连接集群的用户名称。                                                                                   | String | `db_admin`              |
| `password`        | 用于连接集群的用户密码。                                                                                    | String | `mypassword`              |
| `maxRetries`     | 最大重试次数。默认值：**3**。                                                               | Number | 3                   |
| `retryDelay`     | 尝试重试的 gRPC 方法间的延迟（以毫秒为单位）。默认值：**3**。                                        | Number | 30                  |
| `channelOptions` | 创建连接到 gRPC 服务器的通道时可以传递给客户端的可选配置对象。 | Number | 30                  |

## 抛出

None

## 返回结果

MilvusClient 实例。