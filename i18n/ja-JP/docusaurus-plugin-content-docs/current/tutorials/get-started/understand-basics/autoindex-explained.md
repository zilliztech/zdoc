---
title: "AUTOINDEXの説明 | Cloud"
slug: /autoindex-explained
sidebar_label: "AUTOINDEXの説明"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Performance-optimizedと容量に最適化されたクラスターを提供しています。これらのクラスターにインデックスを構築するためには、異なる目的があるため、異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省くために、AUTOINDEXが役立ちます。 | Cloud"
type: origin
token: Tf2kwQ3i3iGlsxkL8EVcpCPInde
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - autoindex
  - milvus
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';


# AUTOINDEXの説明

Zilliz Cloudは、Performance-optimizedと容量に最適化されたクラスターを提供しています。これらのクラスターにインデックスを構築するためには、異なる目的があるため、異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省くために、**AUTOINDEX**が役立ちます。

**AUTOINDEX**は、Zilliz Cloud上で利用可能な独自のインデックスタイプであり、検索パフォーマンスを向上させるのに役立ちます。Zilliz Cloud上でコレクション内のベクトルフィールドをインデックス化したい場合は、**AUTOINDEX**が適用されます。

## 特徴と利点{#features-and-benefits}

**AUTOINDEX**は、特定のデータセットで最大3倍のQPSを達成するため、オープンソースのMilvusに比べて大幅なパフォーマンスの優位性を提供します。AUTOINDEXを使用して、Zilliz Cloudクラスターがサポートするすべてのフィールドタイプにインデックスを作成できます。これには、[密集ベクトル](./use-dense-vector)、[バイナリベクトル](./use-binary-vector)、[疎ベクトル](./use-sparse-vector)が含まれます。

**AUTOINDEX**は以下の点で高いパフォーマンスを発揮します:

- SIMD（Single Instruction, Multiple Data）を活用して、クエリとストレージを高速化し、マシンから可能な限りのパフォーマンスを引き出します。

- 検索時にアクセスするデータポイントの数を大幅に減らすために、データのグラフ化とクロッピング戦略を最適化します。

- 距離計算コストを削減するために動的量子化戦略を実装してください。

### コスト効率{#cost-efficiency}

**AUTOINDEX**は、容量とパフォーマンスに対するユーザーのさまざまなニーズに対応するために、純粋なインメモリ、ハイブリッドディスク、およびメモリマップ(MMAP)モードをサポートしています。インメモリモードでは、**AUTOINDEX**は動的量子化を使用してメモリ使用量を大幅に削減します。ハイブリッドディスクモードでは、**AUTOINDEX**はデータを動的にキャッシュし、アルゴリズムを使用してI/O操作を最小限に抑え、高いパフォーマンスを維持できます。

### 自律チューニング{#autonomous-tuning}

近似最近傍法(ANN)アルゴリズムには、リコールとパフォーマンスのトレードオフが必要です。クエリパラメータは結果に重大な影響を与えます。クエリパラメータ体格が小さすぎる場合、リコールは非常に低くなり、ビジネス要件を満たさない可能性があります。逆に、クエリパラメータ体格が極端に大きい場合、パフォーマンスは深刻に低下します。

クエリパラメータを選択するには、多くのドメイン固有の知識が必要であり、これによりユーザーの学習曲線が大幅に増加します。この問題に対処するために、**AUTOINDEX**はクエリパラメータの選択を容易にするインテリジェントアルゴリズムを開発しました。インデックス構築中にユーザーのデータセットの分布を分析することにより、**AUTOINDEX**は、クエリパラメータの推奨のための機械学習モデルによって駆動され、リコールとパフォーマンスのトレードオフを実現します。これにより、ユーザーはもはやクエリパラメータを手動で設定する必要がありません。

<Admonition type="info" icon="📘" title="ノート">

<p>MilvusのコードベースをZilliz Cloudに移行する際、インデックスの種類を手動で変更する必要はありません。Zilliz Cloudはインデックス作成時に自動的にAUTOINDEXを適用します。</p>

</Admonition>

## インデックスの構築と検索の設定{#index-building-and-search-settings}

インデックスを作成する過程では、結果をより迅速に取得できるように、コレクション内のエンティティを特定の順序でソートします。

Zilliz Cloud上でフローティングベクトルをインデックス化することは障害ではありません。インデックスタイプを`AUTOINDEX`に設定し、Zilliz Cloudのメトリックタイプを選択して、インデックス構築と検索プロセスに最適な構成を決定するだけです。メトリックタイプは、ベクトル間の距離の測定方法を決定し、考慮する必要がある唯一のものです。

MilvusとZilliz Cloudのインデックス構築設定の違いを以下に示します。

```python
# For index-building
# On Milvus
index_params = {
    # Another option is IP.
    "metric_type": "L2", 
    # There are six more options available there.
    "index_type": "IVF_FLAT",
    # This varies with the specified index type.
    "params": {
        # This is the parameter required for IVF_FLAT to work.
        "nlist": 1024
    }
}

# On Zilliz Cloud
index_params = {
    # Always set this to AUTOINDEX
    "index_type": "AUTOINDEX", 
    # This is the only parameter you should think about.
    "metric_type": "L2"
}
```

検索パラメータの設定の違いは次のとおりです。

```python
# For searches
# On Milvus
search_params = {
    # Applicable tuning parameters vary with the index type
    "params": {
        "nprobe": 10
    }
}

# On Zilliz Cloud
search_params = {
    # highlight-next-line
    "params": { 
        "level": 1 # The default value applies when left unspecified
    }
}
```

### `level`パラメータについて{#about-the-level-parameter}

検索パフォーマンスをチューニングするには、インデックスタイプによって異なるパラメータセットを調整する必要があります。たとえば、HNSWを使用する場合、調整する必要があるパラメータは`ef`ですが、IVFを使用する場合、調整するパラメータは`nprobe`です。最適なリコール率と検索パフォーマンスのバランスを取るためには、使用されるインデックスのタイプに特化したこれらのパラメータを微調整する必要があります。

Zilliz Cloudは、上記の複雑なパラメータセットで作業する代わりに、統一されたパラメータ`レベル`を使用して検索パラメータのチューニングを簡素化します。

「`レベル`」パラメータを増やすと、リコール率が高くなりますが、検索パフォーマンスが低下する可能性もあります。値はデフォルトで`1`で、`1`から`10`までの範囲です。デフォルト値により、リコール率は90%になり、ほとんどのユースケースで十分です。ただし、より高いリコール率が必要な場合は、この値を増やしてください。

levelパラメータを微調整するときに`enable_recol_計算をtrueに設定することもできます。これにより、異なるlevel`値で検索の精度を評価でき`ま`す。

<Admonition type="info" icon="📘" title="ノート">

<p>「<code>level</code>」と「<code>enable_リコール_計算</code>」パラメーターはまだ<strong>パブリックプレビュー</strong>のため、互換性の問題により完全に使用できない可能性があります。サポートが必要な場合は、support@zilliz.comまでお問い合わせください。</p>

</Admonition>

## 結論として{#conclusion}

この記事があなたがAUTOINDEXをよりよく理解するのに役立ったことを願っています。AUTOINDEXは、Zilliz Cloud上のコレクション内のベクトルフィールドのインデックスを構築および最適化する過程を簡素化する強力なツールです。検索とインデックスに最適な構成を自動的に決定することにより、AUTOINDEXは従来の方法と比較してユーザーの時間と労力を節約します。Performance-optimizedまたは容量最適化されたクラスターを使用している場合でも、AUTOINDEXはあなたのニーズに合わせた最適化されたインデックスでより速く効率的な検索を実現するのに役立ちます。AUTOINDEXまたはZilliz Cloudのその他の機能に関する質問がある場合は、私たちのチームにお気軽にお問い合わせください。私たちはいつでもお手伝いできます!