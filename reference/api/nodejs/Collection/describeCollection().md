---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /nodejs/describe_collection
---

# describeCollection()

调用接口获取指定 Collection 的详细信息，包括 Collection 名称和 Schema 等。

```javascript
describeCollection(
  collection_name,
  timeout
)
```

## 请求示例

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).describeCollection({
  collection_name: "my_collection",
});
```

成功回显：

```javascript
{
  status: { error_code: 'Success', reason: '' },
  schema: {
    fields: [ {
    type_params: [
      {
        dim: 8
      }
    ],
    index_params: [],
    fieldID: '100',
    name: 'vector_01',
    is_primary_key: false,
    description: 'vector field',
    data_type: 'FloatVector',
    autoID: false
  },
  {
    type_params: [],
    index_params: [],
    fieldID: '101',
    name: 'age',
    is_primary_key: true,
    description: '',
    data_type: 'Int64',
    autoID: true
  } ],
    name: 'my_collection',
    description: '',
    autoID: false
  },
  collectionID: '434827658485039105',
  consistency_level: 'Session',
}
```

## 请求参数

| 参数      | 描述                                                                                                                                                                       | 类型   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `collection_name` | 目标 Collection 的名称。                                                                                                                                                   | String |
| `timeout`        | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Number |

## 抛出

None

## 返回结果

以字典列返回结果。