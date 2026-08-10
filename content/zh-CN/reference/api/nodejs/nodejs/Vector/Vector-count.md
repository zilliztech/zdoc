---
title: "count() | Node.js"
slug: /node/node/Vector-count
sidebar_label: "count()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于统计与指定过滤表达式匹配的 Entity 数量。 | Node.js"
type: docx
token: NaOadUNSpo1EsIxPMSfc0R4Hnfb
sidebar_position: 1
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - zilliz cloud
  - 云
  - count()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# count()

此操作用于统计与指定过滤表达式匹配的 Entity 数量。

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

    保存目标 Collection 的 Database 名称。

- **collection_name** (*str*) -

    **[必填]**

    要为其创建别名的 Collection 名称。

- **expr** (*string*) -

    用于筛选匹配 Entity 的标量过滤条件。 

    您可以将此参数设置为空字符串，以跳过标量过滤。要构建标量过滤条件，请参见 [布尔表达式规则](https://milvus.io/docs/boolean.md)。 

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise&lt;CountResult&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **CountResult** 对象。

```typescript
{
    data: number,
    status:  ResStatus
}
```

**参数：**

- **data** (*number*) -<br/>
  Collection 中与所提供过滤表达式匹配的行数。未提供表达式时，该值为总行数。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的状态码。如果此操作成功，则该值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则该值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。

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
