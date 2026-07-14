---
title: "listSnapshots() | Java | v2"
slug: /java/java/v2-Snapshots-listSnapshots
sidebar_label: "listSnapshots()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、必要に応じて database と collection を指定して snapshots を一覧表示します。 | Java | v2"
type: docx
token: ZhiOdVH0uoMI0axpcYMcfhQXnkf
sidebar_position: 6
keywords: 
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - listSnapshots()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listSnapshots()

この操作は、必要に応じて database と collection を指定して snapshots を一覧表示します。

```java
public ListSnapshotsResp listSnapshots(ListSnapshotsReq request)
```

## リクエスト構文\{#request-syntax}

```java
listSnapshots(ListSnapshotsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    collection を含む database の名前です。省略した場合は、現在の database が使用されます。

- `collectionName(String collectionName)`

    snapshot 操作に関連付けられた collection の名前です。

**戻り値:**

*ListSnapshotsResp*

リクエストフィルターに一致する snapshot 名を含むレスポンスです。

**例外:**

- **MilvusClientException**

    必須パラメータが不足している場合、数値パラメータが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に発生する例外です。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.ListSnapshotsReq;
import io.milvus.v2.service.snapshot.response.ListSnapshotsResp;

ListSnapshotsReq request = ListSnapshotsReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .build();

ListSnapshotsResp response = client.listSnapshots(request);
```
