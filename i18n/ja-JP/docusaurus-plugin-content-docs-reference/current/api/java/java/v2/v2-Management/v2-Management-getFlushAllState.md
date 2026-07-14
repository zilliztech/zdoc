---
title: "getFlushAllState() | Java | v2"
slug: /java/java/v2-Management-getFlushAllState
sidebar_label: "getFlushAllState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、以前の flush-all アクションが完了したかどうかを確認します。`flushAll` を非同期で呼び出し、完了をポーリングする必要がある場合に使用します。 | Java | v2"
type: docx
token: U55Vd0IR9oz8m9xS76scr4KDnNh
sidebar_position: 26
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushAllState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFlushAllState()

この操作は、以前の flush-all アクションが完了したかどうかを確認します。`flushAll` を非同期で呼び出し、完了をポーリングする必要がある場合に使用します。

```java
public GetFlushAllStateResp getFlushAllState(GetFlushAllStateReq request)
```

## リクエスト構文\{#request-syntax}

```java
getFlushAllState(GetFlushAllStateReq.builder()
    .databaseName(String databaseName)
    .flushAllTs(Long flushAllTs)
    .build());
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    `flushAll` が呼び出されたときに使用されたデータベース。

- `flushAllTs(Long flushAllTs)`

    `flushAll` によって返される flush-all タイムスタンプ。

**RETURNS:**

*GetFlushAllStateResp*

**EXCEPTIONS:**

- **MilvusClientException**

    検証に失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

FlushAllResp flush = client.flushAll(FlushAllReq.builder()
    .databaseName("default")
    .build());
GetFlushAllStateResp state = client.getFlushAllState(GetFlushAllStateReq.builder()
    .databaseName("default")
    .flushAllTs(flush.getFlushAllTs())
    .build());
System.out.println(state.getFlushed());
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
