---
title: "dropAlias() | Java | v2"
slug: /java/java/v2-Collections-dropAlias
sidebar_label: "dropAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "この操作は、指定された collection alias を削除します。 | Java | v2"
type: docx
token: ARw0dIb0hojCNbxKkOacs1K7nQf
sidebar_position: 13
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

この操作は、指定された collection alias を削除します。 

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

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    対象の alias が属する database の名前。

- `alias(String alias)`

    collection の alias。 

    この操作を実行する前に、alias が存在することを確認してください。そうしないと、例外が発生します。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DropAliasReq;

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
