---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /go/create_collection
---

# CreateCollection()

调用接口创建 Collection。

```go
client.CreateCollection(ctx, collSchema, shardNum, opts)
```

## 请求示例

```go
var (
        collectionName = "book"
    )
schema := &entity.Schema{
  CollectionName: collectionName,
  Description:    "Test book search",
  Fields: []*entity.Field{
    {
      Name:       "book_id",
      DataType:   entity.FieldTypeInt64,
      PrimaryKey: true,
      AutoID:     false,
    },
    {
      Name:       "word_count",
      DataType:   entity.FieldTypeInt64,
      PrimaryKey: false,
      AutoID:     false,
    },
    {
      Name:     "book_intro",
      DataType: entity.FieldTypeFloatVector,
      TypeParams: map[string]string{
          "dim": "2",
      },
    },
  },
}
err = client.CreateCollection(
    context.Background(),
    schema,
    2,
)
if err != nil {
    log.Fatal("failed to create collection:", err.Error())
}
```

## 请求参数

| 参数          | 描述                          | 类型     |
|--------------------|--------------------------------------|----------|
| `ctx` | 控制 API 调用进程的上下文。 | context.Context |
| `collSchema` | 待创建 Collection 的 Schema。 | Schema 对象指针|
| `shardNum` | 待创建 Collection 的分片数。 | INT32 |
| `opts` | 用于创建 Collection 的其他选项。 您可以设置要创建的 Collection 的一致性级别。 | ...CreateCollectionOption |

## Schema

Schema 定义了要创建的 Collection 的结构和包含字段。

### Collection Schema

Collection Schema 是 Collection 的逻辑定义。

| 参数 |   描述 |  类型 |
| --------- | ------ | ---------- |
| `Collection Name` | 待创建的 Collection 的名称。 | String |
| `Description` | 待创建的 Collection 的描述信息。 | String |
| `AutoID` | 如果设置为 `true`，则会自动为 Collection 中的 Entity 分配 ID。 | Boolean |
| `Fields` | 定义 Collection 中的字段。  | 详见 [Field Schema of Milvus](https://github.com/milvus-io/milvus-sdk-go/blob/7410632233597d4af58df727682ffb29f1d1d51d/entity/schema.go#L54-L63) |

### Field Schema

Field Schema 是字段的逻辑定义。

| 参数  |   描述                                  |  类型        |
| ---------- | ---------------------------------------------- | ------------ |
|  `ID`      | 创建 Collection 时生成的字段 ID。 | INT64        |
| `Name`     | 字段名称。                            | INT64        |
| `PrimaryKey` | 是否启用主键。      | Boolean      |
| `AutoID`   | 是否自动生成 ID。  | Boolean |
| `Description` | 字段描述信息。                   | String       |
| `DataType` | 字段数据类型。 | 详见 [FieldType](https://github.com/milvus-io/milvus-sdk-go/blob/9a7ab65299b4281cc24ad9da7834f6e25866f435/entity/schema.go#L116) |
| `TypeParams` | 字段类型参数。               | 键值对 |
| `IndexParams` | 索引参数。             | 键值对 |

## 抛出

`ErrClientNotReady`：客户端连接失败则抛出此异常。

## 返回结果

None