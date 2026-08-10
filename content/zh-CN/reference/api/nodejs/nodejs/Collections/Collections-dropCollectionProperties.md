---
title: "dropCollectionProperties() | Node.js"
slug: /node/node/Collections-dropCollectionProperties
sidebar_label: "dropCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将特定 Collection 的属性重置为默认值。 | Node.js"
type: docx
token: EjFMdRFz0ofehXxxCPqc6raSnAg
sidebar_position: 11
keywords: 
  - 自然语言处理搜索
  - llm 幻觉
  - 多模态搜索
  - 向量搜索算法
  - zilliz
  - zilliz cloud
  - 云
  - dropCollectionProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionProperties()

此操作会将特定 Collection 的属性重置为默认值。

```javascript
await milvusClient.dropCollectionProperties(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropCollectionProperties({
   db_name?: string
   collection_name: string,
   properties: string[],
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    目标 Collection 的名称。

- **properties** (*string[]*) -

    **[必需]**

    要更改的属性及其期望值，以 TypeScript **Record** 形式提供。可选值如下：

    - **collection.ttl.seconds** -

        Collection 的生存时间（TTL），单位为秒。

    - **mmap.enabled** -

        是否为 Collection 中所有字段的原始数据和索引启用 mmap。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示在收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 promise，该 promise 会解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

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

