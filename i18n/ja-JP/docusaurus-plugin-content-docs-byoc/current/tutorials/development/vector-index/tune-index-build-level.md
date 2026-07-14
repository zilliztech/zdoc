---
title: "インデックス構築レベルの調整 | BYOC"
slug: /tune-index-build-level
sidebar_label: "構築レベルの調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では `buildlevel` というパラメータが導入されており、対象 collection に対してストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低い collection やより多くのストレージ容量が必要な collection では、再現率のわずかな低下と引き換えにストレージ容量を大幅に増やすことができ、その逆も可能です。このガイドでは、利用可能なオプションと、それらを使用して collection のインデックスを構築する方法について説明します。 | BYOC"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# インデックス構築レベルの調整

Zilliz Cloud では `build_level` というパラメータが導入されており、対象 collection に対してストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低い collection やより多くのストレージ容量が必要な collection では、再現率のわずかな低下と引き換えにストレージ容量を大幅に増やすことができ、その逆も可能です。このガイドでは、利用可能なオプションと、それらを使用して collection のインデックスを構築する方法について説明します。 

<Admonition type="info" icon="📘" title="注意">

この機能は現在 **PUBLIC REVIEW** 段階であり、以下の条件を満たす場合にのみ Dedicated cluster に適用されます。

- cluster タイプが **Performance-optimized**、**Capacity-optimized**、**Tiered-storage** のいずれかであること

- cluster が **Milvus v2.6.x** と互換性があること

この機能を試すために cluster をアップグレードできます。さらに明確化が必要な点に遭遇した場合は、お問い合わせください。

</Admonition>

## 概要\{#overview}

Zilliz Cloud のさまざまなタイプの cluster では、公称ストレージ容量に大きな違いがあります。Performance-optimized cluster 内の collection が低頻度利用向けである場合や、追加のストレージが必要な場合は、その collection 内の **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点 vector 型の vector field に対してインデックスを作成する際に、`build_level` を容量優先オプションに設定することを検討してください。これにより、再現率がわずかに低下する可能性はありますが、ストレージ容量を **30%** ～ **40%** 向上させることができます。

`build_level` パラメータには、**Precision-first** (2)、**Balanced** (1)、**Capacity-first** (0) の 3 つのオプションがあります。

- **Balanced** (1)

    これはデフォルトのオプションであり、ほとんどのシナリオにおいて検索精度とストレージ容量のバランスを取ります。

- **Precision-first** (2)

    このオプションは検索パフォーマンスと高い再現率を優先し、高精度が求められる collection に適しています。

- **Capacity-first** (0)

    このオプションはストレージ容量を重視し、追加のストレージ領域が必要な collection に最適です。

社内ベンチマークテストで示されているように、デフォルトオプションは cluster タイプに関係なく、すべての cluster のストレージ容量を向上させます。Performance-optimized cluster では、デフォルトオプションによってストレージ容量が **60%** 向上し、パフォーマンス (QPS) も **17%** 改善されます。 

### Performance-optimized clusters\{#performance-optimized-clusters}

次の表は、`build_level` 導入前後における Performance-optimized cluster の容量、QPS、再現率を比較したものです。デフォルトオプションが再現率を維持しつつ、QPS とストレージ容量の両方を向上させていることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 210 万 768 次元 vector | &#126; 2,850 | 90% - 95% |
| Balanced (1) | 150 万 768 次元 vector | &#126; 3,500 | 91% - 97% |
| Precison-first (2) | 100 万 768 次元 vector | &#126; 3,000 | 92% - 98% (↑) |

### Capacity-optimized clusters\{#capacity-optimized-clusters}

次の表は、`build_level` 導入前後における Capacity-optimized cluster の容量、QPS、再現率を比較したものです。デフォルトオプションが再現率を維持しつつ、QPS とストレージ容量の両方を向上させていることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 700 万 768 次元 vector | &#126; 300 | 89% - 97% |
| Balanced (1) | 500 万 768 次元 vector | &#126; 350 | 93% - 98% |
| Precision-first (2) | 300 万 768 次元 vector | &#126; 345 | 94% - 98% |

### Tiered-storage clusters\{#tiered-storage-clusters}

データの大部分は S3 に保存されるため、メモリはもはや主要なボトルネックではありません。その結果、cluster の最大容量は比較的安定したままであり、最も大きな影響を受けるのは **Recall** です。量子化レベルの違いにより、パフォーマンスにはわずかな変動が生じます。

- **Balanced (1):** これは現在の状態を表しており、パフォーマンスは既存のベンチマークと一致したままです。

- **Precision-first (2):** Build Level を上げることで **Recall が約 3%～4% 向上** しますが、QPS がわずかに低下し、レイテンシが少し増加します。

- **Capacity-first (0):** この構成は利点が最小限であるため、利用されることはまれだと予想されます。容量は変わらない一方で、QPS とレイテンシのわずかな改善と引き換えに、**Recall は 3%～4% 低下** します。

## 制限\{#limits}

操作を開始する前に、次の制限事項を確認してください。

- collection にインデックスを作成する際、このパラメータは **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** を含む浮動小数点 vector 型の vector field に設定する必要があります。

- 一度設定すると、このパラメータは変更できません。ただし、必要に応じて index を削除し、目的の設定でもう一度作成できます。

- migration または backup を行うと、`build_level` の設定は削除されます。migration または復元が完了した後、必要に応じて index を削除し、目的の設定でもう一度作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level` を設定する必要はありません。デフォルト設定により、検索パフォーマンス、精度、ストレージ容量のバランスを取ることができます。 

Zilliz Cloud では、`build_level` をプログラムから、または Zilliz Cloud コンソール上で設定できます。

### build_level をプログラムから設定する\{#set-buildlevel-programmatically}

`build_level` を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点型の [vector field にインデックスを作成する](./autoindex-explained) ときに設定する必要があります。

次の例では、すでに collection を作成済みであることを前提としています。`build_level` を `1` に設定すると、**Balanced** オプションが適用されます。

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

`build_level` はプログラムから設定する代わりに、collection を作成するときに Zilliz Cloud コンソール上でも設定できます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象 cluster の Collection タブで **+ Create Collection** をクリックします。

1. **Create Collection** ページで、スキーマを設定します。

    vector field のデータ型が、有効なオプションである **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** のいずれかであることを確認してください。

1. **Create Index** セクションで、**Edit Index** をクリックします。

1. 表示された Edit Vector Index フィールドで、**Metric Type** と **Index Build Level** を設定できます。

