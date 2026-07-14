---
title: "loadCollection() | Java | v2"
slug: /java/java/v2-Management-loadCollection
sidebar_label: "loadCollection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection のデータをメモリにロードします。 | Java | v2"
type: docx
token: Y3q1d5FzmoSiNkxsWDLcHnAlnQf
sidebar_position: 13
keywords: 
  - milvus ベクターデータベース
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# loadCollection()

この操作は、特定の collection のデータをメモリにロードします。

```java
public void loadCollection(LoadCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
loadCollection(LoadCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .numReplicas(Integer numReplicas)
    .async(Boolean async)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .refresh(Boolean refresh)
    .loadFields(List<String> loadFields)
    .skipLoadDynamicField(Boolean skipLoadDynamicField)
    .resourceGroups(List<String> resourceGroups)
    .build()
);
```

**BUILDER メソッド:**

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象 collection の名前。

- `numReplicas(Integer numReplicas)` -

    ロードするレプリカ数。デフォルトは `1` です。

- `async(Boolean async)` -

    この操作を非同期で実行するかどうか。デフォルトは `Boolean.FALSE` です。

- `sync(Boolean sync)` -

    操作が完了するまで同期的に待機するかどうか。デフォルトは `Boolean.TRUE` です。

- `timeout(Long timeout)` -

    タイムアウト時間（ミリ秒）。デフォルトは `60000L` です。

- `refresh(Boolean refresh)` -

    新しいフィールドを含めるためにロードを更新するかどうか。デフォルトは `Boolean.FALSE` です。

- `loadFields(List<String> loadFields)` -

    ロードする特定のフィールド名のリスト。デフォルトは `new ArrayList<>()` です。

- `skipLoadDynamicField(Boolean skipLoadDynamicField)` -

    dynamic field のロードをスキップするかどうか。デフォルトは `Boolean.FALSE` です。

- `resourceGroups(List<String> resourceGroups)` -

    ロードバランシング用のリソースグループ名のリスト。デフォルトは `new ArrayList<>()` です。

**戻り値:**

*void*

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.LoadCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);
```
