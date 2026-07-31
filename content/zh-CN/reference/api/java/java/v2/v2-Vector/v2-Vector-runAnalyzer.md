---
title: "runAnalyzer() | Java | v2"
slug: /java/java/v2-Vector-runAnalyzer
sidebar_label: "runAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会处理输入数据并生成分词后的输出。 | Java | v2"
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

此操作会处理输入数据并生成分词后的输出。

```java
public RunAnalyzerResp runAnalyzer(RunAnalyzerReq request)
```

## 请求语法\{#request-syntax}

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

**构建器方法：**

- `texts(List<String> texts)` -

    要分析的文本字符串列表。

- `analyzerParams(Map<String, Object> analyzerParams)` -

    analyzer 参数映射。

- `withDetail(Boolean withDetail)` -

    是否包含详细的 token 信息。

- `withHash(Boolean withHash)` -

    是否在输出中包含哈希值。

- `databaseName(String databaseName)` -

    数据库名称。若未指定，则默认使用当前数据库。

- `collectionName(String collectionName)` -

    目标 collection 的名称。

- `fieldName(String fieldName)` -

    目标字段的名称。

- `analyzerNames(List<String> analyzerNames)` -

    要使用的 analyzer 名称列表。

**返回：**

*RunAnalyzerResp*

**RunAnalyzerResp** 包含一个 **AnalyzerResult** 对象列表，其中每个对象都是一个 **AnalyzerToken** 对象列表。

**异常：**

- **MilvusClientException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

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
