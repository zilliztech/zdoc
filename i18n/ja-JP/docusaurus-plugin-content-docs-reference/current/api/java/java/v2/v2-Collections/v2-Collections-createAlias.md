---
title: "createAlias() | Java | v2"
slug: /java/java/v2-Collections-createAlias
sidebar_label: "createAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は既存の collection に対して alias を作成します。 | Java | v2"
type: docx
token: BujpdsEJnozVT4xY3NFczyfrnDe
sidebar_position: 6
keywords: 
  - オープンソース vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - createAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createAlias()

この操作は既存の collection に対して alias を作成します。

```java
public void createAlias(CreateAliasReq request)
```

## Request Syntax\{#request-syntax}

```java
createAlias(CreateAliasReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .alias(String alias)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象 collection の名前。

- `alias(String alias)` -

    alias 名。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CreateAliasReq;

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
