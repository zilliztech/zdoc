---
title: "再現率の調整 | Cloud"
slug: /tune-recall-rate
sidebar_key: tune-recall-rate
sidebar_label: "再現率の調整"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、検索の再現率とパフォーマンスのバランスを調整するための検索パラメータ `level` を導入しています。また、現在の検索における推定再現率を取得できる別の検索パラメータ `enablerecallcalculation` も提供しています。これら 2 つのパラメータを組み合わせることで、ベクトル検索の再現率を調整できます。 | Cloud"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - ベクトル検索
  - ann
  - 再現率
  - 再現率の調整

---

import Admonition from '@theme/Admonition';


# リコール率の調整

Zilliz Cloud では、検索パラメータ `level` を導入し、ユーザーが検索のリコール率とパフォーマンスのバランスを取れるようにしています。また、別の検索パラメータ `enable_recall_calculation` も提供しており、現在の検索における推定リコール率をユーザーに提示します。これらの2つのパラメータを組み合わせることで、ベクトル検索のリコール率を調整できます。

<Admonition type="info" icon="📘" title="Notes">

<p>これは、基本的なベクトル検索、フィルター検索、範囲検索、グループ化検索单、ハイブリッド検索、および検索イテレータを含むすべての検索に適用されます。</p>

</Admonition>

## 概要\{#overview}

Zilliz Cloud におけるリコール率とは、通常、検索によって正常に取得された関連結果の割合を指します。これは、コレクションからすべての関連アイテムをシステムがどれだけ回収できるかを測定する指標です。

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/odmnbehyooaeqkxneenc9swnnmf.png "OdMnbeHYOoAEqKxNEEnc9SwNnmf")

検索のリコール率を計算するには、取得された関連アイテム数を取得すべき関連アイテム総数で割ります。例えば、100個の関連アイテムのうち90個が検索で取得された場合、リコール率は **0.9** または **90%** となります。

高いリコール率は通常、より正確な検索結果を示しますが、その分処理時間が長くなる可能性があります。ベクトル検索の精度と効率のバランスを取るために、リコール率を調整したい場合があるでしょう。

## 検索リクエストの設定\{#set-up-a-search-request}

調整可能なリコール率を持つ検索リクエストを設定するには、以下のように検索パラメータ内に `level` パラメータを含める必要があります：

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

`level` パラメータは `1` から `10` の範囲で設定でき、デフォルト値は `1` です。このデフォルト値ではリコール率が 90% となり、ほとんどのユースケースで十分です。

リコール率を高くする必要がある場合（**99%** 以上）、`level` パラメータを `6` から `10` の間の整数に設定してみてください。検索効率を考慮しないのであれば、このパラメータを `10` に設定することで最も精度の高い結果を得られます。

<Admonition type="info" icon="📘" title="Notes">

<p>最上位レベルの設定でも要件を満たせない場合は、<a href="https://zilliz.com/contact-sales">Zilliz Cloud サポート</a>までお問い合わせください。</p>

</Admonition>

## リコール率の調整\{#tune-recall-rate}

Zilliz Cloud では、調整プロセスを支援するために `enable_recall_calculation` という別の検索パラメータも導入されています。このパラメータを `True` に設定すると、Zilliz Cloud は現在の検索に対するリコール率を推定し、その推定値を検索結果とともに返します。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            "level": 6 # The precision control
            # highlight-next-line
            "enable_recall_calculation": True # Ask for recall rate calculation
        }
    }
)
```

上記の検索リクエストを使用すると、現在の検索の推定リコール率を次のように取得できます。

```python
# data: [...], recalls: [0.98]
```

推定プロセス中に、Zilliz Cloud は以下の処理を実行します。

1. ユーザーが定義した値に設定された `level` パラメータを使用して検索を実行し、
1. 内部の高精度モードで別の検索を実行します。
1. 2 番目の検索結果を正解（ground truth）として使用し、リコール率を推定します。

`enable_recall_calculation` を `True` に設定すると、`level` パラメータの値を調整して複数のリコール率を取得できます。これらの推定値と各検索の所要時間を考慮することで、適切な level 設定を概算できます。

<Admonition type="info" icon="📘" title="Notes">

<p><code>enable_recall_calculation</code> を有効にすると検索パフォーマンスに影響を与える可能性があるため、本番環境での使用は推奨されません。</p>

</Admonition>

## 制限\{#limits}

現在、この機能は Zilliz Cloud クラスターにおける基本的なベクトル検索、フィルター検索、および範囲検索でのみ利用可能です。

