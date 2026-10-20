---
title: "FunctionChainStage | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainStage
sidebar_label: "FunctionChainStage"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainStage インスタンスは、関数チェーンが実行される実行ステージを指定します。数値は、gRPC の `FunctionChainStage` メッセージと同じです。 | Java | v2"
type: docx
token: E1GAdX9woo39BTxEwfocb6fVnCb
sidebar_position: 5
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - クラウド
  - FunctionChainStage
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainStage

FunctionChainStage インスタンスは、関数チェーンが実行される実行ステージを指定します。数値は、gRPC の `FunctionChainStage` メッセージと同じです。

```java
io.milvus.v2.service.vector.request.FunctionChainStage
```

## 定数\{#constants}

- **UNSPECIFIED**

    未設定のステージです。

- **INGESTION**

    データ取り込み中に実行されます。

- **PRE_PROCESS**

    検索前に実行されます。

- **L0_RERANK**

    検索結果に適用される最初の再ランクステージです。

- **L1_RERANK**

    検索結果に適用される 2 番目の再ランクステージです。

- **L2_RERANK**

    検索結果に適用される 3 番目の再ランクステージです。

- **POST_PROCESS**

    検索後に実行されます。

## 例\{#example}

```java
FunctionChain chain = FunctionChain.builder()
        .stage(FunctionChainStage.L2_RERANK)
        .name("fresh_popular_rerank")
        .build();
```
