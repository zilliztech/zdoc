---
title: "get() | Node.js"
slug: /node/node/Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过 ID 获取特定实体。 | Node.js"
type: docx
token: IbxXdvdZlonJk9xnlk2cZlIinCh
sidebar_position: 3
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - get()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# get()

此操作通过其 ID 获取特定实体。

```javascript
await milvusClient.get(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.get({
   db_name: string,
   collection_name: string,
   consistency_level?: ConsistencyLevelEnum,
   ids: string[] | number[],
   limit?: number,
   offset?: number,
   output_fields?: string[],
   partition_names?: string[],
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    持有目标集合的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    现有集合的名称。

- **ids** (*string[]* | *number[]*) -

    **[REQUIRED]**

    一个特定实体 ID 或实体 ID 列表。

- **consistency_level** (*string*) -

    目标集合的一致性级别。

- **limit** (*number*) -

    要返回的实体总数。

    你可以将此参数与 **param** 中的 **offset** 结合使用，以启用分页。

    此值与 **param** 中 **offset** 的总和应小于 16,384。 

- **offset** (*number*) -

    在搜索结果中要跳过的记录数。 

    你可以将此参数与 `limit` 结合使用，以启用分页。

    此值与 `limit` 的总和应小于 16,384。 

- **partition_names** (*string[]*) -

    目标集合中分区名称的列表。

- **output_fields** (*string[]*) -

    返回的每个实体中要包含的字段名称列表。

    该值默认为 **None**。如果未指定，则选择所有字段作为输出字段。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回值** *Promise&lt;QueryResults&gt;*

此方法返回一个 promise，解析为 **QueryResults** 对象。

```typescript
{
    data: Record<string, any>[],
    status:  ResStatus
}
```

**参数：**

- **data** (*Record&lt;string, any&gt;[]*) -<br/>
  主键与提供的 **ids** 匹配的行。每个条目都以字段名为键，并携带每个请求的 **output_fields** 条目的值以及主键。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则始终为 **0**。

    - **error_code** (*string* | *number*) -

        指示已发生错误的错误码。如果此操作成功，则始终为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则始终为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const getResults = await milvusClient.get({
   collection_name: 'my_collection',
   ids: ['1','2','3','4','5','6','7','8'],
   output_fields: ["age"],
 });
```

