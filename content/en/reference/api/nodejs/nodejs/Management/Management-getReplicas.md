---
title: "getReplicas() | Node.js"
slug: /node/node/Management-getReplicas
sidebar_label: "getReplicas()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets replicas of a collection, returning information about each replica including its ID, node assignments, and shard details. | Node.js"
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

This operation gets replicas of a collection, returning information about each replica including its ID, node assignments, and shard details.

```javascript
await milvusClient.getReplicas(data: GetReplicaReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getReplicas({
    collectionID: number | string,
    with_shard_nodes?: boolean,
    timeout?: number,
})
```

**PARAMETERS:**

- **collectionID** (*number | string*) -

    **[REQUIRED]**

    The ID of the collection.

- **with_shard_nodes** (*boolean*) -

    Whether to include shard node information in the response. Optional.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS** *Promise&lt;ReplicasResponse&gt;*

This method returns a promise that resolves to a **ReplicasResponse** object.

```typescript
{
    replicas: ReplicaInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **replicas** (*ReplicaInfo[]*) -
A list of replicas currently serving the requested collection.

    - **replicaID** (*string*) -

        The replica identifier.

    - **collectionID** (*string*) -

        The collection identifier.

    - **partition_ids** (*string[]*) -

        The partition identifiers covered by this replica.

    - **shard_replicas** (*ShardReplica[]*) -

        Per-shard leader and node assignment information.

        - **leaderID** (*string*) -

        The query node ID acting as the shard leader.

        - **leader_addr** (*string*) -

        The address of the leader query node.

        - **dm_channel_name** (*string*) -

        The DML channel served by this shard.

        - **node_ids** (*string[]*) -

        The query node IDs that hold this shard's data.

        - **leaderID** (*string*) -

            The query node ID acting as the shard leader.

        - **leader_addr** (*string*) -

            The address of the leader query node.

        - **dm_channel_name** (*string*) -

            The DML channel served by this shard.

        - **node_ids** (*string[]*) -

            The query node IDs that hold this shard's data.

    - **node_ids** (*string[]*) -

        The query node IDs that participate in this replica.

    - **resource_group_name** (*string*) -

        The resource group that owns this replica's nodes.

    - **num_outbound_node** (*Record&lt;string, number&gt;*) -

        The count of outbound nodes per resource group, used during rebalancing.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

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
