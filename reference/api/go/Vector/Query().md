---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /go/query
---

# Query()

调用接口查询 Collection 中满足指定条件的 Entity。

```go
client.Query(ctx, collectionName, partitionNames, expr, outputFields, opts)
```

## 请求示例

```go
ctx := context.Background()

collectionName := "book"

partitionNames := []string{}

expr := "book_id in [2,4,6,8]"

outputFields := []string{"book_id"}

queryResult, err := client.Query(
    ctx,
    collectionName,
    partitionNames,
    expr,
    outputFields
)
if err != nil {
    log.Fatal("failed to query data:", err.Error())
}
fmt.Printf("%#v\n", queryResult)
for _, sr := range queryResult {
    fmt.Println(sr.IDs)
    fmt.Println(sr.Scores)
}
```

## 请求参数

| 参数  |   描述                                  |  类型        |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collectionName` | 待查询的 Collection 名称。 | String |
| `partitionNames` | 待查询的分片名称。 | list[String] |
| `expr` | 过滤表达式。 | String |
| `outputFields` | 指定返回字段。如果留空，则返回除向量字段外的其他所有字段。 | list[String] |
| `opts` | 查询数据时的其他选项。 | ...SearchQueryOptionFunc |

## 抛出

- `ErrClientNotReady`：客户端连接失败则抛出此异常。

- `ErrCollectionNotExists`: 指定 Collection 不存在则抛出此异常。

## 返回结果

返回满足查询条件的数据记录。