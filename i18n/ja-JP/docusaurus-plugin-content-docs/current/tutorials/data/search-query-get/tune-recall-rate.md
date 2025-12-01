---
title: "再現率の調整 | Cloud"
slug: /tune-recall-rate
sidebar_label: "再現率の調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、ユーザーが検索の再現率とパフォーマンスをバランスさせるために検索パラメータ`level`を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、別の検索パラメータ`enable_recall_calculation`も提供しています。これらの2つのパラメータを組み合わせて、ベクトル検索の再現率を調整できます。| Cloud"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - ベクトル検索
  - ann
  - 再現率
  - 再現率の調整
  - milvusベクトルデータベース
  - milvus db
  - milvusベクトルdb
  - Zilliz Cloud

---

import Admonition from '@theme/Admonition';


# 再現率の調整

Zilliz Cloudは、ユーザーが検索の再現率とパフォーマンスをバランスさせるために検索パラメータ`level`を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、別の検索パラメータ`enable_recall_calculation`も提供しています。これらの2つのパラメータを組み合わせて、ベクトル検索の再現率を調整できます。

## 概要\{#overview}

Zilliz Cloudにおける再現率は通常、検索によって正常に取得された関連結果の割合を指します。これは、コレクションからすべての関連アイテムを回復するシステムの能力を測る指標です。

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](/img/OdMnbeHYOoAEqKxNEEnc9SwNnmf.png)

検索の再現率を計算するには、取得した関連アイテムの数を、取得すべき適用可能なアイテムの総数で割ります。たとえば、検索が100個の関連アイテムのうち90個を取得した場合、再現率は**0.9**または**90%**になります。

高い再現率は通常、より正確な検索結果を示しますが、時間がかかることもあります。ベクトル検索の精度と効率のバランスを取るために再現率を調整することも検討できます。

## 検索リクエストの設定\{#set-up-a-search-request}

調整可能な再現率を持つ検索リクエストを設定するには、以下のように検索パラメータ内に`level`パラメータを含める必要があります：

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # 返す結果の数
    search_params={
        "params": {
            # highlight-next-line
            "level": 1 # 精度制御
        }
    }
)
```

`level`パラメータは`1`から`10`の範囲で、デフォルトは`1`です。デフォルト値では再現率が90%となり、これは通常、ほとんどの使用例で十分です。

高い再現率（**99%**以上）が必要なシナリオでは、`level`パラメータを`6`から`10`の間の整数に設定してみてください。検索効率を考慮しない場合は、このパラメータを`10`に設定して最も正確な結果を得ることができます。

<Admonition type="info" icon="📘" title="注意">

<p>最上位のレベル設定でも不十分な場合は、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>に連絡してください。</p>

</Admonition>

## 再現率の調整\{#tune-recall-rate}

Zilliz Cloudは、調整プロセスを容易にするために`enable_recall_calculation`という名前の別の検索パラメータも導入しています。このパラメータを`True`に設定すると、Zilliz Cloudが現在の検索の再現率を推定し、検索結果とともに推定された再現率を含めることを意味します。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # 返す結果の数
    search_params={
        "params": {
            "level": 6 # 精度制御
            # highlight-next-line
            "enable_recall_calculation": True # 再現率計算の要求
        }
    }
)
```

上記の検索リクエストにより、現在の検索の推定再現率を以下のように取得できます：

```python
# data: [...], recalls: [0.98]
```

推定プロセス中、Zilliz Cloudは以下の処理を行います：

1. `level`パラメータをユーザー定義の値に設定して検索し、
2. 内部の高精度モードで別の検索を実施します。
3. 2番目の検索を基準として使用して再現率を推定します。

`enable_recall_calculation`を`True`に設定しながら、`level`パラメータの値を調整して複数の再現率を得ることができます。これらの推定値と各検索の所要時間を考慮することで、適切なレベル設定を概算できます。

<Admonition type="info" icon="📘" title="注意">

<p><code>enable_recall_calculation</code>を有効にすると検索パフォーマンスに影響を与える可能性があるため、本番環境では推奨されません。</p>

</Admonition>

## 制限事項\{#limits}

現在、この機能はZilliz Cloudクラスターの基本的なベクトル検索、フィルタ検索、範囲検索でのみ使用できます。