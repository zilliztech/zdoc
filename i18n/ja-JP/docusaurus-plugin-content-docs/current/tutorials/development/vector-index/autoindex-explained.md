---
title: "AUTOINDEX の解説 | Cloud"
slug: /autoindex-explained
sidebar_label: "AUTOINDEX"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は異なる構成で動作する cluster を提供します。これらの cluster 上で index を構築するには、それぞれ異なるアプローチが必要です。ユーザーが index パラメータを調整したり微調整したりする手間を省くために、AUTOINDEX が役立ちます。 | Cloud"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AUTOINDEX の解説

Zilliz Cloud は異なる構成で動作する cluster を提供します。これらの cluster 上で index を構築するには、それぞれ異なるアプローチが必要です。ユーザーが index パラメータを調整したり微調整したりする手間を省くために、**AUTOINDEX** が役立ちます。

**AUTOINDEX** は Zilliz Cloud で利用可能な独自の index type であり、より優れた検索パフォーマンスの実現に役立ちます。Zilliz Cloud 上の collection にある vector field または scalar field に index を付けたい場合は、常に **AUTOINDEX** が適用されます。

## 特徴と利点\{#features-and-benefits}

vector field については、**AUTOINDEX** はオープンソースの Milvus と比べて大きなパフォーマンス上の利点があり、特定のデータセットでは最大 3 倍の QPS を実現します。AUTOINDEX を使用すると、[Dense Vector](./use-dense-vector)、[Binary Vector](./use-binary-vector)、および [Binary Vector](./use-binary-vector) を含む、Zilliz Cloud の cluster がサポートするすべての field type に対して index を作成できます。

scalar field については、**AUTOINDEX** は field type と最適な scalar index type の間に効率的なマッピングを提供します。

| Field Type | AUTOINDEX Resolves to | 説明 |
| --- | --- | --- |
| `VARCHAR` | **BITMAP** (C* < 100) / **INVERTED** ( C ≥ 100) | 文字列データ型。詳細は [String Field](./use-string-field) を参照してください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | **BITMAP** (C < 100) / **STL_SORT** (C ≥ 100) | 整数。詳細は [Boolean & Number](./use-number-field) を参照してください。 |
| `FLOAT`, `DOUBLE` | **BITMAP** (C* < 100) / **INVERTED** ( C ≥ 100) | 浮動小数点数。詳細は [Boolean & Number](./use-number-field) を参照してください。 |
| `BOOL` | **BITMAP** | ブール値。詳細は [Boolean & Number](./use-number-field) を参照してください。 |
| `ARRAY` | **BITMAP** (C* < 100) / **INVERTED** ( C ≥ 100) | scalar 値の同種配列。詳細は [Array Field](./use-array-fields) を参照してください。 |
| `GEOMETRY` | **RTREE** | 空間情報を格納する幾何データ。詳細は [Geometry Field](./use-geometry-field) を参照してください。 |
| `TIMESTAMPTZ` | **STL_SORT** | タイムゾーン対応の ISO 8601 入力で、タイムゾーンをまたいだ一貫したフィルタリングと順序付けのために UTC として保存されます。詳細は [TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。 |

<Admonition type="info" icon="📘" title="📘 注意">

Cardinality（上表の C）は、collection 全体にわたる field 内の一意な値の数を示します。たとえば、float field の cardinality は、その field にある異なる float 値の数です。

array field の場合、cardinality はセグメント内のすべての配列にまたがる**異なる要素値**の数です。例:

```plaintext
[1, 2, 3]
[2, 3, 4]
[1, 4, 5]
```

異なる要素値は `{1, 2, 3, 4, 5}` → cardinality = **5** です。これはすべての配列からすべての要素を平坦化してから、一意な値を数えます。異なる配列の数でも、配列の長さでもありません。

</Admonition>

**AUTOINDEX** は次の点で高いパフォーマンスを発揮します。

- Single Instruction, Multiple Data (SIMD) を活用してクエリとストレージを高速化し、マシンから可能な限りのパフォーマンスを引き出します。

- データのグラフ化およびクロッピング戦略を最適化し、検索時にアクセスするデータポイント数を削減します。

- 距離計算のコストを削減するために動的な量子化戦略を実装します。

### コスト効率\{#cost-efficiency}

**AUTOINDEX** は、ユーザーごとの容量とパフォーマンスに対するさまざまなニーズを満たすために、完全インメモリ、ハイブリッドディスク、およびメモリマップド（MMAP）モードをサポートしています。インメモリモードでは、**AUTOINDEX** は動的量子化を使用してメモリ使用量を大幅に削減します。ハイブリッドディスクモードでは、**AUTOINDEX** はデータを動的にキャッシュし、I/O 操作を最小化して高いパフォーマンスを維持するアルゴリズムを使用できます。

### 自律チューニング\{#autonomous-tuning}

近似最近傍（ANN）アルゴリズムでは、recall とパフォーマンスの間でトレードオフが必要です。クエリパラメータは結果に大きな影響を与えます。クエリパラメータのサイズが小さすぎると、recall は極端に低くなり、ビジネス要件を満たせない可能性があります。逆に、クエリパラメータのサイズが大きすぎると、パフォーマンスは大幅に低下します。

クエリパラメータを選択するには多くのドメイン固有知識が必要であり、ユーザーの学習コストを大きく引き上げます。この問題に対処するため、**AUTOINDEX** はクエリパラメータの選択を容易にするインテリジェントなアルゴリズムを開発しました。index 構築中にユーザーのデータセット分布を分析することで、**AUTOINDEX** はクエリパラメータ推奨のための機械学習モデルにより、recall とパフォーマンスのトレードオフを実現します。これにより、ユーザーはクエリパラメータを手動で設定する必要がなくなります。

<Admonition type="info" icon="📘" title="Notes">

Milvus のコードベースを Zilliz Cloud に移行する場合、使用する index type を手動で変更する必要はありません。Zilliz Cloud は index 作成時に自動的に AUTOINDEX を適用します。

</Admonition>

## Index の構築と検索設定\{#index-building-and-search-settings}

index 構築のプロセスでは、collection 内の entities を特定の順序で整理し、結果をより高速に取得できるようにします。

Zilliz Cloud で floating vector に index を付けることは難しくありません。index type を **AUTOINDEX** に設定し、metric type を選ぶだけで、Zilliz Cloud が index 構築および検索プロセスに最適な構成を判断します。metric type は vector 間の距離をどのように測定するかを決定するもので、考慮すべき唯一の要素です。

Milvus と Zilliz Cloud における index 構築設定の違いを以下に示します。

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

検索パラメータ設定の違いは次のとおりです。

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

### `level` パラメータについて\{#about-the-level-parameter}

検索パフォーマンスのチューニングでは、index type ごとに異なるパラメータセットを調整する必要があります。たとえば、HNSW を使用する場合に調整すべきパラメータは `ef` ですが、IVF を使用する場合に調整すべきパラメータは `nprobe` です。最適な recall 率と検索パフォーマンスのバランスを実現するには、使用する index type に応じたこれらのパラメータを細かく調整する必要があります。

Zilliz Cloud は、上記のような複雑なパラメータセットを扱う代わりに、統一されたパラメータ `level` を使用して検索パラメータのチューニングを簡素化します。 

`level` パラメータを大きくすると、より高い recall 率が得られますが、検索パフォーマンスが低下する可能性もあります。値のデフォルトは `1` で、範囲は `1` から `10` です。デフォルト値では recall 率 90% となり、通常はほとんどのユースケースで十分です。ただし、より高い recall 率が必要な場合は、この値を増やしてください。

`level` パラメータを調整するときに `enable_recall_calculation` を `true` に設定することもでき、異なる `level` 値での検索精度を評価できます。

<Admonition type="info" icon="📘" title="Notes">

`level` および `enable_recall_calculation` パラメータは現在も **Public Preview** であり、互換性の問題により十分に使用できない場合があります。サポートが必要な場合は、support@zilliz.com までお問い合わせください。

</Admonition>

## まとめ\{#conclusion}

この記事が、Zilliz Cloud 上の collection にある vector field 向けの index 構築および最適化プロセスを簡素化する強力なツールである AUTOINDEX について、理解を深める助けになれば幸いです。検索と index に最適な構成を自動的に決定することで、AUTOINDEX は従来の方法と比べてユーザーの時間と労力を節約します。Performance-optimized cluster を使用している場合でも Capacity-optimized cluster を使用している場合でも、AUTOINDEX はニーズに合わせて最適化された index により、より高速で効率的な検索の実現を支援します。AUTOINDEX や Zilliz Cloud のその他の機能について質問がある場合は、ぜひ私たちのチームまでご連絡ください。いつでも喜んでお手伝いします！
