---
title: "listAliases() | Node.js"
slug: /node/node/Collections-listAliases
sidebar_label: "listAliases()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "这是一个方法模板。 | Node.js"
type: docx
token: KeoKdlitaog6n1xpX8McIIIrnWb
sidebar_position: 14
keywords: 
  - 什么是语义搜索
  - Embedding model
  - 图像相似性搜索
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - listAliases()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listAliases()

这是一个方法模板。

```javascript
await milvusClient.listAliases(data)
```

## 请求语法\{#request-syntax}

此方法具有以下形式。

```javascript
listAliases({
    db_name: string
    collection_name: string
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    持有目标集合的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    现有集合的名称。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当返回任意响应或发生错误时，此操作将超时。

**返回值** *Promise&lt;ListAliasesResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **ListAliasesResponse** 对象。

```typescript
{
    db_name: string,
    aliases: string[],
    collection_name: string,
    status:  ResStatus
}
```

**参数：**

- **db_name** (*string*) -<br/>
  拥有所列别名的数据库。

- **aliases** (*string[]*) -<br/>
  指向所请求集合的所有别名列表。

- **collection_name** (*string*) -<br/>
  所列别名指向的集合名称。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        指示所报告错误原因的说明。如果此操作成功，则该值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listAliases({ collection_name: 'my_collection' });
```

