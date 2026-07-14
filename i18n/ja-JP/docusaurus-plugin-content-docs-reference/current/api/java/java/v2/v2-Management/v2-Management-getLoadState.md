---
title: "getLoadState() | Java | v2"
slug: /java/java/v2-Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、指定された collection または partition がロードされているかどうかを表示します。 | Java | v2"
type: docx
token: PAs7dwIIrop4OixCUr8ctHVLnXc
sidebar_position: 9
keywords: 
  - vector データベース チュートリアル
  - vector データベースの仕組み
  - vector db 比較
  - openai vector db
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getLoadState()

この操作は、指定された collection または partition がロードされているかどうかを表示します。

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

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    対象の collection が属するデータベースの名前です。

- `collectionName(String collectionName)`

    collection の名前です。

- `partitionName(String partitionName)`

    partition の名前です。

**戻り値の型:**

*Boolean*

**戻り値:**

指定された collection または partition の状態を示す Boolean 値です。 

<Admonition type="info" icon="📘" title="注記">

collection は、そのいずれかまたはすべての partition がロードされている場合、ロード済み状態とみなされます。

</Admonition>

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;

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
