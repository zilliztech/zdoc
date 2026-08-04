---
title: "useDatabase() | Node.js"
slug: /node/node/Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "此操作为 gRPC 客户端设置活动数据库。 | Node.js"
type: docx
token: NDcldy9OLo62DLxw1a9cFSLsnYb
sidebar_position: 6
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# useDatabase()

此操作为 gRPC 客户端设置活动数据库。

```javascript
await milvusClient.useDatabase(data?)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.useDatabase({
    db_name: string
})
```

**参数：**

- **db_name** (*string*) -

    要使用的数据库名称。

    必须存在具有指定名称的数据库。否则，将会发生异常。

**返回值** *Promise |&lt;ResStatus&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，该值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，该值保持为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，该值保持为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.useDatabase({ db_name: 'new_db' });
```
