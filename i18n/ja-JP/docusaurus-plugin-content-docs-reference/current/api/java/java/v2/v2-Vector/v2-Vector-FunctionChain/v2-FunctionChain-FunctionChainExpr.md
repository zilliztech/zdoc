---
title: "FunctionChainExpr | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainExpr
sidebar_label: "FunctionChainExpr"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainExpr インスタンスは、`numcombine`、`decay`、`rounddecimal` などの関数チェーン操作で使用される関数呼び出し式です。 | Java | v2"
type: docx
token: RyvBdUjTKo2sF4xtwoRc2FNbn3d
sidebar_position: 3
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - クラウド
  - FunctionChainExpr
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainExpr

FunctionChainExpr インスタンスは、`num_combine`、`decay`、`round_decimal` などの関数チェーン操作で使用される関数呼び出し式です。

```java
io.milvus.v2.service.vector.request.FunctionChainExpr
```

## コンストラクター\{#constructor}

このビルダーは、名前、引数、名前付きパラメーターを指定して関数式を作成します。

```java
FunctionChainExpr.builder()
    .name(String name)
    .arg(FunctionChainArg arg)
    .param(String key, Object value)
    .build()
```

**ビルダーメソッド：**

- `name(String name)`

    式の名前です。例：`"num_combine"`。

- `arg(FunctionChainArg arg)`

    引数を追加します。引数には、列参照またはリテラルを指定できます。

- `param(String key, Object value)`

    式の名前付きパラメーターを設定します。

**戻り値の型：**

*FunctionChainExpr*

**戻り値：**

**FunctionChainExpr** インスタンスです。

**パラメーター：**

- **name** (*String*) -

    式の名前です。例：`"num_combine"`。

- **args** (*List&lt;FunctionChainArg&gt;*) -

    式の引数です。各引数は **FunctionChainArg** オブジェクトです。

- **params** (*Map&lt;String, FunctionParamValue&gt;*) -

    式の名前付きパラメーターです。各値は **FunctionParamValue** オブジェクトです。

**メソッド：**

- `String getName()`

    式の名前を返します。

- `List<FunctionChainArg> getArgs()`

    式の引数を返します。

- `Map<String, FunctionParamValue> getParams()`

    式の名前付きパラメーターを返します。

## 例\{#example}

```java
FunctionChainExpr expr = FunctionChainExpr.builder()
        .name("num_combine")
        .arg(FunctionChainArg.col("$score"))
        .arg(FunctionChainArg.col("freshness"))
        .param("mode", "weighted")
        .build();
```
