---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /python/query
---

# query()

调用接口查询 Collection 中满足指定条件的 Entity。

```python
query(
    collection_name,
    filter,
    output_fields,
    timeout
)
```

## 请求示例

- 从使用定制 Schema 的 Collection 中查询数据：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.query(
        filter='book_id in [2,4,6,8]',
        output_fields=["book_id", "book_intro"] # book_id 和 book_intro 已在 Schema 中定义
    )
    ```

- 从使用动态 Schema 的 Collection 中查询数据：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)
    
    client.query(
        filter='$meta["claps"] > 30 and responses < 10',
        output_fields=["title", "claps", "responses"] # claps 和 responses 未在 Schema 中定义
    )
    ```

    上述代码展示了如何获取 Schema 中未定义的 `claps` 和 `responses` 字段。

## 请求参数

| 参数              | 描述                                                                                                                                                                  | 类型             | 是否必选 |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|---------|
| `collection_name` | 待查询的 Collection 名称。| String | 是     |
| `filter` | 过滤表达式。 | String | 是     |
| `output_fields` | 指定返回字段。如果留空，则返回除向量字段外的其他所有字段。| list[String] | 否    | |
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float | 否     |

## 抛出

`ValueError`: 指定 Collection 不存在则抛出此异常。

## 返回结果

以字典返回除向量字段外的其他所有字段。