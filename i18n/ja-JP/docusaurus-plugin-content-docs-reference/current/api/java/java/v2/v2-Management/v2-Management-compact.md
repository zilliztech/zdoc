---
title: "compact() | Java | v2"
slug: /java/java/v2-Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、小さなセグメントをより大きなセグメントにマージすることで collection を compact します。collection に大量のデータを挿入した後にこの操作を呼び出すことを推奨します。 | Java | v2"
type: docx
token: LDQsdzUJQotV2GxWGaqcFkDenuq
sidebar_position: 2
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# compact()

この操作は、小さなセグメントをより大きなセグメントにマージすることで collection を compact します。collection に大量のデータを挿入した後にこの操作を呼び出すことを推奨します。

```java
public CompactResp compact(CompactReq request)
```

## Request Syntax\{#request-syntax}

```java
compact(CompactReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .isClustering(Boolean isClustering)
    .isL0(Boolean isL0)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベース名。指定しない場合は現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象 collection の名前。

- `isClustering(Boolean isClustering)`

    clustering compaction を実行するかどうか。デフォルトは `Boolean.FALSE` です。

- `isL0(Boolean isL0)`

    L0 compaction をリクエストするかどうか。デフォルトは `Boolean.FALSE` で、clustering compaction とは独立しています。

**RETURNS:**

*CompactResp*

**CompactResp** オブジェクトには compaction ID が含まれます。

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CompactReq;
import io.milvus.v2.service.utility.response.CompactResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.compact(CompactReq.builder()
    .collectionName("my_collection")
    .build();
);
```
