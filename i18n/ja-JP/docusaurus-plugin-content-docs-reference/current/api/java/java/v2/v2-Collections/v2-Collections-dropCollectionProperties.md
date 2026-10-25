---
title: "dropCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionProperties
sidebar_label: "dropCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクションのプロパティをデフォルト値にリセットします。 | Java | v2"
type: docx
token: EM0nd4Q6toGP0zx0I40cX4OmnHh
sidebar_position: 14
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionProperties()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropCollectionProperties()

この操作は、指定されたコレクションのプロパティをデフォルト値にリセットします。

```java
public Void dropCollectionProperties(DropCollectionPropertiesReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropCollectionProperties(DropCollectionPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    対象のコレクションを保持するデータベースの名前です。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `propertyKeys(List<String> propertyKeys)`

    コレクションのプロパティのうち、デフォルト値にリセットするものは次のとおりです。

    - **collection.ttl.seconds** -

        コレクションの有効期間（TTL）を秒単位で表します。

    - **mmap.enabled** -

        コレクション内のすべてのフィールドの生データとインデックスに対して mmap を有効にするかどうかです。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop the \`collection.ttl.seconds\` property
List<String> propertyKeys = new ArrayList<>();
propertyKeys.add("collection.ttl.seconds");

DropCollectionPropertiesReq dropCollectionPropertiesReq = DropCollectionPropertiesReq.builder()
        .collectionName("test")
        .propertyKeys(propertyKeys)
        .build();
        
client.dropCollectionProperties(dropCollectionPropertiesReq);
```
