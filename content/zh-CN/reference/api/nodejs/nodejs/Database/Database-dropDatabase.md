---
title: "dropDatabase() | Node.js"
slug: /node/node/Database-dropDatabase
sidebar_label: "dropDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "此操作会删除数据库。 | Node.js"
type: docx
token: Ja99dnnaOoncwbx2zIPc4PjunXx
sidebar_position: 3
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabase()

此操作会删除数据库。

```javascript
await milvusClient.dropDatabase(data?)
```

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专属集群。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropDatabase({
    db_name: string,
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    要删除的数据库名称。

    必须存在具有指定名称的数据库。否则将发生异常。

- **timeout** (*number*) -

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

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

    表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropDatabase({ db_name: 'db_to_drop' });
```

