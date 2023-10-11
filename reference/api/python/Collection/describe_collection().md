---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /python/describe_collection
---

# describe_collection()

调用接口获取指定 Collection 的详细信息。

```python
describe_collection(collection_name)
```

## 请求示例

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.describe_collection(collection_name='medium_articles')
```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 目标 Collection 的名称。 | String | 是     |

## 抛出

`ValueError`：如果指定的 Collection 不存在，抛出此异常。

## 返回结果

以字典列返回调用结果。