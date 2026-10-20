---
title: "WaitForDropCollection() | Java | v2"
slug: /java/java/v2-Collections-WaitForDropCollection
sidebar_label: "WaitForDropCollection()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "この操作は、コレクションが削除されるまでプロセスを停止します。このメソッドを使用すると、コレクションの削除リクエストをカプセル化し、後続のアクションに進む前に削除が完全に完了していることを確認できます。 | Java | v2"
type: docx
token: K9E6dtYlJojtOCxTG0EcGBVnnKe
sidebar_position: 20
keywords: 
  - knn アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - Zilliz Cloud
  - クラウド
  - WaitForDropCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# WaitForDropCollection()

この操作は、コレクションが削除されるまでプロセスを停止します。このメソッドを使用すると、コレクションの削除リクエストをカプセル化し、後続のアクションに進む前に削除が完全に完了していることを確認できます。

```java
private void WaitForDropCollection(DropCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
WaitForDropCollection(DropCollectionReq.builder()
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

**ビルダーメソッド:**

- `collectionName(String collectionName)`

    コレクションの名前です。

- `async(Boolean async)`

    この操作を非同期で実行するかどうかを指定します。

    デフォルト値は `Boolean.True` で、プロセスがバックグラウンドで実行中であってもすぐに戻ることを示します。

- `timeout(Long timeout)`

    プロセスのタイムアウト時間です。指定した時間が経過すると、プロセスは終了します。

    デフォルト値は `60000L` で、タイムアウト時間が 1 分であることを示します。

**例外:**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外が発生します。

## 例\{#example}

```java
// drop a collection: test
DropCollectionReq dropCollectionReq = DropCollectionReq.builder()
        .collectionName("test")
        .build();
client.dropCollection(dropCollectionReq);
client.WaitForDropCollection(dropCollectionReq);
```
