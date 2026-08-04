---
title: "listPartitions() | Node.js"
slug: /node/node/Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出指定集合中的分区。 | Node.js"
type: docx
token: IvnLd6nXooRR6NxM9jdcDxCHnhh
sidebar_position: 5
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - listPartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

此操作列出指定集合中的分区。

```javascript
await milvusClient.listPartitions(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.listPartitions({
    db_name: string,
    collection_name: string,
    timeout?: number,
    type?: ShowPartitionsType
 })
```

**参数：**

- **db_name** (*string*) -

    保存目标集合的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    现有集合的名称。

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **type** (*ShowPartitionsType*) - 

    决定列出所有分区，还是仅列出已加载的分区。**ShowPartitionsType** 具有以下值：

    - **All** = 0

        表示列出所有分区。

    - **Loaded** = 1

        表示仅列出已加载的分区。

**返回值** *Promise&lt;ShowPartitionsResponse&gt;*

此方法返回一个 promise，解析为 **ShowPartitionsResponse** 对象。

```typescript
{
    partition_names: string[],
    partitionIDs: number[],
    data: PartitionData[],
    status:  ResStatus
}
```

**参数：**

- **partition_names** (*string[]*) -<br/>
  集合上定义的分区名称列表。

- **partitionIDs** (*number[]*) -<br/>
  分区的内部标识符，顺序与 **partition_names** 相同。

- **data** (*PartitionData[]*) -<br/>
  按分区展平的视图，包含名称、标识符、创建时间戳和加载百分比。

    - **name** (*string*) -

        分区名称。

    - **id** (*string*) -

        分区标识符。

    - **timestamp** (*string*) -

        分区的创建时间戳。

    - **loadedPercentage** (*string*) -

        当前已加载到内存中的分区百分比。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则始终为空字符串。

## 示例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).listPartitions({
    collection_name: 'my_collection',
 });
```

