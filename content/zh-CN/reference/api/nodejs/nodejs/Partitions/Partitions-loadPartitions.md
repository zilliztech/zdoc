---
title: "loadPartitions() | Node.js"
slug: /node/node/Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将指定 Collection 中的一组特定 Partition 加载到内存中。 | Node.js"
type: docx
token: Pyh3dttWKoBqcBx8FGhcArhAnqg
sidebar_position: 6
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - loadPartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitions()

此操作会将指定 Collection 中的一组特定 Partition 加载到内存中。

```javascript
await milvusClient.loadPartitions(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.loadPartitions({
    db_name: string,
    collection_name: string,
    partition_names: string[],
    replica_number?: number,
    resource_groups[]?: string[],
    timeout?: number
 });
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

    Partition 的副本数量。

- **resource_groups** (*string[]*) -

    Partition 中的资源组列表。

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回** *Promise\<ResStatus>*

此方法返回一个 promise，其解析结果为 **ResStatus** 对象。

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

    表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).loadPartitions({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

