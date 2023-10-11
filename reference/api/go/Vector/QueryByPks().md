---
displayed_sidebar: referenceSidebar
sidebar_position: 4
slug: /go/query_by_pks
---

# QueryByPks()

调用接口按主键查询 Collection 中的 Entity。

```go
client.QueryByPks(ctx, collectionName, partitionNames, ids, outputFields, opts)
```

## 请求示例

```go
ctx := context.Background()

collectionName := "my_collection"

partitionNames := []string{}

ids := []int64{1, 3, 5}

outputFields := []string{"name", "age", "height"}

result, err := client.QueryByPks(
    ctx,
    collectionName,
    partitionNames,
    ids,
    outputFields
)
if err != nil {
    log.Fatal("failed to retrieve data records:", err)
}

for i := 0; i < result.RowCount(); i++ {
    name, _ := result.GetString(i, "name")
    age, _ := result.GetInt32(i, "age")
    height, _ := result.GetFloat(i, "height")
    log.Printf("Record %d: Name=%s, Age=%d, Height=%f", i, name, age, height)
}
```

## 请求参数

| 参数  |   描述                                  |  类型        |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collectionName` | 待查询的 Collection 名称。 | String |
| `partitionNames` | 待查询的分片名称。 | list[String] |
| `ids` | 待查询的 Entity 的主键。 | entity.Column |
| `outputFields` | 指定返回字段。如果留空，则返回除向量字段外的其他所有字段。 | list[String] |
| `opts` | 查询数据时的其他选项。 | ...SearchQueryOptionFunc |

## 抛出

- `ErrClientNotReady`：客户端连接失败则抛出此异常。

- `ErrCollectionNotExists`: 指定 Collection 不存在则抛出此异常。

## 返回结果

返回满足查询条件的数据记录。