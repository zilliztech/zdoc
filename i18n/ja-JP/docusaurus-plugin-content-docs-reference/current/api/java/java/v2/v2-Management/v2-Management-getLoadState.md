---
title: "getLoadState() | Java | v2"
slug: /java/java/v2-Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションまたはパーティションがロードされているかどうかを表示します。 | Java | v2"
type: docx
token: UN0oddDrNoaIq2xDGCLcG9XCnob
sidebar_position: 9
keywords: 
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - getLoadState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getLoadState()

この操作は、指定したコレクションまたはパーティションがロードされているかどうかを表示します。

```java
public Boolean getLoadState(GetLoadStateReq request)
```

## リクエスト構文\{#request-syntax}

```java
getLoadState(GetLoadStateReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    コレクションの名前です。

- `partitionName(String partitionName)`

    パーティションの名前です。

**戻り値の型：**

*Boolean*

**戻り値：**

指定したコレクションまたはパーティションの状態を示す Boolean 値です。

**パラメーター：**

- **loaded** (*Boolean*) -

    指定したコレクションまたはパーティションがロードされているかどうかを示します。ロードされている場合は `true`、それ以外の場合は `false` です。

**例外：**

- **MilvusException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get load state for collection "test"
GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.getLoadState(getLoadStateReq);
```
