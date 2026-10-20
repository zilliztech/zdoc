---
title: "FunctionParamValue | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionParamValue
sidebar_label: "FunctionParamValue"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionParamValue インスタンスは、ファンクションチェーン式と操作パラメーターに使用される型付きの値です。 | Java | v2"
type: docx
token: HYTwdAVAEo85oqxQPI4ctxErnDh
sidebar_position: 6
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - 伸縮性のあるベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - FunctionParamValue
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionParamValue

FunctionParamValue インスタンスは、ファンクションチェーン式と操作パラメーターに使用される型付きの値です。

```java
io.milvus.v2.service.vector.request.FunctionParamValue
```

## メソッド\{#methods}

- `static FunctionParamValue of(boolean value)`

    ブール型のパラメーター値を作成します。

- `static FunctionParamValue of(long value)`

    整数型のパラメーター値を作成します。

- `static FunctionParamValue of(double value)`

    浮動小数点型のパラメーター値を作成します。

- `static FunctionParamValue of(String value)`

    文字列型のパラメーター値を作成します。

- `static FunctionParamValue of(byte[] value)`

    バイト配列からバイナリパラメーター値を作成します。

- `static FunctionParamValue of(ByteString value)`

    protobuf の `ByteString` からバイナリパラメーター値を作成します。

- `static FunctionParamValue ofArray(List<FunctionParamValue> values)`

    型付き値のリストから配列パラメーター値を作成します。

- `static FunctionParamValue ofObject(Map<String, FunctionParamValue> fields)`

    フィールド値のマップからオブジェクトパラメーター値を作成します。

- `static FunctionParamValue from(Object value)`

    Java オブジェクトから型を推測してパラメーター値を作成します。

## 例\{#example}

```java
FunctionChainExpr expr = FunctionChainExpr.builder()
        .name("num_combine")
        .arg(FunctionChainArg.col("$score"))
        .param("weights", Arrays.asList(FunctionParamValue.of(0.7), FunctionParamValue.of(0.3)))
        .build();
```
