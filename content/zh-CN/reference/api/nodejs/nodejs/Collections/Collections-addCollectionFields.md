---
title: "addCollectionFields() | Node.js"
slug: /node/node/Collections-addCollectionFields
sidebar_label: "addCollectionFields()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可向现有 Collection 添加一组新的标量字段，而无需重新创建它。由于内部 Schema 同步，这些字段几乎会立即可用，延迟极低。 | Node.js"
type: docx
token: FmG6dw3O1ouzgbxnl4jc5T7cnXf
sidebar_position: 20
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFields()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# addCollectionFields()

此操作可向现有 Collection 添加一组新的标量字段，而无需重新创建它。由于内部 Schema 同步，这些字段几乎会立即可用，延迟极低。

```javascript
await milvusClient.addCollectionFields(data: AddCollectionFieldsReq)
```

<Admonition type="info" icon="📘" title="Notes">

如果 Collection 启用了动态字段，而您添加的静态字段名称与现有动态字段键同名，则静态字段将屏蔽该动态字段键。原始动态值仍可通过 `$meta['field_name']` 语法访问。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addCollectionFields({
    collection_name: string,
    db_name?: string,
    fields: FieldType[],
    timeout?: number
})
```

**参数：**

- **collection_name**（*string*）-

    目标 Collection 的名称。

- **db_name**（*string*）-

    目标 Database 的名称。

- **fields**（*[FieldType](./Collections-FieldType)[]*）-

    要添加的字段的配置，其中每一项都是一个 **FieldType** 对象，该对象包含以下字段。

- **timeout**（*number*）-  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生错误时，此操作即超时。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 promise，该 promise 解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code**（*number*）-

    表示操作结果的代码。如果此操作成功，该值保持为 **0**。

- **error_code**（*string* | *number*）-

    表示已发生错误的错误代码。如果此操作成功，该值保持为 **Success**。

- **reason**（*string*）-

    表示所报告错误的原因。如果此操作成功，该值保持为空字符串。


**异常：**

- **Error**

    在此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const resStatus = await milvusClient.addCollectionFields({
  collection_name: 'my_collection',
  fields: [
    {
      name: 'new_field_1',
      data_type: 'Int64',
      is_primary_key: false,
      description: 'First new field'
    },
    {
      name: 'new_field_2',
      data_type: 'FloatVector',
      dim: 128,
      description: 'Second new field'
    }
  ]
});
```
