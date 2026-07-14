---
title: "インデックス構築レベルを調整する | Cloud"
slug: /tune-index-build-level
sidebar_label: "構築レベルを調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、`buildlevel` というパラメータが導入されており、これによりユーザーは対象 collection のストレージ容量と検索リコール率のバランスを取ることができます。使用頻度が低い collection や、より多くのストレージ容量が必要な collection では、わずかなリコール率の低下を許容する代わりに、ストレージ容量を大幅に増やすことができます。その逆も可能です。このガイドでは、利用可能なオプションと、それらを使用して collection のインデックスを構築する方法について説明します。 | Cloud"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# インデックス構築レベルを調整する

Zilliz Cloud では、`build_level` というパラメータが導入されており、これによりユーザーは対象 collection のストレージ容量と検索リコール率のバランスを取ることができます。使用頻度が低い collection や、より多くのストレージ容量が必要な collection では、わずかなリコール率の低下を許容する代わりに、ストレージ容量を大幅に増やすことができます。その逆も可能です。このガイドでは、利用可能なオプションと、それらを使用して collection のインデックスを構築する方法について説明します。 

<Admonition type="info" icon="📘" title="注意">

この機能は現在 **PUBLIC REVIEW** 段階であり、以下の条件を満たす dedicated cluster にのみ適用されます。

- cluster のタイプが **Performance-optimized**、**Capacity-optimized**、**Tiered-storage** のいずれかであり、

- cluster が **Milvus v2.6.x** と互換性があること。

この機能を試すために cluster をアップグレードできます。さらに明確化が必要な点があれば、お気軽にお問い合わせください。

</Admonition>

## 概要\{#overview}

異なるタイプの Zilliz Cloud cluster では、公称ストレージ容量に大きな違いがあります。Performance-optimized cluster 内の collection が使用頻度の低い用途向けである場合、または追加のストレージが必要な場合は、その collection 内の **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点 vector 型の vector field に対してインデックスを作成する際に、`build_level` を容量優先オプションに設定することを検討してください。これによりリコールはわずかに低下する可能性がありますが、ストレージ容量を **30%** ～ **40%** 向上させることができます。

`build_level` パラメータには、**Precision-first** (2)、**Balanced** (1)、**Capacity-first** (0) の 3 つのオプションがあります。

- **Balanced** (1)

    これはデフォルトのオプションであり、多くのシナリオにおいて検索精度とストレージ容量のバランスを取ります。

- **Precision-first** (2)

    このオプションは検索性能と高いリコールを優先し、高精度が求められる collection に適しています。

- **Capacity-first** (0)

    このオプションはストレージ容量を重視し、追加のストレージ容量が必要な collection に適しています。

社内ベンチマークテストで示されているように、デフォルトのオプションは cluster のタイプに関係なく、すべての cluster のストレージ容量を増加させます。Performance-optimized cluster では、デフォルトのオプションによりストレージ容量が **60%** 向上し、性能（QPS）も **17%** 改善されます。 

### Performance-optimized clusters\{#performance-optimized-clusters}

次の表は、`build_level` の導入前後における Performance-optimized cluster の容量、QPS、リコール率を比較したものです。デフォルトのオプションがリコール率を維持しつつ、QPS とストレージ容量の両方を向上させていることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 210 万個の 768 次元 vector | &#126; 2,850 | 90% - 95% |
| Balanced (1) | 150 万個の 768 次元 vector | &#126; 3,500 | 91% - 97% |
| Precison-first (2) | 100 万個の 768 次元 vector | &#126; 3,000 | 92% - 98% (↑) |

### Capacity-optimized clusters\{#capacity-optimized-clusters}

次の表は、`build_level` の導入前後における Capacity-optimized cluster の容量、QPS、リコール率を比較したものです。デフォルトのオプションがリコール率を維持しつつ、QPS とストレージ容量の両方を向上させていることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 700 万個の 768 次元 vector | &#126; 300 | 89% - 97% |
| Balanced (1) | 500 万個の 768 次元 vector | &#126; 350 | 93% - 98% |
| Precision-first (2) | 300 万個の 768 次元 vector | &#126; 345 | 94% - 98% |

### Tiered-storage clusters\{#tiered-storage-clusters}

データの大部分は S3 に保存されるため、メモリはもはや主要なボトルネックではありません。その結果、cluster の最大容量は比較的安定したままとなり、最も大きな影響を受けるのは **Recall** です。量子化レベルの違いによって性能にはわずかな変動が生じます。

- **Balanced (1):** これは現在の状態を表しており、性能は既存のベンチマークと整合しています。

- **Precision-first (2):** Build Level を上げることで **Recall が約 3%～4% 向上** しますが、QPS がわずかに低下し、レイテンシが少し増加します。

- **Capacity-first (0):** この構成が使われるケースは少ないと考えられます。利点が限定的だからです。容量は変わらない一方で、QPS とレイテンシのわずかな改善と引き換えに、**Recall は 3%～4% 低下** します。

## 制限事項\{#limits}

操作を始める前に、以下の制限事項を確認してください。

- collection にインデックスを作成する際、このパラメータは **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** を含む浮動小数点 vector 型の vector field に設定する必要があります。

- 一度設定すると、このパラメータは変更できません。ただし、必要に応じて index を drop し、目的の設定で再作成できます。

- migration またはバックアップを行うと、`build_level` の設定は削除されます。migration または復元が完了した後、必要に応じて index を drop し、目的の設定で再作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level` を設定する必要はありません。デフォルト設定により、検索性能、精度、ストレージ容量のバランスを取ることができます。 

Zilliz Cloud では、`build_level` をプログラムから設定することも、Zilliz Cloud コンソールで設定することもできます。

### build_level をプログラムから設定する\{#set-buildlevel-programmatically}

`build_level` を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点型の [vector field にインデックスを作成する](./autoindex-explained) 際に設定する必要があります。

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

`build_level` をプログラムから設定する代わりに、collection の作成時に Zilliz Cloud コンソール上で設定することもできます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象 cluster の Collection タブで **+ Create Collection** をクリックします。

1. **Create Collection** ページで、スキーマを設定します。

    vector field のデータ型が有効なオプションのいずれか、つまり **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** であることを確認してください。

1. **Create Index** セクションで、**Edit Index** をクリックします。

1. 表示された Edit Vector Index フィールドで、**Metric Type** と **Index Build Level** を設定できます。

