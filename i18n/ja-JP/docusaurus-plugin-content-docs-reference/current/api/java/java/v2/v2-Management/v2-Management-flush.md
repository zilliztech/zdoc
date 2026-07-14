---
title: "flush() | Java | v2"
slug: /java/java/v2-Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、ストリーミングデータをディスクに flush し、現在の segment を seal します。 | Java | v2"
type: docx
token: N4R0dHR6MoiW2Rx9ClGc9MSlnOe
sidebar_position: 7
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# flush()

この操作は、ストリーミングデータをディスクに flush し、現在の segment を seal します。

```java
public void flush(FlushReq request)
```

## Request Syntax\{#request-syntax}

```java
flush(FlushReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)` -

    データベース名です。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionNames(List<String> collectionNames)` -

    collection 名のリストです。

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)` -

    flush の完了を待機するタイムアウト時間（ミリ秒）です。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.FlushReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.flush(FlushReq.builder()
    .collectionNames(Collections.singletonList("my_collection"))
    .build();
);
```
