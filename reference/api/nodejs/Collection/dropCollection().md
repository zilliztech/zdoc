---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /nodejs/drop_collection
---

# dropCollection()

调用接口删除 Collection。此操作会删除 Collection 中的所有数据。

```javascript
dropCollection(
  collection_name,
  timeout
)
```

## 请求示例

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).dropCollection({
  collection_name: "my_collection",
});
```

成功回显：

```javascript
// dropCollection returns
{ error_code: 'Success', reason: '' }
```

## 请求参数

| 参数      | 描述                                                                                                                                                                       | 类型   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `collection_name` | 目标 Collection 的名称。                                                                                                                                                    | String |
| `timeout`        | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Number |

## 抛出

None

## 返回结果

None