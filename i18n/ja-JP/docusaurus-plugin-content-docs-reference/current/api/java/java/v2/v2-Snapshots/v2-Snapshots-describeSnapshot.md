---
title: "describeSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、スナップショットの詳細なメタデータを取得します。 | Java | v2"
type: docx
token: CJEzd0riyoJkcUxdYvjcKPoWn3c
sidebar_position: 2
keywords: 
  - 類似検索
  - マルチモーダル RAG
  - LLM のハルシネーション
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

この操作は、スナップショットの詳細なメタデータを取得します。

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

    コレクションを含むデータベースの名前です。省略した場合、現在のデータベースが使用されます。

- `collectionName(String collectionName)`

    スナップショット操作に関連付けられたコレクションの名前です。

- `snapshotName(String snapshotName)`

    スナップショットの名前です。

**戻り値の型:**

*DescribeSnapshotResp*

**戻り値:**

スナップショット名、説明、コレクション名、パーティション名、作成タイムスタンプ、保存場所といったスナップショットのメタデータを含むレスポンスです。

**パラメーター:**

- **name** (*String*) -

    スナップショットの名前です。

- **description** (*String*) -

    スナップショットの説明です。

- **collectionName** (*String*) -

    スナップショットの作成元となったコレクションの名前です。

- **partitionNames** (*List&lt;String&gt;*) -

    スナップショットに含まれるパーティションの名前です。

- **createTs** (*Long*) -

    スナップショットの作成タイムスタンプです。

- **s3Location** (*String*) -

    スナップショットデータが保存される S3 ロケーションです。

**例外:**

- **MilvusClientException**

    必須パラメーターが欠落している場合、数値パラメーターが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外がスローされます。

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
