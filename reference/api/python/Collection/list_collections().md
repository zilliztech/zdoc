---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /python/list_collection
---

# list_collections()

调用接口查询当前已创建的所有 Collection。

```python
list_collections()
```

## 请求示例

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.list_collections()
```

## 请求参数

None

## 抛出

None

## 返回结果

以字典列返回调用结果。