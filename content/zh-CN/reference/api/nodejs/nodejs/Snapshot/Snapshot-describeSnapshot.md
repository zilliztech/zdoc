---
title: "describeSnapshot() | Node.js"
slug: /node/node/Snapshot-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检索特定快照的详细信息。 | Node.js"
type: docx
token: KNOwdbcYXoVwGEx8ysScLO1CnUd
sidebar_position: 2
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - describeSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeSnapshot()

此操作检索特定快照的详细信息。

```typescript
await milvusClient.describeSnapshot(data: DescribeSnapshotReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.describeSnapshot({
    collection_name: string,
    snapshot_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **collection_name** (*string*) -<br/>
  **[必需]**<br/>
  该快照所属集合的名称。

- **snapshot_name** (*string*) -<br/>
  **[必需]**<br/>
  要描述的快照名称。

- **db_name** (*string*) -<br/>
  数据库名称。可选。

- **timeout** (*number*) -<br/>
  允许 RPC 执行的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回值** *Promise&lt;DescribeSnapshotResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **DescribeSnapshotResponse** 对象。

```typescript
{
    name: string,
    description: string,
    collection_name: string,
    partition_names: string[],
    create_ts: string,
    s3_location: string,
    status:  ResStatus
}
```

**参数：**

- **name** (*string*) -<br/>
  快照名称。

- **description** (*string*) -<br/>
  创建快照时提供的描述；如果未提供，则为空字符串。

- **collection_name** (*string*) -<br/>
  拥有该快照的集合。

- **partition_names** (*string[]*) -<br/>
  由该快照捕获的分区名称。

- **create_ts** (*string*) -<br/>
  创建该快照时的混合时间戳。

- **s3_location** (*string*) -<br/>
  持久化存储该快照数据的对象存储 URI。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值始终为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.describeSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
});
```
