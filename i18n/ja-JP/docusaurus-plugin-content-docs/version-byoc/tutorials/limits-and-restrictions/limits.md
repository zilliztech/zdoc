---
title: "Zilliz Cloud の制限 | BYOC"
slug: /limits
sidebar_key: limits
sidebar_label: "Zilliz Cloud の制限"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォームにおける制限について説明します。ここに記載されている設定の多くは、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、お気軽にお問い合わせください。| BYOC"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - milvus
  - 制限

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud 制限

このページでは、Zilliz Cloud プラットフォームにおける制限事項について説明します。このページに記載されている設定のほとんどは、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

## 組織とプロジェクト\{#organizations-and-projects}

以下の表は、単一ユーザーに対して許可される組織およびプロジェクトの最大数の制限を一覧にしたものです。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>プロジェクト</p></td>
     <td><p>100</p></td>
     <td><p>各ユーザーは、1 つの組織内で最大 100 個のプロジェクトを作成できます。</p></td>
   </tr>
</table>

## ユーザーとロール\{#users-and-roles}

以下の表は、Zilliz Cloud で許可されるユーザーの最大数の制限を一覧にしたものです。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>クラスターユーザー</p></td>
     <td><p>100</p></td>
     <td><p>1 つのクラスターには、合計で最大 100 人のユーザーを含めることができます。</p></td>
   </tr>
   <tr>
     <td><p>クラスターカスタムロール</p></td>
     <td><p>20</p></td>
     <td><p>1 つのクラスターには、合計で最大 20 個のカスタムロールを含めることができます。この制限を解除するには、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</p></td>
   </tr>
</table>

## API キー\{#api-keys}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>API キー</p></td>
     <td><p>100</p></td>
     <td><p>最適なリソース活用とセキュリティのため、各組織に含めることができるカスタマイズされた API キーの最大数は 100 です。</p></td>
   </tr>
</table>

## コンソール IP 許可リスト\{#console-ip-allowlist}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>組織コンソールの IP 許可リスト内の IP アドレス</p></td>
     <td><p>100</p></td>
     <td><p>各組織コンソールの IP 許可リストには、最大 100 個の IP アドレスまたは CIDR ブロックを含めることができます。</p></td>
   </tr>
</table>

## クラスター\{#clusters}

### CU\{#cus}

CU は、データの並列処理に使用されるコンピューティングリソースの基本単位であり、異なる CU タイプは CPU、メモリ、ストレージのさまざまな組み合わせで構成されます。CU の概念は、Dedicated クラスターにのみ適用されます。

<table>
   <tr>
     <th><p><strong>プロジェクトプランとクラスターデプロイオプション</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>Standard プロジェクト内の Dedicated サービングクラスター</p></td>
     <td><p>CU サイズ &lt;=32</p></td>
     <td><p>コンソールでは、単一のクラスターに対して最大 32 CU を作成できます。</p></td>
   </tr>
   <tr>
     <td><p>Enterprise プロジェクト内の Dedicated サービングクラスター</p></td>
     <td><p>CU サイズ x レプリカ数 &lt;=10,240</p></td>
     <td><p>コンソールでは、単一のクラスターに対して最大 1,024 CU を作成できます。</p><p>ただし、レプリカを追加する場合、制限は CU サイズ x レプリカ数 &lt;=10,240 となります。</p></td>
   </tr>
</table>

以下の場合には、[お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

- Standard プロジェクト内の Dedicated クラスターで 32 CU を超える必要がある場合

- Enterprise プロジェクト内の Dedicated クラスターで 1,024 CU を超える必要がある場合

## レプリカ\{#replicas}

レプリカを追加するには、クラスターに**12 CU 以上**が必要です。また、以下の制限も適用されます。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>レプリカ</p></td>
     <td><p>10</p></td>
     <td><p>最大 10 個のレプリカを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>クエリ CU x レプリカ数</p></td>
     <td><p>10,240</p></td>
     <td><p>クラスターのレプリカ数 x クエリ CU は 10,240 を超えてはいけません。</p></td>
   </tr>
</table>

## データベース\{#databases}

- 各 Serving-Dedicated クラスターには、最大 1024 個のデータベースを含めることができます。

- デフォルトデータベースは削除できません。

## コレクション\{#collections}

Zilliz Cloud クラスター内のコレクションおよびパーティションの最大数は、割り当てられた CU 数と互換性のある Milvus のバージョンによって異なります。以下の説明を参照し、クラスター内のコレクションおよびパーティションの最大数を計算できます。

### Milvus v2.4.x と互換性のあるクラスター\{#clusters-compatible-with-milvus-v24x}

CU あたり最大**256**個のコレクションまたは**1,024**個のパーティションを作成でき、コレクションあたりのパーティション数は最大**1,024**まで許可されます。以下の式を使用して、クラスター内のコレクション数およびパーティション数の上限を計算できます。

![MhA4wDlMwhhXrvbFio6cS3LNnNe](https://zdoc-images.s3.us-west-2.amazonaws.com/MhA4wDlMwhhXrvbFio6cS3LNnNe.png)

- クラスター内のコレクションの総数は、クラスターの CU 数の 256 倍または 16,384 のいずれか低い方未満である必要があります。

- クラスター内のすべてのコレクションにわたるパーティションの総数は、クラスターに割り当てられた CU 数の 1,024 倍または 65,536 のいずれか低い方未満である必要があります。

- 両方の条件を満たす必要があります。

### Milvus v2.5.x と互換性のあるクラスター\{#cluster-compatible-with-milvus-v25x}

CU あたり最大**1,024**個のコレクションまたは**4,096**個のパーティションを作成でき、コレクションあたりのパーティション数は最大**1,024**まで許可されます。以下の式を使用して、クラスター内のコレクション数およびパーティション数の上限を計算できます。

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスター内のコレクションの総数は、クラスターの CU 数の 1,024 倍または 16,384 のいずれか低い方未満である必要があります。

- クラスター内のすべてのコレクションにわたるパーティションの総数は、クラスターに割り当てられた CU 数の 4,096 倍または 65,536 のいずれか低い方未満である必要があります。

- 両方の条件を満たす必要があります。

### フィールド\{#fields}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションあたりのフィールド数</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>コレクションあたりのベクトルフィールド数</p></td>
     <td><p>10</p></td>
   </tr>
</table>

フィールドに関するその他の制限：

- VarChar や JSON などの一部のフィールドは、予想よりも多くのメモリを使用し、クラスターがいっぱいになる原因となることがあります。

### 次元数\{#dimensions}

ベクトルフィールドの最大次元数は**32,768**です。

### シャード\{#shards}

許可されるシャードの最大数は、クラスターの CU サイズに依存します。

<table>
   <tr>
     <th><p>CU サイズ</p></th>
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

Zilliz Cloud では、コレクションおよびパーティションのデータ定義言語（DDL）操作（コレクションの作成、ロード、リリース、削除など）にもレート制限を課しています。以下のレート制限は、Serverless および Dedicated クラスターの両方のコレクションに適用されます。

<table>
   <tr>
     <th></th>
     <th><p><strong>レート制限</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクション DDL 操作</p><p>（作成、ロード、リリース、削除）</p></td>
     <td><p>クラスターあたり 20 req/s</p></td>
   </tr>
   <tr>
     <td><p>パーティション DDL 操作</p><p>（作成、ロード、リリース、削除）</p></td>
     <td><p>クラスターあたり 20 req/s</p></td>
   </tr>
</table>

## 運用\{#operations}

このセクションでは、Zilliz Cloud クラスターにおける一般的なデータ操作のレート制限に焦点を当てます。

### Insert および Upsert\{#insert-and-upsert}

Insert および Upsert 操作のレート制限は、クラスターデプロイオプションと使用中の CU 数に依存します。

<table>
   <tr>
     <th></th>
     <th><p>Insert および Upsert の最大レート制限</p></th>
   </tr>
   <tr>
     <td><p>Dedicated クラスター</p></td>
     <td><p>16 MB/s + 1 MB/s × CU</p><p>最大 256 MB/s まで。</p></td>
   </tr>
</table>

例：

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最大 `256 MB/s`

さらに、以下の追加制限も適用されます。

- 単一シャードの書き込みレートは**32 MB/s**を超えてはいけません。

- データを挿入する際は、スキーマで定義されたすべてのフィールドを含めてください。コレクションで AutoID が有効になっている場合、プライマリキーは除外してください。

- データをアップサートする際は、スキーマで定義されたすべてのフィールドを含めてください。

- 挿入またはアップサートされたエンティティを検索およびクエリですぐに取得可能にするには、検索またはクエリリクエストの一貫性レベルを**Strong**に変更することを検討してください。詳細については、[一貫性レベル](./consistency-level) をご覧ください。

### インデックス\{#index}

インデックスタイプはフィールドタイプによって異なります。以下の表は、インデックス化可能なフィールドタイプと対応するインデックスタイプを一覧にしたものです。

<table>
   <tr>
     <th><p><strong>フィールドタイプ</strong></p></th>
     <th><p><strong>インデックスタイプ</strong></p></th>
     <th><p><strong>メトリックタイプ</strong></p></th>
   </tr>
   <tr>
     <td><p>ベクトルフィールド</p></td>
     <td><p>AUTOINDEX</p></td>
     <td><p>L2、IP、および COSINE</p></td>
   </tr>
   <tr>
     <td><p>VarChar フィールド</p></td>
     <td><p>TRIE</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Int8/16/32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Float32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### Flush\{#flush}

Flush リクエストのレート制限は 0.1 req/s で、特定のクラスタイプに対してコレクションレベルで課されます。このレート制限は、Milvus v2.4.x 以降と互換性のあるクラスターに適用されます。

<Admonition type="info" icon="📘" title="Notes">

<p>手動で flush 操作を実行することは推奨されません。Zilliz Cloud クラスターが適切に処理します。</p>

</Admonition>

### Load\{#load}

Load リクエストのレート制限は、クラスターあたり**20**req/s です。

<Admonition type="info" icon="📘" title="Notes">

<p>すでにロードされているコレクションに対しては、新しいデータがこれらのコレクションに入ってきても、ロードコレクション操作を実行する必要はありません。</p>

</Admonition>

### Search\{#search}

各検索リクエスト/レスポンスは**64**MB を超えてはいけません。

各検索リクエストが運ぶクエリベクトルの数（通常**nq**として知られる）は**16,384**以下であり、各検索レスポンスが返すエンティティの数（通常**topK**として知られる）も**16,384**以下です。

### Query\{#query}

各クエリリクエスト/レスポンスは**64**MB を超えてはいけません。

各クエリレスポンスが返すエンティティの数は最大 16,384 です（通常**topK**として知られる）。

### Delete\{#delete}

各削除リクエスト/レスポンスは**64**MB を超えてはいけません。

削除リクエストのレート制限は、クラスターあたり**0.5**MB/s です。

### Drop\{#drop}

Drop リクエストのレート制限は、クラスターあたり**20**req/s です。

### データインポート\{#data-import}

1 つのコレクション内で実行中または保留中のインポートジョブは最大**10,000**件まで可能です。

Zilliz Cloud では、Web コンソールでのインポートファイルにも制限を設けています。

<table>
   <tr>
     <th><p>ファイルタイプ</p></th>
     <th><p>ローカルアップロード</p></th>
     <th><p>オブジェクトストレージから</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p>最大総インポートサイズは 1 TB、各ファイルの最大サイズは 10 GB で、最大 1,000 ファイルまで可能です。</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1 GB</p></td>
     <td><p>最大総インポートサイズは 1 TB、各ファイルの最大サイズは 10 GB で、最大 1,000 ファイルまで可能です。</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>非対応</p></td>
     <td><p>最大総インポートサイズは 1 TB、各サブディレクトリの最大サイズは 10 GB で、最大 1,000 サブディレクトリまで可能です。</p></td>
   </tr>
</table>

詳細については、[ストレージオプション](./data-import-storage-options) および [フォーマットオプション](./data-import-format-options) を参照してください。

## コンソールでのバックアップ\{#backup-on-console}

手動で作成されたバックアップは永続的に保持されます。

自動作成されたバックアップの最大保持期間は 30 日です。

## コンソールでの復元\{#restore-on-console}

バックアップファイルは、元のクラスターと同じリージョンで復元できます。復元先のターゲットクラスターは、元のクラスターと同じ CU タイプを使用する必要があります。

## IP アクセスリスト\{#ip-access-list}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>コンソール IP アクセス</p></td>
     <td><p>100</p></td>
     <td><p>コンソールの IP 許可リストに追加できる IP アドレスは最大 100 個です。</p></td>
   </tr>
</table>

## マイグレーション\{#migration}

他のベンダーからデータを Zilliz Cloud クラスターへ移行できます。マイグレーションごとのコレクションの最大数は、お使いの Zilliz Cloud クラスターによって異なります。各マイグレーション時に移行できるコレクションは最大**10**個です。

