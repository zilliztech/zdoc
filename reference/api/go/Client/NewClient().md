---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /go/new-client
---

# NewClient()

调用接口创建 MilvusClient 实例。

```go
client.NewClient(ctx, config)
```

## 请求示例

```go
ctx := context.Background()

config := Config{
    Address: "endpoint", // 从 Zilliz Cloud 控制台获取的集群公网地址
    Username: "myuser", // 用于连接到集群的用户名
    Password: "mypassword", // 用于连接到集群的用户名密码
    Identifier: "myconnection", // 本次连接的标识符
    EnableTLSAuth: true, // 是否启用 TLS 身份验证以确保传输安全
    DialOptions: []grpc.DialOption{...}, // GRPC 拨号选项
    DisableConn: false, // 是否包含已筛选或未导出的字段
  }

milvusClient, err := client.NewClient(ctx, config)

if err != nil {
  log.Fatal("failed to connect to cluster:", err.Error())
}
```

## 请求参数

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `config` | Milvus 客户端的配置选项。 | Config |

## 配置

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `Address` | 用于连接到集群的公网地址。 | String |
| `Username` | 用于鉴权的用户名。 | String |
| `Password` | 用于鉴权的用户名密码。 | String |
| `Identifier` | 本次连接的标识符。| String |
| `EnableTLSAuth` | 是否启用 TLS 身份验证以确保传输安全。 | Boolean |
| `DialOptions` | GRPC 拨号选项。 | grpc.DialOption |
| `DisableConn` | 是否包含已筛选或未导出的字段。| Boolean |

## 抛出

None

## 返回结果

MilvusClient 实例。