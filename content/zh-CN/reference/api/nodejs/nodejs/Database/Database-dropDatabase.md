---
title: "dropDatabase() | Node.js"
slug: /node/node/Database-dropDatabase
sidebar_label: "dropDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "此操作用于删除 Database。 | Node.js"
type: docx
token: Ja99dnnaOoncwbx2zIPc4PjunXx
sidebar_position: 3
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - dropDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabase()

此操作用于删除 Database。

```javascript
await milvusClient.dropDatabase(data?)
```

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated 集群。

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

    要删除的 Database 名称。

    必须存在具有指定名称的 Database。否则将发生异常。

- **timeout** (*number*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回** *Promise |&lt;ResStatus&gt;*

此方法返回一个 promise，该 promise 会解析为 **ResStatus** 对象。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，其值保持为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，其值保持为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，其值保持为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropDatabase({ db_name: 'db_to_drop' });
```

