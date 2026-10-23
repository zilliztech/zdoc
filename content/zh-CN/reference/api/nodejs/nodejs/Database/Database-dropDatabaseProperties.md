---
title: "dropDatabaseProperties() | Node.js"
slug: /node/node/Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除指定属性的设置。 | Node.js"
type: docx
token: GulFdOWMboEK9bxnzMSc8Uf8n8b
sidebar_position: 4
keywords: 
  - 异常检测
  - 句子转换器
  - 推荐系统
  - 信息检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropDatabaseProperties()
  - Node.js 3.0
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

此操作会删除指定属性的设置。

```javascript
await milvusClient.dropDatabaseProperties(data)
```

<Admonition type="info" title="Notes">

此方法仅适用于 Dedicated 集群。

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

- **db_name** （*string*） -

    要删除其属性设置的 Database 名称。

    必须存在具有指定名称的 Database。否则，将会发生异常。

- **delete_properties** （*string[]*） -

    要删除的属性名称，以数组形式提供。可用的 Database 属性如下：

    - **database.replica.number** （*int*） -

        此 Database 属性用于指定 Database 的副本数。

    - **database.resource_groups** （*[]str*） -

        此 Database 属性用于指定专供 Database 使用的资源组。

    - **database.diskQuota.mb** （*int*） -

        此 Database 属性用于指定分配给 Database 的磁盘配额，以兆字节（**MB**）为单位。

    - **database.max.collections** （*int*） -

        此 Database 属性用于指定 Database 中允许的最大 Collection 数量。

    - **database.force.deny.writing** （*bool*） -

        此 Database 属性用于指定是否拒绝 Database 中的所有写操作。

    - **database.force.deny.reading** （*bool*） -

        此 Database 属性用于指定是否拒绝 Database 中的所有读操作。

- **timeout** （*number*） -

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生错误时，此操作即超时。

**返回：** *Promise |&lt;ResStatus&gt;*

此方法返回一个会解析为 **ResStatus** 对象的 Promise。

```javascript
{
    code: number
    error_code: string | number,
    reason: string
}
```

**参数：**

- **code** （*number*） -

    表示操作结果的代码。如果此操作成功，该值保持为 **0**。

- **error_code** （*string* | *number*） -

    表示所发生错误的错误代码。如果此操作成功，该值保持为 **Success**。

- **reason** （*string*） - 

    用于说明所报告错误的原因。如果此操作成功，该值为空字符串。

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
