---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /python/get
---

# get()

调用接口按主键获取 Entity。如果请求中指定了 `output_fields`，则返回结果只包含指定字段相关信息。

```python
get(
    collection_name,
    ids,
    output_fields,
    timeout
)
```

## 请求示例

- 获取主键类型为 String 的 Entity：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.get(
        collection_name='my-collection1',
        ids='pk1'
    )
    ```

- 获取主键类型为 Integer 的 Entity：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.get(
        collection_name='my-collection2',
        ids=256
    )
    ```

- 批量获取 Entity，并返回指定字段值：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)
    
    client.get(
        collection_name='my-collection3',
        ids=['pk-1', 'pk-2'],
        output_fields=['claps','reading_time']
    )
    ```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 待获取 Entity 所在的 Collection 的名称。 | String | 是    |
| `ids` | 待获取 Entity 的主键值。 | Union[list, str, int] | 是     |
|`output_fields`| 指定返回字段。 | String or INT64 | 否
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float | 否     |

## 抛出

`ValueError`：接口调用失败则抛出此异常。

## 返回结果

结果以字典列返回，包含主键和向量字段等信息。