---
displayed_sidebar: referenceSidebar
sidebar_position: 4
slug: /python/delete
---

# delete()

调用接口按主键删除 Collection 中的 Entity。

```python
delete(
    collection_name,
    pks,
    timeout
)
```

## 请求示例

- 删除主键类型为 String 的 Entity：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.delete(
        collection_name='my-collection1',
        pks='pk-1'
    )
    ```

- 删除主键类型为 Integer 的 Entity：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.delete(
        collection_name='my-collection2',
        pks=256
    )
    ```

- 批量删除 Entity：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.delete(
        collection_name='my-collection3',
        pks=['pk-1', 'pk-2']
    )
    ```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 待删除 Entity 所在的 Collection 的名称。 | String | 是    |
| `pks` | 待删除 Entity 的主键值。 | Union[list, str, int] | 是    |
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float | 否     |

## 抛出

None

## 返回结果

None