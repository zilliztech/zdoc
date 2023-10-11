---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /go/insert
---

# Insert()

调用接口将 Entity 以列的形式插入到 Collection。

```go
client.Insert(ctx, collName, partitionName, columns)
```

## 请求示例

```go
ctx := context.Background()

collName := my_collection

ageColumn := entity.Column{
    FieldName: "age",
    DataType:  entity.Int32,
    Int32Data: []int32{28, 35, 42},
}

heightColumn := entity.Column{
    FieldName: "height",
    DataType:  entity.Float,
    FloatData: []float32{1.75, 1.82, 1.69},
}

result, err := client.Insert(
    ctx,
    collName,
    ageColumn,
    heightColumn
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
| `columns` | 以列的形式来表示的待插入数据。 | ...entity.Column |

## 抛出

- `ErrClientNotReady`：客户端连接失败则抛出此异常。

- `ErrCollectionNotExists`: 指定 Collection 不存在则抛出此异常。

## 返回结果

已插入 Entity 的主键值。