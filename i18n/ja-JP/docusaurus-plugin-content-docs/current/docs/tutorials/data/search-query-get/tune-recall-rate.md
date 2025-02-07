---
title: "リコール率を調整 | Cloud"
slug: /tune-recall-rate
sidebar_label: "リコール率を調整"
beta: PUBLIC
notebook: FALSE
description: "Zilliz Cloudは、ユーザーが検索の再現率とパフォーマンスをバランスさせるための検索パラメータ`レベル`を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、別の検索パラメータである`enableリコール計算`も提供しています。これら2つのパラメータを組み合わせて、ベクトル検索の再現率を調整することができます。 | Cloud"
type: origin
token: AR0KwdZL1iqGPvkZw0acG3JwnHe
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - vector search
  - ann
  - recall rate
  - tune recall rate
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search

---

import Admonition from '@theme/Admonition';


# リコール率を調整

Zilliz Cloudは、ユーザーが検索の再現率とパフォーマンスをバランスさせるための検索パラメータ`レベル`を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、別の検索パラメータである`enable_リコール_計算`も提供しています。これら2つのパラメータを組み合わせて、ベクトル検索の再現率を調整することができます。

## 概要について{#}

Zilliz Cloudのリコール率は、通常、検索によって正常に取得された関連する結果の割合を指します。これは、システムがコレクションからすべての関連アイテムを回復する能力を測定します。

![EcvqbDaXpoQ5BUxRfL0cyzk9ntc](/img/ja-JP/EcvqbDaXpoQ5BUxRfL0cyzk9ntc.png)

検索のリコール率を計算するには、取得された関連アイテムの数を取得すべき該当アイテムの総数で割ることができます。たとえば、検索が100件の関連アイテムのうち90件を取得した場合、リコール率は**0.9** または**90%**になります。

リコール率が高いと、通常はより正確な検索結果を示し、時間がかかる場合があります。ベクトル検索の精度と効率のバランスを取るために、リコール率を調整することをお勧めします。

## 検索リクエストを設定する{#}

調整可能な呼び出しを使用して検索要求を設定するには、次のように検索パラメータ内に`level`パラメータを含める必要があります。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 1 # The precision control
        }
    }
)
```

パラメータの`レベル`は`1`から`10`の範囲で、デフォルトは`1`です。デフォルト値では、ほとんどのユースケースで十分な90%のリコール率が得られます。

高いリコール率(**99%**以上)が必要なシナリオでは、`level`パラメータを`6`から`10`の整数に設定してみてください。検索効率に問題がない場合は、このパラメータを`10`に設定して、最も正確な結果を得ることができます。

<Admonition type="info" icon="📘" title="ノート">

<p>最上位レベルの設定でも十分でない場合は、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## リコール率を調整する{#}

Zilliz Cloudは、チューニング過程を容易にするために、`enable_リコール_計算`という別の検索パラメータも導入しています。このパラメータを`True`に設定すると、Zilliz Cloudは現在の検索のリコール率を推定し、推定されたリコール率を検索結果に含めます。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 6 # The precision control
            "enable_recall_calculation": True # Ask for recall rate calculation
        }
    }
)
```

上記の検索リクエストを使用すると、現在の検索の推定リコール率を以下のように取得できます。

```python
# data: [...], recalls: [0.98]
```

見積りの過程で、Zilliz Cloud:

1. ユーザー定義の値に設定された`レベル`パラメータで検索します

1. レベルパラメータを`レベル`パラメータに`10`を設定して、別の検索を実行します。

1. 2回目の検索で、`level`パラメータをグラウンドトゥルースとして`10`に設定して、リコール率を推定します。

enable`_recol_計算`を`True`に設定すると、`level`パラメータの値を調整して複数のリコール率を得ることができます。これらの推定値と各検索の期間を考慮することで、適切なレベル設定をおおよそ推定することができます。

## 限界{#}

現在、この機能は基本ベクトル検索、フィルター検索、範囲検索のZilliz Cloudクラスターでのみ利用可能です。

