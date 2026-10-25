---
title: "runAnalyzer() | Java | v2"
slug: /java/java/v2-Vector-runAnalyzer
sidebar_label: "runAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は入力データを処理し、トークン化された出力を生成します。 | Java | v2"
type: docx
token: ZtsPdcamWoCjzhxZMnDc3aIZnxc
sidebar_position: 10
keywords: 
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - zilliz
  - zilliz cloud
  - クラウド
  - runAnalyzer()
  - javaV230
displayed_sidebar: javaSidebar

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

    分析対象のテキスト文字列のリストです。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    analyzer パラメーターのマップです。

- `withDetail(Boolean withDetail)` -

    詳細なトークン情報を含めるかどうかを指定します。

- `withHash(Boolean withHash)` -

    出力に hash 値を含めるかどうかを指定します。

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    対象コレクションの名前です。

- `fieldName(String fieldName)` -

    対象フィールドの名前です。

- `analyzerNames(List<String> analyzerNames)` -

    使用する analyzer 名のリストです。

**戻り値の型:**

*RunAnalyzerResp*

**戻り値:**

**RunAnalyzerResp** には **AnalyzerResult** オブジェクトのリストが含まれ、各 **AnalyzerResult** は **AnalyzerToken** オブジェクトのリストです。

**パラメーター:**

- **results** (*List&lt;AnalyzerResult&gt;*) -

    analyzer の結果のリストです。入力テキストごとに 1 つずつ含まれ、それぞれに以下のフィールドがあります。

    - **tokens** (*List&lt;AnalyzerToken&gt;*) -

        analyzer によって生成されたトークンです。それぞれに以下のフィールドがあります。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
