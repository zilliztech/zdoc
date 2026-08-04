---
title: "dropPartition() | Node.js"
slug: /node/node/Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从当前集合中删除指定分区。 | Node.js"
type: docx
token: BBmsddqZEozxWyxkoADcFfzpncW
sidebar_position: 2
keywords: 
  - 无服务器向量数据库
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量数据库
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

此操作从当前集合中删除指定分区。

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

    保存目标集合的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    现有集合的名称。

- **partition_name** (*string*)

    **[必需]**

    要删除的分区名称。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回值** *Promise\<ResStatus>*

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

    表示操作结果的代码。如果此操作成功，则该值始终为 **0**。

- **error_code** (*string* | *number*) -

    表示已发生错误的错误代码。如果此操作成功，则该值始终为 **Success**。 

- **reason** (*string*) - 

    表示所报告错误原因的说明。如果此操作成功，则该值始终为空字符串。

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

