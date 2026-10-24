---
title: "FunctionScore | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FunctionScore インスタンスは、複数の Function を設定可能な方法で組み合わせます。FunctionScore インスタンスをランカーとして使用すると、複数の再ランキング Function を組み合わせることができます。 | Python | MilvusClient"
type: docx
token: TXPxdXNMtoKZcRxkirkccYSsnId
sidebar_position: 12
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN Search
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionScore
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

**FunctionScore** インスタンスは、複数の **Function** を設定可能な方法で組み合わせます。**FunctionScore** インスタンスをランカーとして使用すると、複数の再ランキング **Function** を組み合わせることができます。

## リクエスト構文\{#request-syntax}

```python
class pymilvus.FunctionScore
```

**PARAMETERS:**

- **functions** (*[Function](../Collections/Function/Function.md*) -

    次のオプションです。<em>,</em> List[Function]&ast;） - 現在の FunctionScore インスタンスで組み合わせる Function インスタンス、または Function インスタンスのリストです。

- **params** (*Dict*) -

    上記の Function インスタンスを組み合わせる方法を指定するオプションです。次の設定を提供します。boost_mode（str）：指定した重みが一致するエンティティのスコアにどのように影響するかを指定します。使用可能な値は次のとおりです。Multiply：重み付き値が、一致するエンティティの元のスコアに指定した重みを乗算した値と等しいことを示します。これがデフォルト値です。Sum：重み付き値が、一致するエンティティの元のスコアと指定した重みの合計と等しいことを示します。function_mode（str）：さまざまな Boost Ranker からの重み付き値がどのように処理されるかを指定します。使用可能な値は次のとおりです。Multiply：一致するエンティティの最終スコアが、すべての Boost Ranker からの重み付き値の積と等しいことを示します。これがデフォルト値です。Sum：一致するエンティティの最終スコアが、すべての Boost Ranker からの重み付き値の合計と等しいことを示します。戻り値の型：*FunctionScore* 戻り値：設定された方法で組み合わせられた Function のセットです。 ## Examples.

## Examples\{#examples}

```python
class pymilvus.FunctionScore
```
