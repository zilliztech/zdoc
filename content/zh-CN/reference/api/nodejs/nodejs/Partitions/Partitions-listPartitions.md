---
title: "listPartitions() | Node.js"
slug: /node/node/Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出指定 Collection 中的 Partition。 | Node.js"
type: docx
token: IvnLd6nXooRR6NxM9jdcDxCHnhh
sidebar_position: 5
keywords: 
  - Serverless 向量 Database
  - milvus 开源
  - milvus 的工作原理
  - Zilliz 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - listPartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

此操作列出指定 Collection 中的 Partition。

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

    包含目标 Collection 的 Database 名称。

- **collection_name** (*string*) -

    **[必需]**

    现有 Collection 的名称。

- **timeout** (*number*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **type** (*ShowPartitionsType*) - 

    确定是列出所有 Partition，还是仅列出已加载的 Partition。**ShowPartitionsType** 具有以下值：

    - **All** = 0

        表示列出所有 Partition。

    - **Loaded** = 1

        表示仅列出已加载的 Partition。

**返回** *Promise&lt;ShowPartitionsResponse&gt;*

此方法返回一个 Promise，解析为 **ShowPartitionsResponse** 对象。

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
  Collection 上定义的 Partition 名称列表。

- **partitionIDs** (*number[]*) -<br/>
  Partition 的内部标识符，顺序与 **partition_names** 相同。

- **data** (*PartitionData[]*) -<br/>
  按 Partition 展开的视图，包含名称、标识符、创建时间戳和加载百分比。

    - **name** (*string*) -

        Partition 名称。

    - **id** (*string*) -

        Partition 标识符。

    - **timestamp** (*string*) -

        Partition 的创建时间戳。

    - **loadedPercentage** (*string*) -

        当前已加载到内存中的 Partition 百分比。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).listPartitions({
    collection_name: 'my_collection',
 });
```

