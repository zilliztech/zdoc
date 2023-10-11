---
displayed_sidebar: referenceSidebar
sidebar_position: 1
slug: /nodejs/search
---

# search()

调用接口基于一个或多个向量执行近似最近邻（Approximate Nearest Neighbor，ANN）检索。

```javascript
search(
  collection_name,
  vector, // 或 `vectors`
  limit, // 或 `topk`
  offset,
  output_fields,
  partitions_names,
  metric_type,
  filter, // 或 `expr`
  params,
  timeout
)
```

## 请求示例

```javascript
import { MilvusClient, DataType, MetricType } from "@zilliz/milvus2-sdk-node";

// 简单检索示例
new milvusClient(ADDRESS).search({
  collection_name: "my_collection",
  vector: [1, 2, 3, 4],
});

// 复杂检索示例
new milvusClient(ADDRESS).search({
  collection_name: "my_collection",
  vector: [1, 2, 3, 4],
  filter: "count > 5",
  limit: 10,
  offset: 2,
  metric_type: MetricType.L2,
  param: { nprobe: 1024 },
});

// 混合检索示例
new milvusClient(ADDRESS).search({
  collection_name: "my_collection",
  vectors: [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ],
});
```

成功回显：

```javascript
{
  status: { error_code: 'Success', reason: '' },
  results: [
    { score: 22, age: '434848878802251176' },
    { score: 22, age: '434848878802251181' },
    { score: 23, age: '434848878802251173' },
    { score: 25, age: '434848878802251179' }
  ]
}
```

## 请求参数（Node SDK v2.2.7 及以后）

| 参数          | 描述                                                                                                                                                                       | 类型                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `collection_name`     | 待检索的 Collection 名称。                                                                                                                                               | String                 |
| `vector` 或 `vectors` |指定的向量值。                                                                                                                                                       | Number[] 或 Number[][] |
| `limit` 或 `topk`     | 每次检索最多返回的数据条数。默认值：**10**。                                                                                                                                                              | Number                 |
| `offset`             | 搜索结果中要跳过的 Entity 数。默认值：**0**.                                                                                                                                                             | Number                 |
| `output_fields`      | 指定返回字段。默认返回所有字段。                                                                                   | String[]               |
| `partitions_names`   | 待检索的分片名称。                                                                                                                              | String[]               |
| `metric_type`        | 相似度类型。 默认值：**L2**.                                                                                                                                         | String                 |
| `filter` 或 `expr`    | 用于过滤数据的布尔表达式。                                                                                                                                             | String                 |
| `params`             | 可选搜索参数。                                                                                                    | Object                 |
| `timeout`            | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Number                 |

## SearchParam

SearchParam 是由键值对组成的 JSON 字符串。

```javascript
JSON.stringify({ nprobe: 1024 });
```

## 抛出

None

## 返回结果

以字典的形式返回结果。