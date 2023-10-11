---
displayed_sidebar: referenceSidebar
sidebar_position: 5
slug: /go/delete_by_pks
---

# DeleteByPks()

调用接口按主键删除 Collection 中的 Entity。您也可以在请求中指定布尔表达式。

```go
client.DeleteByPks(ctx, collName, partitionName, ids)
```

## 请求示例

```go
ctx := context.Background()

collName := my_collection

partitionName := my_partition

ids := entity.Column{
    PKFieldName: "id",
    DataType:  entity.Int64,
    Int64Data: []int64{1, 2, 3},
}

err := client.DeleteByPks(
    ctx,
    collName,
    partitionName,
    ids
)

if err != nil {
    log.Fatal("failed to delete data records:", err)
}
```

## 请求参数

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collName` | 待删除 Entity 所在的 Collection 的名称。 | String |
| `partitionName` | 待删除 Entity 所在的分片名称。 | String |
| `ids` | 待删除 Entity 的主键值。 | entity.Column |

## 抛出

- `ErrClientNotReady`: ：客户端连接失败则抛出此异常。

- `ErrCollectionNotExists`: 指定 Collection 不存在则抛出此异常。

## 返回结果

None