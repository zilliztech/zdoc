---
title: "createPartition() | Node.js"
slug: /node/node/Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在目标 Collection 中创建一个 Partition。 | Node.js"
type: docx
token: PPLtdSbtfomgF1x5MHncKPgPnSf
sidebar_position: 1
keywords: 
  - knn
  - 图像搜索
  - LLMs
  - 机器学习
  - zilliz
  - zilliz cloud
  - cloud
  - createPartition()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createPartition()

此操作会在目标 Collection 中创建一个 Partition。

```javascript
await milvusClient.createPartition(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.createPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 });
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **partition_name** (*string*)

    **[必需]**

    要创建的 Partition 名称。

- **timeout** (*number*)  

    此操作的超时时长。

    将此项设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回** *Promise\<ResStatus>*

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

    表示所报告错误原因的原因。如果此操作成功，则其值为空字符串。

## 示例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).createPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

