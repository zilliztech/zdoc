---
displayed_sidebar: referenceSidebar
sidebar_position: 2
slug: /nodejs/query
---

# query()

调用接口查询 Collection 中满足指定条件的 Entity。

> 📘 说明
>
> 执行查询或检索前，您需要加载 Collection。

```javascript
query(
  collection_name,
  output_fields,
  filter,
  partitions_names,
  timeout
)
```

## 请求示例

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

new milvusClient(ADDRESS).query({
  collection_name: "my_collection",
  filter: "age > 0",
  output_fields: ["age"],
});
```

成功回显：

```javascript
{
  status: { error_code: 'Success', reason: '' },
  data: [
    { age: '434848878802248081' },
    ...999 more items,
  ]
}
```

## 请求参数

| 参数        | 描述                                                                                                                                                                       | 类型     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `collection_name`   | 待查询的 Collection 名称。                                                                                                                                               | String   |
| `output_fields`     | 指定返回字段。                                                                                                                                            | String[] |
| `filter`            | 过滤表达式。                                                                                                                                 | String   |
| `partitions_names` | 待查询的分片名称。                                                                                                                             | String[] |
| `timeout`          | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Number   |
