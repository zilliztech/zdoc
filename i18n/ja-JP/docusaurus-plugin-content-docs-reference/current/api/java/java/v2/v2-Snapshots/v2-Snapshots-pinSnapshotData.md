---
title: "pinSnapshotData() | Java | v2"
slug: /java/java/v2-Snapshots-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、snapshot データをコピーまたは調査している間にガベージコレクションされないよう、一定期間 pin します。 | Java | v2"
type: docx
token: BBYgdwIV5onkWxxowAhcCl5rnzc
sidebar_position: 7
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - pinSnapshotData()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

この操作は、snapshot データをコピーまたは調査している間にガベージコレクションされないよう、一定期間 pin します。

```java
public PinSnapshotDataResp pinSnapshotData(PinSnapshotDataReq request)
```

## リクエスト構文\{#request-syntax}

```java
pinSnapshotData(PinSnapshotDataReq.builder()
    .snapshotName(String snapshotName)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .ttlSeconds(Long ttlSeconds)
    .build()
)
```

**BUILDER メソッド:**

- `snapshotName(String snapshotName)`

    snapshot の名前。

- `databaseName(String databaseName)`

    collection を含む database の名前。省略した場合は、現在の database が使用されます。

- `collectionName(String collectionName)`

    snapshot 操作に関連付けられた collection の名前。

- `ttlSeconds(Long ttlSeconds)`

    snapshot データの pin に対する有効期限（秒）。サーバーのデフォルト動作を使用するには `0L` を指定します。

**戻り値:**

*PinSnapshotDataResp*

pin された snapshot データの pin ID を含むレスポンス。

**例外:**

- **MilvusClientException**

    必須パラメータが不足している場合、数値パラメータが範囲外の場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.PinSnapshotDataReq;
import io.milvus.v2.service.snapshot.response.PinSnapshotDataResp;

PinSnapshotDataReq request = PinSnapshotDataReq.builder()
    .snapshotName("book_chunks_backup")
    .databaseName("default")
    .collectionName("book_chunks")
    .ttlSeconds(3600L)
    .build();

PinSnapshotDataResp response = client.pinSnapshotData(request);
```
