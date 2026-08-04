---
title: "getReplicas() | Node.js"
slug: /node/node/Management-getReplicas
sidebar_label: "getReplicas()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作获取集合的副本，返回每个副本的信息，包括其 ID、节点分配和分片详细信息。 | Node.js"
type: docx
token: XKRWdKvQVolmduxrtrDc0dhjnzc
sidebar_position: 28
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - getReplicas()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getReplicas()

此操作获取集合的副本，返回每个副本的信息，包括其 ID、节点分配和分片详细信息。

```javascript
await milvusClient.getReplicas(data: GetReplicaReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getReplicas({
    collectionID: number | string,
    with_shard_nodes?: boolean,
    timeout?: number,
})
```

**参数：**

- **collectionID** (*number | string*) -

    **[必需]**

    集合的 ID。

- **with_shard_nodes** (*boolean*) -

    是否在响应中包含分片节点信息。可选。

- **timeout** (*number*) -

    以毫秒为单位的 RPC 超时时间。可选。

**返回值** *Promise&lt;ReplicasResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **ReplicasResponse** 对象。

```typescript
{
    replicas: ReplicaInfo[],
    status:  ResStatus
}
```

**参数：**

- **replicas** (*ReplicaInfo[]*) -<br/>
  当前为所请求集合提供服务的副本列表。

    - **replicaID** (*string*) -

        副本标识符。

    - **collectionID** (*string*) -

        集合标识符。

    - **partition_ids** (*string[]*) -

        此副本覆盖的分区标识符。

    - **shard_replicas** (*ShardReplica[]*) -

        每个分片的 leader 和节点分配信息。

        - **leaderID** (*string*) -

        作为分片 leader 的查询节点 ID。

        - **leader_addr** (*string*) -

        leader 查询节点的地址。

        - **dm_channel_name** (*string*) -

        此分片服务的 DML 通道。

        - **node_ids** (*string[]*) -

        持有此分片数据的查询节点 ID。

        - **leaderID** (*string*) -

            作为分片 leader 的查询节点 ID。

        - **leader_addr** (*string*) -

            leader 查询节点的地址。

        - **dm_channel_name** (*string*) -

            此分片服务的 DML 通道。

        - **node_ids** (*string[]*) -

            持有此分片数据的查询节点 ID。

    - **node_ids** (*string[]*) -

        参与此副本的查询节点 ID。

    - **resource_group_name** (*string*) -

        拥有此副本节点的资源组。

    - **num_outbound_node** (*Record&lt;string, number&gt;*) -

        每个资源组的出站节点数量，在重平衡期间使用。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则始终为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误码。如果此操作成功，则始终为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因描述。如果此操作成功，则始终为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const desc = await client.describeCollection({ collection_name: 'my_collection' });
const replicas = await client.getReplicas({
    collectionID: desc.collectionID,
});
console.log(replicas.replicas);
```
