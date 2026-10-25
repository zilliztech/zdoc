---
title: "listSnapshots() | Java | v2"
slug: /java/java/v2-Snapshots-listSnapshots
sidebar_label: "listSnapshots()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、必要に応じてデータベースとコレクションを指定して、スナップショットを一覧表示します。 | Java | v2"
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

---

import Admonition from '@theme/Admonition';


# listSnapshots()

この操作は、必要に応じてデータベースとコレクションを指定して、スナップショットを一覧表示します。

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

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    コレクションを含むデータベースの名前です。省略した場合、現在のデータベースが使用されます。

- `collectionName(String collectionName)`

    スナップショット操作に関連付けられたコレクションの名前です。

**戻り値の型:**

*ListSnapshotsResp*

**戻り値:**

リクエストフィルターに一致するスナップショット名を含むレスポンスです。

**パラメーター:**

- **snapshots** (*List&lt;String&gt;*) -

    リクエストフィルターに一致するスナップショットの名前です。

**例外:**

- **MilvusClientException**

    必須パラメーターが不足している場合、数値パラメーターが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外がスローされます。

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
