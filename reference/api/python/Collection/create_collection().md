---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /python/create_collection
---

# create_collection()

调用接口创建 Collection。

```python
create_collection(
    collection_name,
    dimension,
    primary_field_name,
    id_type,
    vector_field_name,
    metric_type,
    timeout
)
```

## 请求示例

- 使用动态 Schema 创建 Collection：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.create_collection(
        collection_name='medium_articles',
        dimension=768
    )
    ```

- 使用定制 Schema 创建 Collection：

    ```python
    from pymilvus import MilvusClient

    client = MilvusClient(uri, token)

    client.create_collection(
        collection_name='medium_articles',
        dimension=768,
        primary_field_name='custom_id',
        id_type='int64',
        vector_field_name='vector_title'
    )
    ```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 待创建的 Collection 的名称。 | String | 是     |
| `dimension` | 向量维度。 | Integer | 是     |
| `primary_field_name` | 主键名称。默认值：**id**。 | String | 否     |
| `id_type` | 主键的数据类型。有效值：**int64** 或 **string**。 | String | 否     |
| `vector_field_name` | 向量字段名称。 | String | 否     |
| `metric_type` | Collection 使用的相似度类型。 | String | 否     |
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float | 否     |

## 抛出

None

## 返回结果

None