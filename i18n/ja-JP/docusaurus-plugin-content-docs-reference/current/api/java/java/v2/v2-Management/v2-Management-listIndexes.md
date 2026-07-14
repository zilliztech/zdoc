---
title: "listIndexes() | Java | v2"
slug: /java/java/v2-Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection 内の field の index を一覧表示します。 | Java | v2"
type: docx
token: LxwIdeFiGoYaRAxKS72cdjNkneh
sidebar_position: 12
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - listIndexes()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

この操作は、特定の collection 内の field の index を一覧表示します。

```java
public List<String> listIndexes(ListIndexesReq request)
```

## リクエスト構文\{#request-syntax}

```java
listIndexes(ListIndexesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    対象の collection が属する database の名前。

- `collectionName(String collectionName)`

    collection の名前。

- `fieldName(String fieldName)`

    対象 field の名前。

**戻り値:**

*List&lt;String&gt;*

**例外:**

- **MilvusClientExceptions**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.ListIndexesReq;

// 1. クライアントを設定する
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. `test` collection の `varchar` field にある index を一覧表示する
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .build();
        
List<String> indexes = client.listIndexes(ListIndexesReq);
```

