---
title: "describeReplicas() | Java | v2"
slug: /java/java/v2-Collections-describeReplicas
sidebar_label: "describeReplicas()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回特定 collection 的副本信息。 | Java | v2"
type: docx
token: WRSYdEZwroNY1Txpk2DcI1sSnVg
sidebar_position: 25
keywords: 
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
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

此操作返回特定 collection 的副本信息。

```java
public DescribeReplicasResp describeReplicas(DescribeReplicasReq request)
```

## 请求语法\{#request-syntax}

```java
describeReplicas(DescribeReplicasReq.builder()
    .databaseName(String alias)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String alias)`

    持有目标 collection 的数据库名称。

- `collectionName(String collectionName)`

    目标 collection 的名称。

**RETURN TYPE:**

*DescribeReplicasResp*

**RETURNS:**

一个 DescribeReplicasResp，包含指定 collection 中副本的详细信息。

**PARAMETERS:**

- **replicas** (*List&lt;ReplicaInfo&gt;*) -

    副本列表，其中每个副本包含以下字段：

    - **replicaID** (*Long*) -

        副本的 ID。

    - **collectionID** (*Long*) -

        指定 collection 的 ID。

    - **partitionIDs** (*List&lt;Long&gt;*) -

        与当前副本关联的 partitions 的 ID。

    - **shardReplicas** (*List&lt;ShardReplicas&gt;*) -

        与当前副本关联的 shards。每个 shard 包含以下信息：

        - **leaderID** (*Long*) -

            leader shard 的 ID

        - **leaderAddress** (*String*) -

            leader shard 的地址，格式为 `IP:PORT`。

        - **channelName** (*String*) -

            与当前 shard 关联的 channel 名称。

        - **nodeIDs** (*List&lt;Long&gt;*) -

            与当前 shard 关联的 query node 的 ID。

    - **nodeIDs** (*List&lt;Long&gt;*) -

        与当前副本关联的 query node 的 ID。

    - **resourceGroupName** (*String*) -

        与当前副本关联的资源组名称。

    - **numOutboundNode** (*Map&lt;String, Integer&gt;*) -

        出站 query node 的数量。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.ReplicaInfo;
import io.milvus.v2.service.collection.request.DescribeReplicasReq;
import io.milvus.v2.service.collection.response.DescribeReplicasResp;

// 1. 设置客户端
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 描述名为 `test` 的 collection 的副本
DescribeReplicasReq describeReplicasReq = DescribeReplicasReq.builder()
        .collectionName("test")
        .build();
DescribeReplicasResp descReplicaResp = client.describeReplicas(describeReplicasReq);
for (ReplicaInfo replica : descReplicaResp.getReplicas()) {
    System.out.println(replica.getReplicaID());
}
```

