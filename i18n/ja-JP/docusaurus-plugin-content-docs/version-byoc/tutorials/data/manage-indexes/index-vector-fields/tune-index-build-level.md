---
title: "インデックス構築レベルの調整 | BYOC"
slug: /tune-index-build-level
sidebar_key: tune-index-build-level
sidebar_label: "構築レベルの調整"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、対象コレクションのストレージ容量と検索再現率のバランスを調整できる `buildlevel` というパラメータを導入しています。使用頻度が低いコレクションや、より多くのストレージスペースが必要なコレクションでは、わずかな再現率の低下と引き換えにストレージ容量を大幅に増やすことができ、その逆も可能です。このガイドでは、利用可能なオプションと、コレクションのインデックス構築にそれらを使用する方法について説明します。| BYOC"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - ベクトルフィールド
  - インデックス
  - インデックス構築レベル

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# インデックスビルドレベルの調整

Zilliz Cloud では、ターゲットコレクションのストレージ容量と検索再現率のバランスを調整できる `build_level` というパラメーターを導入しました。使用頻度が低いコレクションや、より多くのストレージスペースが必要なコレクションでは、わずかな再現率の低下と引き換えにストレージ容量を大幅に増やすことができ、その逆も可能です。このガイドでは、利用可能なオプションと、コレクションのインデックス構築にそれらを使用する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は現在<strong>PUBLIC REVIEW</strong>段階であり、以下の条件を満たす 専用クラスター にのみ適用されます：</p>
<ul>
<li><p>クラスターが<strong>パフォーマンス最適化済み</strong>、<strong>容量最適化済み</strong>、および<strong>Tiered-storage</strong>タイプであり、かつ</p></li>
<li><p>クラスターが<strong>Milvus v2.6.x</strong>と互換性があること。</p></li>
</ul>
<p>この機能をテストするためにクラスターをアップグレードでき、不明な点があればお問い合わせください。</p>

</Admonition>

## 概要\{#overview}

不同类型的 Zilliz Cloud クラスターは、公表されているストレージ容量が大きく異なります。パフォーマンス クラスター内のコレクションの使用頻度が低い場合、または追加のストレージが必要な場合は、コレクション内の**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR**などの浮動小数点ベクトルタイプの ベクトルフィールド のインデックスを作成する際に、`build_level` を容量優先オプションに設定することを検討してください。これにより再現率がわずかに低下する可能性がありますが、ストレージ容量を**30%**から**40%**増加させることができます。

`build_level` パラメーターには、**精度優先** (2)、**バランス** (1)、**容量優先** (0) の 3 つのオプションがあります。

- **バランス** (1)

    これはデフォルトのオプションであり、ほとんどのシナリオにおいて検索精度とストレージ容量のバランスを取ります。

- **精度優先** (2)

    このオプションは検索パフォーマンスと高い再現率を優先し、高精度を必要とするコレクションに適しています。

- **容量優先** (0)

    このオプションはストレージ容量を重視し、追加のストレージスペースを必要とするコレクションに最適です。

内部ベンチマークテストで示されているように、デフォルトのオプションはクラスターのタイプに関係なく、すべてのクラスターのストレージ容量を増加させます。パフォーマンス最適化済み クラスターでは、デフォルトのオプションによりストレージ容量が**60%**増加し、パフォーマンス（QPS）が**17%**向上します。

### パフォーマンス最適化済み clusters\{#performance-optimized-clusters}

以下の表は、`build_level` 導入前後の パフォーマンス最適化済み クラスターの容量、QPS、再現率を比較したものです。デフォルトのオプションは再現率を維持しつつ、QPS とストレージ容量の両方を増加させることがわかります。

<table>
   <tr>
     <th><p>ビルドレベルオプション</p></th>
     <th><p>容量</p></th>
     <th><p>QPS</p></th>
     <th><p>再現率</p></th>
   </tr>
   <tr>
     <td><p>容量優先 (0)</p></td>
     <td><p>210 万個の 768 次元ベクトル</p></td>
     <td><p>約 2,850</p></td>
     <td><p>90% - 95%</p></td>
   </tr>
   <tr>
     <td><p>バランス (1)</p></td>
     <td><p>150 万個の 768 次元ベクトル</p></td>
     <td><p>約 3,500</p></td>
     <td><p>91% - 97%</p></td>
   </tr>
   <tr>
     <td><p>Precison-first (2)</p></td>
     <td><p>100 万個の 768 次元ベクトル</p></td>
     <td><p>約 3,000</p></td>
     <td><p>92% - 98% (↑)</p></td>
   </tr>
</table>

### 容量最適化済み clusters\{#capacity-optimized-clusters}

以下の表は、`build_level` 導入前後の 容量最適化済み クラスターの容量、QPS、再現率を比較したものです。デフォルトのオプションは再現率を維持しつつ、QPS とストレージ容量の両方を増加させることがわかります。

<table>
   <tr>
     <th><p>ビルドレベルオプション</p></th>
     <th><p>容量</p></th>
     <th><p>QPS</p></th>
     <th><p>再現率</p></th>
   </tr>
   <tr>
     <td><p>容量優先 (0)</p></td>
     <td><p>700 万個の 768 次元ベクトル</p></td>
     <td><p>約 300</p></td>
     <td><p>89% - 97%</p></td>
   </tr>
   <tr>
     <td><p>バランス (1)</p></td>
     <td><p>500 万個の 768 次元ベクトル</p></td>
     <td><p>約 350</p></td>
     <td><p>93% - 98%</p></td>
   </tr>
   <tr>
     <td><p>精度優先 (2)</p></td>
     <td><p>300 万個の 768 次元ベクトル</p></td>
     <td><p>約 345</p></td>
     <td><p>94% - 98%</p></td>
   </tr>
</table>

### Tiered-storage clusters\{#tiered-storage-clusters}

データの大部分が S3 に保存されるため、メモリはもはや主なボトルネックではありません。その結果、クラスターの最大容量は比較的安定したままとなり、最も顕著な影響は**再現率**に現れ、異なる量子化レベルによるパフォーマンスのわずかな変動が生じます。

- **バランス (1):** これは現在の状態を表しており、パフォーマンスは既存のベンチマークと一致したままです。

- **精度優先 (2):** ビルドレベルを上げると、**再現率が約 3%～4% 向上**しますが、QPS がわずかに低下し、レイテンシが小幅に増加します。

- **容量優先 (0):** 利点が最小限であるため、この構成は稀になると予想されます。容量は変化しないまま、**再現率が 3%～4% 低下**する代わりに、QPS とレイテンシがわずかに改善されます。

## 制限\{#limits}

操作を開始する前に、以下の制限事項を確認してください：

- この設定を許可するのは、パフォーマンス最適化済み または 容量最適化済み タイプの Milvus 2.6.x 互換 専用クラスターs のみです。

- コレクションをインデックス化する際、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR**を含む浮動小数点ベクトルタイプの vector field でこのパラメーターを設定する必要があります。

- 一度設定すると、このパラメーターは変更できません。ただし、必要に応じてインデックスを削除し、希望する設定で再度作成することは可能です。

- 移行またはバックアップを行うと、`build_level` 設定は削除されます。移行または復元が完了した後、必要に応じてインデックスを削除し、希望する設定で再度作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level` を設定する必要はありません。デフォルト設定により、検索パフォーマンス、精度、ストレージ容量のバランスを取ることができます。

Zilliz Cloud では、プログラム経由または Zilliz Cloud コンソール上で `build_level` を設定できます。

### プログラムで build_level を設定する\{#set-buildlevel-programmatically}

`build_level` を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR**などの浮動小数点タイプの [ベクトルフィールドのインデックス作成](./index-vector-fields#index-a-collection) 時に行う必要があります。

以下の例では、[準備](./index-vector-fields#preparations) のステップが完了していることを前提としています。`build_level` を `1` に設定することは、**バランス** オプションが適用されることを示します。

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

`build_level` をプログラムで設定する代わりに、コレクション作成時に Zilliz Cloud コンソール上で設定することもできます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象クラスターの **Collection** タブで、**+ Create Collection** をクリックします。

1. **Create Collection** ページでスキーマを設定します。

    ベクトルフィールドのデータ型が、有効なオプション（**FLOAT_VECTOR**、**FLOAT16_VECTOR**、**BFLOAT16_VECTOR**）のいずれかであることを確認してください。

1. **Create Index** セクションで、**Edit Index** をクリックします。

1. 表示された **Edit Vector Index** フィールドで、**メトリックタイプ** と **Index Build Level** を設定できます。

