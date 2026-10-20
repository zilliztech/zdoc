---
title: "FunctionChainArg | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainArg
sidebar_label: "FunctionChainArg"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainArg インスタンスは、関数チェーン式の単一の引数であり、列参照またはリテラル値のいずれかです。 | Java | v2"
type: docx
token: RoiCd1E9QosTydxlBr9cURj5nne
sidebar_position: 2
keywords: 
  - 近似最近傍探索
  - エージェント型 RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - zilliz
  - zilliz cloud
  - クラウド
  - FunctionChainArg
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainArg

FunctionChainArg インスタンスは、関数チェーン式の単一の引数であり、列参照またはリテラル値のいずれかです。

```java
io.milvus.v2.service.vector.request.FunctionChainArg
```

## メソッド\{#methods}

- `static FunctionChainArg col(String name)`

    指定されたフィールド名の列参照引数を作成します。

- `static FunctionChainArg literal(Object value)`

    リテラル値引数を作成します。

- `boolean isColumn()`

    この引数が列参照である場合に `true` を返します。

- `String getColumnName()`

    この引数が列参照である場合に、列名を返します。

- `FunctionParamValue getLiteral()`

    この引数がリテラルの場合に、リテラル値を返します。

## 例\{#example}

```java
FunctionChainArg arg = FunctionChainArg.col("$score");
FunctionChainArg literal = FunctionChainArg.literal(0.7);
```
