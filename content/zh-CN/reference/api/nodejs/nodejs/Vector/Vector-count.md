---
title: "count() | Node.js"
slug: /node/node/Vector-count
sidebar_label: "count()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于统计与指定过滤表达式匹配的实体数量。 | Node.js"
type: docx
token: NaOadUNSpo1EsIxPMSfc0R4Hnfb
sidebar_position: 1
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - count()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# count()

此操作用于统计与指定过滤表达式匹配的实体数量。

```javascript
await milvusClient.count(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.count({
    db_name?: string,
    collection_name: string,
    expr?: string,
    timeout?: boolean
})
```

**参数：**

- **db_name** (*str*) -

    保存目标集合的数据库名称。

- **collection_name** (*str*) -

    **[必填]**

    要为其创建别名的集合名称。

- **expr** (*string*) -

    用于筛选匹配实体的标量过滤条件。 

    你可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见[布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise&lt;CountResult&gt;*

此方法返回一个 Promise，该 Promise 解析为一个 **CountResult** 对象。

```typescript
{
    data: number,
    status:  ResStatus
}
```

**参数：**

- **data** (*number*) -<br/>
  集合中与提供的过滤表达式匹配的行数。未提供表达式时，该值为总行数。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        指示操作结果的代码。如果此操作成功，则该值始终为 **0**。

    - **error_code** (*string* | *number*) -

        指示已发生错误的错误代码。如果此操作成功，则该值始终为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。

## 示例\{#examples}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const num_entities = await milvusClient.count({
   collection_name: 'my_collection',
   expr: "age in [1,2,3,4,5,6,7,8]",
});

// 1000
```
