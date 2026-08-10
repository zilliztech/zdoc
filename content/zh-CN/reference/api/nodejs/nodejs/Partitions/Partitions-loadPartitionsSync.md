---
title: "loadPartitionsSync() | Node.js"
slug: /node/node/Partitions-loadPartitionsSync
sidebar_label: "loadPartitionsSync()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将特定 Partition 的数据加载到内存中。这是一个同步函数，可帮助确保指定的 Partition 已完成加载。 | Node.js"
type: docx
token: VGofdSRi0o6EagxNkokc9Iinndf
sidebar_position: 7
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus 数据库
  - Milvus 向量数据库
  - Zilliz
  - Zilliz Cloud
  - 云
  - loadPartitionsSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitionsSync()

此操作会将特定 Partition 的数据加载到内存中。这是一个同步函数，可帮助确保指定的 Partition 已完成加载。

```javascript
await milvusClient.loadPartitionsSync(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.loadPartitionsSync({ 
    db_name: string,
    collection_name: string,
    refresh?: boolean,
    replica_number?: number,
    resource_groups?: string[],
    timeout?: number
})
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **partition_names** (string[]) -

    **[必需]**

    要加载的 Partition 名称列表。

- **replica_number** (*number*) -

    该 Partition 的副本数量。

- **resource_groups** (*string[]*) -

    该 Partition 中的资源组列表。

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回** *Promise\<ResStatus>*

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

    表示操作结果的代码。如果此操作成功，则其值为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则其值为 **Success**。

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其为空字符串。

## 示例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).loadPartitionsSync({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

