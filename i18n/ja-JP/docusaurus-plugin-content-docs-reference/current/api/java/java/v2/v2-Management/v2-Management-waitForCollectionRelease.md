---
title: "waitForCollectionRelease() | Java | v2"
slug: /java/java/v2-Management-waitForCollectionRelease
sidebar_label: "waitForCollectionRelease()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "この操作は、コレクションがリリースされるまで処理を停止します。このメソッドを使用すると、コレクションのリリース要求をカプセル化し、後続の操作に進む前にリリースが完全に完了したことを確認できます。 | Java | v2"
type: docx
token: HRicdDwU4oUDWEx6DrlcARGrn1c
sidebar_position: 17
keywords: 
  - 情報検索
  - 次元削減
  - hnsw アルゴリズム
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - waitForCollectionRelease()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# waitForCollectionRelease()

この操作は、コレクションがリリースされるまで処理を停止します。このメソッドを使用すると、コレクションのリリース要求をカプセル化し、後続の操作に進む前にリリースが完全に完了したことを確認できます。

```java
public void waitForCollectionRelease(ReleaseCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
waitForCollectionRelease(ReleaseCollectionReq.builder()
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

**ビルダーメソッド：**

- `collectionName(String collectionName)`

    コレクションの名前です。

- `async(Boolean async)`

    この操作を非同期で実行するかどうかです。

    値のデフォルトは `Boolean.True` で、プロセスがバックグラウンドで実行中であっても直ちに戻ることを示します。

- `timeout(Long timeout)`

    プロセスのタイムアウト時間です。指定した時間が経過すると、プロセスは終了します。

    値のデフォルトは `60000L` で、タイムアウト時間が 1 分であることを示します。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
// release collection "test"
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("test")
        .build();
        
client.releaseCollection(releaseCollectionReq);
client.waitForCollectionRelease(releaseCollectionReq);
```
