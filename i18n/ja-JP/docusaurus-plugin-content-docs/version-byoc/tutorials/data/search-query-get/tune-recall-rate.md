---
title: "リコールレートの調整 | BYOC"
slug: /tune-recall-rate
sidebar_label: "リコールレートの調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、検索の再検出率とパフォーマンスのバランスを取るために、ユーザーが使用できる検索パラメータ`level`を導入しています。また、現在の検索の推定再検出率をユーザーに提供するための別の検索パラメータ`enable_recall_calculation`も提供しています。これらの2つのパラメータを組み合わせて、ベクトル検索の再検出率を調整できます。 | BYOC"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 14
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - ベクトル検索
  - ann
  - 再検出率
  - 再検出率の調整
  - k最近傍アルゴリズム
  - ANNS
  - ベクトル検索
  - knnアルゴリズム

---

import Admonition from '@theme/Admonition';


# リコールレートの調整

Zilliz Cloudは、検索の再検出率とパフォーマンスのバランスを取れるように、検索パラメータ`level`を導入しています。また、現在の検索の推定再検出率をユーザーに提供するための別の検索パラメータ`enable_recall_calculation`も提供しています。これらの2つのパラメータを組み合わせて、ベクトル検索の再検出率を調整できます。

## 概要\{#overview}

Zilliz Cloudにおける再検出率（リコールレート）は、通常、検索によって正常に取得された関連性のある結果の割合を指します。これは、コレクションから関連アイテムをすべて回収するシステムの能力を測る指標です。

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](/img/OdMnbeHYOoAEqKxNEEnc9SwNnmf.png)

検索の再検出率を計算するには、取得された関連アイテム数を、取得すべき関連アイテムの総数で割ることができます。たとえば、検索によって100個の関連アイテムのうち90個が取得された場合、再検出率は**0.9**または**90%**になります。

再検出率が高いほど、通常はより精密な検索結果を意味しますが、時間がかかることがあります。再検出率を調整して、ベクトル検索の精度と効率のバランスを取ることもできます。

## 検索要求の設定\{#set-up-a-search-request}

再検出率を調整できる検索要求を設定するには、以下のように検索パラメータ内に`level`パラメータを含める必要があります：

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # 返却する結果の数
    search_params={
        "params": {
            # highlight-next-line
            "level": 1 # 精度の制御
        }
    }
)
```

`level`パラメータの範囲は`1`から`10`で、デフォルトは`1`です。デフォルト値では90%の再検出率となり、これは多くの利用ケースで十分です。

高い再検出率（**99%**以上）を必要とするシナリオでは、`level`パラメータを`6`から`10`の間の整数に設定してみてください。検索効率が問題でない場合は、最も正確な結果を得るためにこのパラメータを`10`に設定できます。

<Admonition type="info" icon="📘" title="注釈">

<p>トップレベルの設定でも十分でない場合は、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 再検出率の調整\{#tune-recall-rate}

Zilliz Cloudはまた、調整プロセスを支援するための`enable_recall_calculation`という別の検索パラメータも導入しています。このパラメータを`True`に設定すると、Zilliz Cloudは現在の検索の再検出率を推定し、その推定再検出率を検索結果とともに含めます。

```python
query_vector = [0.3580376395471989, ..., 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # 返却する結果の数
    search_params={
        "params": {
            "level": 6 # 精度制御
            # highlight-next-line
            "enable_recall_calculation": True # 再検出率計算を要求
        }
    }
)
```

上記の検索リクエストを使用して、現在の検索の推定再検出率を以下のように取得できます：

```python
# data: [...], recalls: [0.98]
```

推定プロセス中、Zilliz Cloudは以下の処理を行います：

1. ユーザー定義の値に設定された`level`パラメータで検索を行い、
2. 内部の高精度モードで別の検索を実施します。
3. 第二の検索を基準として再検出率を推定します。

`enable_recall_calculation`を`True`に設定しながら、`level`パラメータの値を調整して複数の再検出率を得ることができます。これらの推定数値と各検索の実行時間を考慮することで、適切なレベル設定を概ね推定できます。

<Admonition type="info" icon="📘" title="注釈">

<p><code>enable_recall_calculation</code>を有効にすると検索パフォーマンスに影響を与える可能性があるため、本番環境では推奨されません。</p>

</Admonition>

## 制限事項\{#limits}

現在、この機能はZilliz Cloudクラスターの基本ベクトル検索、フィルター検索、範囲検索でのみ利用できます。