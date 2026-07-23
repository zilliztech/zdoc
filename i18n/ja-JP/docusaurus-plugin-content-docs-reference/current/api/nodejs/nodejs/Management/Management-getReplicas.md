---
title: "getReplicas() | Node.js"
slug: /node/node/Management-getReplicas
sidebar_label: "getReplicas()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は collection のレプリカを取得し、各レプリカの ID、ノード割り当て、シャードの詳細を含む情報を返します。 | Node.js"
type: docx
token: XKRWdKvQVolmduxrtrDc0dhjnzc
sidebar_position: 28
keywords: 
  - 画像類似検索
  - Context Window
  - 自然言語検索
  - 類似検索
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

この操作は collection のレプリカを取得し、各レプリカの ID、ノード割り当て、シャードの詳細を含む情報を返します。

```javascript
await milvusClient.getReplicas(data: GetReplicaReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getReplicas({
    collectionID: number | string,
    with_shard_nodes?: boolean,
    timeout?: number,
})
```

**パラメータ:**

- **collectionID** (*number | string*) -

    **[必須]**

    collection の ID。

- **with_shard_nodes** (*boolean*) -

    レスポンスにシャードノード情報を含めるかどうか。任意です。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウト。任意です。

**戻り値** *Promise&lt;ReplicasResponse&gt;*

このメソッドは、**ReplicasResponse** オブジェクトに解決される promise を返します。

```typescript
{
    replicas: ReplicaInfo[],
    status:  ResStatus
}
```

**パラメータ:**

- **replicas** (*ReplicaInfo[]*) -<br/>
  要求された collection を現在処理しているレプリカの一覧。

    - **replicaID** (*string*) -

        レプリカ識別子。

    - **collectionID** (*string*) -

        collection 識別子。

    - **partition_ids** (*string[]*) -

        このレプリカが対象とする partition 識別子。

    - **shard_replicas** (*ShardReplica[]*) -

        シャードごとのリーダーおよびノード割り当て情報。

        - **leaderID** (*string*) -

        シャードリーダーとして機能するクエリノード ID。

        - **leader_addr** (*string*) -

        リーダークエリノードのアドレス。

        - **dm_channel_name** (*string*) -

        このシャードが処理する DML チャネル。

        - **node_ids** (*string[]*) -

        このシャードのデータを保持するクエリノード ID。

        - **leaderID** (*string*) -

            シャードリーダーとして機能するクエリノード ID。

        - **leader_addr** (*string*) -

            リーダークエリノードのアドレス。

        - **dm_channel_name** (*string*) -

            このシャードが処理する DML チャネル。

        - **node_ids** (*string[]*) -

            このシャードのデータを保持するクエリノード ID。

    - **node_ids** (*string[]*) -

        このレプリカに参加しているクエリノード ID。

    - **resource_group_name** (*string*) -

        このレプリカのノードを所有する resource group。

    - **num_outbound_node** (*Record&lt;string, number&gt;*) -

        resource group ごとのアウトバウンドノード数。リバランシング中に使用されます。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

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
