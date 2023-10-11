---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /nodejs/create_collection
---

# createCollection()

调用接口创建 Collection。

```javascript
createCollection(
  collection_name,
  fields
)
```

## 请求示例

使用定制 Schema 创建 Collection：

```javascript
// 定义 Schema
const collection_name = `book`;
const dim = 128;
const schema = [
  {
    name: `book_id`,
    description: `customized primary id`,
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: `word_count`,
    description: `word count`,
    data_type: DataType.Int64,
  },
  {
    name: `book_intro`,
    description: `word count`,
    data_type: DataType.FloatVector,
    dim: dim,
  },
];

// 创建 Collection
new milvusClient(ADDRESS).createCollection({
  collection_name,
  fields: schema,
});
```

## 请求参数

| 参数            | 描述                                                                                         | 类型    | 是否必选 |
| -------------------- | --------------------------------------------------------------------------------------------------- | ------- | -------- |
| `collection_name`    | 待创建的 Collection 的名称。                                                                   | String  | 是     |
| `fields`    | Collection 中包含的字段。                                                                   | list[Dictionary]  | 是     |

## `fields` 参数

| 参数            | 描述                                                                                         | 类型    |
| -------------------- | --------------------------------------------------------------------------------------------------- | ------- |
| `name`    | 字段名称，在 Collection 中必须是唯一的。                                                                   | String  |
| `description`    | 字段描述。                                                                   | String  |
| `dim`          | 向量维度。                                                                                   | Integer |
| `is_primary_key` | 是否为主键。                                                    | Boolean  |
| `autoID` | 是否为主键启用自动生成 ID。                                                    | Boolean  |
| `data_type`            | 字段的数据类型，可以是几种预定义数据类型之一，如 Int64 或 FloatVector。                                | String  |

## 抛出

None

## 返回结果

Collection 对象。
