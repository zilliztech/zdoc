---
title: "addFunction() | Java | v2"
slug: /java/java/v2-FunctionScore-addFunction
sidebar_label: "addFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、`FunctionScore` インスタンスに関数を追加します。 | Java | v2"
type: docx
token: WMdhdOQGWooN4axfpQQcIRGTnsb
sidebar_position: 1
keywords: 
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - addFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFunction()

この操作は、`FunctionScore` インスタンスに関数を追加します。

```java
public B addFunction(CreateCollectionReq.Function func)
```

## リクエスト構文\{#request-syntax}

```java
addFunction(
    CreateCollectionReq.Function func
)
```

**PARAMETERS:**

- **func** (*CreateCollectionReq.Function*)

    追加する関数です。

**RETURN TYPE:**

*B extends FunctionScore.FunctionScoreBuilder&lt;C, B&gt;*

**RETURNS:**

複数の addFunction() メソッドをチェーンするための FunctionScore ビルダーです。

**PARAMETERS:**

- **functions** (*List&lt;CreateCollectionReq.Function&gt;*) -

    これまでに追加された関数です。addFunction() を呼び出すたびに、このリストに追加されます。

- **params** (*Map&lt;String, String&gt;*) -

    `params(Map<String, String> params)` で設定する、この関数スコアのパラメーターです。

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
