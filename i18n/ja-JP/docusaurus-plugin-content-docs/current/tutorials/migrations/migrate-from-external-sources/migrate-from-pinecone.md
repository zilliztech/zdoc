---
title: "Pinecone から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-pinecone
sidebar_key: migrate-from-pinecone
sidebar_label: "Pinecone"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Pinecone から移行する際に、Zilliz Cloud がデータ型のマッピング、フィールドの変換、ネームスペースの処理、およびコレクションの命名規則をどのように扱うかについて説明します。| Cloud"
type: origin
token: R33EwQchxiO3HKk4vPnce6vkntc
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - migrations
  - pinecone

---

import Admonition from '@theme/Admonition';


# Pinecone から Zilliz Cloud への移行

このトピックでは、[Pinecone](https://www.pinecone.io/) から移行する際に、Zilliz Cloud がデータ型のマッピング、フィールドの変換、ネームスペースの処理、およびコレクションの命名規則をどのように扱うかについて説明します。

## 前提条件\{#prerequisites}

Pinecone から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Pinecone の要件\{#pinecone-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>インデックスタイプ</p></td>
     <td><p>Pinecone Serverless インデックスからのみ移行をサポート</p></td>
   </tr>
   <tr>
     <td><p>API アクセス</p></td>
     <td><p>アクセス権限を持つ Pinecone API キー</p></td>
   </tr>
   <tr>
     <td><p>データの可用性</p></td>
     <td><p>Pinecone のソースインデックスにはデータが含まれている必要があります。空のインデックスは移行できません。</p></td>
   </tr>
   <tr>
     <td><p>ベクトル次元</p></td>
     <td><p>次元は &gt; 1 である必要があります。単一次元のベクトルは移行失敗の原因となります</p></td>
   </tr>
</table>

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

<table>
   <tr>
     <th><p>要件</p></th>
     <th><p>詳細</p></th>
   </tr>
   <tr>
     <td><p>ユーザーロール</p></td>
     <td><p>組織オーナー または プロジェクト管理者</p></td>
   </tr>
   <tr>
     <td><p>クラスター容量</p></td>
     <td><p>十分なストレージおよび計算リソース（CU サイズの見積もりには <a href="https://zilliz.com/pricing#calculator">CU 計算機</a> を使用してください）</p></td>
   </tr>
   <tr>
     <td><p>ネットワーク アクセス</p></td>
     <td><p>ネットワーク制限を使用している場合は、<a href="./zilliz-cloud-ips">Zilliz Cloud IPs</a> を許可リストに追加してください</p></td>
   </tr>
</table>

## データ型のマッピング\{#data-type-mapping}

Pinecone のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

<table>
   <tr>
     <th><p>Pinecone フィールド型</p></th>
     <th><p>Zilliz Cloud フィールド型</p></th>
     <th><p>注記</p></th>
   </tr>
   <tr>
     <td><p>主キー</p></td>
     <td><p>VARCHAR (主キー)</p></td>
     <td><p>自動的にマッピングされます。自動ID を有効にすると新しい ID が生成されます（元の値は破棄されます）。</p></td>
   </tr>
   <tr>
     <td><p>密ベクトル</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>次元はそのまま保持され、変更は不要です</p></td>
   </tr>
   <tr>
     <td><p>疎ベクトル</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
     <td><p>サンプルデータで空でない場合にのみマッピングされます。</p></td>
   </tr>
   <tr>
     <td><p>メタデータ</p></td>
     <td><p>動的フィールド</p></td>
     <td><p>デフォルトでは動的スキーマとしてマッピングされます。固定フィールドに変換することも可能です。</p><p>詳細については、<a href="./enable-dynamic-field">動的フィールド</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>ネームスペース</p></td>
     <td><p>パーティションキー / パーティション</p></td>
     <td><p>パフォーマンス最適化のために推奨されます。</p><p>詳細については、<a href="./migrate-from-pinecone#namespace-processing">ネームスペースの処理</a> を参照してください。</p></td>
   </tr>
</table>

## メタデータフィールドの変換\{#metadata-field-conversion}

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud はメタデータスキーマを検出するために 100 行をサンプリングします。必要に応じて手動で追加のフィールドを追加できます。</p>

</Admonition>

Pinecone のメタデータは、最大限の柔軟性のために当初 Zilliz Cloud の動的スキーマにマッピングされます。以下の利点を得るために、オプションでメタデータフィールドを固定フィールドに変換できます。

- より強力な検証のためのデータ型の強制
- より良いクエリパフォーマンスのためのインデックス最適化
- 一貫したデータ管理のための構造化されたスキーマ

メタデータを固定フィールドに変換する場合：

<table>
   <tr>
     <th><p>Pinecone メタデータ型</p></th>
     <th><p>Zilliz 固定フィールド型</p></th>
     <th><p>注記</p></th>
   </tr>
   <tr>
     <td><p>文字列</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>最大 65,535 バイトまでサポート</p></td>
   </tr>
   <tr>
     <td><p>数値 (int/float)</p></td>
     <td><p>DOUBLE</p></td>
     <td><p>すべての数値型は DOUBLE になります</p></td>
   </tr>
   <tr>
     <td><p>ブール値</p></td>
     <td><p>BOOL</p></td>
     <td><p>直接マッピング</p></td>
   </tr>
   <tr>
     <td><p>文字列のリスト</p></td>
     <td><p>ARRAY&lt;VARCHAR&gt;</p></td>
     <td><p>ネストされた配列をサポート</p></td>
   </tr>
</table>

固定フィールドに変換されたメタデータフィールドに対しては、追加の属性を設定できます。

- **NULL 許容**: フィールドが null 値を受け入れられるかどうかを決定します。この機能はデフォルトで有効です。詳細については、[NULL 許容属性](./nullable-fields) を参照してください。

- **デフォルト値**: データが欠落している場合のフォールバック値を設定します。詳細については、[デフォルト値](./nullable-fields) を参照してください。

## Pinecone 固有の処理規則\{#pinecone-specific-handling-rules}

### ネームスペースの処理\{#namespace-processing}

Pinecone のネームスペースは、以下の 2 つの戦略を使用して移行できます。

<table>
   <tr>
     <th><p>戦略</p></th>
     <th><p>実装</p></th>
     <th><p>パフォーマンスへの影響</p></th>
     <th><p>ユースケース</p></th>
   </tr>
   <tr>
     <td><p><strong>ネームスペースをパーティションキーとして使用</strong> <em>(推奨)</em></p></td>
     <td><p>ネームスペースはパーティションキーフィールドの値になります</p></td>
     <td><p>検索パフォーマンスの自動最適化</p></td>
     <td><p>複数のネームスペースを持つほとんどのシナリオ</p></td>
   </tr>
   <tr>
     <td><p><strong>ネームスペースをパーティションとして使用</strong></p></td>
     <td><p>各ネームスペースが個別のパーティションになります</p></td>
     <td><p>手動でのパーティション管理が必要</p></td>
     <td><p>少数で安定したネームスペースを持つ単純なシナリオ</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Pinecone の <code>default</code> ネームスペースの処理：</p>
<ul>
<li><p><strong>パーティションとして</strong>: Zilliz Cloud 内の <code>_default</code> パーティションになります</p></li>
<li><p><strong>パーティションキーとして</strong>: 空文字列 <code>""</code> の値になります</p></li>
</ul>
<p>パーティションおよびパーティションキーの概念の詳細については、<a href="./manage-partitions">パーティションの管理</a> および <a href="./use-partition-key">パーティションキーの使用</a> を参照してください。</p>

</Admonition>

### コレクションの命名規則\{#collection-naming-rules}

Pinecone のインデックス名は、Zilliz Cloud との互換性のために自動的に処理されます。

<table>
   <tr>
     <th><p>Pinecone インデックス名</p></th>
     <th><p>Zilliz Cloud コレクション名</p></th>
     <th><p>適用された規則</p></th>
   </tr>
   <tr>
     <td><p><code>my-vector-index</code></p></td>
     <td><p><code>my_vector_index</code></p></td>
     <td><p>ハイフン (<code>-</code>) は、Zilliz Cloud のコレクション命名規約に準拠するためにアンダースコア (<code>_</code>) に変換されます</p></td>
   </tr>
   <tr>
     <td><p><code>product_search</code></p></td>
     <td><p><code>product_search</code></p></td>
     <td><p>変更不要</p></td>
   </tr>
</table>

**名前の競合**: ターゲットデータベースに同じ名前のコレクションが既に存在する場合は、以下のいずれかを行う必要があります。

- 既存のコレクションを削除する
- 別のターゲットデータベースを選択する
- 移行設定中にターゲットコレクションの名前を変更する

