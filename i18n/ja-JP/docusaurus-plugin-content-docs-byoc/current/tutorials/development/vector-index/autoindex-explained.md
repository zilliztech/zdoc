---
title: "AUTOINDEX の解説 | BYOC"
slug: /autoindex-explained
sidebar_label: "AUTOINDEX"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、異なる構成で稼働するクラスターを提供しています。これらのクラスターでインデックスを構築するには、それぞれ異なるアプローチが必要です。ユーザーがインデックスパラメーターの調整や微調整に煩わされないようにするために、AUTOINDEX が役立ちます。 | BYOC"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AUTOINDEX の解説

Zilliz Cloud では、異なる構成で稼働するクラスターを提供しています。これらのクラスターでインデックスを構築するには、それぞれ異なるアプローチが必要です。ユーザーがインデックスパラメーターのチューニングや微調整に煩わされないようにするために、**AUTOINDEX** が役立ちます。

**AUTOINDEX** は、Zilliz Cloud で利用できる独自のインデックスタイプであり、より優れた検索パフォーマンスの実現に役立ちます。Zilliz Cloud 上のコレクションでベクトルフィールドまたはスカラーフィールドにインデックスを作成する場合は常に、**AUTOINDEX** が適用されます。

## 機能とメリット\{#features-and-benefits}

ベクトルフィールドでは、**AUTOINDEX** はオープンソースの Milvus と比べて大幅なパフォーマンス上の優位性を提供し、特定のデータセットでは最大 3 倍の QPS を実現します。AUTOINDEX を使用すると、Zilliz Cloud のクラスターがサポートするすべてのフィールドタイプにインデックスを作成できます。対象には、[Dense ベクトル](./use-dense-vector)、[Binary ベクトル](./use-binary-vector)、[Binary ベクトル](./use-binary-vector) が含まれます。

スカラーフィールドでは、**AUTOINDEX** はフィールドタイプと最適なスカラーインデックスタイプとの間に効率的なマッピングを提供します。

| フィールドタイプ | AUTOINDEX が適用するインデックス | 説明 |
| --- | --- | --- |
| `VARCHAR` | **BITMAP** (C&ast; < 100) / **INVERTED** ( C ≥ 100) | 文字列データ型です。詳細については、[String Field](./use-string-field) を参照してください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | **BITMAP** (C < 100) / **STL_SORT** (C ≥ 100) | 整数です。詳細については、[Boolean & Number](./use-number-field) を参照してください。 |
| `FLOAT`, `DOUBLE` | **BITMAP** (C&ast; < 100) / **INVERTED** ( C ≥ 100) | 浮動小数点数です。詳細については、[Boolean & Number](./use-number-field) を参照してください。 |
| `BOOL` | **BITMAP** | ブール値です。詳細については、[Boolean & Number](./use-number-field) を参照してください。 |
| `ARRAY` | **BITMAP** (C&ast; < 100) / **INVERTED** ( C ≥ 100) | スカラー値の同種配列です。詳細については、[Array Field](./use-array-fields) を参照してください。 |
| `GEOMETRY` | **RTREE** | 空間情報を格納する幾何データです。詳細については、[Geometry Field](./use-geometry-field) を参照してください。 |
| `TIMESTAMPTZ` | **STL_SORT** | タイムゾーンを認識する ISO 8601 入力で、タイムゾーンをまたいでも一貫したフィルタリングと並べ替えができるように UTC として保存されます。詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。 |

<Admonition type="info" title="Notes">

Cardinality（上の表の C）は、コレクション全体のあるフィールドにおける一意な値の数を示します。たとえば、float フィールドの cardinality は、そのフィールド内の異なる float 値の数です。

array フィールドの場合、cardinality はセグメント内のすべての配列にまたがる **異なる要素値** の数です。たとえば次のようになります。

```plaintext
[1, 2, 3]
[2, 3, 4]
[1, 4, 5]
```

異なる要素値は `{1, 2, 3, 4, 5}` であり、cardinality = **5** となります。これはすべての配列のすべての要素を平坦化してから一意な値を数えたもので、異なる配列の数でも配列の長さでもありません。

</Admonition>

**AUTOINDEX** は、次の点で高いパフォーマンスを発揮します。

- Single Instruction, Multiple Data（SIMD）を活用してクエリとストレージを高速化し、マシンの性能を可能な限り引き出します。

- データのグラフ化とクロッピングの戦略を最適化し、検索時にアクセスするデータポイントの数を削減します。

- 動的量子化戦略を実装し、距離計算のコストを削減します。

### コスト効率\{#cost-efficiency}

**AUTOINDEX** は、容量とパフォーマンスに関するユーザーのさまざまなニーズに応えるため、純粋なインメモリ、ハイブリッドディスク、およびメモリマップ（MMAP）モードをサポートしています。インメモリモードでは、**AUTOINDEX** は動的量子化を使用してメモリ使用量を大幅に削減します。ハイブリッドディスクモードでは、**AUTOINDEX** はデータを動的にキャッシュし、アルゴリズムを用いて I/O 操作を最小限に抑えながら高いパフォーマンスを維持できます。

### 自律的なチューニング\{#autonomous-tuning}

近似最近傍（ANN）アルゴリズムでは、recall とパフォーマンスのトレードオフが必要です。クエリパラメーターは結果に大きな影響を与えます。クエリパラメーターのサイズが小さすぎると、recall が極端に低くなり、ビジネス要件を満たせない可能性があります。反対に、クエリパラメーターのサイズが大きすぎると、パフォーマンスが大幅に低下します。

クエリパラメーターの選択には多くのドメイン固有の知識が必要であり、ユーザーの学習曲線を大幅に高めます。この問題に対処するため、**AUTOINDEX** はクエリパラメーターの選択を支援するインテリジェントなアルゴリズムを開発しました。インデックス構築時にユーザーのデータセットの分布を分析することで、**AUTOINDEX** はクエリパラメーター推薦用の機械学習モデルを活用し、recall とパフォーマンスのトレードオフを実現します。これにより、ユーザーはクエリパラメーターを手動で設定する必要がなくなります。

<Admonition type="info" title="Notes">

Milvus のコードベースを Zilliz Cloud に移行する際に、使用しているインデックスタイプを手動で変更する必要はありません。Zilliz Cloud はインデックスの作成時に AUTOINDEX を自動的に適用します。

</Admonition>

## インデックス構築と検索設定\{#index-building-and-search-settings}

インデックスを構築するプロセスでは、結果をより迅速に取得できるように、コレクション内のエンティティを特定の順序で並べ替えます。

Zilliz Cloud での浮動小数点ベクトルのインデックス作成は難しくありません。インデックスタイプを **`AUTOINDEX`** に設定し、メトリックタイプを選択するだけで、Zilliz Cloud がインデックス構築プロセスと検索プロセスに最適な構成を判断します。メトリックタイプはベクトル間の距離の測定方法を決定するものであり、唯一考慮すべき事項です。

Milvus と Zilliz Cloud におけるインデックス構築設定の違いを以下に示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

// On Milvus
Map<String, Object> indexParams = new HashMap<>();
indexParams.put("metric_type", "L2");
indexParams.put("index_type", "IVF_FLAT");
Map<String, Object> milvusParams = new HashMap<>();
milvusParams.put("nlist", 1024);
indexParams.put("params", milvusParams);

// On Zilliz Cloud
Map<String, Object> cloudIndexParams = new HashMap<>();
cloudIndexParams.put("index_type", "AUTOINDEX");
cloudIndexParams.put("metric_type", "L2");
```

</TabItem>

<TabItem value='go'>

```go
// On Milvus
indexParams := map[string]any{
    "metric_type": "L2",
    "index_type":  "IVF_FLAT",
    "params":      map[string]any{"nlist": 1024},
}

// On Zilliz Cloud
indexParams = map[string]any{
    "index_type": "AUTOINDEX",
    "metric_type": "L2",
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

// On Milvus
let index_params = json!({
    "metric_type": "L2",
    "index_type": "IVF_FLAT",
    "params": { "nlist": 1024 }
});

// On Zilliz Cloud
let cloud_index_params = json!({
    "index_type": "AUTOINDEX",
    "metric_type": "L2"
});
```

</TabItem>

<TabItem value='c++'>

```c++
// On Milvus
nlohmann::json index_params = {
    {"metric_type", "L2"},
    {"index_type", "IVF_FLAT"},
    {"params", {{"nlist", 1024}}}
};

// On Zilliz Cloud
nlohmann::json cloud_index_params = {
    {"index_type", "AUTOINDEX"},
    {"metric_type", "L2"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
// On Milvus
const indexParams = {
  metric_type: 'L2',
  index_type: 'IVF_FLAT',
  params: { nlist: 1024 },
};

// On Zilliz Cloud
const cloudIndexParams = {
  index_type: 'AUTOINDEX',
  metric_type: 'L2',
};
```

</TabItem>

<TabItem value='bash'>

```bash
# On Milvus
index_params='{
  "metric_type": "L2",
  "index_type": "IVF_FLAT",
  "params": { "nlist": 1024 }
}'

# On Zilliz Cloud
cloud_index_params='{
  "index_type": "AUTOINDEX",
  "metric_type": "L2"
}' 
```

</TabItem>
</Tabs>

検索パラメーター設定の違いは次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

// On Milvus
Map<String, Object> searchParams = new HashMap<>();
Map<String, Object> milvusParams = new HashMap<>();
milvusParams.put("nprobe", 10);
searchParams.put("params", milvusParams);

// On Zilliz Cloud
Map<String, Object> cloudSearchParams = new HashMap<>();
Map<String, Object> levelParams = new HashMap<>();
levelParams.put("level", 1); // The default value applies when left unspecified
cloudSearchParams.put("params", levelParams);
```

</TabItem>

<TabItem value='go'>

```go
// On Milvus
searchParams := map[string]any{
    "params": map[string]any{"nprobe": 10},
}

// On Zilliz Cloud
searchParams = map[string]any{
    "params": map[string]any{"level": 1}, // The default value applies when left unspecified
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

// On Milvus
let search_params = json!({
    "params": { "nprobe": 10 }
});

// On Zilliz Cloud
let cloud_search_params = json!({
    "params": { "level": 1 } // The default value applies when left unspecified
});
```

</TabItem>

<TabItem value='c++'>

```c++
// On Milvus
nlohmann::json search_params = {
    {"params", {{"nprobe", 10}}}
};

// On Zilliz Cloud
nlohmann::json cloud_search_params = {
    {"params", {{"level", 1}}} // The default value applies when left unspecified
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
// On Milvus
const searchParams = {
  params: { nprobe: 10 },
};

// On Zilliz Cloud
const cloudSearchParams = {
  params: { level: 1 }, // The default value applies when left unspecified
};
```

</TabItem>

<TabItem value='bash'>

```bash
# On Milvus
search_params='{
  "params": { "nprobe": 10 }
}'

# On Zilliz Cloud
cloud_search_params='{
  "params": { "level": 1 }
}' 
```

</TabItem>
</Tabs>

### `level` パラメーターについて\{#about-the-level-parameter}

検索パフォーマンスをチューニングするには、インデックスタイプに応じて異なるパラメーター群を調整する必要があります。たとえば、HNSW を使用する場合に調整すべきパラメーターは `ef` であり、IVF を使用する場合に調整すべきパラメーターは `nprobe` です。最適な recall 率と検索パフォーマンスのバランスを取るには、使用しているインデックスタイプに固有のこれらのパラメーターを微調整する必要があります。

Zilliz Cloud では、上述のような複雑なパラメーター群を扱う代わりに、統一パラメーター `level` を使用して検索パラメーターのチューニングを簡素化しています。 

`level` パラメーターを大きくすると recall 率は高くなりますが、検索パフォーマンスが低下する可能性もあります。この値のデフォルトは `1` で、範囲は `1` から `10` です。デフォルト値では recall 率が 90% となり、通常はほとんどのユースケースで十分です。ただし、より高い recall 率が必要な場合は、この値を大きくしてください。

`level` パラメーターを調整するときに `enable_recall_calculation` を `true` に設定することもできます。これにより、異なる `level` 値での検索精度を評価できます。

## まとめ\{#conclusion}

この記事が、Zilliz Cloud 上のコレクションにおけるベクトルフィールドのインデックス構築と最適化のプロセスを簡素化する強力なツールである AUTOINDEX について、より深く理解する助けになれば幸いです。検索とインデックスに最適な構成を自動的に判断することで、AUTOINDEX は従来の方法と比べてユーザーの時間と労力を節約します。Performance-optimized クラスターと Capacity-optimized クラスターのどちらを使用している場合でも、AUTOINDEX はニーズに合わせて最適化されたインデックスにより、より高速で効率的な検索を実現するのに役立ちます。AUTOINDEX または Zilliz Cloud のその他の機能についてご質問がある場合は、ぜひチームまでお問い合わせください。いつでも喜んでお手伝いします。
