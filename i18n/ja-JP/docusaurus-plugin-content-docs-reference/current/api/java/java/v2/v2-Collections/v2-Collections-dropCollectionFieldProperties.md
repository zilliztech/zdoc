---
title: "dropCollectionFieldProperties() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFieldProperties
sidebar_label: "dropCollectionFieldProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、フィールドの指定されたプロパティを削除します。 | Java | v2"
type: docx
token: O3E9duLvfoMC26x8AmDcomlWneh
sidebar_position: 26
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFieldProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFieldProperties()

この操作は、フィールドの指定されたプロパティを削除します。

```java
public void dropCollectionFieldProperties(DropCollectionFieldPropertiesReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropCollectionFieldProperties(DropCollectionFieldPropertiesReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**BUILDER メソッド:**

- `collectionName(String collectionName)`

    既存の collection の名前。

- `databaseName(String databaseName)`

    上記の collection を含む database の名前。 

- `fieldName(String fieldName)`

    指定された collection 内の対象フィールドの名前。

- `propertyKeys(List<String> propertyKeys)`

    指定されたフィールドから削除するプロパティの名前。

**戻り値の型:**

*void*

**戻り値:** 

なし

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionFieldPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop field's properties
client.dropCollectionFieldProperties(DropCollectionFieldPropertiesReq.builder()
        .collectionName(collectionName)
        .fieldName("fieldName")
        .propertyKeys(Collections.singletonList(Constant.MMAP_ENABLED))
        .build());
```
