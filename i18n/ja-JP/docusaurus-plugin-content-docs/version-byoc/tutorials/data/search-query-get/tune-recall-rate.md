---
title: "リコール率を調整 | BYOC"
slug: /tune-recall-rate
sidebar_label: "リコール率を調整"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、ユーザーが検索の再現率とパフォーマンスをバランスさせるための検索パラメータ`level`を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、別の検索パラメータである`enablerecallestimation`も提供しています。これら2つのパラメータを組み合わせて、ベクトル検索の再現率を調整することができます。 | BYOC"
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
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example

---

import Admonition from '@theme/Admonition';


# リコール率を調整

Zilliz Cloudは、ユーザーが検索の再現率とパフォーマンスをバランスさせるための検索パラメータ`level`を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、別の検索パラメータである`enable_recall_estimation`も提供しています。これら2つのパラメータを組み合わせて、ベクトル検索の再現率を調整することができます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能はパブリックプレビューであり、Milvus v 2.5.4以降またはMilvus v 2.4.14以降と互換性のあるクラスターを使用する必要があります。</p>
<p>この機能は、次のバージョンのAPIおよびSDKと互換性があります。</p>
<ul>
<li><p>Python:バージョン2.5.4とバージョン2.4.1 4</p></li>
<li><p>Java: v 2.5.3およびv 2.4.10</p></li>
<li><p>Node. js:v 2.5.2とv 2.4.10</p></li>
<li><p>RESTful:バージョン2.5.4</p></li>
</ul>

</Admonition>

## 概要について{#overview}

Zilliz Cloudのリコール率は、通常、検索によって正常に取得された関連する結果の割合を指します。これは、システムがコレクションからすべての関連アイテムを回復する能力を測定します。

![EcvqbDaXpoQ5BUxRfL0cyzk9ntc](/img/EcvqbDaXpoQ5BUxRfL0cyzk9ntc.png)

検索のリコール率を計算するには、取得された関連アイテムの数を取得すべき該当アイテムの総数で割ることができます。たとえば、検索が100件の関連アイテムのうち90件を取得した場合、リコール率は**0.9** または**90%**になります。

リコール率が高いと、通常はより正確な検索結果を示し、時間がかかる場合があります。ベクトル検索の精度と効率のバランスを取るために、リコール率を調整することをお勧めします。

## 検索リクエストを設定する{#set-up-a-search-request}

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

## リコール率を調整する{#tune-recall-rate}

Zilliz Cloudは、チューニング過程を容易にするために、`enable_recall_estimation`という別の検索パラメータも導入しています。このパラメータを`True`に設定すると、Zilliz Cloudは現在の検索のリコール率を推定し、推定されたリコール率を検索結果に含めます。

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

1. ユーザー定義の値に設定された`level`パラメータで検索します

1. 内部高精度モードで別の検索を実行します。

1. リコール率を推定するために、2番目の検索をグラウンドトゥルースとして使用してください。

`enable_recall_estimation`を`True`に設定すると、`level`パラメータの値を調整して複数のリコール率を得ることができます。これらの推定値と各検索の期間を考慮することで、適切なレベル設定をおおよそ推定することができます。

## 限界{#limits}

現在、この機能は基本ベクトル検索、フィルター検索、範囲検索のZilliz Cloudクラスターでのみ利用可能です。

