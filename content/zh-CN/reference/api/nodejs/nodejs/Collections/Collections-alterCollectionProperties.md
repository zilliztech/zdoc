---
title: "alterCollectionProperties() | Node.js"
slug: /node/node/Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改指定集合的属性。 | Node.js"
type: docx
token: EHPGdbCP5o7UzCxlDnRc6y5Pn1c
sidebar_position: 3
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionProperties()

此操作会修改指定集合的属性。

```javascript
await milvusClient.alterCollectionProperties(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.alterCollectionProperties({
   db_name?: string
   collection_name: string,
   delete_keys?: string[],
   properties: Properties,
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    保存目标集合的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    要重新分配别名的目标集合名称。

- **delete_keys** (*string[]*) -

    要删除的属性。

- **properties** (*Properties*) -

    **[REQUIRED]**

    要更改的属性及其期望值，以 TypeScript **Record** 的形式提供。可能的值如下：

    - **collection.ttl.seconds** (*number*) -

        集合的生存时间（TTL），单位为秒。

    - **mmap.enabled** (*bool*) -

        是否为集合中所有字段的原始数据和索引启用 mmap。

- **timeout** (*number*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**RETURNS** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则始终为空字符串。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterCollection({
    collection_name: 'my-collection',
    properties: {"collection.ttl.seconds": 18000}
});
```

