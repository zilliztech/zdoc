---
title: "dropCollectionFieldProperties() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFieldProperties
sidebar_label: "dropCollectionFieldProperties()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、フィールドの指定されたプロパティを削除します。 | Java | v2"
type: docx
token: DU5gdncRGoDE0exDDUXcxAOsnIi
sidebar_position: 23
keywords: 
  - ANNS
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - zilliz
  - Zilliz Cloud
  - クラウド
  - dropCollectionFieldProperties()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropCollectionFieldProperties()

この操作では、フィールドの指定されたプロパティを削除します。

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

**ビルダーメソッド：**

- `collectionName(String collectionName)`

    既存のコレクションの名前です。

- `databaseName(String databaseName)`

    上記で指定したコレクションを含むデータベースの名前です。

- `fieldName(String fieldName)`

    指定したコレクション内の対象フィールドの名前です。

- `propertyKeys(List<String> propertyKeys)`

    指定したフィールドから削除するプロパティの名前です。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionFieldPropertiesReq;
import java.util.Collections;
import java.util.Set;

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
