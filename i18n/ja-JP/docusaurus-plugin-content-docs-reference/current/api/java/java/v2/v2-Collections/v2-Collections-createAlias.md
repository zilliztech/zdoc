---
title: "createAlias() | Java | v2"
slug: /java/java/v2-Collections-createAlias
sidebar_label: "createAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションのエイリアスを作成します。 | Java | v2"
type: docx
token: PA3Ad6PPYom1wexoyqgcGvNanyV
sidebar_position: 6
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - createAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createAlias()

この操作は、既存のコレクションのエイリアスを作成します。

```java
public void createAlias(CreateAliasReq request)
```

## リクエスト構文\{#request-syntax}

```java
createAlias(CreateAliasReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .alias(String alias)
    .build()
);
```

**ビルダーメソッド：**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    対象コレクションの名前です。

- `alias(String alias)` -

    エイリアス名です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CreateAliasReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create an alias "test_alias" for collection "test"
CreateAliasReq createAliasReq = CreateAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
client.createAlias(createAliasReq);
```
