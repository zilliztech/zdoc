---
title: "pinSnapshotData() | Java | v2"
slug: /java/java/v2-Snapshots-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、スナップショットデータをコピーまたは検査している間にガベージコレクションされないよう、スナップショットデータを一定期間ピン留めします。 | Java | v2"
type: docx
token: BBYgdwIV5onkWxxowAhcCl5rnzc
sidebar_position: 7
keywords: 
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - zilliz
  - zilliz cloud
  - クラウド
  - pinSnapshotData()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

この操作では、スナップショットデータをコピーまたは検査している間にガベージコレクションされないよう、スナップショットデータを一定期間ピン留めします。

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

**ビルダーメソッド：**

- `snapshotName(String snapshotName)`

    スナップショットの名前です。

- `databaseName(String databaseName)`

    コレクションを含むデータベースの名前です。省略した場合は、現在のデータベースが使用されます。

- `collectionName(String collectionName)`

    スナップショット操作に関連するコレクションの名前です。

- `ttlSeconds(Long ttlSeconds)`

    スナップショットデータのピン留めの有効期間（秒）です。サーバーのデフォルト動作を使用するには、`0L` を使用します。

**戻り値の型：**

*PinSnapshotDataResp*

**戻り値：**

ピン留めされたスナップショットデータのピン ID を含むレスポンスです。

**パラメーター：**

- **pinId** (*Long*) -

    作成されたピンの ID です。

**例外：**

- **MilvusClientException**

    必須パラメーターが欠落している場合、数値パラメーターが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

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
