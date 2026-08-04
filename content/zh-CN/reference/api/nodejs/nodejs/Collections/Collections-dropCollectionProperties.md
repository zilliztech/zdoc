---
title: "dropCollectionProperties() | Node.js"
slug: /node/node/Collections-dropCollectionProperties
sidebar_label: "dropCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将特定 collection 的属性重置为其默认值。 | Node.js"
type: docx
token: EjFMdRFz0ofehXxxCPqc6raSnAg
sidebar_position: 11
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionProperties()

此操作会将特定 collection 的属性重置为其默认值。

```javascript
await milvusClient.dropCollectionProperties(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropCollectionProperties({
   db_name?: string
   collection_name: string,
   properties: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    持有目标 collection 的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    目标 collection 的名称。

- **properties** (*string[]*) -

    **[REQUIRED]**

    要更改的属性及其预期值，以 TypeScript **Record** 表示。可能的值如下：

    - **collection.ttl.seconds** -

        collection 的生存时间（TTL），以秒为单位。

    - **mmap.enabled** -

        是否为 collection 中所有字段的原始数据和索引启用 mmap。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

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

    指示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    指示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。 

- **reason** (*string*) - 

    指示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropCollectionProperties({
    collection_name: 'my-collection',
    delete_keys: ["collection.ttl.seconds"]
});
```

