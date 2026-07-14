---
title: "describeCollection() | Java | v2"
slug: /java/java/v2-Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションに関する詳細情報を一覧表示します。 | Java | v2"
type: docx
token: WEE6ddFntowCIixVMCmc3pESnug
sidebar_position: 12
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - describeCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeCollection()

この操作は、特定のコレクションに関する詳細情報を一覧表示します。

```java
public DescribeCollectionResp describeCollection(DescribeCollectionReq request)
```

## Request Syntax\{#request-syntax}

```java
describeCollection(DescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .collectionId(Long collectionId)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象のコレクションの名前です。

- `collectionId(Long collectionId)` -

    コレクションの数値 ID です。名前ではなく ID でコレクションを識別する必要がある場合に使用します。

**RETURNS:**

*DescribeCollectionResp*

指定したコレクションに関する詳細情報を含む **DescribeCollectionResp** オブジェクト。

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
DescribeCollectionReq describeCollectionReq = DescribeCollectionReq.builder()
        .collectionName("test")
        .build();
DescribeCollectionResp describeCollectionResp = client.describeCollection(describeCollectionReq);
```
