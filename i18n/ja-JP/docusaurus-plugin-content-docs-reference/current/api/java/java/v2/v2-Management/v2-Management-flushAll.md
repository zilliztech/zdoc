---
title: "flushAll() | Java | v2"
slug: /java/java/v2-Management-flushAll
sidebar_label: "flushAll()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、データベース内のすべての collection の挿入バッファを flush します。バックアップ、検証、または最近のすべての書き込みが永続化されている必要があるワークフローの前に使用します。 | Java | v2"
type: docx
token: KQqgduahOo13yOxiRMgcfXQxnxd
sidebar_position: 25
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

この操作は、データベース内のすべての collection の挿入バッファを flush します。バックアップ、検証、または最近のすべての書き込みが永続化されている必要があるワークフローの前に使用します。

```java
public FlushAllResp flushAll(FlushAllReq request)
```

## Request Syntax\{#request-syntax}

```java
flushAll(FlushAllReq.builder()
    .databaseName(String databaseName)
    .waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)
    .build());
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    flush 対象の collection が含まれるデータベースです。省略すると、現在のデータベースコンテキストが使用されます。

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)`

    flush-all 操作の完了を待機する時間です。0 より大きい値を指定すると、同期的な待機が有効になります。

**RETURNS:**

*FlushAllResp*

**EXCEPTIONS:**

- **MilvusClientException**

    検証に失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## Example\{#example}

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
