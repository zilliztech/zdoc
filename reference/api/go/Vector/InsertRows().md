---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /go/insert_rows
---

# InsertRows()

调用接口将 Entity 以行的形式插入到 Collection。

```go
client.InsertRows(ctx, collName, partitionName, rows)
```

## 请求示例

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

## 请求参数

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collName` | 待插入数据所在的 Collection 名称。 | String |
| `partitionName` | 待插入数据所在的分片名称。 | String |
| `rows` | 以行的形式来表示的待插入数据。 | Any |

## 抛出

- `ErrClientNotReady`：客户端连接失败则抛出此异常。

- `ErrCollectionNotExists`: 指定 Collection 不存在则抛出此异常。


## 返回结果

已插入 Entity 的主键值。