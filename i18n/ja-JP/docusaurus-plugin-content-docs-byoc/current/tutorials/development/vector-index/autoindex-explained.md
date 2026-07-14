---
title: "AUTOINDEX の解説 | BYOC"
slug: /autoindex-explained
sidebar_label: "AUTOINDEX"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、異なる構成で稼働するクラスターが提供されています。これらのクラスターでインデックスを構築するには、それぞれ異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整に煩わされないようにするために、AUTOINDEX が用意されています。 | BYOC"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AUTOINDEX の解説

Zilliz Cloud では、異なる構成で稼働するクラスターが提供されています。これらのクラスターでインデックスを構築するには、それぞれ異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整に煩わされないようにするために、**AUTOINDEX** が役立ちます。

**AUTOINDEX** は Zilliz Cloud で利用可能な独自のインデックスタイプであり、より優れた検索パフォーマンスの実現に役立ちます。Zilliz Cloud 上のコレクションでベクトルフィールドまたはスカラーフィールドにインデックスを作成したい場合は、**AUTOINDEX** が適用されます。

## 機能とメリット\{#features-and-benefits}

ベクトルフィールドに対して、**AUTOINDEX** はオープンソースの Milvus と比べて大きなパフォーマンス上の優位性を提供し、特定のデータセットでは最大 3 倍の QPS を実現します。AUTOINDEX を使用すると、Zilliz Cloud のクラスターがサポートするすべてのフィールドタイプに対してインデックスを作成できます。これには、[Dense Vector](./use-dense-vector)、[Binary Vector](./use-binary-vector)、および [Binary Vector](./use-binary-vector) が含まれます。

スカラーフィールドに対して、**AUTOINDEX** はフィールドタイプと最適なスカラーインデックスタイプの間に効率的なマッピングを提供します。

| Field Type | AUTOINDEX Resolves to | Description |
| --- | --- | --- |
| `VARCHAR` | **BITMAP** (C* < 100) / **INVERTED** ( C ≥ 100) | 文字列データ型。詳細は [String Field](./use-string-field) を参照してください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | **BITMAP** (C < 100) / **STL_SORT** (C ≥ 100) | 整数。詳細は [Boolean & Number](./use-number-field) を参照してください。 |
| `FLOAT`, `DOUBLE` | **BITMAP** (C* < 100) / **INVERTED** ( C ≥ 100) | 浮動小数点数。詳細は [Boolean & Number](./use-number-field) を参照してください。 |
| `BOOL` | **BITMAP** | ブール値。詳細は [Boolean & Number](./use-number-field) を参照してください。 |
| `ARRAY` | **BITMAP** (C* < 100) / **INVERTED** ( C ≥ 100) | スカラー値の同種配列。詳細は [Array Field](./use-array-fields) を参照してください。 |
| `GEOMETRY` | **RTREE** | 空間情報を格納する幾何データ。詳細は [Geometry Field](./use-geometry-field) を参照してください。 |
| `TIMESTAMPTZ` | **STL_SORT** | タイムゾーンを認識する ISO 8601 入力で、タイムゾーンをまたいでも一貫したフィルタリングと順序付けを行うために UTC として保存されます。詳細は [TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。 |

<Admonition type="info" icon="📘" title="📘 Notes">

Cardinality（上の表の C）は、コレクション全体におけるあるフィールドの一意な値の数を示します。たとえば、float フィールドの cardinality は、そのフィールド内に存在する異なる float 値の数です。

array フィールドの場合、cardinality はそのセグメント内のすべての配列にまたがる **異なる要素値** の数です。たとえば次のようになります。

```plaintext
[1, 2, 3]
[2, 3, 4]
[1, 4, 5]
```

異なる要素値は `{1, 2, 3, 4, 5}` です → cardinality = **5**。すべての配列の全要素をフラット化してから一意な値を数えます。異なる配列の数でも、配列の長さでもありません。

</Admonition>

**AUTOINDEX** は以下の点で高いパフォーマンスを発揮します。

- Single Instruction, Multiple Data（SIMD）を活用してクエリとストレージを高速化し、マシンの性能を可能な限り引き出します。

- データのグラフ化およびクロッピング戦略を最適化し、検索時にアクセスされるデータポイント数を削減します。

- 動的量子化戦略を実装し、距離計算のコストを削減します。

### コスト効率\{#cost-efficiency}

**AUTOINDEX** は、pure in-memory、hybrid disk、memory-mapped（MMAP）モードをサポートしており、容量とパフォーマンスに関するさまざまなユーザーニーズに対応します。in-memory モードでは、**AUTOINDEX** は動的量子化を使用してメモリ使用量を大幅に削減します。hybrid disk モードでは、**AUTOINDEX** はデータを動的にキャッシュし、アルゴリズムを用いて I/O 操作を最小限に抑えつつ高いパフォーマンスを維持できます。

### 自律的なチューニング\{#autonomous-tuning}

Approximate nearest neighbor（ANN）アルゴリズムでは、recall とパフォーマンスのトレードオフが必要です。クエリパラメータは結果に大きく影響します。クエリパラメータのサイズが小さすぎると、recall は極端に低くなり、ビジネス要件を満たせない可能性があります。逆に、クエリパラメータのサイズが大きすぎると、パフォーマンスが著しく低下します。

クエリパラメータを選択するには多くのドメイン固有知識が必要であり、ユーザーにとって学習コストが大きくなります。この問題に対処するために、**AUTOINDEX** はクエリパラメータの選択を支援するインテリジェントなアルゴリズムを開発しました。インデックス構築時にユーザーのデータセット分布を分析することで、**AUTOINDEX** はクエリパラメータ推奨のための機械学習モデルを活用し、recall とパフォーマンスのトレードオフを実現します。これにより、ユーザーはクエリパラメータを手動で設定する必要がなくなります。

<Admonition type="info" icon="📘" title="Notes">

Milvus のコードベースを Zilliz Cloud に移行する際、使用するインデックスタイプを手動で変更する必要はありません。Zilliz Cloud はインデックス作成時に自動的に AUTOINDEX を適用します。

</Admonition>

## インデックス構築と検索設定\{#index-building-and-search-settings}

インデックスを構築するプロセスでは、コレクション内のエンティティを特定の順序で整理し、結果をより素早く取得できるようにします。

Zilliz Cloud では、浮動小数点ベクトルへのインデックス作成は簡単です。単にインデックスタイプを **AUTOINDEX** に設定し、メトリックタイプを選ぶだけで、Zilliz Cloud がインデックス構築および検索プロセスに最も適した構成を判断します。メトリックタイプはベクトル間の距離をどのように測定するかを決定するものであり、これだけを考慮すれば十分です。

Milvus と Zilliz Cloud におけるインデックス構築設定の違いを以下に示します。

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

検索パフォーマンスをチューニングするには、インデックスタイプごとに異なるパラメータ群を調整する必要があります。たとえば、HNSW を使用する場合に調整すべきパラメータは `ef` であり、IVF を使用する場合に調整すべきパラメータは `nprobe` です。最適な recall 率と検索パフォーマンスのバランスを取るには、使用しているインデックスタイプに固有のこれらのパラメータを細かく調整する必要があります。

Zilliz Cloud では、上記のような複雑なパラメータ群を扱う代わりに、統一パラメータ `level` を使用して検索パラメータのチューニングを簡素化しています。 

`level` パラメータを大きくすると、recall 率は高くなりますが、検索パフォーマンスが低下する可能性もあります。この値のデフォルトは `1` で、範囲は `1` から `10` です。デフォルト値では recall 率が 90% となり、通常はほとんどのユースケースで十分です。ただし、より高い recall 率が必要な場合は、この値を大きくしてください。

`level` パラメータを調整するときに `enable_recall_calculation` を `true` に設定することもできます。これにより、異なる `level` 値での検索精度を評価できます。

<Admonition type="info" icon="📘" title="Notes">

`level` および `enable_recall_calculation` パラメータはまだ **Public Preview** 段階であり、互換性の問題により十分に利用できない場合があります。サポートが必要な場合は、support@zilliz.com までお問い合わせください。

</Admonition>

## まとめ\{#conclusion}

この記事が、Zilliz Cloud 上のコレクションにおけるベクトルフィールドのインデックス構築と最適化プロセスを簡素化する強力なツールである AUTOINDEX について、理解を深める助けになれば幸いです。検索およびインデックスに最も適した構成を自動的に判断することで、AUTOINDEX は従来の方法と比べてユーザーの時間と労力を節約します。Performance-optimized クラスターと Capacity-optimized クラスターのどちらを使用している場合でも、AUTOINDEX はニーズに合わせて最適化されたインデックスにより、より高速で効率的な検索の実現に役立ちます。AUTOINDEX または Zilliz Cloud のその他の機能についてご質問があれば、どうぞお気軽にチームまでお問い合わせください。いつでも喜んでお手伝いします。
