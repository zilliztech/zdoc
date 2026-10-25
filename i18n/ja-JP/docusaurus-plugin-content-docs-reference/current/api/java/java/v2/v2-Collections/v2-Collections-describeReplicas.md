---
title: "describeReplicas() | Java | v2"
slug: /java/java/v2-Collections-describeReplicas
sidebar_label: "describeReplicas()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns information about the replicas of a specific コレクション. | Java | v2"
type: docx
token: E2hHdOb5BoCYhnxR9FWcerHrnsb
sidebar_position: 22
keywords: 
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - describeReplicas()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeReplicas()

This operation returns information about the replicas of a specific コレクション.

```java
public DescribeReplicasResp describeReplicas(DescribeReplicasReq request)
```

## リクエスト構文\{#request-syntax}

```java
describeReplicas(DescribeReplicasReq.builder()
    .databaseName(String alias)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String alias)`

    The name of the データベース that holds the target コレクション.

- `collectionName(String collectionName)`

    The name of the target コレクション.

**戻り値の型:**

*DescribeReplicasResp*

**戻り値:**

A DescribeReplicasResp that contains detailed information about the replicas in the specified コレクション.

**パラメータ:**

- **replicas** (*List&lt;ReplicaInfo&gt;*) -

    replicas のリスト。各 replica には次のフィールドが含まれます。

    - **replicaID** (*Long*) -

        replica の ID。

    - **collectionID** (*Long*) -

        The ID of the specified コレクション.

    - **partitionIDs** (*List&lt;Long&gt;*) -

        現在の replica に関連付けられた partition の ID。

    - **shardReplicas** (*List&lt;ShardReplicas&gt;*) -

        現在の replica に関連付けられた shard。各 shard には次の情報が含まれます。

        - **leaderID** (*Long*) -

            リーダー shard の ID

        - **leaderAddress** (*String*) -

            `IP:PORT` 形式のリーダー shard のアドレス。

        - **channelName** (*String*) -

            現在の shard に関連付けられた channel の名前。

        - **nodeIDs** (*List&lt;Long&gt;*) -

            現在の shard に関連付けられた query node の ID。

    - **nodeIDs** (*List&lt;Long&gt;*) -

        現在の replica に関連付けられた query node の ID。

    - **resourceGroupName** (*String*) -

        現在の replica に関連付けられた resource group の名前。

    - **numOutboundNode** (*Map&lt;String, Integer&gt;*) -

        outbound query node の数。

**例外:**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.ReplicaInfo;
import io.milvus.v2.service.collection.request.DescribeReplicasReq;
import io.milvus.v2.service.collection.response.DescribeReplicasResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// describe the replicas of a collection named \`test\`
DescribeReplicasReq describeReplicasReq = DescribeReplicasReq.builder()
        .collectionName("test")
        .build();
DescribeReplicasResp descReplicaResp = client.describeReplicas(describeReplicasReq);
for (ReplicaInfo replica : descReplicaResp.getReplicas()) {
    System.out.println(replica.getReplicaID());
}
```
