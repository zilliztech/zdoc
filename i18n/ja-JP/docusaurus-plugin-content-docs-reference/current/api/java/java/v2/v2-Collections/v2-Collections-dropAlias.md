---
title: "dropAlias() | Java | v2"
slug: /java/java/v2-Collections-dropAlias
sidebar_label: "dropAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションのエイリアスを削除します。 | Java | v2"
type: docx
token: OfL3da2p1oeJcRxMrxQcb1lbnd2
sidebar_position: 12
keywords: 
  - 機械学習
  - RAG
  - NLP
  - ニューラルネットワーク
  - zilliz
  - zilliz cloud
  - クラウド
  - dropAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropAlias()

この操作は、指定したコレクションのエイリアスを削除します。

```java
public void dropAlias(DropAliasReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropAlias(DropAliasReq.builder()
    .databaseName(String databaseName)
    .alias(String alias)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象のエイリアスが属するデータベースの名前です。

- `alias(String alias)`

    コレクションのエイリアスです。

    この操作を実行する前に、エイリアスが存在することを確認してください。存在しない場合は、例外がスローされます。

**例外:**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DropAliasReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop alias "test_alias"
DropAliasReq dropAliasReq = DropAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
client.dropAlias(dropAliasReq);
```
