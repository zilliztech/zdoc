---
title: "get() | Java | v2"
slug: /java/java/v2-Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID によって特定のエンティティを取得します。 | Java | v2"
type: docx
token: Xl3QdxmFxo3MNCxWlrxc9jFbnFc
sidebar_position: 2
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - get()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# get()

この操作は、ID によって特定のエンティティを取得します。

```java
public GetResp get(GetReq request)
```

## リクエスト構文\{#request-syntax}

```java
get(GetReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionName(String partitionName)
    .ids(List<Object> ids)
    .outputFields(List<String> outputFields)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象の collection が属するデータベースの名前。

- `collectionName(String collectionName)`

    既存の collection の名前。

- `clusterId(String clusterId)`

    この vector 読み取りリクエストの対象 cluster ID。複数のリクエストで同じ cluster ID を共有する場合は、`session(String clusterId)` を使用します。

- `partitionName(String partitionName)`

    partition の名前。

- `ids(List<Object> ids)`

    特定のエンティティ ID、またはエンティティ ID のリスト。

- `outputFields(List<String> outputFields)`

    クエリ結果に含めるフィールド名のリスト。

**戻り値の型:**

*GetResp*

**戻り値:**

1 つ以上のクエリ対象エンティティを表す **GetResp** オブジェクト。

**パラメータ:**

- **getResults** (*List\\\&lt;QueryResp.QueryResult\\\&gt;*)

    **QueryResp.QueryResult** オブジェクトのリスト。

- **fields** (*Map\\\&lt;String,Object\\\&gt;*)

    フィールド名とその値のキーと値のペアを含むマップ。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get entity with id 0
GetReq getReq = GetReq.builder()
        .collectionName("test")
        .ids(Collections.singletonList("0"))
        .build();
GetResp getResp = client.get(getReq);
```
