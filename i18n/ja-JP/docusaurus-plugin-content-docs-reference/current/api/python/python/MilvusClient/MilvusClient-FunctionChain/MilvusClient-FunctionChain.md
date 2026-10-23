---
title: "FunctionChain | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionChain
sidebar_label: "FunctionChain"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FunctionChain インスタンスは、1 つの実行ステージにバインドされた map 操作と sort 操作の名前付きシーケンスからなるサーバー側の関数チェーンを構成します。 | Python | MilvusClient"
type: docx
token: Qp9tdzovXo3xCvxPlszcLGcInPh
sidebar_position: 1
keywords: 
  - 近似最近傍探索
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - zilliz
  - Zilliz Cloud
  - クラウド
  - FunctionChain
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChain

FunctionChain インスタンスは、1 つの実行ステージにバインドされた map 操作と sort 操作の名前付きシーケンスからなるサーバー側の関数チェーンを構成します。

## リクエスト構文\{#request-syntax}

```python
class FunctionChain:
```

**パラメーター：**

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    チェーンが実行される実行ステージです。たとえば、FunctionChainStage.L2_RERANK です。

- **name** (*str*) -

    デフォルト：`""`

    この関数チェーンに割り当てられた名前です。

**メソッド：**

- `name`

    この関数チェーンに割り当てられた名前です。

- `stage`

    この関数チェーンが実行される実行ステージです。

- `ops`

    このチェーンに追加された操作の不変ビューです。

- `map(output, expr)`

    式の結果を出力フィールドに書き込む map 操作を追加します。

- `sort(by, desc=True, tie_break_col=None)`

    列を基準に sort 操作を追加します。任意でタイブレーク列を指定できます。

- `limit(limit, offset=0)`

    offset を任意で指定して limit 操作を追加します。

**例外：**

- **ParamError**

    stage を FunctionChainStage に変換できない場合、または name が文字列でない場合に発生します。正確な原因を確認するには、エラーメッセージを調べてください。

## 例\{#examples}

```python
from pymilvus import MilvusClient, FunctionChain, FunctionChainStage, col, fn

chain = (
    FunctionChain(
        FunctionChainStage.L2_RERANK,
        name="fresh_popular_rerank",
    )
    .map("freshness", fn.decay(
            col("published_at"),
            function="exp",
            origin=1700000000,
            scale=86400,
        ))
    .map(
        "$score",
        fn.num_combine(
            col("$score"),
            col("freshness"),
            col("popularity"),
            mode="weighted",
        ),
    )
    .sort(
        "$score",
        desc=True,
    )
)
results = client.search(
    collection_name="docs",
    data=[[0.1, 0.2]],
    limit=10,
    function_chains=chain,
)
```
