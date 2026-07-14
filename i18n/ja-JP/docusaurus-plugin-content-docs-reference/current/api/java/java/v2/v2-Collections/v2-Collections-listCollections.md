---
title: "listCollections() | Java | v2"
slug: /java/java/v2-Collections-listCollections
sidebar_label: "listCollections()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は既存のすべての collection を一覧表示します。 | Java | v2"
type: docx
token: Vv4NdWVa5o5BSrx11OZcNVnQnbh
sidebar_position: 20
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
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

この操作は既存のすべての collection を一覧表示します。

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

collection 名のリストを含む **ListCollectionsResp** オブジェクト。collection が1つも存在しない場合は、空のリストが返されます。

**PARAMETERS:**

- **collectionNames** (*List&lt;String&gt;*)

    既存のすべての collection 名を含む文字列のリスト。

- **collectionInfos** (*List&lt;CollectionInfo&gt;*)

    **CollectionInfo** オブジェクトのリスト。**CollectionInfo** オブジェクトには次のフィールドがあります。

    - **collectionName** (*String*)

        collection の名前。

    - **shardNum** (*Integer*)

        上記 collection 内の shard 数。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List collections
ListCollectionsResp listAliasResp = client.listCollections();
```

