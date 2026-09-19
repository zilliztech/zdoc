---
title: "AUTOINDEX の解説 | Cloud"
slug: /autoindex-explained
sidebar_label: "AUTOINDEX"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、構成の異なるクラスターが提供されています。これらのクラスターにインデックスを構築するには、それぞれ異なるアプローチが必要です。インデックスパラメータの調整や微調整に手間をかけずに済むように、AUTOINDEX が役立ちます。 | Cloud"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AUTOINDEX の解説

Zilliz Cloud では、構成の異なるクラスターが提供されています。これらのクラスターにインデックスを構築するには、それぞれ異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整に手間をかけずに済むように、**AUTOINDEX** が役立ちます。

**AUTOINDEX** は、Zilliz Cloud で利用できる独自のインデックスタイプであり、より優れた検索パフォーマンスの実現に役立ちます。Zilliz Cloud 上のコレクションでベクトルフィールドまたはスカラーフィールドにインデックスを作成する場合は常に、**AUTOINDEX** が適用されます。

## 機能とメリット\{#features-and-benefits}

ベクトルフィールドに対して、**AUTOINDEX** はオープンソースの Milvus と比べて大幅なパフォーマンス上の優位性をもたらし、特定のデータセットでは最大 3 倍の QPS を実現します。AUTOINDEX を使用すると、Zilliz Cloud のクラスターがサポートするすべてのフィールドタイプにインデックスを作成できます。これには [密ベクトル](./use-dense-vector)、[バイナリベクトル](./use-binary-vector)、[バイナリベクトル](./use-binary-vector) が含まれます。

スカラーフィールドに対して、**AUTOINDEX** はフィールドタイプと最適なスカラーインデックスタイプの間の効率的なマッピングを提供します。

| フィールドタイプ | AUTOINDEX が解決するインデックスタイプ | 説明 |
| --- | --- | --- |
| `VARCHAR` | **BITMAP** (C&ast; < 100) / **INVERTED** ( C ≥ 100) | 文字列データ型。詳細については、[文字列フィールド](./use-string-field) を参照してください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | **BITMAP** (C < 100) / **STL_SORT** (C ≥ 100) | 整数。詳細については、[ブール値と数値](./use-number-field) を参照してください。 |
| `FLOAT`, `DOUBLE` | **BITMAP** (C&ast; < 100) / **INVERTED** ( C ≥ 100) | 浮動小数点数。詳細については、[ブール値と数値](./use-number-field) を参照してください。 |
| `BOOL` | **BITMAP** | ブール値。詳細については、[ブール値と数値](./use-number-field) を参照してください。 |
| `ARRAY` | **BITMAP** (C&ast; < 100) / **INVERTED** ( C ≥ 100) | スカラー値の同種配列。詳細については、[配列フィールド](./use-array-fields) を参照してください。 |
| `GEOMETRY` | **RTREE** | 空間情報を格納する幾何データ。詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。 |
| `TIMESTAMPTZ` | **STL_SORT** | タイムゾーンを認識する ISO 8601 入力。タイムゾーンをまたいでも一貫したフィルタリングと並べ替えを行えるよう UTC として保存されます。詳細については、[TIMESTAMPTZ フィールド](./use-timestamptz-field) を参照してください。 |

<Admonition type="info" title="Notes">

カーディナリティ（上の表の C）は、コレクション全体におけるあるフィールドの一意な値の数を示します。たとえば、float フィールドのカーディナリティは、そのフィールド内の異なる float 値の数です。

array フィールドの場合、カーディナリティは、セグメント内のすべての配列にまたがる**異なる要素値**の数です。たとえば、次のとおりです。

```plaintext
[1, 2, 3]
[2, 3, 4]
[1, 4, 5]
```

異なる要素値は `{1, 2, 3, 4, 5}` → カーディナリティ = **5** です。すべての配列からすべての要素を平坦化してから一意な値を数えます。異なる配列の数でも、配列の長さでもありません。

</Admonition>

**AUTOINDEX** は、次の点で高いパフォーマンスを発揮します。

- Single Instruction, Multiple Data（SIMD）を活用してクエリとストレージを高速化し、マシンの性能を可能な限り引き出します。

- データのグラフ化とクロッピングの戦略を最適化し、検索時にアクセスするデータポイントの数を削減します。

- 動的な量子化戦略を実装し、距離計算のコストを削減します。

### コスト効率\{#cost-efficiency}

**AUTOINDEX** は、純粋なインメモリ、ハイブリッドディスク、メモリマップド（MMAP）の各モードをサポートし、容量とパフォーマンスに関するユーザーの多様なニーズに応えます。インメモリモードでは、**AUTOINDEX** は動的な量子化を使用してメモリ使用量を大幅に削減します。ハイブリッドディスクモードでは、**AUTOINDEX** はデータを動的にキャッシュし、アルゴリズムを用いて I/O 操作を最小限に抑えながら高いパフォーマンスを維持できます。

### 自律的なチューニング\{#autonomous-tuning}

近似最近傍（ANN）アルゴリズムでは、再現率とパフォーマンスのトレードオフが必要です。クエリパラメータは結果に大きな影響を与えます。クエリパラメータの値が小さすぎると再現率が極端に低くなり、ビジネス要件を満たせない可能性があります。逆に、クエリパラメータの値が大きすぎると、パフォーマンスが著しく低下します。

クエリパラメータの選択には多くのドメイン固有の知識が必要であり、ユーザーの学習負担を大幅に増加させます。この問題に対処するため、**AUTOINDEX** はクエリパラメータの選択を容易にするインテリジェントなアルゴリズムを開発しました。インデックス構築時にユーザーのデータセットの分布を分析することで、**AUTOINDEX** はクエリパラメータの推奨に機械学習モデルを活用して、再現率とパフォーマンスのトレードオフを実現します。これにより、ユーザーはクエリパラメータを手動で設定する必要がなくなります。

<Admonition type="info" title="Notes">

Milvus のコードベースを Zilliz Cloud に移行する場合、使用するインデックスタイプを手動で変更する必要はありません。Zilliz Cloud はインデックス作成時に AUTOINDEX を自動的に適用します。

</Admonition>

## インデックス構築と検索設定\{#index-building-and-search-settings}

インデックスを構築するプロセスでは、コレクション内のエンティティを特定の順序で整理し、結果をより迅速に取得できるようにします。

Zilliz Cloud で浮動小数点ベクトルにインデックスを作成することは難しくありません。インデックスタイプを **`AUTOINDEX`** に設定し、メトリックタイプを選択するだけで、Zilliz Cloud がインデックス構築プロセスと検索プロセスに最適な構成を決定します。メトリックタイプはベクトル間の距離の測定方法を決定するものであり、考慮すべき唯一の項目です。

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

検索パフォーマンスをチューニングするには、インデックスタイプに応じて異なる一連のパラメータを調整する必要があります。たとえば、HNSW を使用する場合に調整すべきパラメータは `ef` であり、IVF を使用する場合に調整すべきパラメータは `nprobe` です。最適な再現率と検索パフォーマンスのバランスを取るには、使用するインデックスタイプに固有のこれらのパラメータを微調整する必要があります。

Zilliz Cloud では、上記のような複雑なパラメータセットを扱う代わりに、統一パラメータ `level` を使用して検索パラメータのチューニングを簡素化しています。

`level` パラメータを大きくすると再現率は高くなりますが、検索パフォーマンスが低下する可能性もあります。この値のデフォルトは `1` で、範囲は `1` から `10` です。デフォルト値では再現率が 90% となり、通常はほとんどのユースケースで十分です。ただし、より高い再現率が必要な場合は、この値を大きくしてください。

`level` パラメータを調整する際に `enable_recall_calculation` を `true` に設定すると、異なる `level` 値での検索の精度を評価できます。

## まとめ\{#conclusion}

この記事が、Zilliz Cloud 上のコレクションのベクトルフィールドに対するインデックスの構築と最適化のプロセスを簡素化する強力なツールである AUTOINDEX について、理解を深める一助となれば幸いです。検索とインデックスに最適な構成を自動的に決定することで、AUTOINDEX は従来の方法と比べてユーザーの時間と労力を節約します。Performance-optimized クラスターと Capacity-optimized クラスターのどちらを使用している場合でも、AUTOINDEX は、ニーズに合わせて最適化されたインデックスにより、より高速で効率的な検索の実現に役立ちます。AUTOINDEX または Zilliz Cloud のその他の機能についてご質問がある場合は、どうぞお気軽に当社のチームまでお問い合わせください。いつでも喜んでお手伝いします。
