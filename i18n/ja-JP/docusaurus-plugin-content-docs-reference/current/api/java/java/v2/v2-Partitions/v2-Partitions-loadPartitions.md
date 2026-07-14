---
title: "loadPartitions() | Java | v2"
slug: /java/java/v2-Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、指定された collection 内の partitions をメモリから解放します。 | Java | v2"
type: docx
token: MH8cdNxkgoliJ5xU0f9cBKqunYe
sidebar_position: 6
keywords: 
  - rag vector database
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - loadPartitions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitions()

この操作は、指定された collection 内の partitions をメモリから解放します。

```java
public void loadPartitions(LoadPartitionsReq request)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象の collection 名。

- `partitionNames(List<String> partitionNames)` -

    対象とする partition 名のリスト。

- `numReplicas(Integer numReplicas)` -

    ロードするレプリカの数。

- `sync(Boolean sync)` -

    操作が完了するまで同期的に待機するかどうか。

- `timeout(Long timeout)` -

    タイムアウト時間（ミリ秒）。

- `refresh(Boolean refresh)` -

    新しい field を含めるためにロードを更新するかどうか。

- `loadFields(List<String> loadFields)` -

    ロードする特定の field 名のリスト。

- `skipLoadDynamicField(Boolean skipLoadDynamicField)` -

    dynamic field のロードをスキップするかどうか。

- `resourceGroups(List<String> resourceGroups)` -

    ロードバランシングのための resource group 名のリスト。

**RETURNS:**

*void*

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.LoadPartitionsReq;

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
