---
title: "updateReplicateConfiguration() | Java | v2"
slug: /java/java/v2-Management-updateReplicateConfiguration
sidebar_label: "updateReplicateConfiguration()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus クラスター間のレプリケーション構成を更新します。クラスター接続とレプリケーショントポロジーを定義することで、クラスター間のデータレプリケーションを構成するために使用します。 | Java | v2"
type: docx
token: EQ2LdAQqIo79HAxVl45cS8pknTe
sidebar_position: 28
keywords: 
  - 機械学習
  - RAG
  - NLP
  - ニューラルネットワーク
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - updateReplicateConfiguration()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updateReplicateConfiguration()

この操作は、Milvus クラスター間のレプリケーション構成を更新します。クラスター接続とレプリケーショントポロジーを定義することで、クラスター間のデータレプリケーションを構成するために使用します。

```java
public UpdateReplicateConfigurationResp updateReplicateConfiguration(UpdateReplicateConfigurationReq request)
```

## リクエスト構文\{#request-syntax}

```java
updateReplicateConfiguration(UpdateReplicateConfigurationReq.builder()
    .replicateConfiguration(ReplicateConfiguration config)
    .forcePromote(boolean forcePromote)
    .build()
);
```

**ビルダーメソッド：**

- `replicateConfiguration(ReplicateConfiguration config)` -

    **[必須]**

    クラスター定義とトポロジーを含むレプリケーション構成です。

- `forcePromote(boolean forcePromote)`

    レプリケーション構成の更新時に、強制昇格を要求するかどうか。

**戻り値の型：**

*UpdateReplicateConfigurationResp*

**戻り値：**

**UpdateReplicateConfigurationResp** は更新の確認応答です。応答にはペイロードは含まれません。

**パラメーター：**

- **UpdateReplicateConfigurationResp** (*object*) -

    サーバーが更新されたレプリケーション構成を受け入れた後に返される、空の確認応答オブジェクトです。検査対象のペイロードフィールドは含まれません。要求の検証エラーと RPC の失敗は応答に反映されず、**MilvusClientException** が発生します。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.service.cdc.request.CrossClusterTopology;
import io.milvus.v2.service.cdc.request.MilvusCluster;
import io.milvus.v2.service.cdc.request.ReplicateConfiguration;
import io.milvus.v2.service.cdc.request.UpdateReplicateConfigurationReq;

import java.util.ArrayList;

// Define source and target Milvus clusters
MilvusCluster sourceCluster = MilvusCluster.builder()
        .clusterId("upstream-cluster")
        .uri("http://192.168.1.1:19530")
        .pchannels(pchannelList)
        .build();
MilvusCluster targetCluster = MilvusCluster.builder()
        .clusterId("downstream-cluster")
        .uri("http://192.168.1.2:19530")
        .pchannels(pchannelList)
        .build();

// Define cross-cluster replication topology
CrossClusterTopology topology = CrossClusterTopology.builder()
        .sourceClusterId("upstream-cluster")
        .targetClusterId("downstream-cluster")
        .build();

// Build and apply replication configuration
ReplicateConfiguration configuration = ReplicateConfiguration.builder()
        .clusters(new ArrayList<MilvusCluster>() {{
            add(sourceCluster);
            add(targetCluster);
        }})
        .crossClusterTopologies(new ArrayList<CrossClusterTopology>() {{
            add(topology);
        }})
        .build();

client.updateReplicateConfiguration(
    UpdateReplicateConfigurationReq.builder()
        .replicateConfiguration(configuration)
        .build()
);
```
