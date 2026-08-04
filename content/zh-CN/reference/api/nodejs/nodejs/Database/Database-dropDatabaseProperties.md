---
title: "dropDatabaseProperties() | Node.js"
slug: /node/node/Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作删除指定属性的设置。 | Node.js"
type: docx
token: GulFdOWMboEK9bxnzMSc8Uf8n8b
sidebar_position: 4
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabaseProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

此操作删除指定属性的设置。

```javascript
await milvusClient.dropDatabaseProperties(data)
```

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专属集群。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropDatabaseProperties({
    db_name: string,
    delete_properties: string[],
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    要删除其属性的数据库名称。

    应存在具有指定名称的数据库。否则将发生异常。

- **delete_properties** (*string[]*) -

    以数组形式指定要删除的属性名称。可用的数据库属性如下：

    - **database.replica.number** (*int*) -

        数据库的副本数量。

    - **database.resource_groups** (*[]str*) -

        专用于该数据库的资源组。

    - **database.diskQuota.mb** (*int*) -

        分配给数据库的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) -

        数据库中允许的最大 collection 数量。

    - **database.force.deny.writing** (*bool*) -

        是否拒绝数据库中的所有写入操作。

    - **database.force.deny.reading** (*bool*) -

        是否拒绝数据库中的所有读取操作。

- **timeout** (*number*) -

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise |&lt;ResStatus&gt;*

此方法返回一个 promise，解析为一个 **ResStatus** 对象。

```javascript
{
    code: number
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropDatabaseProperties({ 
    db_name: 'new_db',
    delete_properties: ["database.replica.number"] 
});
```
