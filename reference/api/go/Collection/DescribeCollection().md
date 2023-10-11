---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /go/describe_collection
---

# DescribeCollection()

调用接口获取指定 Collection 的详细信息，包括 Collection 名称和 Schema 等。

```go
client.DescribeCollection(ctx, collName)
```

## 请求示例

```go
ctx := context.Background()

collName := "book"

collDesc, err := client.DescribeCollection(ctx, collName)

if err != nil {
  log.Fatal("failed to check collection schema:", err.Error())
}

log.Printf("%v\n", collDesc)
```

## 请求参数

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collName` | 目标 Collection 的名称。 | String |

## 抛出

- `ErrClientNotReady`：客户端连接失败则抛出此异常。
- `ErrCollectionNotExists`：指定 Collection 不存在则抛出此异常。

## 返回结果

Collection 对象，包含 Collection 的 Schema 等信息。