---
displayed_sidebar: referenceSidebar
sidebar_position: 5
slug: /python/drop_collection
---

# drop_collection()

调用接口删除 Collection。

```python
drop_collection(collection_name)
```

## 请求示例

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.drop_collection(collection_name='my-collection')
```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 目标 Collection 的名称。 | String | 是     |

## 抛出

None

## 返回结果

None