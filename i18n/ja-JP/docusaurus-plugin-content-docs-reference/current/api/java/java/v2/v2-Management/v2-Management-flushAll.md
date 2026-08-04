---
title: "flushAll() | Java | v2"
slug: /java/java/v2-Management-flushAll
sidebar_label: "flushAll()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、データベース内のすべての collection に対して挿入バッファをフラッシュします。バックアップ、検証、または直近のすべての書き込みが永続化されている必要があるワークフローの前に使用します。 | Java | v2"
type: docx
token: KQqgduahOo13yOxiRMgcfXQxnxd
sidebar_position: 22
keywords: 
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - flushAll()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# flushAll()

この操作は、データベース内のすべての collection に対して挿入バッファをフラッシュします。バックアップ、検証、または直近のすべての書き込みが永続化されている必要があるワークフローの前に使用します。

```java
public FlushAllResp flushAll(FlushAllReq request)
```

## リクエスト構文\{#request-syntax}

```java
flushAll(FlushAllReq.builder()
    .databaseName(String databaseName)
    .waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)
    .build());
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    フラッシュ対象の collection が含まれるデータベースです。省略すると、現在のデータベースコンテキストが使用されます。

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)`

    flush-all 操作の完了を待機する時間です。0 より大きい値を指定すると、同期的な待機が有効になります。

**戻り値:**

*FlushAllResp*

**例外:**

- **MilvusClientException**

    バリデーションに失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

FlushAllResp resp = client.flushAll(FlushAllReq.builder()
    .databaseName("default")
    .waitFlushedTimeoutMs(60000L)
    .build());
System.out.println(resp.getFlushAllTs());
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
