---
title: "sort() | Python | MilvusClient"
slug: /python/python/FunctionChain-sort
sidebar_label: "sort()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ソート操作を関数チェーンに追加し、呼び出しを連続してチェーンできるようにチェーンを返します。チェーンはデフォルトで列の降順にソートされ、安定した順序付けのためにオプションのタイブレーク列を指定できます。 | Python | MilvusClient"
type: docx
token: NqVVdpsuPoWuD8xKcf5cAvq3nJh
sidebar_position: 5
keywords: 
  - OpenAI ベクトル DB
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - マネージドベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - sort()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# sort()

この操作は、ソート操作を関数チェーンに追加し、呼び出しを連続してチェーンできるようにチェーンを返します。チェーンはデフォルトで列の降順にソートされ、安定した順序付けのためにオプションのタイブレーク列を指定できます。

## リクエスト構文\{#request-syntax}

```python
sort(
    by: Union[str, ColumnRef],
    desc: bool = True,
    tie_break_col: Optional[Union[str, ColumnRef]] = None
) -> "FunctionChain"
```

**パラメーター:**

- **by** (*str | ColumnRef*) -

    **[必須]**

    プライマリソートキーとして使用する列名または ColumnRef です。

- **desc** (*bool*) -

    チェーンのソート方向です。デフォルトでは降順にソートされます。

- **tie_break_col** (*str | ColumnRef | None*) -

    プライマリソート値が等しい場合にタイブレークに使用する、オプションの列名または ColumnRef です。

**戻り値の型:**

[FunctionChain](./MilvusClient-FunctionChain)

**戻り値:**

ソート操作が追加された FunctionChain インスタンス自体です。これにより、後続の map()、sort()、limit() 呼び出しを連続してチェーンできます。

**パラメーター:**

- **name** (*str*) -

    関数チェーンに割り当てられた名前です。

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    チェーンが実行される実行ステージです。

- **ops** (*list*) -

    この呼び出しで追加された操作を含め、これまでにチェーンに追加された操作です。

**例外:**

- **ParamError**

    by または tie_break_col が有効な列参照でない場合、または desc がブール値でない場合に発生します。両方の列参照が既存のフィールドを指定し、desc がブール値になるように引数を修正してください。

## 例\{#examples}

```python
chain = chain.sort(
    "score",
    desc=True,
    tie_break_col="doc_id",
)
```
