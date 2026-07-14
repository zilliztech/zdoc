---
title: "alterCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection のプロパティを変更します。 | Java | v2"
type: docx
token: JQ4QdTaadoIDSPxDJRZcSDu3n5g
sidebar_position: 3
keywords: 
  - Vector index
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionProperties()

この操作は、指定された collection のプロパティを変更します。

```java
public Void alterCollectionProperties(AlterCollectionPropertiesReq request)
```

## Request Syntax\{#request-syntax}

```java
alterCollectionProperties(AlterCollectionPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    対象の collection を保持するデータベースの名前です。

- `collectionName(String collectionName)`

    対象の collection の名前です。

- `properties(Map<String, String> properties)`

    変更するプロパティとその期待値です。プロパティ値は文字列である必要があることに注意してください。使用可能なデータベースプロパティは次のとおりです。

    - **collection.ttl.seconds** -

        collection の有効期限（TTL）を秒単位で指定します。

    - **mmap.enabled** -

        collection 内のすべてのフィールドの生データおよび index に対して mmap を有効にするかどうかを指定します。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `collection.ttl.seconds` property
Map<String, String> properties = new HashMap<>()
properties.put("collection.ttl.seconds", "86400")

AlterCollectionPropertiesReq alterCollectionFieldReq = AlterCollectionPropertiesReq.builder()
        .collectionName("test")
        .properties(properties)
        .build();
client.alterCollectionProperties(alterCollectionFieldReq)
```

