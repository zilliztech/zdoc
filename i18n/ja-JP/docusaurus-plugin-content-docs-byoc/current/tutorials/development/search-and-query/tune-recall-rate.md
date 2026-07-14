---
title: "再現率の調整 | BYOC"
slug: /tune-recall-rate
sidebar_label: "再現率の調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、ユーザーが検索の再現率とパフォーマンスのバランスを取れるようにする検索パラメータ `level` が導入されています。また、現在の検索のおおよその再現率を取得できる別の検索パラメータ `enablerecallcalculation` も提供されています。これら 2 つのパラメータを組み合わせることで、vector 検索の再現率を調整できます。 | BYOC"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 再現率の調整

Zilliz Cloud では、ユーザーが検索の再現率とパフォーマンスのバランスを取れるようにする検索パラメータ `level` が導入されています。また、現在の検索のおおよその再現率を取得できる別の検索パラメータ `enable_recall_calculation` も提供されています。これら 2 つのパラメータを組み合わせることで、vector 検索の再現率を調整できます。

<Admonition type="info" icon="📘" title="Notes">

これは、基本的な vector 検索、フィルタ付き検索、範囲検索、グループ化検索、ハイブリッド検索、検索イテレータを含む、すべての検索に適用されます。

</Admonition>

## 概要\{#overview}

Zilliz Cloud における再現率とは通常、検索によって関連する結果が正常に取得された割合を指します。これは、collection から関連するすべての項目をどの程度取得できるかというシステムの能力を測る指標です。

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/odmnbehyooaeqkxneenc9swnnmf.png "OdMnbeHYOoAEqKxNEEnc9SwNnmf")

検索の再現率を計算するには、取得された関連項目数を、本来取得されるべき対象項目の総数で割ります。たとえば、100 件の関連項目のうち 90 件を検索で取得した場合、再現率は **0.9** または **90%** です。

再現率が高いほど、一般に検索結果の精度は高くなりますが、時間がかかる場合があります。vector 検索の精度と効率のバランスを取るために、再現率を調整したい場合があります。

## 検索リクエストの設定\{#set-up-a-search-request}

再現率を調整可能な検索リクエストを設定するには、以下のように検索パラメータ内に `level` パラメータを含める必要があります。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # 返される結果数
    search_params={
        "params": {
            # highlight-next-line
            "level": 1 # 精度制御
        }
    }
)
```

`level` パラメータの範囲は `1` から `10` で、デフォルトは `1` です。デフォルト値では再現率が 90% となり、通常はほとんどのユースケースで十分です。 

高い再現率（**99%** 以上）が必要なシナリオでは、`level` パラメータを `6` から `10` の整数に設定してみてください。検索効率を気にしない場合は、このパラメータを `10` に設定して最も高精度な結果を取得できます。

<Admonition type="info" icon="📘" title="Notes">

最上位の `level` 設定でも不十分な場合は、[Zilliz Cloud support](https://zilliz.com/contact-sales) にお問い合わせください。

</Admonition>

## 再現率の調整\{#tune-recall-rate}

Zilliz Cloud では、調整プロセスを容易にするために、`enable_recall_calculation` という別の検索パラメータも導入されています。このパラメータを `True` に設定すると、Zilliz Cloud は現在の検索の再現率を推定し、その推定値を検索結果とともに返します。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # 返される結果数
    search_params={
        "params": {
            "level": 6 # 精度制御
            # highlight-next-line
            "enable_recall_calculation": True # 再現率計算を要求
        }
    }
)
```

上記の検索リクエストでは、以下のように現在の検索のおおよその再現率を取得できます。

```python
# data: [...], recalls: [0.98]
```

推定プロセス中、Zilliz Cloud は以下を実行します。

1. `level` パラメータをユーザー定義の値に設定して検索を実行し、

1. 内部の高精度モードでもう一度検索を実行します。

1. 2 回目の検索を ground truth として使用し、再現率を推定します。

`enable_recall_calculation` を `True` に設定した状態で、`level` パラメータの値を調整して複数の再現率を取得できます。これらの推定値と各検索にかかった時間を考慮することで、適切な level 設定をおおよそ見積もることができます。

<Admonition type="info" icon="📘" title="Notes">

`enable_recall_calculation` を有効にすると検索パフォーマンスに影響する可能性があるため、本番環境での使用は推奨されません。

</Admonition>

## 制限\{#limits}

現在、この機能は Zilliz Cloud cluster における基本的な vector 検索、フィルタ付き検索、および範囲検索でのみ利用できます。

