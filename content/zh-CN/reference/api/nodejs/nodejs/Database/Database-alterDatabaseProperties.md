---
title: "alterDatabaseProperties() | Node.js"
slug: /node/node/Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改指定 Database 的属性。 | Node.js"
type: docx
token: NNWed9Vd1o7vDkxY4pncM4wYnaf
sidebar_position: 7
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - zilliz
  - Zilliz Cloud
  - 云
  - alterDatabaseProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

此操作会修改指定 Database 的属性。

```javascript
await milvusClient.alterDatabaseProperties(data)
```

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated 集群。

</Admonition>

## 请求语法\{#request-syntax}

```javascript
await milvusClient.alterDatabaseProperties({
    db_name: string,
    delete_keys: Object,
    properties: Record<string, string | number | boolean>
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    要修改其属性的 Database 名称。

    必须存在具有指定名称的 Database。否则将发生异常。

- **delete_properties** (*string[]*) -

    以数组形式指定要删除的属性名称。可用的 Database 属性如下：

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

- **properties** (*Record&lt;string, string | number | boolean&gt;*) -

    以键值对形式指定属性及其值。

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

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise |&lt;ResStatus&gt;*

此方法返回一个 promise，其解析结果为 **ResStatus** 对象。

```javascript
{
    code: number
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
const resStatus = await milvusClient.alterDatabaseProperties({ 
    db_name: 'new_db',
    delete_properties: {'database.replica.number': 3} 
});
```

