---
title: "Zilliz Cloud 制限事項 | BYOC"
slug: /limits
sidebar_label: "Zilliz Cloud 制限事項"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページはZilliz Cloudプラットフォームにおける制限事項に関する情報を提供します。Zillizが提供するOPSシステムを使用して、このページで言及されているほとんどの設定を調整できます。さらにヘルプが必要な場合はご連絡ください。 | BYOC"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - milvus
  - limits
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud 制限事項

このページはZilliz Cloudプラットフォームにおける制限事項に関する情報を提供します。Zillizが提供するOPSシステムを使用して、このページで言及されているほとんどの設定を調整できます。さらにヘルプが必要な場合は[ご連絡ください](https://support.zilliz.com/hc/en-us)。

## 組織とプロジェクト\{#organizations-and-projects}

以下の表は、単一のユーザーに対して許可されるプロジェクトの最大数に関する制限を示しています。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>プロジェクト</p></td>
     <td><p>100</p></td>
     <td><p>各ユーザーは1つの組織内で最大100個のプロジェクトを作成できます。</p></td>
   </tr>
</table>

## コレクション\{#collections}

Zilliz Cloudクラスター内のコレクションおよびパーティションの最大数は、クラスターに割り当てられたCU数と互換性のあるMilvusバージョンによって異なります。以下の説明を参照して、クラスター内のコレクションおよびパーティションの最大数を計算できます。

### Milvus v2.4.x と互換性のあるクラスター\{#clusters-compatible-with-milvus-v24x}

CUあたり最大**256**個のコレクションまたは**1,024**個のパーティションを作成でき、1つのコレクションにつき最大**1,024**個のパーティションが許可されます。以下の式を使用して、クラスター内のコレクションおよびパーティションの上限を計算できます：

![MhA4wDlMwhhXrvbFio6cS3LNnNe](/img/MhA4wDlMwhhXrvbFio6cS3LNnNe.png)

- クラスター内のコレクションの総数は、クラスター内のCU数の256倍または16,384のいずれか小さい方より少なくてはなりません。

- クラスター内のすべてのコレクションにわたるパーティションの総数は、クラスターに割り当てられたCU数の1,024倍または65,536のいずれか小さい方より少なくてはなりません。

- 上記の両方の条件を満たす必要があります。

### Milvus v2.5.x と互換性のあるクラスター\{#cluster-compatible-with-milvus-v25x}

CUあたり最大**1,024**個のコレクションまたは**4,096**個のパーティションを作成でき、1つのコレクションにつき最大**1,024**個のパーティションが許可されます。以下の式を使用して、クラスター内のコレクションおよびパーティションの上限を計算できます：

![I1aJwA2LShihxQbyG30cFm14ngf](/img/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスター内のコレクションの総数は、クラスター内のCU数の1,024倍または16,384のいずれか小さい方より少なくてはなりません。

- クラスター内のすべてのコレクションにわたるパーティションの総数は、クラスターに割り当てられたCU数の4,096倍または65,536のいずれか小さい方より少なくてはなりません。

- 上記の両方の条件を満たす必要があります。

### フィールド\{#fields}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td><p>1コレクションあたりのフィールド数</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>1コレクションあたりのベクトルフィールド数</p></td>
     <td><p>10</p></td>
   </tr>
</table>

その他のフィールドに関する制限:

- VarCharやJSONなどの一部のフィールドは予想より多くのメモリを使用し、クラスターがいっぱいになる原因になることがあります。

### 次元\{#dimensions}

ベクトルフィールドの最大次元数は**32,768**です。

### シャード\{#shards}

許可される最大シャード数はクラスターCUサイズに依存します。

<table>
   <tr>
     <th><p>CUサイズ</p></th>
     <th><p>最大数</p></th>
   </tr>
   <tr>
     <td><p>1 - 2 CU</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>4 - 8 CU</p></td>
     <td><p>4</p></td>
   </tr>
   <tr>
     <td><p>12 - 64 CU</p></td>
     <td><p>8</p></td>
   </tr>
   <tr>
     <td><p>> 64 CU</p></td>
     <td><p>16</p></td>
   </tr>
</table>

### レート制限\{#rate-limit}

Zilliz Cloudでは、コレクションおよびパーティションのデータ定義言語（DDL）操作、つまりコレクションの作成、読み込み、解放、削除についてもレート制限が課されています。以下のレート制限は、ServerlessクラスターおよびDedicatedクラスター内のコレクションに適用されます。

<table>
   <tr>
     <th></th>
     <th><p><strong>レート制限</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションDDL操作</p><p>（作成、読み込み、解放、削除）</p></td>
     <td><p>20 req/s per cluster</p></td>
   </tr>
   <tr>
     <td><p>パーティションDDL操作</p><p>（作成、読み込み、解放、削除）</p></td>
     <td><p>20 req/s per cluster</p></td>
   </tr>
</table>

## 操作\{#operations}

このセクションでは、Zilliz Cloudクラスター内の一般的なデータ操作に関するレート制限に焦点を当てています。

### 挿入\{#insert}

各挿入リクエスト/レスポンスは**64** MB以下でなければなりません。

レート制限はクラスタータイプと使用中のCU数によって異なります。以下の表は挿入操作のレート制限を示しています。

<table>
   <tr>
     <th></th>
     <th><p>最大挿入レート制限</p></th>
   </tr>
   <tr>
     <td><p>[1 CU, 2 CUs]</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[4 CUs,  8 CUs]</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[12 CUs, 20 CUs]</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[24 CUs, 64 CUs)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[64 CUs, 128CUs)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[128 CUs, 256CUs)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><p>>= 256 CUs</p></td>
     <td><p>64 MB/s</p></td>
   </tr>
</table>

データ挿入時には、スキーマ定義に含まれるすべてのフィールドを含めてください。コレクションがAutoIDを有効にしている場合、主キーは除外してください。

挿入されたエンティティを検索およびクエリで即座に取得可能にするには、検索またはクエリリクエストで整合性レベルを**Strong**に変更することを検討してください。詳しくは[整合性レベル](./consistency-level)を参照してください。

### アップサート\{#upsert}

各アップサートリクエスト/レスポンスは**64** MB以下でなければなりません。

レート制限はクラスタータイプと使用中のCU数によって異なります。以下の表はアップサート操作のレート制限を示しています。

<table>
   <tr>
     <th></th>
     <th><p>最大アップサートレート制限</p></th>
   </tr>
   <tr>
     <td><p>[1 CU, 2 CUs]</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[4 CUs,  8 CUs]</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[12 CUs, 20 CUs]</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[24 CUs, 64 CUs)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[64 CUs, 128CUs)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[128 CUs, 256CUs)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><p>>= 256 CUs</p></td>
     <td><p>64 MB/s</p></td>
   </tr>
</table>

データのアップサート時には、スキーマ定義に含まれるすべてのフィールドを含めてください。

アップサートされたエンティティを検索およびクエリで即座に取得可能にするには、検索またはクエリリクエストで整合性レベルを**Strong**に変更することを検討してください。詳しくは[整合性レベル](./consistency-level)を参照してください。

### インデックス\{#index}

インデックスタイプはフィールドタイプによって異なります。以下の表はインデックス可能なフィールドタイプと対応するインデックスタイプを示しています。

<table>
   <tr>
     <th><p><strong>フィールドタイプ</strong></p></th>
     <th><p><strong>インデックスタイプ</strong></p></th>
     <th><p><strong>メトリックタイプ</strong></p></th>
   </tr>
   <tr>
     <td><p>ベクトルフィールド</p></td>
     <td><p>AUTOINDEX</p></td>
     <td><p>L2, IP, および COSINE</p></td>
   </tr>
   <tr>
     <td><p>VarCharフィールド</p></td>
     <td><p>TRIE</p></td>
     <td><p>該当なし</p></td>
   </tr>
   <tr>
     <td><p>Int8/16/32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>該当なし</p></td>
   </tr>
   <tr>
     <td><p>Float32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>該当なし</p></td>
   </tr>
</table>

### フラッシュ\{#flush}

フラッシュリクエストのレート制限は、特定のクラスタータイプに対してコレクションレベルで0.1リクエスト/秒です。このレート制限はMilvus v2.4.x以降と互換性のあるクラスターに適用されます。

<Admonition type="info" icon="📘" title="ノート">

<p>フラッシュ操作を手動で行うことは推奨されません。Zilliz Cloudクラスターはこれを適切に処理します。</p>

</Admonition>

### ロード\{#load}

ロードリクエストのレート制限は**20** req/s per clusterです。

<Admonition type="info" icon="📘" title="ノート">

<p>これらのコレクションに新しいデータが入ってくる場合でも、すでにロードされているコレクションに対してコレクションのロードを実行する必要はありません。</p>

</Admonition>

### 検索\{#search}

各検索リクエスト/レスポンスは**64** MB以下でなければなりません。

各検索リクエストが持つクエリーベクトルの数（通常**nq**と呼ばれます）は**16,384**以下でなければならず、各検索レスポンスが持つ数（通常**topK**と呼ばれます）は返されるエンティティで**16,384**以下でなければなりません。

### クエリ\{#query}

各クエリーリクエスト/レスポンスは**64** MB以下でなければなりません。

各クエリーレスポンスは、返されるエンティティが16,384以下です（通常**topK**と呼ばれます）。

### 削除\{#delete}

各削除リクエスト/レスポンスは**64** MB以下でなければなりません。

削除リクエストのレート制限は**0.5** MB/s per clusterです。

### ドロップ\{#drop}

ドロップリクエストのレート制限は**20** req/s per clusterです。

### データインポート\{#data-import}

コレクション内には最大**10,000**個の実行中または保留中のインポートジョブを持つことができます。

Zilliz Cloudでは、ウェブコンソールでのインポートファイルにも制限が課されています。

<table>
   <tr>
     <th><p>ファイルタイプ</p></th>
     <th><p>ローカルアップロード</p></th>
     <th><p>オブジェクトストレージから</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p>最大総インポートサイズは1TB、各ファイルの最大サイズは10GB、最大1,000ファイルです。</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1 GB</p></td>
     <td><p>最大総インポートサイズは1TB、各ファイルの最大サイズは10GB、最大1,000ファイルです。</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>サポートされていません</p></td>
     <td><p>最大総インポートサイズは1TB、各サブディレクトリの最大サイズは10GB、最大1,000サブディレクトリです。</p></td>
   </tr>
</table>

詳細については、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。

## コンソールでのバックアップ\{#backup-on-console}

手動で作成されたバックアップは永久に保持されます。

自動的に作成されたバックアップの最大保持期間は30日です。

## コンソールでのリストア\{#restore-on-console}

スナップショットの元のクラスターと同じリージョンでスナップショットを復元できます。復元のターゲットクラスターは、元のクラスターと同じCUタイプを使用する必要があります。

## IPアクセスリスト\{#ip-access-list}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>IPアドレス（CIDR）</p></td>
     <td><p>100</p></td>
     <td><p>許可リストには最大100個のIPアドレスを追加できます。</p></td>
   </tr>
</table>

## マイグレーション\{#migration}

他ベンダーからZilliz Cloudクラスターにデータをマイグレーションできます。マイグレーションごとの最大コレクション数はZilliz Cloudクラスターによって異なります。マイグレーション時には最大**10**個のコレクションを一度に移行できます。