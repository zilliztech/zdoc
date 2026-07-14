---
title: "createIndex() | Java | v2"
slug: /java/java/v2-Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に対して index を作成します。 | Java | v2"
type: docx
token: JLCudD7MYoQdxQxLwlpcbBnpn8c
sidebar_position: 3
keywords: 
  - rag vector database
  - vector db とは
  - vector databases とは
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - createIndex()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createIndex()

この操作は、特定の collection に対して index を作成します。

```java
public void createIndex(CreateIndexReq request)
```

## Request Syntax\{#request-syntax}

```java
createIndex(CreateIndexReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexParams(List<IndexParam> indexParams)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    database の名前です。指定しない場合、現在の database がデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象 collection の名前です。

- `indexParams(List<IndexParam> indexParams)` -

    index の構成を定義する IndexParam オブジェクトのリストです。

- `sync(Boolean sync)` -

    操作が完了するまで同期的に待機するかどうかを指定します。デフォルトは `Boolean.TRUE` です。

- `timeout(Long timeout)` -

    タイムアウト時間をミリ秒単位で指定します。デフォルトは `60000L` です。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create an index for the field "vector"
IndexParam indexParam = IndexParam.builder()
        .metricType(IndexParam.MetricType.L2)
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .fieldName("vector")
        .build();
CreateIndexReq createIndexReq = CreateIndexReq.builder()
        .collectionName("test")
        .indexParams(Collections.singletonList(indexParam))
        .build();
client.createIndex(createIndexReq);
```
