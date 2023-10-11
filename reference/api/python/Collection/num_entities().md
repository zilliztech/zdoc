---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /python/num_entities
---

# num_entities()

调用接口统计 Collection 中已插入的 Entity 数。

```python
num_entities(
    collection_name,
    timeout
)
```

## 请求示例

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.num_entities(collection_name='my-collection')
```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 目标 Collection 的名称。 | String | 是     |
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float | 否     |

## 抛出

None

## 返回结果

返回已插入的 Entity 数。