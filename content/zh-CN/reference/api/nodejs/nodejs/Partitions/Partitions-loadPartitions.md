---
title: "loadPartitions() | Node.js"
slug: /node/node/Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将指定 collection 中的一组特定 partitions 加载到内存中。 | Node.js"
type: docx
token: Pyh3dttWKoBqcBx8FGhcArhAnqg
sidebar_position: 6
keywords: 
  - 向量数据库
  - IVF
  - knn
  - 图像搜索
  - zilliz
  - zilliz cloud
  - cloud
  - loadPartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitions()

此操作会将指定 collection 中的一组特定 partitions 加载到内存中。

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

    保存目标 collection 的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    已存在的 collection 名称。

- **partition_names** (string[]) -

    **[必需]**

    要加载的 partitions 名称列表。

- **replica_number** (*number*) -

    partition 的副本数量。

- **resource_groups** (*string[]*) -

    partition 所在的资源组列表。

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作将超时。

**返回值** *Promise\<ResStatus>*

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

    表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误码。如果此操作成功，则其值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

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

