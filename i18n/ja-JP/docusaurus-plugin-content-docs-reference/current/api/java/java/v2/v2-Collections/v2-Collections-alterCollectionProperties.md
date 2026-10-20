---
title: "alterCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation modifies the properties of a specified コレクション. | Java | v2"
type: docx
token: NzCuda5k8oJHOOxVLk0cg7HInMg
sidebar_position: 3
keywords: 
  - ベクトル インデックス
  - ベクトル データベース open source
  - open source ベクトル db
  - ベクトル データベース example
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

This operation modifies the properties of a specified コレクション.

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

    The name of the データベース that holds the target コレクション.

- `collectionName(String collectionName)`

    The name of the target コレクション.

- `properties(Map<String, String> properties)`

    変更するプロパティとその期待値です。プロパティ値は文字列である必要があることに注意してください。使用可能なデータベースプロパティは次のとおりです。

    - **コレクション.ttl.seconds** -

        The time-to-live (TTL) of a コレクション in seconds.

    - **mmap.enabled** -

        Whether to enable mmap for the raw data and インデックス of all fields in the コレクション.

- `property(String key, String value)`

    Adds a single property to the コレクション.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中にエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the \`collection.ttl.seconds\` property
Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "86400");

AlterCollectionPropertiesReq alterCollectionFieldReq = AlterCollectionPropertiesReq.builder()
        .collectionName("test")
        .properties(properties)
        .build();
client.alterCollectionProperties(alterCollectionFieldReq);
```
