---
title: "ListCollectionsV2() | Java | v2"
slug: /java/java/v2-Collections-ListCollectionsV2
sidebar_label: "ListCollectionsV2()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータベース内の既存のすべてのコレクションを一覧表示します。 | Java | v2"
type: docx
token: WY4idJdzCozGGnxmLoFcIjC2ndw
sidebar_position: 29
keywords: 
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - zilliz
  - zilliz cloud
  - cloud
  - ListCollectionsV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# ListCollectionsV2()

この操作は、指定されたデータベース内の既存のすべてのコレクションを一覧表示します。

```java
public ListCollectionsResp listCollectionsV2(ListCollectionsReq request)
```

## Request Syntax\{#request-syntax}

```java
listCollectionsV2(ListCollectionsReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    対象データベースの名前です。指定すると、この操作は指定されたデータベース内のすべてのコレクションを返します。

**RETURN TYPE:**

*ListCollectionsResp*

**RETURNS:**

コレクション名の一覧を含む **ListCollectionsResp** オブジェクトです。コレクションが存在しない場合は、空のリストが返されます。

**PARAMETERS:**

- **collectionNames** (*List&lt;String&gt;*)

    既存のすべてのコレクションの名前を含む文字列のリストです。

- **collectionInfos** (*List&lt;CollectionInfo&gt;*)

    **CollectionInfo** オブジェクトのリストです。**CollectionInfo** オブジェクトには以下のフィールドがあります。

    - **collectionName** (*String*)

        コレクションの名前です。

    - **shardNum** (*Integer*)

        上記コレクションのシャード数です。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に、この例外が送出されます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.ListCollectionsReq;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List collections
ListCollectionReq listCollectionReq = ListCollectionReq.builder()
    .databaseName("my_database")
    .build();

ListCollectionsResp listAliasResp = client.listCollectionsV2(listCollectionReq);
```

