---
title: "truncateCollection() | Node.js"
slug: /node/node/Collections-truncateCollection
sidebar_label: "truncateCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会移除集合中的所有数据，但会保留集合的 schema 和结构。 | Node.js"
type: docx
token: J0IBdbw3Voyqw9xnInUcn9EonTe
sidebar_position: 28
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - truncateCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# truncateCollection()

此操作会移除集合中的所有数据，但会保留集合的 schema 和结构。

```javascript
await milvusClient.truncateCollection(data: TruncateCollectionRequest)
```

<Admonition type="info" icon="📘" title="说明">

- **不可逆操作**

    截断集合会永久删除所有数据。

- **保留 schema**

    集合结构、字段、索引和属性都会保持不变。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
truncateCollection({
    db_name?: string,
    collection_name: string,
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    包含该集合的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    目标集合的名称。

- **timeout** (*number*) -

    以毫秒为单位的 RPC 超时时间。

**返回：**

*Promise\<ResStatus\>*

此方法会返回一个 promise，该 promise 解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的状态码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

### 基本用法\{#basic-usage}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

// Truncate collection
const res = await milvusClient.truncateCollection({
  collection_name: 'my_collection',
});

console.log(res);
// Output: { error_code: 'Success', reason: '' }
```

### 指定数据库\{#with-database-specified}

```javascript
const res = await milvusClient.truncateCollection({
  db_name: 'my_database',
  collection_name: 'my_collection',
});
```
