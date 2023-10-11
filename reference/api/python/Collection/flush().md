---
displayed_sidebar: referenceSidebar
sidebar_position: 4
slug: /python/flush
---

# flush()

调用接口将 Collection 中的所有 Entity 写入盘。 Flush 操作后，任何新插入的数据都会生成新的数据段。 只有写入盘后的数据才能被索引。

```python
flush(
    collection_name,
    timeout
)
```

## 请求示例

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token)

client.flush(collection_name='my-collection')
```

## 请求参数

| 参数      | 描述                                                                                         | 类型   | 是否必选 |
|-----------|--------------------------------------------------------------------------------------------|--------|---------|
| `collection_name` | 目标 Collection 的名称。 | String | 是     |
| `timeout` | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Float | 否     |

## 抛出

None

## 返回结果

None