---
title: "FunctionScore | Java | v2"
slug: /java/java/v2-Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`FunctionScore` インスタンスは、reranker として使用される `Function` インスタンスのリストです。 | Java | v2"
type: docx
token: Au6Wda1HUonyXOx5Pfzc0Cpjnab
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

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

`FunctionScore` インスタンスは、reranker として使用される `Function` インスタンスのリストです。

```java
io.milvus.v2.service.vector.request.FunctionScore
```

## Constructor\{#constructor}

このコンストラクタは、1 つ以上の ranker で構成される新しい `FunctionScore` インスタンスを初期化します。

```java
FunctionScore.builder()
    .functions(List<CreateCollectionReq.Function> functions)
    .params(Map<String, String> params)
    .build()
```

**BUILDER METHODS:**

- `functions(List<CreateCollectionReq.Function> functions)`

    `Function` インスタンスのリスト。

- `params(Map<String, String> params)`

    指定された functions がどのように連携して動作するかに関する追加パラメータです。Boost ranker の場合、以下のパラメータを設定できます。

    - `boost_mode` (String)

        指定された重みが、一致した任意の entity のスコアにどのように影響するかを指定します。指定可能な値は次のとおりです。

        - `Multiple`

            重み付けされた値が、一致した entity の元のスコアに指定された重みを掛けた値に等しいことを示します。

            これはデフォルト値です。

        - `Sum`

            重み付けされた値が、一致した entity の元のスコアと指定された重みの合計に等しいことを示します

    - `function_mode` (String)

        複数の Boost Rankers からの重み付けされた値をどのように処理するかを指定します。指定可能な値は次のとおりです。

        - `Multiplify`

            一致した entity の最終スコアが、すべての Boost Rankers からの重み付けされた値の積に等しいことを示します。

            これはデフォルト値です。

        - `Sum`

            一致した entity の最終スコアが、すべての Boost Rankers からの重み付けされた値の合計に等しいことを示します。

**RETURN TYPE:**

*FunctionScore*

**RETURNS:**

**FunctionScore** インスタンス。

## Example\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

CreateCollectionReq.Function ranker = CreateCollectionReq.Function.builder()
                 .functionType(FunctionType.RERANK)
                 .name("boost")
                 .param("reranker", "boost")
                 .param("filter", "doctype == \"abstract\"")
                 .param("weight", "0.5")
                 .param("random_score", "{\"seed\": 126, \"field\": \"id\"}")
                 .build();
                 
SearchResp searchReq = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .functionScore(FunctionScore.builder()
                .addFunction(ranker)
                .build())
        .build());
SearchResp searchResp = client.search(searchReq);
```
