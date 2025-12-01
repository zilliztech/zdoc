---
title: "インデックス構築レベルの調整 | BYOC"
slug: /tune-index-build-level
sidebar_label: "インデックス構築レベルの調整"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは`build_level`と呼ばれるパラメータを導入し、ターゲットコレクションのストレージ容量と検索再現率のバランスを取れるようにします。使用頻度が低いまたは追加のストレージ領域が必要なコレクションでは、再現率のわずかな低下と引き換えにストレージ容量を大幅に増やすことができます。逆もまた然りです。このガイドでは利用可能なオプションとコレクション用のインデックス構築方法について説明します。| BYOC"
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
  - RAG LLMアーキテクチャ
  - プライベートLLM
  - 近似近傍検索
  - LLM評価

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# インデックス構築レベルの調整

Zilliz Cloudは`build_level`と呼ばれるパラメータを導入し、ターゲットコレクションのストレージ容量と検索再現率のバランスを取れるようにします。使用頻度が低いまたは追加のストレージ領域が必要なコレクションでは、再現率のわずかな低下と引き換えにストレージ容量を大幅に増やすことができます。逆もまた然りです。このガイドでは利用可能なオプションとコレクション用のインデックス構築方法について説明します。

<Admonition type="info" icon="📘" title="備考">

<p>この機能は現在<strong>パブリックレビュー中</strong>であり、以下の条件を満たす専用クラスターにのみ適用されます。</p>
<ul>
<li><p>クラスターが<strong>パフォーマンス最適化</strong>または<strong>容量最適化</strong>タイプの場合、および</p></li>
<li><p>クラスターが<strong>Milvus v2.6.x</strong>と互換性がある場合。</p></li>
</ul>
<p>クラスターをアップグレードしてこの機能をテストできます。さらに説明が必要な場合は<a href="https://support.zilliz.com/hc/en-us/requests/new">お問い合わせください</a>。</p>

</Admonition>

## 概要\{#overview}

異なるタイプのZilliz Cloudクラスターは、主張されているストレージ容量が大きく異なります。パフォーマンス最適化クラスター内のコレクションが使用頻度が低い、または追加のストレージを必要とする場合は、コレクション内の浮動小数ベクトル型（**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**など）のインデックスを作成する際、`build_level`を容量優先オプションに設定することを検討してください。これにより再現率がわずかに低下する可能性がありますが、ストレージ容量を**30%**から**40%**増加させることができます。

`build_level`パラメータには3つのオプションがあります：**精度優先** (2)、**バランス** (1)、および**容量優先** (0)。

- **バランス** (1)

    これはデフォルトオプションで、ほとんどのシナリオにおいて検索精度とストレージ容量をバランスよく調整します。

- **精度優先** (2)

    このオプションは検索パフォーマンスと高再現率を優先し、高精度が必要なコレクションに適しています。

- **容量優先** (0)

    このオプションはストレージ容量を重視し、追加のストレージ領域が必要なコレクションに最適です。

内部のベンチマークテストでは、デフォルトオプションがすべてのクラスタータイプに関係なくストレージ容量を増加させることが示されています。パフォーマンス最適化クラスターの場合、デフォルトオプションはストレージ容量を**60%**、パフォーマンス（QPS）を**17%**向上させます。

### パフォーマンス最適化クラスター\{#performance-optimized-clusters}

以下の表は、`build_level`導入前後のパフォーマンス最適化クラスターの容量、QPS、再現率を比較しています。デフォルトオプションは再現率を維持し、QPSとストレージ容量の両方を増加させていることがわかります。

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
     <td><p>~3,000</p></td>
     <td><p>91% - 97%</p></td>
   </tr>
   <tr>
     <td><p>容量優先 (0)</p></td>
     <td><p><strong>525万個の768次元ベクトル (↑250%)</strong></p></td>
     <td><p>~2,850 (↓~5%)</p></td>
     <td><p>90% - 95%</p></td>
   </tr>
   <tr>
     <td><p><strong>バランス (1)</strong></p></td>
     <td><p><strong>240万個の768次元ベクトル (↑60%)</strong></p></td>
     <td><p><strong>~3,500 (↑17%)</strong></p></td>
     <td><p>91% - 97%</p></td>
   </tr>
   <tr>
     <td><p>精度優先 (2)</p></td>
     <td><p>150万個の768次元ベクトル</p></td>
     <td><p>~3,000</p></td>
     <td><p><strong>92% - 98% (↑)</strong></p></td>
   </tr>
</table>

### 容量最適化クラスター\{#capacity-optimized-clusters}

以下の表は、`build_level`導入前後の容量最適化クラスターの容量、QPS、再現率を比較しています。デフォルトオプションは再現率を維持し、QPSとストレージ容量の両方を増加させていることがわかります。

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
     <td><p>~340</p></td>
     <td><p>93% - 98%</p></td>
   </tr>
   <tr>
     <td><p>容量優先 (0)</p></td>
     <td><p><strong>1000万個の768次元ベクトル (↑100%)</strong></p></td>
     <td><p>~300</p></td>
     <td><p>89% - 97%</p></td>
   </tr>
   <tr>
     <td><p><strong>バランス (1)</strong></p></td>
     <td><p><strong>750万個の768次元ベクトル (↑50%)</strong></p></td>
     <td><p><strong>~350 (↑3%)</strong></p></td>
     <td><p>92% - 97%</p></td>
   </tr>
   <tr>
     <td><p>精度優先 (2)</p></td>
     <td><p>500万個の768次元ベクトル</p></td>
     <td><p>~345</p></td>
     <td><p><strong>94% - 98% (↑)</strong></p></td>
   </tr>
</table>

## 制限事項\{#limits}

操作を開始する前に、以下の制限事項を確認してください：

- パフォーマンス最適化または容量最適化タイプのMilvus 2.6.x互換専用クラスターのみがこの設定を許可します。

- コレクションのインデックス作成時に、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**を含む浮動小数ベクトル型のベクトルフィールドにこのパラメータを設定する必要があります。

- 一度設定すると、このパラメータは変更できません。ただし、必要に応じてインデックスを削除し、目的の設定で別のインデックスを作成できます。

- マイグレーションまたはバックアップにより`build_level`設定は削除されます。マイグレーションまたは復元が完了した後、必要に応じてインデックスを削除し、目的の設定で別のインデックスを作成できます。

## 手順\{#procedure}

ほとんどの場合、`build_level`を設定する必要はありません。デフォルト設定により、検索パフォーマンス、精度、ストレージ容量のバランスが保たれます。

Zilliz Cloudでは、`build_level`をプログラム的に設定するか、Zilliz Cloudコンソールで設定できます。

### プログラム的にbuild_levelを設定\{#set-buildlevel-programmatically}

`build_level`を設定するには、**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**などの浮動小数型の[ベクトルフィールドにインデックスをかける](./index-vector-fields#index-a-collection)際に設定する必要があります。

以下の例では、[準備](./index-vector-fields#preparations)のステップが完了していると仮定します。`build_level`を`1`に設定することは、**バランス**オプションが適用されることを示しています。

```python
# 4. インデックスを設定
# 4.1. インデックスパラメータを設定
index_params = MilvusClient.prepare_index_params()

# 4.2. ベクトルフィールドにインデックスを追加
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

プログラムで`build_level`を設定する代わりに、Zilliz Cloudコンソールでコレクションを作成する際に設定することもできます。

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. ターゲットクラスターのコレクションタブで**+ コレクションの作成**をクリックします。

1. **コレクションの作成**ページで、スキーマを設定します。

    ベクトルフィールドのデータ型が有効なオプションのいずれかであることを確認してください：**FLOAT_VECTOR**、**FLOAT16_VECTOR**、および**BFLOAT16_VECTOR**。

1. **インデックスを作成**セクションで、**インデックスを編集**をクリックします。

1. 表示されるベクトルインデックス編集フィールドで、**メトリックタイプ**と**インデックス構築レベル**を設定できます。
