---
title: "alterCollectionFieldProperties() | Node.js"
slug: /node/node/Collections-alterCollectionFieldProperties
sidebar_label: "alterCollectionFieldProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于修改指定集合字段的属性。 | Node.js"
type: docx
token: RQH5dhSenoDGjYxyBb2c3n1rnie
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionFieldProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionFieldProperties()

此操作用于修改指定集合字段的属性。

```javascript
await milvusClient.alterCollectionFieldProperties(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterCollectionFieldProperties({
   db_name?: string
   collection_name: string,
   field_name: string,
   properties: Properties,
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    持有目标集合的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    要重新分配别名的目标集合名称。

- **field_name** (*string*) -

    **[必需]**

    目标字段名称。

- **properties** (*Properties*) -

    **[必需]**

    要更改的属性及其期望值，采用 TypeScript **Record** 表示。可能的值如下：

    - **max_length** (*number*) -

        允许插入的字符串的最大字节长度。请注意，多字节字符（例如 Unicode 字符）每个可能占用多个字节，因此请确保插入字符串的字节长度不超过指定限制。取值范围：[1, 65,535]。

        这是 **DataType.VARCHAR** 字段的必需项。

    - **max_capacity** (*number*) -

        Array 字段值中的元素数量。

        这是 **DataType.ARRAY** 字段的必需项。

    - **mmap_enabled** (*bool*) -

        是否让 Milvus 将字段数据映射到内存中，而不是将其完全加载到内存。详情请参见 MMap-enabled Data Storage。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterCollectionField({
  collection_name: 'my-collection',
  field_name: 'my-field',
  properties: {"mmap.enabled": true}
});
```

