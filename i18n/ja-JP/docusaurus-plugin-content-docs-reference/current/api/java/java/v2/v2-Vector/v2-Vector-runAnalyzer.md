---
title: "runAnalyzer() | Java | v2"
slug: /java/java/v2-Vector-runAnalyzer
sidebar_label: "runAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は入力データを処理し、トークン化された出力を生成します。 | Java | v2"
type: docx
token: AXt2dvFmQoP04wx9zlVciuitnQf
sidebar_position: 10
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - runAnalyzer()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# runAnalyzer()

この操作は入力データを処理し、トークン化された出力を生成します。

```java
public RunAnalyzerResp runAnalyzer(RunAnalyzerReq request)
```

## リクエスト構文\{#request-syntax}

```java
runAnalyzer(RunAnalyzerReq.builder()
    .texts(List<String> texts)
    .analyzerParams(Map<String, Object> analyzerParams)
    .withDetail(Boolean withDetail)
    .withHash(Boolean withHash)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .analyzerNames(List<String> analyzerNames)
    .build()
);
```

**BUILDER メソッド:**

- `texts(List<String> texts)` -

    分析するテキスト文字列のリスト。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    analyzer パラメータのマップ。

- `withDetail(Boolean withDetail)` -

    詳細なトークン情報を含めるかどうか。

- `withHash(Boolean withHash)` -

    出力に hash 値を含めるかどうか。

- `databaseName(String databaseName)` -

    データベース名。指定しない場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象 collection の名前。

- `fieldName(String fieldName)` -

    対象 field の名前。

- `analyzerNames(List<String> analyzerNames)` -

    使用する analyzer 名のリスト。

**戻り値:**

*RunAnalyzerResp*

**RunAnalyzerResp** には **AnalyzerResult** オブジェクトのリストが含まれ、各 **AnalyzerResult** は **AnalyzerToken** オブジェクトのリストです。 

**例外:**

- **MilvusClientException**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Run analyzer
List<String> texts = new ArrayList<>();
texts.add("Analyzers (tokenizers) for multi languages");
texts.add("2.5 to take advantage of enhancements and fixes!");

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Arrays.asList("lowercase",
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Arrays.asList("to", "of", "for", "the"));
                }}));

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .withDetail(true)
        .withHash(true)
        .build());
```
