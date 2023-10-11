---
displayed_sidebar: referenceSidebar
sidebar_position: 4
slug: /nodejs/delete
---

# delete()

调用接口按 ID 删除 Collection 中的 Entity。

```javascript
delete(
  collection_name,
  ids
)
```

## 请求示例

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).delete({
  collection_name: "my_collection",
  ids: [1, 2, 3, 4],
});
```

成功回显：

```javascript
{
   error_code: 'Success', reason: ''
}
```

## 请求参数

| 参数        | 描述                                                                                                                                                                       | 类型                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `collection_name`   | 待删除 Entity 所在的 Collection 的名称。                                                                                                                                               | String               |
| `ids`               | 待删除 Entity 的 ID。                                                                                                                                                                          | String[] or Number[] |

## 抛出

None

## 返回结果

None