---
displayed_sidebar: referenceSidebar
sidebar_position: 3
slug: /nodejs/get
---

# get()

调用接口按 ID 获取 Entity。

```javascript
get(
  collection_name,
  output_fields,
  ids,
  partitions_names,
  timeout
)
```

## 请求示例

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).get({
  collection_name: "my_collection",
  ids: [1, 2, 3, 4],
  output_fields: ["id"],
});
```

成功回显：

```javascript
{
  status: { error_code: 'Success', reason: '' },
  data: [
    { id: '434848878802248081' },
    ...999 more items,
  ]
}
```

## 请求参数

| 参数        | 描述                                                                                                                                                                       | 类型                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `collection_name`   | 待获取 Entity 所在的 Collection 的名称。                                                                                                                                               | String               |
| `output_fields`     | 指定返回字段。                                                                                                                                            | String[]             |
| `ids`               | 待获取 Entity 的 ID。                                                                                                                                                                          | String[] or Number[] |
| `partitions_names` | 待获取 Entity 所在的分片名称。                                                                                                                             | String[]             |
| `timeout`          | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Number               |

## 抛出

None

## 返回结果

结果以字典列返回，包含指定输出字段。