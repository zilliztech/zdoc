---
title: "PineconeからZilliz Cloudへの移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz CloudがPineconeからの移行時にデータ型マッピング、フィールド変換、名前空間処理、およびコレクション名付け規則をどのように処理するかについて説明します。 | Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 移行
  - pinecone
  - ベクターインデックス
  - オープンソースベクターデータベース
  - オープンソースベクターデータベース
  - ベクターデータベースの例

---

import Admonition from '@theme/Admonition';


# PineconeからZilliz Cloudへの移行

このトピックでは、Zilliz Cloudが[Pinecone](https://www.pinecone.io/)からの移行時にデータ型マッピング、フィールド変換、名前空間処理、およびコレクション名付け規則をどのように処理するかについて説明します。

## 前提条件\{#prerequisites}

PineconeからZilliz Cloudへの移行を開始する前に、以下の要件を満たしていることを確認してください：

### Pineconeの要件\{#pinecone-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>インデックスタイプ</p></td>
     <td><p>Pineconeサーバーレスインデックスからの移行のみサポート</p></td>
   </tr>
   <tr>
     <td><p>APIアクセス</p></td>
     <td><p>アクセス権限を持つPinecone APIキー</p></td>
   </tr>
   <tr>
     <td><p>データ可用性</p></td>
     <td><p>Pineconeからのソースインデックスにはデータが含まれている必要があります。空のインデックスは移行できません。</p></td>
   </tr>
   <tr>
     <td><p>ベクター次元</p></td>
     <td><p>次元は1より大きくなければなりません。1次元のベクターは移行の失敗を引き起こします</p></td>
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

Pineconeのデータ型がZilliz Cloudにどのようにマッピングされるかを理解することは、移行計画にとって極めて重要です：

<table>
   <tr>
     <th><p>Pineconeフィールドタイプ</p></th>
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
     <td><p>メタデータ</p></td>
     <td><p>動的フィールド</p></td>
     <td><p>デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換できます。</p><p>詳細は<a href="./enable-dynamic-field">動的フィールド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>名前空間</p></td>
     <td><p>パーティションキー / パーティション</p></td>
     <td><p>パフォーマンス最適化に推奨されます。</p><p>詳細については<a href="./migrate-from-pinecone#namespace-processing">名前空間処理</a>を参照してください。</p></td>
   </tr>
</table>

## メターデータフィールド変換\{#metadata-field-conversion}

<Admonition type="info" icon="📘" title="注意">

<p>Zilliz Cloudはメタデータスキーマを検出するために100行をサンプリングします。必要に応じて手動で追加フィールドを追加できます。</p>

</Admonition>

Pineconeのメタデータは、最大限の柔軟性を確保するためにZilliz Cloudの動的スキーマに最初はマッピングされます。メタデータフィールドを固定フィールドに変換して、以下を得ることが可能です：

- 強い検証のための強制データ型

- より良いクエリパフォーマンスのための最適化されたインデックス

- 一貫したデータ管理のための構造化スキーマ

メタデータを固定フィールドに変換する場合：

<table>
   <tr>
     <th><p>Pineconeメタデータ型</p></th>
     <th><p>Zilliz固定フィールド型</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p>文字列</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大65,535バイト対応</p></td>
   </tr>
   <tr>
     <td><p>数値（int/float）</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>すべての数値型はDOUBLEになります</p></td>
   </tr>
   <tr>
     <td><p>ブール</p></td>
     <td><p>BOOL</p></td>
     <td><p>直接マッピング</p></td>
   </tr>
   <tr>
     <td><p>文字列のリスト</p></td>
     <td><p>ARRAY\<VARCHAR></p></td>
     <td><p>ネストされた配列はサポートされています</p></td>
   </tr>
</table>

固定フィールドに変換されたメタデータフィールドについては、追加の属性を構成できます：

- **NULL可能**: フィールドがNULL値を受け入れるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[NULL属性](./nullable-and-default#nullable-attribute)を参照してください。

- **デフォルト値**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-and-default#default-values)を参照してください。

## Pinecone固有の処理ルール\{#pinecone-specific-handling-rules}

### 名前空間処理\{#namespace-processing}

Pineconeの名前空間は、2つの戦略で移行できます：

<table>
   <tr>
     <th><p>戦略</p></th>
     <th><p>実装</p></th>
     <th><p>パフォーマンスへの影響</p></th>
     <th><p>ユースケース</p></th>
   </tr>
   <tr>
     <td><p><strong>名前空間をパーティションキーとして</strong> <em>（推奨）</em></p></td>
     <td><p>名前空間はパーティションキーの値になります</p></td>
     <td><p>検索パフォーマンスの自動最適化</p></td>
     <td><p>複数の名前空間を持つほとんどのシナリオ</p></td>
   </tr>
   <tr>
     <td><p><strong>名前空間をパーティションとして</strong></p></td>
     <td><p>各名前空間が個別のパーティションになります</p></td>
     <td><p>手動のパーティション管理が必要</p></td>
     <td><p>少数の安定した名前空間を持つ単純なシナリオ</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注意">

<p>Pineconeの<code>default</code>名前空間の処理：</p>
<ul>
<li><p><strong>パーティションとして</strong>: Zilliz Cloudで<code>_default</code>パーティションになります</p></li>
<li><p><strong>パーティションキーとして</strong>: 空文字列<code>""</code>の値になります</p></li>
</ul>
<p>パーティションおよびパーティションキーの概念の詳細については、<a href="./manage-partitions">パーティション管理</a>および<a href="./use-partition-key">パーティションキー使用</a>を参照してください。</p>

</Admonition>

### コレクション名付けルール\{#collection-naming-rules}

Pineconeのインデックス名は、Zilliz Cloudとの互換性のために自動的に処理されます：

<table>
   <tr>
     <th><p>Pineconeインデックス名</p></th>
     <th><p>Zilliz Cloudコレクション名</p></th>
     <th><p>適用されたルール</p></th>
   </tr>
   <tr>
     <td><p><code>my-vector-index</code></p></td>
     <td><p><code>my_vector_index</code></p></td>
     <td><p>ハイフン（<code>-</code>）はアンダースコア（<code>_</code>）に変換されて、Zilliz Cloudコレクション名付け規則に準拠</p></td>
   </tr>
   <tr>
     <td><p><code>product_search</code></p></td>
     <td><p><code>product_search</code></p></td>
     <td><p>変更は必要ありません</p></td>
   </tr>
</table>

**命名競合**: ターゲットデータベースに同じ名前のコレクションが既に存在する場合、以下のいずれかを実行する必要があります：

- 既存のコレクションを削除する、または

- 異なるターゲットデータベースを選択する、または

- 移行構成中にターゲットコレクションの名前を変更する

