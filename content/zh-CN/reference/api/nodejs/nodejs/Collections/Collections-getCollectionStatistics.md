---
title: "getCollectionStatistics() | Node.js"
slug: /node/node/Collections-getCollectionStatistics
sidebar_label: "getCollectionStatistics()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出在特定 collection 上收集的统计信息。 | Node.js"
type: docx
token: LQMGdRHjKogdeMxekCtcdBLqnNf
sidebar_position: 12
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - getCollectionStatistics()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getCollectionStatistics()

此操作列出在特定 collection 上收集的统计信息。

```javascript
await milvusClient.getCollectionStatistics(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getCollectionStatistics({ 
    db_name: string,
    collection_name: string,
    timeout?: number 
})
```

**参数：**

- **db_name** (*string*) -

    保存目标 collection 的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    collection 的名称。

- **timeout** (*number*) -

    此操作的超时时长。

    将其设置为 **None** 表示当返回任意响应或发生错误时，此操作即超时。

**返回值** *Promise&lt;StatisticsResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为一个 **StatisticsResponse** 对象。

```typescript
{
    stats: KeyValuePair[],
    data: { [x: string]: any },
    status:  ResStatus
}
```

**参数：**

- **stats** (*KeyValuePair[]*) -<br/>
  Milvus 返回的原始统计信息列表。每个条目都包含一个 **key**（例如 **row_count**）和一个字符串类型的 **value**。

- **data** (*Record&lt;string, any&gt;*) -<br/>
  为便于使用而提供的 **stats** 扁平化键索引视图。例如，`data.row_count` 以字符串形式返回行数。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.getCollectionStatistics({ collection_name: 'my_collection' });
```

