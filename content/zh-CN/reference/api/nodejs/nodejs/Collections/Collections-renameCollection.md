---
title: "renameCollection() | Node.js"
slug: /node/node/Collections-renameCollection
sidebar_label: "renameCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将重命名现有集合。 | Node.js"
type: docx
token: LSwVdMg4SorzZ5xSHHVcQeVDnfh
sidebar_position: 16
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - renameCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# renameCollection()

此操作将重命名现有集合。

```javascript
await milvusClient.renameCollection(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.renameCollection({
   db_name: string,
   collection_name: string,
   new_collection_name: string,
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    保存目标集合的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    现有集合的名称。

- **new_collection_name** (*string*) -

    **[REQUIRED]**

    此操作完成后目标集合的新名称。

- **timeout** (*number*) -

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

此方法返回一个 Promise，该 Promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.renameCollection({
   collection_name: 'my_collection',
   new_collection_name: 'my_new_collection'
 });
```

