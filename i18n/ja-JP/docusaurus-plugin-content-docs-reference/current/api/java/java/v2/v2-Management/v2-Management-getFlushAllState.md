---
title: "getFlushAllState() | Java | v2"
slug: /java/java/v2-Management-getFlushAllState
sidebar_label: "getFlushAllState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、前回の flush-all アクションが完了したかどうかを確認します。`flushAll` を非同期で呼び出し、完了までポーリングする必要がある場合に使用します。 | Java | v2"
type: docx
token: U55Vd0IR9oz8m9xS76scr4KDnNh
sidebar_position: 24
keywords: 
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushAllState()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getFlushAllState()

この操作は、前回の flush-all アクションが完了したかどうかを確認します。`flushAll` を非同期で呼び出し、完了までポーリングする必要がある場合に使用します。

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

    `flushAll` の呼び出し時に使用されたデータベースです。

- `flushAllTs(Long flushAllTs)`

    `flushAll` によって返された flush-all タイムスタンプです。

**RETURN TYPE:**

*GetFlushAllStateResp*

**RETURNS:**

flush-all 操作が完了したかどうかを示す **GetFlushAllStateResp** オブジェクトです。

**PARAMETERS:**

- **flushed** (*Boolean*) -

    flush-all 操作が完了したかどうか。完了した場合は `true`、それ以外の場合は `false` です。

**EXCEPTIONS:**

- **MilvusClientException**

    検証に失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外がスローされます。

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
