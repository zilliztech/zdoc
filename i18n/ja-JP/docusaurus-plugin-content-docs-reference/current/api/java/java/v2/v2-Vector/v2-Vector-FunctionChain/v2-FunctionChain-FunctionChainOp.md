---
title: "FunctionChainOp | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainOp
sidebar_label: "FunctionChainOp"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainOp インスタンスは、`map`、`sort`、`limit` などの関数チェーンパイプラインにおける単一の操作です。 | Java | v2"
type: docx
token: A6jodK8uxonu3Gx8pS6ccsJtnte
sidebar_position: 4
keywords: 
  - Milvus ベンチマーク
  - マネージド Milvus
  - Serverless ベクトルデータベース
  - Milvus オープンソース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - FunctionChainOp
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainOp

FunctionChainOp インスタンスは、`map`、`sort`、`limit` などの関数チェーンパイプラインにおける単一の操作です。

```java
io.milvus.v2.service.vector.request.FunctionChainOp
```

## 定数\{#constants}

- `String OP_MAP` — `"map"` 操作名です。

- `String OP_SORT` — `"sort"` 操作名です。

- `String OP_LIMIT` — `"limit"` 操作名です。

## コンストラクター\{#constructor}

このビルダーは、式（省略可能）、入力、出力、およびパラメーターを指定して関数チェーン操作を作成します。

```java
FunctionChainOp.builder()
    .op(String op)
    .expr(FunctionChainExpr expr)
    .inputs(List<String> inputs)
    .outputs(List<String> outputs)
    .params(Map<String, FunctionParamValue> params)
    .build()
```

**ビルダーメソッド：**

- `op(String op)`

    操作名です。例：`"map"`、`"sort"`、`"limit"`。

- `expr(FunctionChainExpr expr)`

    この操作に付加される関数式です。

- `inputs(List<String> inputs)`

    この操作の入力列です。

- `outputs(List<String> outputs)`

    この操作の出力列です。

- `params(Map<String, FunctionParamValue> params)`

    この操作の名前付きパラメーターです。

**戻り値の型：**

*FunctionChainOp*

**戻り値：**

**FunctionChainOp** インスタンスです。

**パラメーター：**

- **op** (*String*) -

    サーバーが認識する操作名です。例：`"map"`、`"sort"`、`"limit"`。

- **expr** (*FunctionChainExpr*) -

    この操作に付加される関数式です。操作に式がない場合は `null` です。

- **inputs** (*List&lt;String&gt;*) -

    この操作で消費される入力列です。

- **outputs** (*List&lt;String&gt;*) -

    この操作で生成される出力列です。

- **params** (*Map&lt;String, FunctionParamValue&gt;*) -

    この操作の名前付きパラメーターです。各値は **FunctionParamValue** オブジェクトです。

**メソッド：**

- `String getOp()`

    操作名を返します。

- `FunctionChainExpr getExpr()`

    付加された関数式を返します。

- `List<String> getInputs()`

    この操作の入力列を返します。

- `List<String> getOutputs()`

    この操作の出力列を返します。

- `Map<String, FunctionParamValue> getParams()`

    この操作の名前付きパラメーターを返します。

## 例\{#example}

```java
FunctionChainOp op = FunctionChainOp.builder()
        .op(FunctionChainOp.OP_SORT)
        .inputs(Collections.singletonList("$score"))
        .build();
```
