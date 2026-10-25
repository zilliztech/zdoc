---
title: "loadPartitions() | Java | v2"
slug: /java/java/v2-Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクション内のパーティションをメモリにロードします。 | Java | v2"
type: docx
token: QHhAd0ObroZgicxARuKcOqEmnfb
sidebar_position: 6
keywords: 
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベースの比較
  - zilliz
  - Zilliz Cloud
  - クラウド
  - loadPartitions()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# loadPartitions()

この操作は、指定したコレクション内のパーティションをメモリにロードします。

```java
public void loadPartitions(LoadPartitionsReq request)
```

## リクエスト構文\{#request-syntax}

```java
loadPartitions(LoadPartitionsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .numReplicas(Integer numReplicas)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .refresh(Boolean refresh)
    .loadFields(List<String> loadFields)
    .skipLoadDynamicField(Boolean skipLoadDynamicField)
    .resourceGroups(List<String> resourceGroups)
    .build()
);
```

**ビルダーメソッド：**

- `databaseName(String databaseName)` -

    データベース名です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    対象コレクションの名前です。

- `partitionNames(List<String> partitionNames)` -

    対象とするパーティション名のリストです。

- `numReplicas(Integer numReplicas)` -

    ロードするレプリカの数です。

- `sync(Boolean sync)` -

    操作が完了するまで同期的に待機するかどうか。

- `timeout(Long timeout)` -

    タイムアウト時間をミリ秒単位で指定します。

- `refresh(Boolean refresh)` -

    新しいフィールドを含めるようにロードを更新するかどうか。

- `loadFields(List<String> loadFields)` -

    ロードする特定のフィールド名のリストです。

- `skipLoadDynamicField(Boolean skipLoadDynamicField)` -

    動的フィールドのロードをスキップするかどうか。

- `resourceGroups(List<String> resourceGroups)` -

    ロードバランシング用のリソースグループ名のリストです。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.LoadPartitionsReq;
import java.util.Collections;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Load partition in collection
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
        .collectionName("test")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.loadPartitions(loadPartitionsReq);
```
