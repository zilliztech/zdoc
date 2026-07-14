---
title: "getLoadStateV2() | Java | v2"
slug: /java/java/v2-Collections-getLoadStateV2
sidebar_label: "getLoadStateV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection または partition の詳細なロード状態情報を取得します。現在のロード状態とロード進行状況の両方が必要な場合に使用します。 | Java | v2"
type: docx
token: JEgudTxxYocs2VxLjgccpB7SnOb
sidebar_position: 38
keywords: 
  - オープンソース vector db
  - vector database の例
  - rag vector database
  - vector db とは
  - zilliz
  - zilliz cloud
  - クラウド
  - getLoadStateV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getLoadStateV2()

この操作は、collection または partition の詳細なロード状態情報を取得します。現在のロード状態とロード進行状況の両方が必要な場合に使用します。

```java
public GetLoadStateResp getLoadStateV2(GetLoadStateReq request)
```

## リクエスト構文\{#request-syntax}

```java
getLoadStateV2(GetLoadStateReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build());
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    collection を含むデータベース。

- `collectionName(String collectionName)`

    ロード状態を確認する collection。

- `partitionName(String partitionName)`

    オプションの partition 名です。collection レベルのロード状態を確認するには省略します。

**戻り値:**

*GetLoadStateResp*

**例外:**

- **MilvusClientException**

    バリデーションに失敗した場合、またはこの操作に対してサーバーがエラーを返した場合に、この例外が発生します。

## 例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

GetLoadStateResp resp = client.getLoadStateV2(GetLoadStateReq.builder()
    .collectionName("book")
    .build());
System.out.println(resp.getState());
System.out.println(resp.getProgress());
```

{/* category: Collections; action: CREATE; addedSince: v3.0.x */}
