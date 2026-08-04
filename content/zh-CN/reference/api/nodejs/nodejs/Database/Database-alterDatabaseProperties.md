---
title: "alterDatabaseProperties() | Node.js"
slug: /node/node/Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作修改指定数据库的属性。 | Node.js"
type: docx
token: NNWed9Vd1o7vDkxY4pncM4wYnaf
sidebar_position: 7
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabaseProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

此操作修改指定数据库的属性。

```javascript
await milvusClient.alterDatabaseProperties(data)
```

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专用集群。

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

    要修改属性的数据库名称。

    必须存在具有指定名称的数据库。否则将发生异常。

- **delete_properties** (*string[]*) -

    要删除的属性名称数组。可用的数据库属性如下：

    - **database.replica.number** (*int*) -

        数据库的副本数量。

    - **database.resource_groups** (*[]str*) -

        专用于该数据库的资源组。

    - **database.diskQuota.mb** (*int*) -

        分配给数据库的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) -

        数据库中允许的最大集合数量。

    - **database.force.deny.writing** (*bool*) -

        是否拒绝数据库中的所有写操作。

    - **database.force.deny.reading** (*bool*) -

        是否拒绝数据库中的所有读操作。

- **properties** (*Record&lt;string, string | number | boolean&gt;*) -

    以键值对形式指定的属性及其值。

    - **database.replica.number** (*int*) -

        数据库的副本数量。

    - **database.resource_groups** (*[]str*) -

        专用于该数据库的资源组。

    - **database.diskQuota.mb** (*int*) -

        分配给数据库的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) -

        数据库中允许的最大集合数量。

    - **database.force.deny.writing** (*bool*) -

        是否拒绝数据库中的所有写操作。

    - **database.force.deny.reading** (*bool*) -

        是否拒绝数据库中的所有读操作。

- **timeout** (*number*) -

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回值** *Promise |&lt;ResStatus&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **ResStatus** 对象。

```javascript
{
    code: number
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** (*number*) -

    指示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    指示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。

- **reason** (*string*) - 

    指示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

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

