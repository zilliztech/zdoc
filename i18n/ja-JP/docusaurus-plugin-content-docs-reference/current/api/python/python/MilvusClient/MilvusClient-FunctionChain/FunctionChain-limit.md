---
title: "limit() | Python | MilvusClient"
slug: /python/python/FunctionChain-limit
sidebar_label: "limit()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、関数チェーンに limit 操作を追加し、呼び出しを流暢にチェーンできるようにチェーンを返します。チェーンは最初の limit 個のアイテムを保持し、必要に応じて適用前にオフセットをスキップします。 | Python | MilvusClient"
type: docx
token: KhBxdmmAGobyzWxEdHvcYEqWnxe
sidebar_position: 3
keywords: 
  - 近似最近傍探索
  - LLM 評価
  - スパースと密
  - 密ベクトル
  - zilliz
  - Zilliz Cloud
  - クラウド
  - limit()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# limit()

この操作は、関数チェーンに limit 操作を追加し、呼び出しを流暢にチェーンできるようにチェーンを返します。チェーンは最初の limit 個のアイテムを保持し、必要に応じて適用前にオフセットをスキップします。

## リクエスト構文\{#request-syntax}

```python
limit(
    limit: int,
    offset: int = 0
) -> "FunctionChain"
```

**パラメーター:**

- **limit** (*int*) -

    **[必須]**

    保持するアイテムの最大数です。正の整数である必要があります。

- **offset** (*int*) -

    limit を適用する前にスキップするアイテム数です。負でない整数である必要があり、デフォルトは 0 です。

**戻り値の型:**

[FunctionChain](./MilvusClient-FunctionChain)

**戻り値:**

limit 操作が追加された FunctionChain インスタンス自体です。これにより、後続の map()、sort()、limit() 呼び出しを流暢にチェーンできます。

**パラメーター:**

- **name** (*str*) -

    関数チェーンに割り当てられた名前です。

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    チェーンが実行される実行ステージです。

- **ops** (*list*) -

    この呼び出しで追加された操作を含め、これまでにチェーンに追加された操作です。

**例外:**

- **ParamError**

    limit が正の整数でない場合、または offset が負の場合に発生します。limit が正の値になり、offset が 0 以上になるように引数を修正してください。

## 例\{#examples}

```python
chain = chain.limit(
    10,
    offset=10,
)
```
