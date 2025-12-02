---
title: "インデックス構築レベルの調整 | Cloud"
slug: /tune-index-build-level
sidebar_label: "インデックス構築レベルの調整"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは`buildlevel`というパラメータを導入しており、これによりユーザーは対象コレクションのストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低いまたはより多くのストレージ容量が必要なコレクションでは、ストレージ容量の大幅な増加と引き換えにわずかな再現率の低下を許容できます。逆も同様です。このガイドでは、使用可能なオプションとコレクション用にインデックスを構築するためにそれらを使用する方法について説明します。 | Cloud"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - vector field
  - index
  - index build level
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# インデックス構築レベルの調整

Zilliz Cloudは`build_level`というパラメータを導入しており、これによりユーザーは対象コレクションのストレージ容量と検索再現率のバランスを取ることができます。使用頻度が低いまたはより多くのストレージ容量が必要なコレクションでは、ストレージ容量の大幅な増加と引き換えにわずかな再現率の低下を許容できます。逆も同様です。このガイドでは、使用可能なオプションとコレクション用にインデックスを構築するためにそれらを使用する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は現在<strong>パブリックレビュー</strong>中であり、以下の条件に該当する専用クラスターにのみ適用されます。</p>
<ul>
<li><p>クラスターが<strong>パフォーマンス最適化</strong>または<strong>容量最適化</strong>のいずれかのタイプであること、および</p></li>
<li><p>クラスターが<strong>Milvus v2.6.x</strong>と互換性を持っていること。</p></li>
</ul>
<p>この機能をテストするにはクラスターをアップグレードできます。さらに説明が必要な場合は<a href="https://support.zilliz.com/hc/en-us/requests/new">お問い合わせください</a>。</p>

</Admonition>

## 概要\{#overview}

Zilliz Cloudの異なるタイプのクラスターは、宣言されたストレージ容量において著しく異なります。パフォーマンス最適化クラスターのコレクションが使用頻度が低い場合や追加のストレージ容量が必要な場合は、コレクション内の**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**などの浮動小数ベクトル型のベクトルフィールドにインデックスを作成する際に、`build_level`を容量優先オプションに設定することを検討してください。これにより再現率がわずかに低下する可能性がありますが、ストレージ容量を**30%**から**40%**増加させることができます。

`build_level`パラメータには以下の3つのオプションがあります：**精度優先**（2）、**バランス型**（1）、および**容量優先**（0）。

- **バランス型**（1）

    これはデフォルトのオプションであり、ほとんどのシナリオにおいて検索精度とストレージ容量のバランスをとります。

- **精度優先**（2）

    このオプションは検索パフォーマンスと高再現率を優先し、高い精度が必要なコレクションに適しています。

- **容量優先**（0）

    このオプションはストレージ容量を重視し、追加のストレージ容量が必要なコレクションに最適です。

内部ベンチマークテストで示されたように、デフォルトオプションはクラスターのタイプに関係なくストレージ容量を増加させます。パフォーマンス最適化クラスターの場合、デフォルトオプションはストレージ容量を**60%**、パフォーマンス（QPS）を**17%**向上させます。

### パフォーマンス最適化クラスター\{#performance-optimized-clusters}

以下の表は、`build_level`導入前と導入後のパフォーマンス最適化クラスターの容量、QPS、および再現率を比較しています。デフォルトオプションは再現率を維持し、QPSとストレージ容量の両方を増加させていることがわかります。

<table>
   <tr>
     <th><p>構築レベルオプション</p></th>
     <th><p>容量</p></th>
     <th><p>QPS</p></th>
     <th><p>再現率</p></th>
   </tr>
   <tr>
     <td><p><code>build_level</code>導入前（ベースライン）</p></td>
     <td><p>150万個の768次元ベクトル</p></td>
     <td><p>~ 3,000</p></td>
     <td><p>91% - 97%</p></td>
   </tr>
   <tr>
     <td><p>容量優先（0）</p></td>
     <td><p><strong>525万個の768次元ベクトル（↑ 250%）</strong></p></td>
     <td><p>~ 2,850（↓ ~5%）</p></td>
     <td><p>90% - 95%</p></td>
   </tr>
   <tr>
     <td><p><strong>バランス型（1）</strong></p></td>
     <td><p><strong>240万個の768次元ベクトル（↑ 60%）</strong></p></td>
     <td><p><strong>~ 3,500（↑ 17%）</strong></p></td>
     <td><p>91% - 97%</p></td>
   </tr>
   <tr>
     <td><p>精度優先（2）</p></td>
     <td><p>150万個の768次元ベクトル</p></td>
     <td><p>~ 3,000</p></td>
     <td><p><strong>92% - 98%（↑）</strong></p></td>
   </tr>
</table>

### 容量最適化クラスター\{#capacity-optimized-clusters}

以下の表は、`build_level`導入前と導入後の容量最適化クラスターの容量、QPS、および再現率を比較しています。デフォルトオプションは再現率を維持し、QPSとストレージ容量の両方を増加させていることがわかります。

<table>
   <tr>
     <th><p>構築レベルオプション</p></th>
     <th><p>容量</p></th>
     <th><p>QPS</p></th>
     <th><p>再現率</p></th>
   </tr>
   <tr>
     <td><p><code>build_level</code>導入前（ベースライン）</p></td>
     <td><p>500万個の768次元ベクトル</p></td>
     <td><p>~ 340</p></td>
     <td><p>93% - 98%</p></td>
   </tr>
   <tr>
     <td><p>容量優先（0）</p></td>
     <td><p><strong>1000万個の768次元ベクトル（↑ 100%）</strong></p></td>
     <td><p>~ 300</p></td>
     <td><p>89% - 97%</p></td>
   </tr>
   <tr>
     <td><p><strong>バランス型（1）</strong></p></td>
     <td><p><strong>750万個の768次元ベクトル（↑ 50%）</strong></p></td>
     <td><p><strong>~ 350（↑ 3%）</strong></p></td>
     <td><p>92% - 97%</p></td>
   </tr>
   <tr>
     <td><p>精度優先（2）</p></td>
     <td><p>500万個の768次元ベクトル</p></td>
     <td><p>~ 345</p></td>
     <td><p><strong>94% - 98%（↑）</strong></p></td>
   </tr>
</table>

## 制限事項\{#limits}

操作を開始する前に、以下の制限事項をよく理解してください。

- パフォーマンス最適化または容量最適化のいずれかのタイプのMilvus 2.6.x互換専用クラスターのみがこの設定を許可します。

- コレクションにインデックスを作成する際、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**を含む浮動小数ベクトル型のベクトルフィールドにこのパラメータを設定する必要があります。

- 一度設定すると、このパラメータは変更できません。ただし、必要に応じてインデックスを削除し、望ましい設定で別のインデックスを作成できます。

- 移行またはバックアップでは`build_level`設定が削除されます。移行または復元が完了した後、必要に応じてインデックスを削除し、望ましい設定で別のインデックスを作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level`を設定する必要はありません。デフォルト設定により、検索パフォーマンス、精度、およびストレージ容量のバランスをとることができます。

Zilliz Cloudでは、`build_level`をプログラムで設定するか、Zilliz Cloudコンソールで設定できます。

### プログラムでbuild_levelを設定\{#set-buildlevel-programmatically}

`build_level`を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**などの浮動小数型の[ベクトルフィールドにインデックスを作成する](./index-vector-fields#index-a-collection)際に設定する必要があります。

以下の例では、[準備](./index-vector-fields#preparations)の手順を完了していると想定しています。`build_level`を`1`に設定すると、**バランス型**オプションが適用されます。

```python
# 4. インデックスを設定
# 4.1. インデックスパラメータを設定
index_params = MilvusClient.prepare_index_params()

# 4.2. ベクトルフィールドにインデックスを追加。
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX",
    index_name="vector_index",
    # highlight-next-line
    build_level=1
)

# 4.4. インデックスファイルを作成
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 5. インデックスを説明
res = client.list_indexes(
    collection_name="customized_setup"
)
```

### Zilliz Cloudコンソールでbuild_levelを設定\{#set-buildlevel-on-the-zilliz-cloud-console}

`build_level`をプログラムで設定する代わりに、Zilliz Cloudコンソールでコレクションを作成する際に設定することもできます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. 対象クラスターのコレクションタブで**+ コレクションの作成**をクリックします。

1. **コレクションの作成**ページで、スキーマを設定します。

    ベクトルフィールドのデータ型が有効なオプションのいずれかであることを確認します：**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**。

1. **インデックスの作成**セクションで、**インデックスの編集**をクリックします。

1. 表示されるベクトルインデックス編集フィールドで、**メトリックタイプ**および**インデックス構築レベル**を設定できます。