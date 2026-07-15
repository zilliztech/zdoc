---
title: "Zilliz Cloud Limits | BYOC"
slug: /limits
sidebar_key: limits
sidebar_label: "Zilliz Cloud Limits"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォームの制限について説明します。このページで言及されている設定のほとんどは、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、お問い合わせください。 | BYOC"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - 制限

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud 制限

このページでは、Zilliz Cloud プラットフォームの制限について説明します。このページで言及されている設定のほとんどは、Zilliz が提供する OPS システムを使用して調整できます。さらにサポートが必要な場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

## 組織 & プロジェクト\{#organizations-and-projects}

次の表は、1 人のユーザーに許可される組織とプロジェクトの最大数の制限を示しています。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>プロジェクト</p></td>
     <td><p>100</p></td>
     <td><p>各ユーザーは 1 つの組織に最大 100 個のプロジェクトを作成できます。</p></td>
   </tr>
</table>

## ユーザー & ロール\{#users-and-roles}

次の表は、Zilliz Cloud で許可されるユーザーとロールの最大数の制限を示しています。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>クラスターユーザー</p></td>
     <td><p>500</p></td>
     <td><p>1 つのクラスターには合計最大 500 人のユーザーを設定できます。</p></td>
   </tr>
   <tr>
     <td><p>クラスターカスタムロール</p></td>
     <td><p>500</p></td>
     <td><p>1 つのクラスターには合計最大 500 のカスタムロールを設定できます。この制限を解除するには <a href="http://support.zilliz.com">お問い合わせ</a> ください。</p></td>
   </tr>
</table>

## APIキー\{#api-keys}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>APIキー</p></td>
     <td><p>100</p></td>
     <td><p>各組織には、リソースの最適な利用とセキュリティのため、最大 100 個のカスタマイズされた APIキーを含めることができます。</p></td>
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
     <td><p>組織コンソール IP 許可リスト内の IP</p></td>
     <td><p>100</p></td>
     <td><p>各組織のコンソール IP 許可リストには、最大 100 個の IP アドレスまたは CIDR ブロックを含めることができます。</p></td>
   </tr>
</table>

## クラスター\{#clusters}

### CU\{#cus}

CU はデータの並列処理に使用される計算リソースの基本単位であり、異なる CU タイプは CPU、メモリ、ストレージの異なる組み合わせで構成されています。CU の概念は Dedicated クラスターにのみ適用されます。

<table>
   <tr>
     <th><p><strong>プロジェクトプラン & クラスターデプロイオプション</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>Standard プロジェクトの Dedicated サービングクラスター</p></td>
     <td><p>CU サイズ &lt;=32</p></td>
     <td><p>コンソール上で、1 つのクラスターに最大 32 CU まで作成できます。</p></td>
   </tr>
   <tr>
     <td><p>Enterprise プロジェクトの Dedicated サービングクラスター</p></td>
     <td><p>CU サイズ x レプリカ数 &lt;=204,800</p></td>
     <td><p>コンソール上で、1 つのクラスターに最大 2,048 CU まで作成できます。</p><p>ただし、レプリカを追加する場合、制限は CU サイズ x レプリカ数 &lt;=204,800 となります。</p></td>
   </tr>
</table>

以下の場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us) ください：

- Standard プロジェクトの Dedicated クラスターで 32 CU を超える必要がある場合

- Enterprise プロジェクトの Dedicated クラスターで 1,024 CU を超える必要がある場合

## レプリカ\{#replicas}

レプリカを追加するには、クラスターに**少なくとも 8 CU**が必要です。以下の制限も適用されます。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>レプリカ</p></td>
     <td><p>100</p></td>
     <td><p>最大 100 個のレプリカを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>クエリ CU x レプリカ数</p></td>
     <td><p>204,800</p></td>
     <td><p>クラスターのレプリカ x クエリ CU は 204,800 を超えてはいけません。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

以前の Milvus リリースと互換性のある一部のクラスターでは、レプリカを追加するために少なくとも 12 CU が必要な場合があります。

クエリ CU が少ないクラスターにレプリカを追加するには、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</Admonition>

## データベース\{#databases}

- 各 Serving-Dedicated クラスターは最大 1024 のデータベースを持つことができます。

- デフォルトのデータベースは削除できません。

## コレクション\{#collections}

Zilliz Cloud クラスター内のコレクションとパーティションの最大数は、クラスターに割り当てられた CU の数と互換性のある Milvus バージョンによって異なります。以下の説明を参照して、クラスター内のコレクションとパーティションの最大数を計算できます。

CU あたり最大 **1,024** のコレクションまたは **4,096** のパーティションを作成でき、コレクションあたり最大 **1,024** のパーティションが許可されています。クラスター内のコレクションとパーティションの上限を計算するために、以下の式を使用できます：

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスター内のコレクションの総数は、クラスター内の CU 数の 1,024 倍または 16,384 のいずれか小さい方より少なくする必要があります。

- クラスター内のすべてのコレクションにまたがるパーティションの総数は、クラスターに割り当てられた CU 数の 4,096 倍または 65,536 のいずれか小さい方より少なくする必要があります。

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

- VarChar や JSON などの一部のフィールドは、予想より多くのメモリを使用し、クラスターがフルになる原因となる可能性があります。

### 次元数\{#dimensions}

ベクトルフィールドの最大次元数は **32,768** です。

### シャード\{#shards}

許可されるシャードの最大数は、クラスターの CU サイズによって異なります。

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

Zilliz Cloud は、コレクションおよびパーティションのデータ定義言語（DDL）操作（作成、ロード、解放、削除を含む）に対してもレート制限を課しています。以下のレート制限は、Serverless クラスターと Dedicated クラスターの両方のコレクションに適用されます。

<table>
   <tr>
     <th></th>
     <th><p><strong>レート制限</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクション DDL 操作 </p><p>(create, load, release, drop)</p></td>
     <td><p>クラスターあたり 20 req/s</p></td>
   </tr>
   <tr>
     <td><p>パーティション DDL 操作</p><p>(create, load, release, drop)</p></td>
     <td><p>クラスターあたり 20 req/s</p></td>
   </tr>
</table>

## 運用\{#operations}

このセクションでは、Zilliz Cloud クラスターでの一般的なデータ操作のレート制限に焦点を当てます。

### 挿入とアップサート\{#insert-and-upsert}

挿入とアップサート操作のレート制限は、クラスターデプロイオプションと使用している CU の数によって異なります。

<table>
   <tr>
     <th></th>
     <th><p>最大挿入およびアップサートレート制限</p></th>
   </tr>
   <tr>
     <td><p>Dedicated クラスター</p></td>
     <td><p>16 MB/s + 1 MB/s × CU</p><p>最大で 256 MB/s まで。</p></td>
   </tr>
</table>

例：

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最大 `256 MB/s`

さらに、以下の追加制限が適用されます：

- 単一シャードの書き込みレートは **32 MB/s** を超えてはいけません。

- データを挿入する際は、スキーマで定義されたすべてのフィールドを含めてください。コレクションで AutoID が有効になっている場合は、プライマリキーを除外してください。

- データをアップサートする際は、スキーマで定義されたすべてのフィールドを含めてください。

- 挿入またはアップサートされたエンティティを検索およびクエリですぐに検索可能にするには、検索またはクエリリクエストの一貫性レベルを **Strong** に変更することを検討してください。詳細については、[一貫性レベル](./consistency-level) をお読みください。

### インデックス\{#index}

インデックスタイプはフィールドタイプによって異なります。次の表は、インデックス可能なフィールドタイプと対応するインデックスタイプを示しています。

<table>
   <tr>
     <th><p><strong>フィールドタイプ</strong></p></th>
     <th><p><strong>インデックスタイプ</strong></p></th>
     <th><p><strong>メトリックタイプ</strong></p></th>
   </tr>
   <tr>
     <td><p>ベクトルフィールド</p></td>
     <td><p>AUTOINDEX</p></td>
     <td><p>L2, IP, COSINE</p></td>
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

### フラッシュ\{#flush}

フラッシュリクエストのレート制限は、特定のクラスタータイプのコレクションレベルで課される 1 秒あたり 0.1 リクエストです。このレート制限は、Milvus v2.4.x 以降と互換性のあるクラスターに適用されます。

<Admonition type="info" icon="📘" title="Notes">

<p>フラッシュ操作を手動で実行することは推奨されません。Zilliz Cloud クラスターが適切に処理します。</p>

</Admonition>

### ロード\{#load}

ロードリクエストのレート制限は、クラスターあたり **20** req/s です。

<Admonition type="info" icon="📘" title="Notes">

<p>すでにロードされているコレクションに新しいデータが流入しても、これらのコレクションのロードコレクションを実行する必要はありません。</p>

</Admonition>

### 検索\{#search}

各検索リクエスト/レスポンスは **64** MB を超えてはいけません。

各検索リクエストが含むクエリベクトルの数（通常 **nq** と呼ばれる）は **16,384** を超えず、各検索レスポンスが返す数（通常 **topK** と呼ばれる）は **16,384** エンティティを超えてはいけません。

### クエリ\{#query}

各クエリリクエスト/レスポンスは **64** MB を超えてはいけません。

各クエリレスポンスが返すエンティティ数は最大 16,384（通常 **topK** と呼ばれる）です。

### 削除\{#delete}

各削除リクエスト/レスポンスは **64** MB を超えてはいけません。

削除リクエストのレート制限は、クラスターあたり **0.5** MB/s です。

### ドロップ\{#drop}

ドロップリクエストのレート制限は、クラスターあたり **20** req/s です。

### データインポート\{#data-import}

コレクション内で実行中または保留中のインポートジョブは最大 **10,000** まで可能です。

Zilliz Cloud は、Web コンソールでのインポートファイルにも制限を課しています。

<table>
   <tr>
     <th><p>ファイルタイプ</p></th>
     <th><p>ローカルアップロード</p></th>
     <th><p>オブジェクトストレージから</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p>最大合計インポートサイズは 1 TB、各ファイルの最大サイズは 10 GB、最大 1,000 ファイルまで。</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1 GB</p></td>
     <td><p>最大合計インポートサイズは 1 TB、各ファイルの最大サイズは 10 GB、最大 1,000 ファイルまで。</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>非対応</p></td>
     <td><p>最大合計インポートサイズは 1 TB、各サブディレクトリの最大サイズは 10 GB、最大 1,000 サブディレクトリまで。</p></td>
   </tr>
</table>

詳細については、[ストレージオプション](./data-import-storage-options) と [フォーマットオプション](./data-import-format-options) を参照してください。

## コンソールでのバックアップ\{#backup-on-console}

手動で作成されたバックアップは永久に保持されます。

自動作成されたバックアップの最大保持期間は 30 日です。

## コンソールでの復元\{#restore-on-console}

バックアップファイルは、バックアップファイルの元のクラスターと同じリージョンに復元できます。復元の対象クラスターは、元のクラスターと同じ CU タイプを使用する必要があります。

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
     <td><p>コンソール IP 許可リストに最大 100 個の IP アドレスを追加できます。</p></td>
   </tr>
</table>

## マイグレーション\{#migration}

他のベンダーから Zilliz Cloud クラスターにデータを移行でき、マイグレーションごとの最大コレクション数は Zilliz Cloud クラスターによって異なります。マイグレーション中は、1 回あたり最大 **10** 個のコレクションを移行できます。
