---
title: "map() | Python | MilvusClient"
slug: /python/python/FunctionChain-map
sidebar_label: "map()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、関数チェーンに map 操作を追加し、呼び出しを流暢にチェーンできるようにチェーンを返します。map 操作は関数式を評価し、その結果を出力フィールドに書き込みます。 | Python | MilvusClient"
type: docx
token: Vo8NdVAd6oBnY4xdWR1c3jNEnye
sidebar_position: 4
keywords: 
  - 階層型ナビゲート可能スモールワールド
  - 高密度埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - map()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# map()

この操作は、関数チェーンに map 操作を追加し、呼び出しを流暢にチェーンできるようにチェーンを返します。map 操作は関数式を評価し、その結果を出力フィールドに書き込みます。

## リクエスト構文\{#request-syntax}

```python
map(
    output: str,
    expr: FunctionChainExpr
) -> "FunctionChain"
```

**パラメーター:**

- **output** (*str*) -

    **[必須]**

    式が結果を書き込む出力フィールドの名前です。空でない文字列である必要があります。

- **expr** (*FunctionChainExpr*) -

    **[必須]**

    チェーンが各入力項目に対して評価する関数式です。列参照と fn モジュールのヘルパー関数から構築されます。

**戻り値の型:**

[FunctionChain](./MilvusClient-FunctionChain)

**戻り値:**

map 操作が追加された FunctionChain インスタンス自体です。これにより、後続の map()、sort()、limit() 呼び出しを流暢にチェーンできます。

**パラメーター:**

- **name** (*str*) -

    関数チェーンに割り当てられた名前です。

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    チェーンが実行される実行ステージです。

- **ops** (*list*) -

    この呼び出しで追加された操作を含め、これまでにチェーンに追加された操作です。

**例外:**

- **ParamError**

    output が空の文字列の場合、または expr が FunctionChainExpr でない場合に発生します。output がフィールドを指定し、expr が fn ヘルパーで構築された関数式になるように引数を修正してください。

## 例\{#examples}

```python
chain = chain.map(
    "rounded_score",
    fn.round_decimal(
        col("$score"),
        decimal=3,
    ),
)
```
