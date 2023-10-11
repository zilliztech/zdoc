---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /nodejs/insert
---

# insert()

调用接口将 Entity 插入到 Collection。

> 📘 Note
>
> 如果字段类型为二进制，则向量数据的长度等于向量维度值除以 8。

```javascript
insert(
  collection_name,
  data,
  partition_name,
  timeout
)
```

## 请求示例

```javascript
const vectorsData = Array.from({ length: 10 }).map(() => ({
  vector_01: Array.from({ length: 4 }).map(() =>
    Math.floor(Math.random() * 10)
  ),
}));

new milvusClient(ADDRESS).insert({
  collection_name: COLLECTION_NAME,
  data: vectorsData,
});
```

成功回显：

```javascript
{
  status: { error_code: 'Success', reason: '' },
  succ_index: [
     0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
    ... 990 more items
  ],
  err_index: [],
  acknowledged: false,
  insert_cnt: '1',
  delete_cnt: '0',
  upsert_cnt: '0',
  timestamp: '434849944099356674',
  IDs: {
    int_id: {
      data: [
        '434848878802250134',
        ...999 more items,
      ],
    },
    id_field: 'int_id',
  },
}
```

## 请求参数

| 参数      | 描述                                                                                                                                                                       | 类型                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `collection_name` | 待插入数据的 Collection 名称。                                                                                                                                        | String                 |
| `data`            | 待插入数据，以字典的形式插入数据。                                                                                                                                                                       | list[Dictionary] |
| `partition_name` | 待插入数据的分片名称。                                                                                                                                         | String                 |
| `timeout`        | 客户端等待的超时时间，单位为秒。如果设置为 None，客户端会一直等待，直到服务器响应或发生错误。 | Number                 |

## 抛出

None

## 返回结果

以字典的形式返回结果。