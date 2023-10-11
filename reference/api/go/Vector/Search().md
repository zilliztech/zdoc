---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /go/search
---

# Search()

调用接口基于一个或多个向量执行近似最近邻（Approximate Nearest Neighbor，ANN）检索。Zilliz Cloud 支持在检索中指定布尔表达式。

```go
client.Search(ctx, collName, partitions, expr, outputFields, vectors, vectorField, metricType, topK, sp, opts)
```

## 请求示例

```go
ctx := context.Background()

collName := "book"

partitions := []string{}

expr := ""

outputFields := []string{"book_id"}

vectors := []entity.Vector{entity.FloatVector([]float32{0.1, 0.2})}

vectorField := "book_intro"

metricType := entity.L2

topK := 2

searchResult, err := client.Search(
    ctx,
    collName,
    partitions,
    expr,
    outputFields,
    vectors,
    vectorField,
    metricType,
    topK
)
if err != nil {
    log.Fatal("fail to search collection:", err.Error())
}
fmt.Printf("%#v\n", searchResult)
for _, sr := range searchResult {
    fmt.Println(sr.IDs)
    fmt.Println(sr.Scores)
}
```

## 请求参数

| 参数  |   描述                                  |  类型        |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collName` | 待检索的 Collection 名称。 | String |
| `partitions` | 待检索的分片名称。 | list[String] |
| `expr` | 过滤表达式。 | String |
| `outputFields` | 指定返回字段。如果留空，则返回除向量字段外的其他所有字段。 | list[String] |
| `vectors` | 指定的向量值。 | entity.Vector |
| `vectorField` | 向量字段的名称。 | String |
| `metricType` | Collection 使用的相似度类型。 | entity.MetricType |
| `topK` | 要返回的最近邻记录数。 | Integer |
| `sp` | 搜索参数。 | entity.SearchParam |
| `opts` | 其他选项。 | ...SearchQueryOptionFunc |

## 抛出

- `ErrClientNotReady`：客户端连接失败则抛出此异常。

- `ErrCollectionNotExists`: 指定 Collection 不存在则抛出此异常。

## 返回结果

包含搜索结果的 SearchResult。