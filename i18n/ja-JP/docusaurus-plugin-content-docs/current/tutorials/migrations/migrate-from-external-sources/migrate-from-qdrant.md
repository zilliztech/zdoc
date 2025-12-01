---
title: "QdrantからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-qdrant
sidebar_label: "Qdrant"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz CloudがQdrantからの移行時にデータ型マッピング、ペーロロードフィールド変換、およびコレクション名付け規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: LqMIw1DXyiHUjAk9TEAcqHp6nDd
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - migrations
  - qdrant
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


# QdrantからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudが[Qdrant](https://qdrant.tech/)からの移行時にデータ型マッピング、ペーロロードフィールド変換、およびコレクション名付け規則をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

QdrantからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください：

### Qdrantの要件\{#qdrant-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ソースQdrantクラスターがパプリックインターネットからアクセス可能であること</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>アクセス権限を持つクラスターエンドポイントおよびAPIキー</p></td>
   </tr>
   <tr>
     <td><p>データ可用性</p></td>
     <td><p>ソースコレクションにはデータが含まれている必要があります。空のコレクションは移行できません。</p></td>
   </tr>
</table>

### Zilliz Cloudの要件\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ユーザーロール</p></td>
     <td><p>組織オーナーまたはプロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスターキャパシティ</p></td>
     <td><p>十分なストレージおよびコンピュートリソース（必要CUサイズの見積もりには<a href="https://zilliz.com/pricing#calculator">CU計算機</a>を使用してください）</p></td>
   </tr>
   <tr>
     <td><p>ネットワークアクセス</p></td>
     <td><p>ネットワーク制限を使用している場合は、<a href="./zilliz-cloud-ips">Zilliz Cloud IP</a>を許可リストに追加してください</p></td>
   </tr>
</table>

## データ型マッピング\{#data-type-mapping}

Qdrantのデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行計画にとって極めて重要です：

<table>
   <tr>
     <th><p>Qdrantフィールドタイプ</p></th>
     <th><p>Zilliz Cloudフィールドタイプ</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p>プライマリキー</p></td>
     <td><p>VARCHAR（プライマリキー）</p></td>
     <td><p>自動的にマッピングされます。自動IDを有効にして新しいIDを生成できます（元の値は破棄されます）。</p></td>
   </tr>
   <tr>
     <td><p>密度ベクター</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>次元数は正確に保持され、修正は必要ありません</p></td>
   </tr>
   <tr>
     <td><p>スパースベクター</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
     <td><p>サンプルデータが空でない場合にのみマッピングされます。</p></td>
   </tr>
   <tr>
     <td><p>ペーロロード</p></td>
     <td><p>JSON（動的フィールド）</p></td>
     <td><p>デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換できます。</p><p>詳細については、<a href="./enable-dynamic-field">動的フィールド</a>を参照してください。</p></td>
   </tr>
</table>

## ペーロロードフィールド変換\{#payload-field-conversion}

<Admonition type="info" icon="📘" title="注意">

<p>Zilliz Cloudはペーロロードスキーマを検出するために100行をサンプリングします。必要に応じて手動で追加フィールドを追加できます。</p>

</Admonition>

Qdrantペーロロードは、最大限の柔軟性を確保するためにZilliz Cloudの動的スキーマに最初はマッピングされます。オプションでペーロロードフィールドを固定フィールドに変換して、以下を得ることができます：

- より強い検証のための強制データ型

- より良いクエリパフォーマンスのための最適化されたインデックス

- 一貫したデータ管理のための構造化スキーマ

ペーロロードを固定フィールドに変換する場合：

<table>
   <tr>
     <th><p>Qdrantペーロロード型</p></th>
     <th><p>Zilliz固定フィールド型</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p>整数</p></td>
     <td><p>INT64</p></td>
     <td><p>直接型変換</p></td>
   </tr>
   <tr>
     <td><p>浮動小数点</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>すべての浮動小数点数がDOUBLEになります</p></td>
   </tr>
   <tr>
     <td><p>ブール</p></td>
     <td><p>BOOL</p></td>
     <td><p>直接マッピング</p></td>
   </tr>
   <tr>
     <td><p>キーワード</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,535バイト対応</p></td>
   </tr>
   <tr>
     <td><p>地理情報</p></td>
     <td><p>JSON</p></td>
     <td><p>JSON構造として保持されます。固定フィールドに変換できません</p></td>
   </tr>
   <tr>
     <td><p>日時</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,535バイト対応</p></td>
   </tr>
   <tr>
     <td><p>UUID</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,535バイト対応</p></td>
   </tr>
</table>

### 配列型サポート\{#array-type-support}

配列型は既存のペーロロードデータでは検出されず、動的フィールドからの変換はできません。ただし、移行構成中に手動で新しいフィールドとして追加できる場合がほとんどです：

<table>
   <tr>
     <th><p>Qdrant配列型</p></th>
     <th><p>Zilliz Cloud配列型</p></th>
     <th><p>手動追加可能</p></th>
   </tr>
   <tr>
     <td><p>配列\<Int64></p></td>
     <td><p>ARRAY\<INT64></p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列\<FLOAT></p></td>
     <td><p>ARRAY\<DOUBLE></p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列\<BOOL></p></td>
     <td><p>ARRAY\<BOOL></p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列\<VARCHAR></p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列\<Geo></p></td>
     <td><p>サポートされていません</p></td>
     <td><p>❌ 利用不可</p></td>
   </tr>
   <tr>
     <td><p>配列\<Datetime></p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
   <tr>
     <td><p>配列\<UUID></p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>✅ 新しいフィールドとして追加可能</p></td>
   </tr>
</table>

固定フィールドに変換されたペーロロードフィールドについては、追加の属性を構成できます：

- **NULL可能**: フィールドがNULL値を受け入れるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[NULL属性](./nullable-and-default#nullable-attribute)を参照してください。

- **デフォルト値**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-and-default#default-values)を参照してください。

- **パーティションキー**: オプションでINT64またはVARCHARフィールドをパーティションキーとして指定できます。各コレクションは1つのパーティションキーのみをサポートし、選択されたフィールドはNULL不可でなければならないことに注意してください。詳細については、[パーティションキーを使用](./use-partition-key)を参照してください。

## Qdrant固有の処理ルール\{#qdrant-specific-handling-rules}

### コレクション名付けルール\{#collection-naming-rules}

Qdrantコレクション名は、以下の考慮事項でZilliz Cloudに転送されます：

<table>
   <tr>
     <th><p>シナリオ</p></th>
     <th><p>影響</p></th>
     <th><p>解決策</p></th>
   </tr>
   <tr>
     <td><p>命名競合</p></td>
     <td><p>データベースに同じ名前のコレクションが既に存在する場合、移行ジョブを送信できません</p></td>
     <td><p>既存のコレクションを削除、異なるターゲットデータベースを選択、または移行構成中に名前を変更してください</p></td>
   </tr>
   <tr>
     <td><p>特殊文字</p></td>
     <td><p>コレクション名はQdrantからそのまま保持されます</p></td>
     <td><p>コレクション名がZilliz Cloudの命名規則に準拠していることを確認してください</p></td>
   </tr>
</table>

