---
title: "dropIndexProperties() | Java | v2"
slug: /java/java/v2-Management-dropIndexProperties
sidebar_label: "dropIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された index プロパティをデフォルト値にリセットします。 | Java | v2"
type: docx
token: IdNAdlMhjoM40pxjpKecpc7inbd
sidebar_position: 6
keywords: 
  - rag vector database
  - vector db とは
  - vector databases とは
  - vector databases の比較
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndexProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropIndexProperties()

この操作は、指定された index プロパティをデフォルト値にリセットします。

```java
public Void dropIndexProperties(DropIndexPropertiesReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropIndexProperties(DropIndexPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexName(String indexName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    対象の collection を保持するデータベースの名前です。

- `collectionName(String collectionName)`

    対象の collection の名前です。

- `indexName(String indexName)`

    対象の index の名前です。

- `propertyKeys(List<String> propertyKeys)`

    削除するプロパティです。プロパティ値は文字列である必要があることに注意してください。使用可能なデータベースプロパティは次のとおりです。

    - **mmap.enabled** -

        現在の index に対して mmap を有効にするかどうかを指定します。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DropIndexPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop the `mmap.enabled` property
List<String> propertyKeys = new ArrayList<>()
propertyKeys.add("mmap.enabled")

DropIndexPropertiesReq dropIndexPropertiesReq = DropIndexPropertiesReq.builder()
        .collectionName("test")
        .indexName("vector")
        .propertyKeys(propertyKeys)
        .build();
client.dropIndexProperties(dropIndexPropertiesReq)
```

