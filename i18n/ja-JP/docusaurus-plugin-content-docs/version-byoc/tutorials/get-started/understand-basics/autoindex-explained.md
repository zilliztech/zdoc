---
title: "AUTOINDEX の説明 | BYOC"
slug: /autoindex-explained
sidebar_label: "AUTOINDEX の説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、パフォーマンス最適化クラスターと容量最適化クラスターを提供しています。異なる目的があるため、これらのクラスターにインデックスを構築するには異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省くために、AUTOINDEX が活用されます。 | BYOC"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - autoindex
  - milvus
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent

---

import Admonition from '@theme/Admonition';


# AUTOINDEX の説明

Zilliz Cloud は、パフォーマンス最適化クラスターと容量最適化クラスターを提供しています。異なる目的があるため、これらのクラスターにインデックスを構築するには異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省くために、**AUTOINDEX** が活用されます。

**AUTOINDEX** は Zilliz Cloud で利用可能な独自のインデックスタイプであり、より良い検索パフォーマンスを実現するのに役立ちます。Zilliz Cloud のコレクションでベクトルフィールドにインデックスを付けたいときはいつでも、**AUTOINDEX** が適用されます。

## 機能と利点\{#features-and-benefits}

**AUTOINDEX** は、オープンソース Milvus に比べて顕著なパフォーマンス優位性を提供し、特定のデータセットで最大3倍の QPS を実現します。AUTOINDEX を使用して、Zilliz Cloud クラスターがサポートするすべてのフィールドタイプにインデックスを作成できます。これには [Dense Vector](./use-dense-vector)、[Binary Vector](./use-binary-vector)、および [Binary Vector](./use-binary-vector) が含まれます。

**AUTOINDEX** は以下の点で高パフォーマンスを実現します：

- シングルインストラクションマルチプルデータ (SIMD) を活用してクエリとストレージを高速化し、マシンの可能な限りすべてのパフォーマンスを絞り出します。

- データグラフ化およびクロッピング戦略を最適化して、検索時にアクセスするデータポイント数を著しく削減します。

- 距離計算コストを削減するために動的量子化戦略を実装します。

### コスト効率\{#cost-efficiency}

**AUTOINDEX** は、純粋なインメモリ、ハイブリッドディスク、およびメモリマップド (MMAP) モードをサポートして、容量とパフォーマンスのさまざまなニーズに対応します。インメモリモードでは、**AUTOINDEX** は動的量子化を使用してメモリ使用量を著しく削減します。ハイブリッドディスクモードでは、**AUTOINDEX** はデータを動的にキャッシュし、アルゴリズムを使用して I/O 操作を最小限に抑え、高いパフォーマンスを維持します。

### 自律チューニング\{#autonomous-tuning}

近似最近傍 (ANN) アルゴリズムは、再現率とパフォーマンスの間でのトレードオフを必要とします。クエリパラメータは結果に大きな影響を与えます。クエリパラメータが小さすぎると再現率が極端に低くなり、ビジネス要件を満たさない可能性があります。逆に、クエリパラメータが大きすぎると、パフォーマンスが大幅に低下します。

クエリパラメータの選択には多くのドメイン固有の知識が必要であり、ユーザーの学習曲線を大幅に増加させます。この問題に対処するため、**AUTOINDEX** はクエリパラメータの選択を容易にする知的アルゴリズムを開発しました。インデックス構築中にユーザーのデータセット分布を分析することで、**AUTOINDEX** はクエリパラメータ推奨のための機械学習モデルにより、再現率とパフォーマンスの間のトレードオフを実現します。これにより、ユーザーは手動でクエリパラメータを設定する必要がありません。

<Admonition type="info" icon="📘" title="Notes">

<p>Milvus コードベースを Zilliz Cloud に移行する際、手動で使用するインデックスタイプを変更する必要はありません。Zilliz Cloud はインデックス作成時に自動的に AUTOINDEX を適用します。</p>

</Admonition>

## インデックス構築および検索設定\{#index-building-and-search-settings}

インデックス構築のプロセスでは、結果をより迅速に取得できるようにコレクション内のエンティティを特定の順序で整理します。

Zilliz Cloud での浮動小数ベクトルのインデックス作成は障害ではありません。インデックスタイプを **AUTOINDEX** に設定し、Zilliz Cloud がインデックス構築および検索プロセスに最も適した構成を決定するためのメトリックタイプを選択するだけです。メトリックタイプはベクトル間の距離を測定する方法を決定し、検討する必要がある唯一のものです。

Milvus と Zilliz Cloud のインデックス構築設定の違いは以下の通りです：

```python
# インデックス構築用
# Milvus 上
index_params = {
    # 他のオプションは IP です。
    "metric_type": "L2",
    # 他に6つのオプションがあります。
    "index_type": "IVF_FLAT",
    # これは指定されたインデックスタイプに応じて異なります。
    "params": {
        # これは IVF_FLAT が機能するために必要なパラメータです。
        "nlist": 1024
    }
}

# Zilliz Cloud 上
index_params = {
    # 常にこれを AUTOINDEX に設定
    "index_type": "AUTOINDEX",
    # 考慮すべき唯一のパラメータです。
    "metric_type": "L2"
}
```

検索パラメータ設定の違いは以下の通りです：

```python
# 検索用
# Milvus 上
search_params = {
    # 適用されるチューニングパラメータはインデックスタイプに応じて異なります
    "params": {
        "nprobe": 10
    }
}

# Zilliz Cloud 上
search_params = {
    # highlight-next-line
    "params": {
        "level": 1 # 指定されていない場合デフォルト値が適用されます
    }
}
```

### `level` パラメータについて\{#about-the-level-parameter}

検索パフォーマンスの調整には、インデックスタイプに応じて異なるパラメータセットを調整する必要があります。たとえば、HNSW を使用する場合、調整するパラメータは `ef` ですが、IVF を使用する場合、調整するパラメータは `nprobe` です。最適な再現率と検索パフォーマンスのバランスを取るには、使用中のインデックスタイプに特有のこれらのパラメータを微調整する必要があります。

Zilliz Cloud は、上記の複雑なパラメータセットを調整する代わりに、検索パラメータの調整を簡略化するために統一されたパラメータ `level` を使用します。

`level` パラメータを増やすと再現率が高くなりますが、検索パフォーマンスが低下する可能性もあります。値はデフォルトで `1` で、`1` から `10` の範囲です。デフォルト値では再現率は90%になり、通常はほとんどのユースケースに十分です。ただし、より高い再現率が必要な場合は、この値を増やしてください。

`level` パラメータを調整する際に `enable_recall_calculation` を `true` に設定して、異なる `level` 値で検索の精度を評価できます。

<Admonition type="info" icon="📘" title="Notes">

<p>`level` パラメータと `enable_recall_calculation` パラメータは現在<strong>パブリックプレビュー</strong>中であり、互換性の問題により完全に使用できない可能性があります。ご支援が必要な場合は、support@zilliz.com までご連絡ください。</p>

</Admonition>

## 結論\{#conclusion}

この記事が、Zilliz Cloud 上のコレクションでベクトルフィールド用のインデックス構築および最適化プロセスを簡略化する強力なツールである AUTOINDEX をより理解するのに役立ったことを願います。検索およびインデックスに最も適した構成を自動的に決定することで、AUTOINDEX は従来の方法と比較してユーザーの時間と労力を節約します。パフォーマンス最適化クラスターまたは容量最適化クラスターを使用しているかにかかわらず、AUTOINDEX はニーズに合わせて調整されたインデックスにより、高速で効率的な検索を実現できます。AUTOINDEX または Zilliz Cloud の他の機能についてご質問がありましたら、遠慮なく当社チームまでご連絡ください。いつでもお手伝いさせていただきます！