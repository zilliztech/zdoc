---
title: "compact() | Node.js"
slug: /node/node/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会压缩并合并较小的 segment 为更大的 segment，以节省内存使用并提升搜索性能。 | Node.js"
type: docx
token: DCK5d56UZop0kGxpQu8cLqlvndg
sidebar_position: 2
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# compact()

此操作会压缩并合并较小的 segment 为更大的 segment，以节省内存使用并提升搜索性能。

```javascript
await milvusClient.compact(data)
```

## 请求语法\{#request-syntax}

```javascript
milvusClient.compact()
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要重新分配别名的目标 collection 名称。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise&lt;CompactionResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **CompactionResponse** 对象。

```typescript
{
    compactionID: string,
    compactionPlanCount: number,
    status:  ResStatus
}
```

**参数：**

- **compactionID** (*string*) -<br/>
  compaction 操作的标识符。将此值传递给 `getCompactionState()` 或 `getCompactionStateWithPlans()` 以轮询进度。

- **compactionPlanCount** (*number*) -<br/>
  为此操作生成的 compaction 计划数量。

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
 const resStatus = await milvusClient.compact({
      collection_name: 'my_collection',
 });
```

