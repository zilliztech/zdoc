---
title: "dropPartition() | Node.js"
slug: /node/node/Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从当前 Collection 中删除指定的 Partition。 | Node.js"
type: docx
token: BBmsddqZEozxWyxkoADcFfzpncW
sidebar_position: 2
keywords: 
  - Serverless 向量 Database
  - Milvus 开源
  - Milvus 的工作原理
  - Zilliz 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropPartition()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropPartition()

此操作会从当前 Collection 中删除指定的 Partition。

```javascript
await milvusClient.dropPartition(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.dropPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    持有目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必填]**

    现有 Collection 的名称。

- **partition_name** (*string*)

    **[必填]**

    要删除的 Partition 名称。

- **timeout** (*number*)  

    此操作的超时时长。

    将此项设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回** *Promise\<ResStatus>*

此方法返回一个 promise，解析为 **ResStatus** 对象。

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

    表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).dropPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

