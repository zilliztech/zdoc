---
title: "listCollections() | Java | v2"
slug: /java/java/v2-Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all existing コレクション. | Java | v2"
type: docx
token: VtCvd8vpoo1P7hxhJltcAIldnDg
sidebar_position: 18
keywords: 
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - listCollections()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listCollections()

This operation lists all existing コレクション.

```java
public ListCollectionsResp listCollections()
```

## Request Syntax\{#request-syntax}

```java
listCollections()
```

**RETURN TYPE:**

*ListCollectionsResp*

**RETURNS:**

A ListCollectionsResp object containing a list of コレクション names. If there are no コレクション, an empty list will be returned.

**PARAMETERS:**

- **collectionNames** (*List&lt;String&gt;*)

    A list of strings containing the names of all existing コレクション.

- **collectionInfos** (*List&lt;CollectionInfo&gt;*)

    **CollectionInfo** オブジェクトのリスト。**CollectionInfo** オブジェクトには次のフィールドがあります。

    - **collectionName** (*String*)

        The name of a コレクション.

    - **shardNum** (*Integer*)

        The number of shards in the コレクション.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List collections
ListCollectionsResp listAliasResp = client.listCollections();
```
