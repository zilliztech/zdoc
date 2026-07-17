---
title: "インデックス Build Level の調整 | BYOC"
slug: /tune-index-build-level
sidebar_label: "Build Level の調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では `buildlevel` というパラメータが導入されており、これにより対象 collection のストレージ容量と検索リコール率のバランスを調整できます。使用頻度が低い collection や、より多くのストレージ容量が必要な collection では、リコール率のわずかな低下と引き換えに、ストレージ容量を大幅に増やすことができます。逆も同様です。このガイドでは、利用可能なオプションと、それらを使用して collection のインデックスを構築する方法について説明します。 | BYOC"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# インデックス Build Level の調整

Zilliz Cloud では `build_level` というパラメータが導入されており、これにより対象 collection のストレージ容量と検索リコール率のバランスを調整できます。使用頻度が低い collection や、より多くのストレージ容量が必要な collection では、リコール率のわずかな低下と引き換えに、ストレージ容量を大幅に増やすことができます。逆も同様です。このガイドでは、利用可能なオプションと、それらを使用して collection のインデックスを構築する方法について説明します。 

<Admonition type="info" icon="📘" title="注意">

この機能は現在 **PUBLIC REVIEW** 段階であり、以下の条件を満たす Dedicated cluster のみに適用されます。

- cluster が **Performance-optimized**、**Capacity-optimized**、**Tiered-storage** タイプであること

- cluster が **Milvus v2.6.x** と互換性があること

この機能を試すために cluster をアップグレードできます。さらに詳しい説明が必要な点があれば、お問い合わせください。

</Admonition>

## 概要\{#overview}

異なるタイプの Zilliz Cloud cluster では、公称ストレージ容量に大きな違いがあります。Performance-optimized cluster 内の collection が低頻度利用向けである場合や、追加のストレージが必要な場合は、その collection 内の **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点 vector 型フィールドに対してインデックスを作成する際に、`build_level` を容量優先オプションに設定することを検討してください。これによりリコールがわずかに低下する可能性はありますが、ストレージ容量を **30%** ～ **40%** 向上させることができます。

`build_level` パラメータには、**Precision-first** (2)、**Balanced** (1)、**Capacity-first** (0) の3つのオプションがあります。

- **Balanced** (1)

    これはデフォルトのオプションであり、ほとんどのシナリオで検索精度とストレージ容量のバランスを取ります。

- **Precision-first** (2)

    このオプションは検索パフォーマンスと高いリコールを優先し、高精度を必要とする collection に適しています。

- **Capacity-first** (0)

    このオプションはストレージ容量を重視し、追加のストレージ容量を必要とする collection に最適です。

社内ベンチマークテストで示されているように、デフォルトオプションは cluster タイプに関係なく、すべての cluster のストレージ容量を向上させます。Performance-optimized cluster では、デフォルトオプションによってストレージ容量が **60%** 向上し、パフォーマンス (QPS) も **17%** 改善されます。 

### Performance-optimized clusters\{#performance-optimized-clusters}

次の表は、`build_level` の導入前後における Performance-optimized cluster の容量、QPS、およびリコール率を比較したものです。デフォルトオプションはリコール率を維持しながら、QPS とストレージ容量の両方を向上させていることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 500万 768-dim vectors | &#126; 1,800 | 90% - 95% |
| Balanced (1) | 200万 768-dim vectors | &#126; 2,800 | 91% - 97% |
| Precison-first (2) | 150万 768-dim vectors | &#126; 2,900 | 92% - 98% (↑) |

### Capacity-optimized clusters\{#capacity-optimized-clusters}

次の表は、`build_level` の導入前後における Capacity-optimized cluster の容量、QPS、およびリコール率を比較したものです。デフォルトオプションはリコール率を維持しながら、QPS とストレージ容量の両方を向上させていることがわかります。

| Build Level Option | Capacity | QPS | Recall |
| --- | --- | --- | --- |
| Capacity-first (0) | 1200万 768-dim vectors | &#126; 200 | 89% - 97% |
| Balanced (1) | 800万 768-dim vectors | &#126; 300 | 93% - 98% |
| Precision-first (2) | 500万 768-dim vectors | &#126; 350 | 94% - 98% |

### Tiered-storage clusters\{#tiered-storage-clusters}

データの大部分は S3 に保存されるため、メモリはもはや主要なボトルネックではありません。その結果、cluster の最大容量は比較的安定したままとなります。最も大きな影響を受けるのは **Recall** であり、量子化レベルの違いによってパフォーマンスにわずかな差が生じます。

- **Balanced (1):** これは現在の状態を表しており、パフォーマンスは既存のベンチマークと同等です。

- **Precision-first (2):** Build Level を上げると **Recall が約 3%～4% 向上** しますが、QPS がわずかに低下し、レイテンシが少し増加します。

- **Capacity-first (0):** この構成が使用されるケースは少ないと考えられます。メリットが限定的だからです。容量は変わらない一方で、QPS とレイテンシのわずかな改善と引き換えに **Recall が 3%～4% 低下** します。

## 制限\{#limits}

操作を開始する前に、以下の制限事項を確認してください。

- collection のインデックス作成時に、このパラメータは **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** を含む浮動小数点 vector 型のフィールドに設定する必要があります。

- 一度設定すると、このパラメータは変更できません。ただし、必要に応じてインデックスを削除し、希望する設定で新しく作成することは可能です。

- migration または backup を行うと、`build_level` の設定は削除されます。migration または復元が完了した後、必要に応じてインデックスを削除し、希望する設定で新しく作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level` を設定する必要はありません。デフォルト設定により、検索パフォーマンス、精度、ストレージ容量のバランスを取ることができます。 

Zilliz Cloud では、`build_level` をプログラムから設定することも、Zilliz Cloud コンソール上で設定することもできます。

### build_level をプログラムから設定する\{#set-buildlevel-programmatically}

`build_level` を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** などの浮動小数点型の [vector field にインデックスを作成する](./autoindex-explained) 際に行う必要があります。

次の例では、すでに collection が作成済みであることを前提としています。`build_level` を `1` に設定すると、**Balanced** オプションが適用されることを示します。

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

`build_level` をプログラムから設定する代わりに、collection を作成する際に Zilliz Cloud コンソール上で設定することもできます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象 cluster の Collection タブで **+ Create Collection** をクリックします。

1. **Create Collection** ページで、スキーマを設定します。

    vector field のデータ型が有効なオプションのいずれか、つまり **FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR** であることを確認してください。

1. **Create Index** セクションで、**Edit Index** をクリックします。

1. 表示された Edit Vector Index フィールドで、**Metric Type** と **Index Build Level** を設定できます。

