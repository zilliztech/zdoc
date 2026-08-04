---
title: "hasPartition() | Node.js"
slug: /node/node/Partitions-hasPartition
sidebar_label: "hasPartition()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作用于检查指定集合中是否存在指定分区。 | Node.js"
type: docx
token: TVWPdTw2WoPAJYxsbGMc7MX6nEf
sidebar_position: 4
keywords: 
  - milvus 的工作原理
  - Zilliz 向量数据库
  - Zilliz 数据库
  - 非结构化数据
  - zilliz
  - zilliz cloud
  - cloud
  - hasPartition()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hasPartition()

此操作用于检查指定集合中是否存在指定分区。

```javascript
await milvusClient.hasPartition(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.hasPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    持有目标集合的数据库名称。

- **collection_name** (*string*) -

    **[REQUIRED]**

    已存在集合的名称。

- **partition_name** (*string*)

    **[REQUIRED]**

    要检查的分区名称。

- **timeout** (*number*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回值** *Promise&lt;BoolResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **BoolResponse** 对象。

```typescript
{
    value: boolean,
    status:  ResStatus
}
```

**参数：**

- **value** (*boolean*) -<br/>
  一个布尔值，用于指示请求的分区是否存在于集合中。分区存在时为 **true**，不存在时为 **false**。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

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
}).hasPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

