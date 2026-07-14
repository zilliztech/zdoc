---
title: "describeReplicas() | Java | v2"
slug: /java/java/v2-Collections-describeReplicas
sidebar_label: "describeReplicas()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection の replicas に関する情報を返します。 | Java | v2"
type: docx
token: WRSYdEZwroNY1Txpk2DcI1sSnVg
sidebar_position: 25
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

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeReplicas()

この操作は、特定の collection の replicas に関する情報を返します。

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

    対象 collection を保持するデータベースの名前。

- `collectionName(String collectionName)`

    対象 collection の名前。

**戻り値の型:**

*DescribeReplicasResp*

**戻り値:**

指定した collection 内の replicas に関する詳細情報を含む DescribeReplicasResp。

**パラメータ:**

- **replicas** (*List&lt;ReplicaInfo&gt;*) -

    replicas のリスト。各 replica には次のフィールドが含まれます。

    - **replicaID** (*Long*) -

        replica の ID。

    - **collectionID** (*Long*) -

        指定された collection の ID。

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

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// describe the replicas of a collection named `test`
DescribeReplicasReq describeReplicasReq = DescribeReplicasReq.builder()
        .collectionName("test")
        .build();
DescribeReplicasResp descReplicaResp = client.describeReplicas(describeReplicasReq);
for (ReplicaInfo replica : descReplicaResp.getReplicas()) {
    System.out.println(replica.getReplicaID());
}
```

