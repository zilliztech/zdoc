---
title: "再現率の調整 | Cloud"
slug: /tune-recall-rate
sidebar_label: "再現率の調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、検索の再現率とパフォーマンスのバランスを取れるようにするための検索パラメータ `level` が導入されています。また、現在の検索の推定再現率を取得するための別の検索パラメータ `enablerecallcalculation` も提供されています。これら 2 つのパラメータを組み合わせることで、ベクトル検索の再現率を調整できます。 | Cloud"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 再現率の調整

Zilliz Cloud では、検索の再現率とパフォーマンスのバランスを取れるようにするための検索パラメータ `level` が導入されています。また、現在の検索の推定再現率を取得するための別の検索パラメータ `enable_recall_calculation` も提供されています。これら 2 つのパラメータを組み合わせることで、ベクトル検索の再現率を調整できます。

<Admonition type="info" icon="📘" title="Notes">

これは、基本的なベクトル検索、フィルタ付き検索、範囲検索、グループ化検索、ハイブリッド検索、検索イテレータを含むすべての検索に適用されます。

</Admonition>

## 概要\{#overview}

Zilliz Cloud における再現率は通常、検索によって関連性の高い結果が正常に取得された割合を指します。これは、コレクションから関連するすべての項目を取得するシステムの能力を測る指標です。

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/odmnbehyooaeqkxneenc9swnnmf.png "OdMnbeHYOoAEqKxNEEnc9SwNnmf")

検索の再現率を計算するには、取得された関連項目数を、本来取得されるべき対象項目の総数で割ります。たとえば、ある検索で 100 件の関連項目のうち 90 件を取得した場合、再現率は **0.9** または **90%** です。

再現率が高いほど、通常はより正確な検索結果を示しますが、時間がかかる場合があります。ベクトル検索の精度と効率のバランスを取るために、再現率を調整したい場合があります。

## 検索リクエストの設定\{#set-up-a-search-request}

再現率を調整可能な検索リクエストを設定するには、以下のように検索パラメータ内に `level` パラメータを含める必要があります。

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

`level` パラメータの範囲は `1` から `10` で、デフォルトは `1` です。デフォルト値では再現率は 90% となり、通常はほとんどのユースケースで十分です。 

高い再現率（**99%** 以上）が必要なシナリオでは、`level` パラメータを `6` から `10` の整数に設定してみてください。検索効率が問題でない場合は、最も正確な結果を得るためにこのパラメータを `10` に設定できます。

<Admonition type="info" icon="📘" title="Notes">

最上位の level 設定でも不十分な場合は、[Zilliz Cloud support](https://zilliz.com/contact-sales) にお問い合わせください。

</Admonition>

## 再現率の調整\{#tune-recall-rate}

Zilliz Cloud では、調整プロセスを容易にするために、`enable_recall_calculation` という別の検索パラメータも導入されています。このパラメータを `True` に設定すると、Zilliz Cloud は現在の検索の再現率を推定し、その推定値を検索結果とともに含めます。

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

上記の検索リクエストでは、現在の検索の推定再現率を次のように取得できます。

```python
# data: [...], recalls: [0.98]
```

推定プロセス中、Zilliz Cloud は次のことを行います。

1. `level` パラメータをユーザー定義の値に設定して検索し、

1. 内部の高精度モードでもう一度検索を実行し、

1. 2 回目の検索をグラウンドトゥルースとして使用し、再現率を推定します。

`enable_recall_calculation` を `True` に設定したうえで、`level` パラメータの値を調整して複数の再現率を取得できます。これらの推定値と各検索の所要時間を考慮することで、適切な level 設定をおおよそ見積もることができます。

<Admonition type="info" icon="📘" title="Notes">

`enable_recall_calculation` を有効にすると検索パフォーマンスに影響する可能性があるため、本番環境では推奨されません。

</Admonition>

## 制限\{#limits}

現在、この機能は Zilliz Cloud クラスターにおける基本的なベクトル検索、フィルタ付き検索、および範囲検索でのみ利用できます。

