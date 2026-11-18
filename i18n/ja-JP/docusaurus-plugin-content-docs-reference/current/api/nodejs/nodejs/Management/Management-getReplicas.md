---
title: "getReplicas() | Node.js"
slug: /node/node/Management-getReplicas
sidebar_label: "getReplicas()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets replicas of a コレクション, returning information about each replica including its ID, node assignments, and shard details. | Node.js"
type: docx
token: XKRWdKvQVolmduxrtrDc0dhjnzc
sidebar_position: 28
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - getReplicas()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getReplicas()

This operation gets replicas of a コレクション, returning information about each replica including its ID, node assignments, and shard details.

```javascript
await milvusClient.getReplicas(data: GetReplicaReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getReplicas({
    collectionID: number | string,
    collection_name?: string,
    db_name?: string,
    with_shard_nodes?: boolean,
    timeout?: number,
})
```

**PARAMETERS:**

- **collectionID** (*number | string*) -

    **[REQUIRED]**

    The ID of the コレクション.

- **collection_name** (*string*) -

    コレクションの名前。任意です。

- **db_name** (*string*) -

    対象のコレクションを保持するデータベースの名前。任意です。

- **with_shard_nodes** (*boolean*) -

    レスポンスに shard ノード情報を含めるかどうか。任意です。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。任意です。

**戻り値:**

*Promise&lt;ReplicasResponse&gt;*

このメソッドは、**ReplicasResponse** オブジェクトに解決される promise を返します。

```javascript
{
    replicas: ReplicaInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **replicas** (*ReplicaInfo[]*) -
現在、要求されたコレクションにサービスを提供しているレプリカの一覧。

    - **replicaID** (*string*) -

        replica 識別子。

    - **collectionID** (*string*) -

        The コレクション identifier.

    - **partition_ids** (*string[]*) -

        この replica が対象とする partition 識別子。

    - **shard_replicas** (*ShardReplica[]*) -

        shard ごとのリーダーおよびノード割り当て情報。

        - **leaderID** (*string*) -

        shard リーダーとして動作する query node の ID。

        - **leader_addr** (*string*) -

        リーダー query node のアドレス。

        - **dm_channel_name** (*string*) -

        この shard が処理する DML channel。

        - **node_ids** (*string[]*) -

        この shard のデータを保持する query node の ID。

    - **node_ids** (*string[]*) -

        この replica に参加している query node の ID。

    - **resource_group_name** (*string*) -

        この replica のノードを所有する resource group。

    - **num_outbound_node** (*Record&lt;string, number&gt;*) -

        resource group ごとの outbound ノード数で、リバランス時に使用されます。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

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
