---
title: "addCollectionField() | Node.js"
slug: /node/node/Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加一个新的标量字段，而无需重新创建该 Collection。由于内部 Schema 同步，该字段几乎会立即变为可用，延迟极小。 | Node.js"
type: docx
token: BKqIdIm0cop2s0xYjtQcSZL5nth
sidebar_position: 19
keywords: 
  - AI Agent
  - 语义搜索
  - 异常检测
  - sentence transformers
  - zilliz
  - zilliz cloud
  - 云
  - addCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# addCollectionField()

此操作会向现有 Collection 添加一个新的标量字段，而无需重新创建该 Collection。由于内部 Schema 同步，该字段几乎会立即变为可用，延迟极小。

```javascript
await milvusClient.addCollectionField(data: AddCollectionFieldReq)
```

<Admonition type="info" icon="📘" title="Notes">

如果该 Collection 已启用动态字段，而您添加的静态字段与现有动态字段键同名，则该静态字段会遮盖该动态字段键。原始动态值仍可通过 `$meta['field_name']` 语法访问。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.addCollectionField({
    collection_name: string,
    db_name?: string,
    field: FieldType,
    timeout?: number
})
```

**参数：**

- **collection_name** （*string*） -

    目标 Collection 的名称。

- **db_name** （*string*） -

    目标 Database 的名称。

- **field** （*FieldType*） -

    待添加字段的配置，即一个包含以下字段的 **FieldType** 对象。

- **timeout** （*number*） -  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回：**

*Promise\<ResStatus\>*

此方法返回一个 Promise，该 Promise 会解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** （*number*） -

    指示操作结果的代码。如果此操作成功，则该值保持为 **0**。

- **error_code** （*string* | *number*） -

    指示所发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

- **reason** （*string*） - 

    指示所报告错误原因的说明。如果此操作成功，则该值为空字符串。


**异常：**

- **Error**

    当此操作过程中发生任何错误时，便会引发此异常。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const resStatus = await milvusClient.addCollectionField({
  collection_name: 'my_collection',
  field: {
    name: 'new_field',
    data_type: 'Int64',
    is_primary_key: false,
    description: 'A new field'
  }
});
```
