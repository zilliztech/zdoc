---
title: "AUTOINDEXの説明 | Cloud"
slug: /autoindex-explained
sidebar_label: "AUTOINDEXの説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudはパフォーマンス最適化クラスターと容量最適化クラスターを提供しています。目的が異なるため、これらのクラスターにインデックスを構築するには異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省くために、AUTOINDEXが活用されます。 | Cloud"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - autoindex
  - milvus
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


# AUTOINDEXの説明

Zilliz Cloudはパフォーマンス最適化クラスターと容量最適化クラスターを提供しています。目的が異なるため、これらのクラスターにインデックスを構築するには異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省くために、**AUTOINDEX**が活用されます。

**AUTOINDEX**は、Zilliz Cloudで利用可能な独自のインデックスタイプであり、より良い検索パフォーマンスを実現できます。Zilliz Cloud上のコレクションでベクトルフィールドにインデックスを張りたい場合、**AUTOINDEX**が適用されます。

## 機能と利点\{#features-and-benefits}

**AUTOINDEX**は、オープンソースのMilvusに比べて顕著なパフォーマンスの利点を提供し、特定のデータセットで最大3倍のQPSを実現できます。AUTOINDEXを使用して、Zilliz Cloudクラスターがサポートするすべてのフィールドタイプ、[Dense Vector](./use-dense-vector)、[Binary Vector](./use-binary-vector)、および[Binary Vector](./use-binary-vector)にインデックスを作成できます。

**AUTOINDEX**はこれらの面で高性能を提供します：

- シングルインストラクションマルチプルデータ（SIMD）を活用してクエリとストレージを高速化し、マシンから可能な限りすべてのパフォーマンスを引き出します。

- データグラフィングとクロッピング戦略を最適化して、検索時のアクセス対象データポイント数を大幅に削減します。

- 動的量子化戦略を実装して距離計算コストを削減します。

### コスト効率\{#cost-efficiency}

**AUTOINDEX**は純粋なメモリ内、ハイブリッドディスク、およびメモリマップド（MMAP）モードをサポートし、容量とパフォーマンスに関するユーザーのさまざまなニーズに対応します。メモリ内モードでは、**AUTOINDEX**は動的量子化を使用してメモリ使用量を大幅に削減します。ハイブリッドディスクモードでは、**AUTOINDEX**はデータを動的にキャッシュし、I/O操作を最小限に抑えて高性能を維持するアルゴリズムを使用できます。

### 自律調整\{#autonomous-tuning}

近似最近傍（ANN）アルゴリズムでは、再現率とパフォーマンスの間でトレードオフが必要です。クエリパラメータは結果に大きな影響を与えます。クエリパラメータが小さすぎると再現率が極端に低くなり、ビジネス要件を満たさない可能性があります。逆に、クエリパラメータが大きすぎると、パフォーマンスが大幅に低下します。

クエリパラメータの選択には多くの分野固有の知識が必要であり、ユーザーの学習曲線を大幅に増加させます。この問題に対処するため、**AUTOINDEX**はクエリパラメータの選択を容易にする知的アルゴリズムを開発しました。インデックス構築中にユーザーのデータセット分布を分析することで、**AUTOINDEX**はクエリパラメータ推奨のための機械学習モデルを活用して再現率とパフォーマンスのトレードオフを実現します。このようにして、ユーザーはクエリパラメータを手動で設定する必要がなくなります。

<Admonition type="info" icon="📘" title="注釈">

<p>MilvusのコードベースをZilliz Cloudに移行する際、手動で使用されているインデックスタイプを変更する必要はありません。Zilliz Cloudはインデックス作成時にAUTOINDEXを自動的に適用します。</p>

</Admonition>

## インデックス構築と検索設定\{#index-building-and-search-settings}

インデックスの構築プロセスは、結果をより迅速に取得できるように特定の順序でコレクション内のエンティティを整理することを含みます。

Zilliz Cloud上の浮動小数ベクトルのインデックス作成は障害ではありません。単にインデックスタイプを**AUTOINDEX**に設定し、Zilliz Cloudがインデックス構築および検索プロセスに最も適した構成を決定できるようにメトリックタイプを選択するだけです。メトリックタイプはベクトル間の距離の測定方法を決定し、考慮する必要がある唯一のものです。

MilvusとZilliz Cloudのインデックス構築設定の違いは以下の通りです：

```python
# インデックス構築用
# Milvusの場合
index_params = {
    # 他の選択肢としてIPがあります。
    "metric_type": "L2",
    # 他に6つのオプションがあります。
    "index_type": "IVF_FLAT",
    # これは指定されたインデックスタイプによって異なります。
    "params": {
        # これはIVF_FLATが動作するために必要なパラメータです。
        "nlist": 1024
    }
}

# Zilliz Cloudの場合
index_params = {
    # 常にこれをAUTOINDEXに設定してください
    "index_type": "AUTOINDEX",
    # 考慮すべき唯一のパラメータです。
    "metric_type": "L2"
}
```

検索パラメータ設定の違いは以下の通りです：

```python
# 検索用
# Milvusの場合
search_params = {
    # 適用される調整パラメータはインデックスタイプによって異なります
    "params": {
        "nprobe": 10
    }
}

# Zilliz Cloudの場合
search_params = {
    # highlight-next-line
    "params": {
        "level": 1 # 指定しない場合のデフォルト値が適用されます
    }
}
```

### `level`パラメータについて\{#about-the-level-parameter}

検索パフォーマンスの調整には、インデックスタイプに応じて異なるパラメータセットを調整する必要があります。たとえば、HNSWを使用する場合、調整すべきパラメータは`ef`ですが、IVFを使用する場合、調整するパラメータは`nprobe`です。最適な再現率と検索パフォーマンスのバランスを取るには、使用されているインデックスタイプに固有のこれらのパラメータを微調整する必要があります。

Zilliz Cloudは、上記の複雑なパラメータセットを操作する代わりに、検索パラメータ調整を簡素化するために統一されたパラメータ`level`を使用します。

`level`パラメータを増加させると再現率が向上しますが、検索パフォーマンスが低下する可能性もあります。値のデフォルトは`1`で、`1`から`10`の範囲です。デフォルト値では再現率は90%となり、通常、ほとんどのユースケースに十分です。ただし、より高い再現率が必要な場合は、この値を増加させてください。

`level`パラメータを微調整する際、`enable_recall_calculation`を`true`に設定して、異なる`level`値での検索精度を評価できます。

<Admonition type="info" icon="📘" title="注釈">

<p><code>level</code> および <code>enable_recall_calculation</code> パラメータは依然として<strong>パブリックプレビュー</strong>段階であり、互換性の問題により完全に使用できない可能性があります。ご支援が必要な場合は、support@zilliz.com までお問い合わせください。</p>

</Admonition>

## まとめ\{#conclusion}

この記事が、Zilliz Cloud上のコレクションでベクトルフィールドのインデックスを構築および最適化するプロセスを簡素化する強力なツールであるAUTOINDEXをより深く理解するのに役立ったことを願っています。 AUTOINDEXは、検索およびインデックスの最も適した構成を自動的に決定することで、従来の方法と比較してユーザーの時間と労力を節約します。パフォーマンス最適化クラスターを使用している場合も容量最適化クラスターを使用している場合も、AUTOINDEXはニーズに合わせて調整されたインデックスでより高速で効率的な検索を実現できます。AUTOINDEXまたはZilliz Cloudの他の機能についてご質問がある場合は、いつでもチームまでお気軽にお問い合わせください。お手伝いできることを嬉しく思います！