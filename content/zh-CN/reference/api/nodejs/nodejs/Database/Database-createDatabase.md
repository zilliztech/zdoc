---
title: "createDatabase() | Node.js"
slug: /node/node/Database-createDatabase
sidebar_label: "createDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作创建一个 Database。 | Node.js"
type: docx
token: UouKd4h01oL9Rqx73jjcHM3enSh
sidebar_position: 2
keywords: 
  - milvus Database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - createDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createDatabase()

此操作创建一个 Database。

```javascript
await milvusClient.createDatabase(data)
```

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated 集群。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.createDatabase({
    db_name: string,
    properties?: Object
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    要创建的 Database 名称。

    不能存在与指定名称相同的 Database。否则将发生异常。

- **properties** (*Object*) -

    创建 Database 时一并设置的属性。可选的 Database 属性如下：

    - **database.replica.number** (*int*) -

        Database 的副本数量。

    - **database.resource_groups** (*[]str*) -

        专用于该 Database 的资源组。

    - **database.diskQuota.mb** (*int*) -

        为该 Database 分配的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) -

        该 Database 中允许的最大 Collection 数量。

    - **database.force.deny.writing** (*bool*) -

        是否拒绝该 Database 中的所有写入操作。

    - **database.force.deny.reading** (*bool*) -

        是否拒绝该 Database 中的所有读取操作。

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

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.createDatabase({
    db_name: 'new_db',
    properties: { 'database.resource_groups': 'rg1' },
});
```
