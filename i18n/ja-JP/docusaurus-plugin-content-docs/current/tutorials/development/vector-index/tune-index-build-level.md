---
title: "インデックス構築レベルの調整 | Cloud"
slug: /tune-index-build-level
sidebar_label: "構築レベルの調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、`buildlevel` というパラメーターが導入されており、対象コレクションのストレージ容量と検索リコール率のバランスを調整できます。使用頻度が低いコレクションや、より多くのストレージ容量を必要とするコレクションでは、リコール率がわずかに低下する代わりにストレージ容量を大幅に増やすことができ、その逆も可能です。このガイドでは、利用可能なオプションと、それらを使用してコレクションのインデックスを構築する方法を説明します。 | Cloud"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# インデックス構築レベルの調整

Zilliz Cloud では、`build_level` というパラメーターが導入されており、対象コレクションのストレージ容量と検索リコール率のバランスを調整できます。使用頻度が低いコレクションや、より多くのストレージ容量を必要とするコレクションでは、リコール率がわずかに低下する代わりにストレージ容量を大幅に増やすことができ、その逆も可能です。本ガイドでは、利用可能なオプションと、それらを使用してコレクションのインデックスを構築する方法を説明します。

<Admonition type="info" title="Notes">

この機能は現在 **PUBLIC REVIEW** であり、次の条件を満たす Dedicated クラスターにのみ適用されます。

- クラスターが **Performance-optimized**、**Capacity-optimized**、**Tiered-storage** タイプであること。

- クラスターが **Milvus v2.6.x** と互換性があること。

この機能を試すにはクラスターをアップグレードできます。さらに明確な説明が必要な点があれば、お問い合わせください。

</Admonition>

## 概要\{#overview}

Zilliz Cloud のクラスターはタイプによって公称ストレージ容量が大きく異なります。Performance-optimized クラスター内のコレクションが使用頻度の低い用途向けである場合や、追加のストレージを必要とする場合は、そのコレクション内の **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点ベクトル型のベクトルフィールドにインデックスを作成するときに、`build_level` を容量優先オプションに設定することを検討してください。これによりリコールがわずかに低下する可能性がありますが、ストレージ容量を **30%**～**40%** 増やすことができます。

`build_level` パラメーターには、**Precision-first** (2)、**Balanced** (1)、**Capacity-first** (0) の 3 つのオプションがあります。

- **Balanced** (1)

    これはデフォルトのオプションであり、ほとんどのシナリオで検索精度とストレージ容量のバランスを取ります。

- **Precision-first** (2)

    このオプションは検索性能と高いリコールを優先し、高い精度が求められるコレクションに適しています。

- **Capacity-first** (0)

    このオプションはストレージ容量を重視し、追加のストレージ容量を必要とするコレクションに最適です。

社内ベンチマークテストで示されているとおり、デフォルトオプションはクラスターのタイプに関係なく、すべてのクラスターのストレージ容量を増加させます。Performance-optimized クラスターでは、デフォルトオプションによってストレージ容量が **60%** 増加し、性能（QPS）も **17%** 向上します。

### Performance-optimized クラスター\{#performance-optimized-clusters}

次の表は、`build_level` を導入する前後で Performance-optimized クラスターの容量、QPS、リコール率を比較したものです。デフォルトオプションはリコール率を維持し、QPS とストレージ容量の両方を増加させていることがわかります。

| 構築レベルオプション | 容量（CU あたり） | QPS | リコール |
| --- | --- | --- | --- |
| Capacity-first (0) | 500 万個の 768 次元ベクトル | &#126; 1,800 | 90% - 95% |
| Balanced (1) | 200 万個の 768 次元ベクトル | &#126; 2,800 | 91% - 97% |
| Precison-first (2) | 150 万個の 768 次元ベクトル | &#126; 2,900 | 92% - 98% (↑) |

### Capacity-optimized クラスター\{#capacity-optimized-clusters}

次の表は、`build_level` を導入する前後で Capacity-optimized クラスターの容量、QPS、リコール率を比較したものです。デフォルトオプションはリコール率を維持し、QPS とストレージ容量の両方を増加させていることがわかります。

| 構築レベルオプション | 容量（CU あたり） | QPS | リコール |
| --- | --- | --- | --- |
| Capacity-first (0) | 1,200 万個の 768 次元ベクトル | &#126; 200 | 89% - 97% |
| Balanced (1) | 800 万個の 768 次元ベクトル | &#126; 300 | 93% - 98% |
| Precision-first (2) | 500 万個の 768 次元ベクトル | &#126; 350 | 94% - 98% |

### Tiered-storage クラスター\{#tiered-storage-clusters}

データの大部分が S3 に保存されるため、メモリはもはや主要なボトルネックではありません。その結果、クラスターの最大容量は比較的安定したままとなり、最も大きな影響を受けるのは **Recall** です。量子化レベルの違いにより、性能にはわずかな変動が生じます。

- **Balanced (1):** これは現在の状態を表しており、性能は既存のベンチマークと整合したままです。

- **Precision-first (2):** Build Level を上げると **Recall が約 3%～4% 向上**しますが、その代わりに QPS がわずかに低下し、レイテンシがわずかに増加します。

- **Capacity-first (0):** メリットが最小限であるため、この構成が使用されることはまれと想定されます。容量は変わらない一方で、QPS とレイテンシがわずかに改善する代わりに **Recall が 3%～4% 低下**します。

## 制限事項\{#limits}

操作を開始する前に、以下の制限事項を確認してください。

- コレクション にインデックスを作成するときは、このパラメーターを **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点ベクトル型のベクトルフィールドに設定する必要があります。

- 一度設定すると、このパラメーターは変更できません。ただし、必要に応じてインデックスを削除し、目的の設定で新しいインデックスを作成できます。

- マイグレーションまたはバックアップを実行すると、`build_level` の設定は削除されます。マイグレーションまたは復元が完了した後、必要に応じてインデックスを削除し、目的の設定で新しいインデックスを作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level` を設定する必要はありません。デフォルト設定により、検索性能、精度、ストレージ容量のバランスを取ることができます。

Zilliz Cloud では、`build_level` をプログラムから、または Zilliz Cloud コンソールで設定できます。

### プログラムから build_level を設定する\{#set-buildlevel-programmatically}

`build_level` を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点型の [ベクトルフィールドにインデックスを作成する](./autoindex-explained) ときに行う必要があります。

次の例は、コレクションがすでに作成されていることを前提としています。`build_level` を `1` に設定すると、**Balanced** オプションが適用されることを示します。

```python
# 4. Set up index
# 4.1. Set up the index parameters
index_params = MilvusClient.prepare_index_params()

# 4.2. Add an index on the vector field.
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX",
    index_name="vector_index",
    # highlight-next-line
    build_level=1
)

# 4.4. Create an index file
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 5. Describe index
res = client.list_indexes(
    collection_name="customized_setup"
)
```

### Zilliz Cloud コンソールで build_level を設定する\{#set-buildlevel-on-the-zilliz-cloud-console}

`build_level` をプログラムから設定する代わりに、コレクションの作成時に Zilliz Cloud コンソールでも設定できます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象クラスターの **コレクション** タブで **+ Create Collection** をクリックします。

1. **Create Collection** ページで、スキーマを設定します。

    ベクトルフィールドのデータ型が、有効なオプションである **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** のいずれかであることを確認してください。

1. **Create インデックス** セクションで、**Edit Index** をクリックします。

1. 表示される Edit ベクトル Index フィールドで、**Metric Type** と **Index Build Level** を設定できます。
