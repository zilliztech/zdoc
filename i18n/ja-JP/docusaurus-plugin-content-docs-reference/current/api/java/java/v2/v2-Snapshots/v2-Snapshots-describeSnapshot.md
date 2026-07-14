---
title: "describeSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はスナップショットの詳細なメタデータを取得します。 | Java | v2"
type: docx
token: CJEzd0riyoJkcUxdYvjcKPoWn3c
sidebar_position: 2
keywords: 
  - 類似検索
  - マルチモーダル RAG
  - llm hallucinations
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - cloud
  - describeSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeSnapshot()

この操作はスナップショットの詳細なメタデータを取得します。

```java
public DescribeSnapshotResp describeSnapshot(DescribeSnapshotReq request)
```

## リクエスト構文\{#request-syntax}

```java
describeSnapshot(DescribeSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    collection を含むデータベースの名前です。省略した場合、現在のデータベースが使用されます。

- `collectionName(String collectionName)`

    スナップショット操作に関連付けられた collection の名前です。

- `snapshotName(String snapshotName)`

    スナップショットの名前です。

**戻り値:**

*DescribeSnapshotResp*

スナップショット名、説明、collection 名、partition 名、作成タイムスタンプ、保存場所を含む、スナップショットのメタデータを含むレスポンスです。

**例外:**

- **MilvusClientException**

    必須パラメータが不足している場合、数値パラメータが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.DescribeSnapshotReq;
import io.milvus.v2.service.snapshot.response.DescribeSnapshotResp;

DescribeSnapshotReq request = DescribeSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .build();

DescribeSnapshotResp response = client.describeSnapshot(request);
```
