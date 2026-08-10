---
title: "getCollectionStatistics() | Node.js"
slug: /node/node/Collections-getCollectionStatistics
sidebar_label: "getCollectionStatistics()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出在特定 Collection 上收集的统计信息。 | Node.js"
type: docx
token: LQMGdRHjKogdeMxekCtcdBLqnNf
sidebar_position: 12
keywords: 
  - nn 搜索
  - llm 评估
  - 稀疏 vs 稠密
  - 稠密向量
  - zilliz
  - zilliz cloud
  - 云
  - getCollectionStatistics()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getCollectionStatistics()

此操作列出在特定 Collection 上收集的统计信息。

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

    包含目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    Collection 名称。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示此操作会在返回任意响应或发生错误时超时。

**返回值** *Promise&lt;StatisticsResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **StatisticsResponse** 对象。

```typescript
{
    stats: KeyValuePair[],
    data: { [x: string]: any },
    status:  ResStatus
}
```

**参数：**

- **stats** (*KeyValuePair[]*) -<br/>
  Milvus 返回的原始统计信息列表。每个条目都包含一个 **key**（例如 **row_count**）以及一个字符串类型的 **value**。

- **data** (*Record&lt;string, any&gt;*) -<br/>
  为方便使用而提供的 **stats** 扁平化键索引视图。例如，`data.row_count` 以字符串形式返回行数。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

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
 const res = await milvusClient.getCollectionStatistics({ collection_name: 'my_collection' });
```

