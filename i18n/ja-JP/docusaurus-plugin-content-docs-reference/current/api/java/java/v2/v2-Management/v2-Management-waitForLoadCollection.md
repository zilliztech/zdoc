---
title: "waitForLoadCollection() | Java | v2"
slug: /java/java/v2-Management-waitForLoadCollection
sidebar_label: "waitForLoadCollection()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "この操作は、コレクションがロードされるまでプロセスを停止します。このメソッドを使用すると、ロードプロセスが完了するまで 0.5 秒間隔でコレクションのロード状態を確認できます。 | Java | v2"
type: docx
token: LMsOdAVFQopadPx1N2UcOn0unCf
sidebar_position: 18
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone と Milvus の比較
  - zilliz
  - zilliz cloud
  - クラウド
  - waitForLoadCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# waitForLoadCollection()

この操作は、コレクションがロードされるまでプロセスを停止します。このメソッドを使用すると、ロードプロセスが完了するまで 0.5 秒間隔でコレクションのロード状態を確認できます。

```java
private void WaitForLoadCollection(String collectionName, long timeoutMs)
```

## リクエスト構文\{#request-syntax}

```java
waitForCollectionRelease(String collectionName, long timeoutMs)
```

**パラメーター：**

- **collectionName** (*String*) -

    対象コレクションの名前です。

- **timeoutMs** (*long*) -

    この操作のタイムアウト時間（ミリ秒）です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
// load collection "test"
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
        .collectionName("test")
        .build();
client.loadCollection(loadCollectionReq);

// Wait for 10 seconds
client.waitForLoadCollection("test", 10000)
```
