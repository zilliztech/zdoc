---
title: "FunctionScore | Java | v2"
slug: /java/java/v2-Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FunctionScore インスタンスは、reranker として使用される `Function` インスタンスのリストです。 | Java | v2"
type: docx
token: QwsCdrceioo36Bxu2ricF15knUh
sidebar_position: 2
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionScore
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# FunctionScore

FunctionScore インスタンスは、reranker として使用される `Function` インスタンスのリストです。

```java
io.milvus.v2.service.vector.request.FunctionScore
```

## コンストラクター\{#constructor}

このコンストラクターは、1 つ以上の ranker で構成される新しい `FunctionScore` インスタンスを初期化します。

```java
FunctionScore.builder()
    .functions(List<CreateCollectionReq.Function> functions)
    .params(Map<String, String> params)
    .build()
```

**ビルダーメソッド：**

- `functions(List<CreateCollectionReq.Function> functions)`

    `Function` インスタンスのリストです。

- `params(Map<String, String> params)`

    指定された functions がどのように連携して動作するかに関する追加のパラメータです。Boost ranker の場合は、以下のパラメータを設定できます。

- `boost_mode` (String)

    指定された重みが、一致するエンティティのスコアにどのように影響するかを指定します。指定可能な値は次のとおりです。

    - `Multiply`

        重み付けされた値が、一致するエンティティの元のスコアに指定された重みを掛けた値に等しいことを示します。

        これはデフォルト値です。

    - `Sum`

        重み付けされた値が、一致するエンティティの元のスコアと指定された重みの合計に等しいことを示します。

- `function_mode` (String)

    複数の Boost ranker からの重み付けされた値をどのように処理するかを指定します。指定可能な値は次のとおりです。

    - `Multiply`

        一致するエンティティの最終スコアが、すべての Boost ranker からの重み付けされた値の積に等しいことを示します。

        これはデフォルト値です。

    - `Sum`

        一致するエンティティの最終スコアが、すべての Boost ranker からの重み付けされた値の合計に等しいことを示します。

**戻り値の型：**

*FunctionScore*

**戻り値：**

**FunctionScore** インスタンスです。

**パラメーター：**

- **functions** (*List&lt;CreateCollectionReq.Function&gt;*) -

    reranker として使用される `Function` インスタンスのリストです。

- **params** (*Map&lt;String, String&gt;*) -

    指定された functions がどのように連携して動作するかに関する追加のパラメータです。

## 例\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CreateCollectionReq.Function ranker = CreateCollectionReq.Function.builder()
                 .functionType(FunctionType.RERANK)
                 .name("boost")
                 .param("reranker", "boost")
                 .param("filter", "doctype == \"abstract\"")
                 .param("weight", "0.5")
                 .param("random_score", "{\"seed\": 126, \"field\": \"id\"}")
                 .build();

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .functionScore(FunctionScore.builder()
                .addFunction(ranker)
                .build())
        .build());
```
