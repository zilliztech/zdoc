---
title: "QdrantからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Qdrantから移行する際に、Zilliz Cloudがデータ型マッピング、ペイロードフィールド変換、コレクション命名規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - qdrant
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';


# QdrantからZilliz Cloudへの移行

このトピックでは、[Qdrant](https://qdrant.tech/)から移行する際に、Zilliz Cloudがデータ型マッピング、ペイロードフィールド変換、コレクション命名規則をどのように処理するかについて説明します。

## 前提条件{#prerequisites}

QdrantからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください。

### Qdrantの要件{#qdrant-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースQdrantクラスターは、パブリックインターネットからアクセスできる必要があります</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>アクセス権限を持つクラスターエンドポイントとAPIキー</p></td>
   </tr>
   <tr>
     <td><p>データの可用性</p></td>
     <td><p>ソースコレクションにはデータが含まれている必要があります。空のコレクションは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloudの要件{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件について</p></th>
     <th><p>詳細はこちら</p></th>
   </tr>
   <tr>
     <td><p>ユーザーの役割</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスタ容量</p></td>
     <td><p>十分なストレージとコンピューティングリソース(<a href="https://zilliz.com/pricing#calculator">CUの計算機</a>を使用してCU体格を推定)</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用する場合は、許可リストに<a href="./zilliz-cloud-ips">Zilliz CloudのIPアドレス</a>を追加してください。</p></td>
   </tr>
</table>

## データ型マッピング{#data-type-mapping}

Qdrantのデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行を計画する上で重要です。

<table>
   <tr>
     <th><p>Qdrantフィールドタイプ</p></th>
     <th><p>Zilliz Cloudフィールドタイプ</p></th>
     <th><p>ノート</p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>VARCHAR(プライマリキー)</p></td>
     <td><p>自動的にマップされます。新しいIDを生成するためにAuto IDを有効にします(元の値は破棄されます)。</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>フロートベクトル</p></td>
     <td><p>寸法は正確に保持され、変更は必要ありません</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>浮動小数点ベクトル</p></td>
     <td><p>サンプルデータで空でない場合にのみマップされます。</p></td>
   </tr>
   <tr>
     <td><p>ペイロード</p></td>
     <td><p>JSON（動的フィールド）</p></td>
     <td><p>デフォルトで動的スキーマとしてマップされ、固定フィールドに変換できます。</p><p>詳細については、<a href="./enable-dynamic-field">ダイナミックフィールド</a>を参照してください。</p></td>
   </tr>
</table>

## ペイロードフィールド変換{#payload-field-conversion}

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、ペイロードスキーマを検出するために100行をサンプリングします。必要に応じて、追加のフィールドを手動で追加できます。</p>

</Admonition>

Qdrantのペイロードは、最大限の柔軟性を得るために、最初にZilliz Cloudの動的スキーマにマップされます。オプションで、ペイロードフィールドを固定フィールドに変換して、以下を得ることができます:

- より強力な検証のための強制データ型

- クエリのパフォーマンスを向上させるためのインデックスの最適化

- 一貫したデータ管理のための構造化スキーマ

ペイロードを固定フィールドに変換する場合:

<table>
   <tr>
     <th><p>Qdrantペイロードタイプ</p></th>
     <th><p>Zilliz固定フィールドタイプ</p></th>
     <th><p>ノート</p></th>
   </tr>
   <tr>
     <td><p>Integer型の整数</p></td>
     <td><p>INT 64</p></td>
     <td><p>直接型の変換</p></td>
   </tr>
   <tr>
     <td><p>フロート</p></td>
     <td><p>ダブル</p></td>
     <td><p>すべての浮動小数点数はDOUBLEになります</p></td>
   </tr>
   <tr>
     <td><p>Bool</p></td>
     <td><p>BOOL</p></td>
     <td><p>ダイレクトマッピング</p></td>
   </tr>
   <tr>
     <td><p>キーワード</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,53 5バイトをサポート</p></td>
   </tr>
   <tr>
     <td><p>ジオ</p></td>
     <td><p>JSON</p></td>
     <td><p>JSON構造として保存されます。固定フィールドに変換できません</p></td>
   </tr>
   <tr>
     <td><p>Datetimeファイル</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,53 5バイトをサポート</p></td>
   </tr>
   <tr>
     <td><p>UUID</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,53 5バイトをサポート</p></td>
   </tr>
</table>

### 配列型のサポート{#array-type-support}

配列タイプは既存のペイロードデータで検出されず、動的フィールドから変換することはできません。ただし、ほとんどの配列タイプは、移行構成中に新しいフィールドとして手動で追加できます

<table>
   <tr>
     <th><p>Qdrant配列タイプ</p></th>
     <th><p>Zilliz Cloudアレイタイプ</p></th>
     <th><p>手動で追加可能</p></th>
   </tr>
   <tr>
     <td><p>アレイ<integer></integer></p></td>
     <td><p>アレイ<int64></int64></p></td>
     <td><p>✅ 新しいフィールドとして追加できます</p></td>
   </tr>
   <tr>
     <td><p>アレイ<float></float></p></td>
     <td><p>アレイ<double></double></p></td>
     <td><p>✅ 新しいフィールドとして追加できます</p></td>
   </tr>
   <tr>
     <td><p>アレイ<bool></bool></p></td>
     <td><p>アレイ<bool></bool></p></td>
     <td><p>✅ 新しいフィールドとして追加できます</p></td>
   </tr>
   <tr>
     <td><p>アレイ<keyword></keyword></p></td>
     <td><p>アレイ<varchar></varchar></p></td>
     <td><p>✅ 新しいフィールドとして追加できます</p></td>
   </tr>
   <tr>
     <td><p>アレイ<geo></geo></p></td>
     <td><p>サポートされていない</p></td>
     <td><p>❌ 利用できません</p></td>
   </tr>
   <tr>
     <td><p>アレイ<datetime></datetime></p></td>
     <td><p>アレイ<varchar></varchar></p></td>
     <td><p>✅ 新しいフィールドとして追加できます</p></td>
   </tr>
   <tr>
     <td><p>アレイ<uuid></uuid></p></td>
     <td><p>アレイ<varchar></varchar></p></td>
     <td><p>✅ 新しいフィールドとして追加できます</p></td>
   </tr>
</table>

固定フィールドに変換されたペイロードフィールドについては、追加の属性を構成できます

- **Nullable**:フィールドがnull値を受け入れることができるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[Nullableな属性](./nullable-and-default#nullable-attribute)を参照してください。

- **デフォルト値**:データがない場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-and-default#default-values)を参照してください。

- **パーティションキー**:オプションで、パーティションキーとしてINT64またはVARCHARフィールドを指定できます。各コレクションは1つのパーティションキーのみをサポートしており、選択されたフィールドはnullにできません。詳細については、[パーティションキーを使う](./use-partition-key)を参照してください。

## Qdrant固有の処理ルール{#qdrant-specific-handling-rules}

### コレクションの命名規則{#collection-naming-rules}

以下の考慮事項を考慮して、Qdrantコレクション名がZilliz Cloudに転送されます。

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>インパクト</p></th>
     <th><p>ソリューション</p></th>
   </tr>
   <tr>
     <td><p>名前の衝突</p></td>
     <td><p>データベースに同じ名前のコレクションがすでに存在する場合、移行ジョブを送信できません</p></td>
     <td><p>移行構成中に既存のコレクションを削除したり、別のターゲットデータベースを選択したり、名前を変更したりします</p></td>
   </tr>
   <tr>
     <td><p>特殊キャラクター</p></td>
     <td><p>コレクション名はQdrantからそのまま保存されます。</p></td>
     <td><p>コレクション名がZilliz Cloudの命名規則に準拠していることを確認する</p></td>
   </tr>
</table>
