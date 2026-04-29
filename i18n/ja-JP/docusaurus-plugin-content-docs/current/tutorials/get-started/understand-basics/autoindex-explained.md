---
title: "AUTOINDEX の解説 | Cloud"
slug: /autoindex-explained
sidebar_key: autoindex-explained
sidebar_label: "AUTOINDEX の解説"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、異なる構成で実行されるクラスターを提供しています。これらのクラスター上でインデックスを構築するには、それぞれ異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省けるよう、AUTOINDEX が活用されます。 | Cloud"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - autoindex
  - milvus

---

import Admonition from '@theme/Admonition';


# AUTOINDEX の解説

Zilliz Cloud は、異なる構成で実行されるクラスターを提供しています。これらのクラスター上でインデックスを構築するには、異なるアプローチが必要です。ユーザーがインデックスパラメータの調整や微調整の手間を省けるよう、**AUTOINDEX** が登場します。

**AUTOINDEX** は Zilliz Cloud で利用可能な独自インデックスタイプであり、より優れた検索パフォーマンスの実現をサポートします。Zilliz Cloud 上のコレクション内でベクトルフィールドまたはスカラーフィールドをインデックス化したい場合、常に **AUTOINDEX** が適用されます。

## 機能と利点\{#features-and-benefits}

ベクトルフィールドにおいて、**AUTOINDEX** はオープンソースの Milvus と比較して顕著なパフォーマンス優位性を提供し、特定のデータセットでは最大 3 倍の QPS を達成します。AUTOINDEX を使用して、Zilliz Cloud クラスターがサポートするすべてのフィールドタイプ（[Dense Vector](./use-dense-vector)、[Binary Vector](./use-binary-vector)、[Binary Vector](./use-binary-vector) など）にインデックスを作成できます。

スカラーフィールドにおいて、**AUTOINDEX** はフィールドタイプと最も適したスカラーインデックスタイプとの間で効率的なマッピングを提供します。

<table>
   <tr>
     <th><p>フィールドタイプ</p></th>
     <th><p>AUTOINDEX による解決結果</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p><strong>BITMAP</strong> (C&ast; &lt; 100) / <strong>INVERTED</strong> ( C ≥ 100)</p></td>
     <td><p>文字列データタイプ。詳細については、<a href="./use-string-field">String Field</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code>, <code>INT16</code>, <code>INT32</code>, <code>INT64</code></p></td>
     <td><p><strong>BITMAP</strong> (C &lt; 100) / <strong>STL_SORT</strong> (C ≥ 100)</p></td>
     <td><p>整数。詳細については、<a href="./use-number-field">Boolean & Number</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT</code>, <code>DOUBLE</code></p></td>
     <td><p><strong>BITMAP</strong> (C&ast; &lt; 100) / <strong>INVERTED</strong> ( C ≥ 100)</p></td>
     <td><p>浮動小数点数。詳細については、<a href="./use-number-field">Boolean & Number</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p><strong>BITMAP</strong></p></td>
     <td><p>ブール値。詳細については、<a href="./use-number-field">Boolean & Number</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY</code></p></td>
     <td><p><strong>BITMAP</strong> (C&ast; &lt; 100) / <strong>INVERTED</strong> ( C ≥ 100)</p></td>
     <td><p>スカラー値の同種配列。詳細については、<a href="./use-array-fields">配列 Field</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>GEOMETRY</code></p></td>
     <td><p><strong>RTREE</strong></p></td>
     <td><p>空間情報を格納する幾何学データ。詳細については、<a href="./use-geometry-field">ジオメトリ Field</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>TIMESTAMPTZ</code></p></td>
     <td><p><strong>STL_SORT</strong></p></td>
     <td><p>タイムゾーン対応の ISO 8601 入力。UTC として保存され、タイムゾーン間で一貫したフィルタリングおよび順序付けを可能にします。詳細については、<a href="./use-timestamptz-field">TIMESTAMPTZ Field</a> を参照してください。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>基数（上記表の C）は、コレクション全体におけるフィールド内の一意の値の数を示します。例えば、浮動小数点フィールドの基数は、そのフィールド内の異なる浮動小数点値の数です。</p>
<p>配列フィールドの場合、基数はセグメント内のすべての配列にわたる<strong>固有の要素値</strong>の数です。例えば：</p>

```plaintext
[1, 2, 3]
[2, 3, 4]
[1, 4, 5]
```

<p>固有の要素値は <code>{1, 2, 3, 4, 5}</code> → 基数 = <strong>5</strong> です。これは、すべての配列からすべての要素を平坦化し、一意の値の数をカウントします。異なる配列の数や配列の長さをカウントするわけではありません。</p>

</Admonition>

**AUTOINDEX** は、以下の側面で高いパフォーマンスを提供します：

- Single Instruction, Multiple データ (SIMD) を活用してクエリとストレージを高速化し、マシンから可能な限りのパフォーマンスを引き出します。

- データのグラフ化およびトリミング戦略を最適化し、検索時にアクセスするデータポイントの数を削減します。

- 動的量子化戦略を実装して、距離計算のコストを削減します。

### コスト効率\{#cost-efficiency}

**AUTOINDEX** は、純粋なインメモリ、ハイブリッドディスク、およびメモリマップド (MMAP) モードをサポートし、容量とパフォーマンスに対するユーザーのさまざまなニーズに対応します。インメモリモードでは、**AUTOINDEX** は動的量子化を使用してメモリ使用量を大幅に削減します。ハイブリッドディスクモードでは、**AUTOINDEX** はデータを動的にキャッシュし、アルゴリズムを使用して I/O 操作を最小限に抑えながら、高いパフォーマンスを維持できます。

### 自律的なチューニング\{#autonomous-tuning}

近似最近傍 (ANN) アルゴリズムでは、再現率とパフォーマンスの間にトレードオフが必要です。クエリパラメータは結果に大きな影響を与えます。クエリパラメータのサイズが小さすぎると、再現率が極めて低くなり、ビジネス要件を満たせない可能性があります。逆に、クエリパラメータのサイズが大きすぎると、パフォーマンスが著しく低下します。

クエリパラメータを選択するには、多くのドメイン固有の知識が必要であり、これによりユーザーの学習曲線が大幅に急になります。この問題に対処するため、**AUTOINDEX** はクエリパラメータの選択を容易にするインテリジェントなアルゴリズムを開発しました。インデックス作成中にユーザーのデータセットの分布を分析することで、**AUTOINDEX** はクエリパラメータ推奨用の機械学習モデルを活用して、再現率とパフォーマンスの間のトレードオフを実現します。これにより、ユーザーは手動でクエリパラメータを設定する必要がなくなります。

<Admonition type="info" icon="📘" title="Notes">

<p>Milvus のコードベースを Zilliz Cloud に移行する際、手動で使用しているインデックスタイプを変更する必要はありません。Zilliz Cloud は、インデックスを作成する際に自動的に AUTOINDEX を適用します。</p>

</Admonition>

## インデックス作成と検索設定\{#index-building-and-search-settings}

インデックスを作成するプロセスには、コレクション内のエンティティを特定の順序で整理し、結果をより迅速に取得できるようにすることが含まれます。

Zilliz Cloud 上で浮動小数点ベクトルのインデックス作成を行うことは困難ではありません。インデックスタイプを **AUTOINDEX** に設定し、メトリックタイプを選択するだけで、Zilliz Cloud がインデックス作成プロセスと検索プロセスに最も適した構成を決定します。メトリックタイプは、ベクトル間の距離をどのように測定するかを決定するものであり、考慮すべき唯一の要素です。

Milvus と Zilliz Cloud におけるインデックス作成設定の違いを以下に示します：

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

検索パラメータ設定の違いは以下の通りです：

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

検索パフォーマンスのチューニングには、インデックスタイプによって異なるパラメータセットの調整が必要です。例えば、HNSW を使用する場合は `ef` パラメータをチューニングし、IVF を使用する場合は `nprobe` パラメータを調整します。最適な再現率と検索パフォーマンスのバランスを実現するには、使用しているインデックスタイプ固有のパラメータを微調整する必要があります。

Zilliz Cloud では、上記のような複雑なパラメータセットを個別に扱う代わりに、統一されたパラメータ `level` を使用して検索パラメータのチューニングを簡素化しています。

`level` パラメータの値を増やすと再現率は高くなりますが、検索パフォーマンスが低下する可能性もあります。この値のデフォルトは `1` で、範囲は `1` から `10` です。デフォルト値では再現率が 90% となり、これはほとんどのユースケースで十分です。ただし、より高い再現率が必要な場合は、この値を増やしてください。

また、`level` パラメータを調整する際に `enable_recall_calculation` を `true` に設定することで、異なる `level` 値における検索の精度を評価できます。

<Admonition type="info" icon="📘" title="Notes">

<p><code>level</code> および <code>enable_recall_calculation</code> パラメータは現在<strong>パブリックプレビュー</strong>段階であり、互換性の問題により完全に使用できない場合があります。サポートが必要な場合は、support@zilliz.com までお問い合わせください。</p>

</Admonition>

## まとめ\{#conclusion}

この記事が、Zilliz Cloud 上のコレクションにおけるベクトルフィールドのインデックス構築と最適化のプロセスを簡素化する強力なツールである AUTOINDEX の理解を深める一助となれば幸いです。AUTOINDEX は、検索とインデックスに最も適した構成を自動的に決定することで、従来の方法と比較してユーザーの時間と労力を節約します。パフォーマンス最適化済み クラスターを使用している場合でも、容量最適化済み クラスターを使用している場合でも、AUTOINDEX はニーズに合わせて最適化されたインデックスにより、より高速で効率的な検索の実現をサポートします。AUTOINDEX や Zilliz Cloud のその他の機能についてご質問がある場合は、お気軽に当社チームまでご連絡ください。喜んでお手伝いいたします！