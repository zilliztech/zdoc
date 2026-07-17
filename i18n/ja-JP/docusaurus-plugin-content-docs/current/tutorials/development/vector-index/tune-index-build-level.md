---
title: "Index Build Level の調整 | Cloud"
slug: /tune-index-build-level
sidebar_label: "Build Level の調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、`buildlevel` というパラメータが導入されており、これによりユーザーは対象 collection のストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低い collection や、より多くのストレージ容量が必要な collection では、再現率のわずかな低下を許容する代わりに、ストレージ容量を大幅に増やすことができます。その逆も可能です。このガイドでは、利用可能なオプションと、それらを使用して collection の index を構築する方法について説明します。 | Cloud"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Index Build Level の調整

Zilliz Cloud では、`build_level` というパラメータが導入されており、これによりユーザーは対象 collection のストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低い collection や、より多くのストレージ容量が必要な collection では、再現率のわずかな低下を許容する代わりに、ストレージ容量を大幅に増やすことができます。その逆も可能です。このガイドでは、利用可能なオプションと、それらを使用して collection の index を構築する方法について説明します。 

<Admonition type="info" icon="📘" title="注意">

この機能は現在 **PUBLIC REVIEW** 中であり、以下の条件を満たす dedicated cluster にのみ適用されます。

- cluster が **Performance-optimized**、**Capacity-optimized**、**Tiered-storage** のいずれかのタイプであること

- cluster が **Milvus v2.6.x** と互換性があること

この機能を試すために cluster をアップグレードできます。不明点があればお問い合わせください。

</Admonition>

## 概要\{#overview}

Zilliz Cloud cluster はタイプごとに公称ストレージ容量が大きく異なります。performance-optimized cluster 内の collection が低頻度利用向けである場合や、追加のストレージが必要な場合は、collection 内の **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの floating vector type の vector field に対して index を作成する際に、`build_level` を容量優先オプションに設定することを検討してください。これにより再現率がわずかに低下する可能性はありますが、ストレージ容量を **30%** ～ **40%** 向上させることができます。

`build_level` パラメータには、**Precision-first** (2)、**Balanced** (1)、**Capacity-first** (0) の 3 つのオプションがあります。

- **Balanced** (1)

    これはデフォルトのオプションで、ほとんどのシナリオにおいて検索精度とストレージ容量のバランスを取ります。

- **Precision-first** (2)

    このオプションは検索パフォーマンスと高い再現率を優先し、高精度が求められる collection に適しています。

- **Capacity-first** (0)

    このオプションはストレージ容量を重視し、追加の保存領域が必要な collection に最適です。

社内ベンチマークテストで示されているように、デフォルトオプションは cluster のタイプに関係なく、すべての cluster のストレージ容量を増加させます。performance-optimized cluster では、デフォルトオプションによりストレージ容量が **60%** 向上し、パフォーマンス (QPS) も **17%** 改善されます。 

### Performance-optimized clusters\{#performance-optimized-clusters}

次の表は、`build_level` 導入前後における performance-optimized cluster の容量、QPS、再現率を比較したものです。デフォルトオプションでは再現率を維持しつつ、QPS とストレージ容量の両方が向上していることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 500万 768-dim vectors | &#126; 1,800 | 90% - 95% |
| Balanced (1) | 200万 768-dim vectors | &#126; 2,800 | 91% - 97% |
| Precison-first (2) | 150万 768-dim vectors | &#126; 2,900 | 92% - 98% (↑) |

### Capacity-optimized clusters\{#capacity-optimized-clusters}

次の表は、`build_level` 導入前後における capacity-optimized cluster の容量、QPS、再現率を比較したものです。デフォルトオプションでは再現率を維持しつつ、QPS とストレージ容量の両方が向上していることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 1200万 768-dim vectors | &#126; 200 | 89% - 97% |
| Balanced (1) | 800万 768-dim vectors | &#126; 300 | 93% - 98% |
| Precision-first (2) | 500万 768-dim vectors | &#126; 350 | 94% - 98% |

### Tiered-storage clusters\{#tiered-storage-clusters}

データの大部分が S3 に保存されるため、メモリはもはや主要なボトルネックではありません。その結果、cluster の最大容量は比較的安定したままで、最も大きな影響を受けるのは **Recall** です。量子化レベルの違いにより、パフォーマンスにはわずかな変動が生じます。

- **Balanced (1):** これは現在の状態を表しており、パフォーマンスは既存のベンチマークと一致したままです。

- **Precision-first (2):** Build Level を上げると、**Recall が約 3%～4% 向上**しますが、その代わりに QPS がわずかに低下し、レイテンシがやや増加します。

- **Capacity-first (0):** この構成は利点が小さいため、利用されるケースは少ないと考えられます。容量は変わらない一方で、QPS とレイテンシがわずかに改善する代わりに、**Recall が 3%～4% 低下**します。

## 制限事項\{#limits}

操作を開始する前に、以下の制限事項を確認してください。

- collection に index を作成する際、このパラメータは **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** を含む floating vector type の vector field に設定する必要があります。

- 一度設定すると、このパラメータは変更できません。ただし、必要に応じて index を削除し、希望する設定で新しいものを作成できます。

- migration または backup を行うと、`build_level` の設定は削除されます。migration または復元が完了した後、必要に応じて index を削除し、希望する設定で新しいものを作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level` を設定する必要はありません。デフォルト設定により、検索パフォーマンス、精度、ストレージ容量のバランスを取ることができます。 

Zilliz Cloud では、`build_level` をプログラムから設定することも、Zilliz Cloud コンソール上で設定することもできます。

### build_level をプログラムから設定する\{#set-buildlevel-programmatically}

`build_level` を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの floating type の [vector field に index を作成する](./autoindex-explained)際に設定する必要があります。

次の例では、すでに collection を作成済みであることを前提としています。`build_level` を `1` に設定すると、**Balanced** オプションが適用されることを示します。

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

`build_level` はプログラムから設定する代わりに、collection の作成時に Zilliz Cloud コンソールで設定することもできます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象 cluster の Collection タブで **+ Create Collection** をクリックします。

1. **Create Collection** ページで、schema を設定します。

    vector field のデータ型が有効なオプションのいずれかであることを確認してください: **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR**。

1. **Create Index** セクションで、**Edit Index** をクリックします。

1. 表示された Edit Vector Index フィールドで、**Metric Type** と **Index Build Level** を設定できます。

