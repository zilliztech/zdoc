---
title: "unpinSnapshotData() | Java | v2"
slug: /java/java/v2-Snapshots-unpinSnapshotData
sidebar_label: "unpinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、`pinSnapshotData()` によって作成されたスナップショットデータのピンを解放します。 | Java | v2"
type: docx
token: SachdJS5AopAZyxEfloceBnnnqg
sidebar_position: 9
keywords: 
  - オープンソースのベクトルデータベース
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - unpinSnapshotData()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# unpinSnapshotData()

この操作は、`pinSnapshotData()` によって作成されたスナップショットデータのピンを解放します。

```java
public void unpinSnapshotData(UnpinSnapshotDataReq request)
```

## リクエスト構文\{#request-syntax}

```java
unpinSnapshotData(UnpinSnapshotDataReq.builder()
    .pinId(Long pinId)
    .build()
)
```

**ビルダーメソッド：**

- `pinId(Long pinId)`

    `pinSnapshotData()` によって返されるピン ID です。

**例外：**

- **MilvusClientException**

    必須パラメーターが不足している場合、数値パラメーターが範囲外である場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.snapshot.request.UnpinSnapshotDataReq;

UnpinSnapshotDataReq request = UnpinSnapshotDataReq.builder()
    .pinId(987654321L)
    .build();

client.unpinSnapshotData(request);
```
