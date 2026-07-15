---
title: "Zilliz Cloud 制限 | Cloud"
slug: /limits
sidebar_key: limits
sidebar_label: "Zilliz Cloud 制限"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プラットフォームの制限に関する情報を提供します。これらの制限に関連する問題を報告する必要がある場合は、リクエストを送信してください。 | Cloud"
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

このページでは、Zilliz Cloud プラットフォームの制限に関する情報を提供します。これらの制限に関連する問題を報告する必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

## 組織 & プロジェクト\{#organizations-and-projects}

次の表は、1人のユーザーに許可される組織とプロジェクトの最大数の制限を示しています。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization</p></td>
     <td><p>1</p></td>
     <td><p>Zilliz Cloud は、アカウント登録成功時に自動的に1つの組織を作成します。さらに組織が必要な場合は、<a href="http://support.zilliz.com">サポートチケットを作成</a>してください。1人のユーザーは複数の組織に参加できます。</p></td>
   </tr>
   <tr>
     <td><p>Project</p></td>
     <td><p>100</p></td>
     <td><p>各ユーザーは1つの組織内に最大100個のプロジェクトを作成できます。</p></td>
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
     <td><p>Organization User</p></td>
     <td><p>100</p></td>
     <td><p>1つの組織は、合計で最大100人の組織ユーザーを持つことができます。</p></td>
   </tr>
   <tr>
     <td><p>Cluster User</p></td>
     <td><p>500</p></td>
     <td><p>1つのクラスターは、合計で最大500人のユーザーを持つことができます。</p></td>
   </tr>
   <tr>
     <td><p>Cluster Custom ロール</p></td>
     <td><p>500</p></td>
     <td><p>1つのクラスターは、合計で最大500個のカスタムロールを持つことができます。この制限を解除するには、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</p></td>
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
     <td><p>各組織は、最適なリソース利用とセキュリティのために、最大100個のカスタマイズされたAPIキーを含むことができます。</p></td>
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
     <td><p>各組織のコンソール IP 許可リストには、最大100個の IP アドレスまたは CIDR ブロックを含めることができます。</p></td>
   </tr>
</table>

## ボリューム\{#volumes}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>Managed volume</p></td>
     <td><p>100</p></td>
     <td><p>各組織は、最大100個のマネージドボリュームを含むことができます。</p></td>
   </tr>
   <tr>
     <td><p>External volume</p></td>
     <td><p>100</p></td>
     <td><p>各組織は、最大100個の外部ボリュームを含むことができます。</p></td>
   </tr>
</table>

## クラスター\{#clusters}

### クラスター数\{#number-of-clusters}

クラスターの最大数は、お支払い方法とデプロイオプションによって異なります。

- **有効な支払い方法がない場合**

    <table>
       <tr>
         <th><p><strong>クラスターデプロイオプション</strong></p></th>
         <th><p><strong>最大数</strong></p></th>
         <th><p><strong>備考</strong></p></th>
       </tr>
       <tr>
         <td><p>Free</p></td>
         <td><p>1</p></td>
         <td><p>各組織には1つの Free クラスターのみが許可されています。必要に応じて、既存の Free クラスターを削除して新しいクラスターに置き換えることができます。</p></td>
       </tr>
       <tr>
         <td><p>Serverless/Dedicated</p></td>
         <td><p>1</p></td>
         <td><p>無料トライアル期間中は、Serverless/Dedicated クラスターを1つだけ作成できます。追加のクラスターが必要な場合は、支払い方法を追加してください。</p></td>
       </tr>
    </table>

- **有効な支払い方法がある場合**

    <table>
       <tr>
         <th><p><strong>クラスターデプロイオプション</strong></p></th>
         <th><p><strong>最大数</strong></p></th>
         <th><p><strong>備考</strong></p></th>
       </tr>
       <tr>
         <td><p>Serving - Free</p></td>
         <td><p>1</p></td>
         <td><p>各組織には1つの Free クラスターのみが許可されています。必要に応じて、既存の Free クラスターを削除して新しいクラスターに置き換えることができます。</p></td>
       </tr>
       <tr>
         <td><p>Serving - Serverless</p></td>
         <td><p>100</p></td>
         <td><p>各プロジェクトに最大100個の Serverless クラスターを作成できます。</p></td>
       </tr>
       <tr>
         <td><p>Serving - Dedicated</p></td>
         <td><p>100</p></td>
         <td><p>各プロジェクトに最大100個の Dedicated クラスターを作成できます。</p></td>
       </tr>
       <tr>
         <td><p>On-demand</p></td>
         <td><p>20</p></td>
         <td><p>各プロジェクトに最大20個のオンデマンドクラスターを作成できます。</p></td>
       </tr>
    </table>

### CU\{#cus}

CU は、データの並列処理に使用される計算リソースの基本単位であり、異なる CU タイプは CPU、メモリ、ストレージの異なる組み合わせで構成されています。CU の概念は Dedicated クラスターにのみ適用されます。

<table>
   <tr>
     <th><p><strong>プロジェクトプラン & クラスターデプロイオプション</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>Standard プロジェクトの Dedicated serving クラスター</p></td>
     <td><p>CU サイズ &lt;=32</p></td>
     <td><p>コンソール上で、1つのクラスターに最大32 CU を作成できます。</p></td>
   </tr>
   <tr>
     <td><p>Enterprise プロジェクトの Dedicated serving クラスター</p></td>
     <td><p>CU サイズ x レプリカ数 &lt;=204,800</p></td>
     <td><p>コンソール上で、1つのクラスターに最大2,048 CU を作成できます。</p><p>ただし、レプリカが追加される場合、制限は CU サイズ x レプリカ数 &lt;=204,800 となります。</p></td>
   </tr>
   <tr>
     <td><p>Enterprise プロジェクトのオンデマンドクラスター</p></td>
     <td><p>8&lt;= CU サイズ &lt;= 256</p></td>
     <td><p>コンソール上で、1つのオンデマンドクラスターは8から256 CU をサポートします。</p><p>8 CU ごとに、最大3 TB のデータを検索できます。</p></td>
   </tr>
</table>

以下の場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください：

- Standard プロジェクトの Dedicated クラスターが32 CU を超える必要がある場合

- Enterprise プロジェクトの Dedicated クラスターが1,024 CU を超える必要がある場合

### vCU\{#vcus}

仮想計算ユニット（vCU）は、読み取り操作（検索やクエリなど）と書き込み操作（挿入、アップサート、削除など）で消費されるリソースを測定するために使用されます。vCU の概念は Free および Serverless クラスターにのみ適用されます。

<table>
   <tr>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>制限</strong></p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>月間250万 vCU</p></td>
   </tr>
   <tr>
     <td><p>Serverless</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### 容量\{#capacity}

次の表は、各クラスタープランの容量制限を示しています。

<table>
   <tr>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>制限</strong></p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>クラスターあたり5 GB（クラスターあたり100万個の768次元ベクトルに相当）</p></td>
   </tr>
   <tr>
     <td><p>Serverless</p></td>
     <td><p>Zilliz Cloud の Serverless クラスターに容量制限はありません。</p></td>
   </tr>
   <tr>
     <td><p>Dedicated（1 CU あたり）</p></td>
     <td><p>Zilliz Cloud の Dedicated クラスターに容量制限はありません。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

Dedicated クラスターの容量上限は、使用する CU タイプとサイズによって異なります。クラスターの容量が不足している場合は、CU タイプとサイズの調整を検討してください。詳細については、Plan Cluster Scaling を参照してください。

</Admonition>

## レプリカ\{#replicas}

レプリカを追加するには、クラスターに**少なくとも 8 CU**が必要です。以下の制限も適用されます。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>Replica</p></td>
     <td><p>100</p></td>
     <td><p>最大100個のレプリカを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>Query CU x レプリカ数</p></td>
     <td><p>204,800</p></td>
     <td><p>クラスターのレプリカ数 x クエリ CU は204,800を超えてはいけません。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

以前の Milvus リリースと互換性のある一部のクラスターでは、レプリカを追加するために少なくとも 12 CU が必要な場合があります。

クエリ CU が少ないクラスターにレプリカを追加するには、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

</Admonition>

## データベース\{#databases}

- 各 Serving-Dedicated クラスターは最大1024個のデータベースを持つことができます。

- プロジェクトあたり、リージョンあたり最大64個のオンデマンド計算データベースを作成できます。

- デフォルトのデータベースは削除できません。

## コレクション\{#collections}

Zilliz Cloud クラスター内のコレクションとパーティションの最大数は、割り当てられた CU の数と互換性のある Milvus バージョンによって異なります。以下の説明を参照して、クラスター内のコレクションとパーティションの最大数を計算できます。

1 CU あたり、最大**1,024**個のコレクションまたは**4,096**個のパーティションを作成でき、コレクションあたり最大**1,024**個のパーティションが許可されています。クラスター内のコレクションとパーティションの数の上限を計算するために、以下の式を使用できます：

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスター内のコレクションの総数は、クラスター内の CU 数の1,024倍または16,384のいずれか小さい方より少なくする必要があります。

- クラスター内のすべてのコレクションにまたがるパーティションの総数は、クラスターに割り当てられた CU 数の4,096倍または65,536のいずれか小さい方より少なくする必要があります。

- 両方の条件を満たす必要があります。

<Admonition type="info" icon="📘" title="Notes">

**Free** および **Serverless** クラスターの場合は、代わりに以下の制限が適用されます：

- **Free** クラスターは最大**5**個のコレクションを許可します。

- **Serverless** クラスターは最大**100**個のコレクションをサポートします。

</Admonition>

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
     <td><ul><li><p>Free & Serverless: 4</p></li><li><p>Dedicated: 10</p></li></ul></td>
   </tr>
</table>

フィールドに関するその他の制限：

- VarChar や JSON などの一部のフィールドは、予想より多くのメモリを使用し、クラスターが満杯になる原因となる可能性があります。

### 次元数\{#dimensions}

ベクトルフィールドの最大次元数は**32,768**です。

### シャード\{#shards}

許可されるシャードの最大数は、クラスタープランとクラスターの CU サイズによって異なります。

<table>
   <tr>
     <th colspan="2"><p><strong>クラスタープラン & CU サイズ</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Free</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Serverless</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>Dedicated</p></td>
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

Zilliz Cloud は、コレクションおよびパーティションのデータ定義言語（DDL）操作（作成、ロード、解放、削除など）に対してもレート制限を課しています。以下のレート制限は、Serverless および Dedicated クラスターの両方のコレクションに適用されます。

<table>
   <tr>
     <th></th>
     <th><p><strong>レート制限</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクション DDL 操作</p><p>(create, load, release, drop)</p></td>
     <td><p>クラスターあたり20 req/s</p></td>
   </tr>
   <tr>
     <td><p>パーティション DDL 操作</p><p>(create, load, release, drop)</p></td>
     <td><p>クラスターあたり20 req/s</p></td>
   </tr>
</table>

## 運用\{#operations}

このセクションでは、Zilliz Cloud クラスターでの一般的なデータ操作のレート制限に焦点を当てます。

### 挿入とアップサート\{#insert-and-upsert}

挿入とアップサート操作のレート制限は、クラスターデプロイオプションと使用している CU の数によって異なります。

<table>
   <tr>
     <th></th>
     <th><p>挿入とアップサートの最大レート制限</p></th>
   </tr>
   <tr>
     <td><p>Free クラスター</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Serverless クラスター</p></td>
     <td><p>10 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated クラスター</p></td>
     <td><p>16 MB/s + 1 MB/s × CU</p><p>最大で256 MB/s。</p></td>
   </tr>
</table>

例：

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最大 `256 MB/s`

さらに、以下の追加制限が適用されます：

- 1つのシャードの書き込みレートは**32 MB/s**を超えてはいけません。

- データを挿入する際は、スキーマで定義されたすべてのフィールドを含めてください。コレクションに AutoID が有効な場合は、プライマリキーを除外してください。

- データをアップサートする際は、スキーマで定義されたすべてのフィールドを含めてください。

- 挿入またはアップサートされたエンティティを検索やクエリですぐに検索可能にするには、検索またはクエリリクエストの一貫性レベルを **Strong** に変更することを検討してください。詳細については、[一貫性レベル](./consistency-level)をお読みください。

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
     <td><p>VarChar Field</p></td>
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

フラッシュリクエストのレート制限は、特定のクラスタータイプのコレクションレベルで課される秒間0.1リクエストです。このレート制限は以下に適用されます：

- Milvus v2.4.x 以降と互換性のある Serverless クラスター。

- Milvus v2.4.x 以降と互換性のあるベータ版にアップグレードされた Dedicated クラスター。

<Admonition type="info" icon="📘" title="Notes">

手動でフラッシュ操作を実行することは推奨されません。Zilliz Cloud クラスターはこれを適切に処理します。

</Admonition>

### ロード\{#load}

ロードリクエストのレート制限は、クラスターあたり**20** req/s です。

<Admonition type="info" icon="📘" title="Notes">

新しいデータが流入している場合でも、すでにロードされているコレクションに対してロードコレクションを実行する必要はありません。

</Admonition>

### 検索\{#search}

各検索リクエスト/レスポンスは**64** MB を超えてはいけません。

各検索リクエストが含むクエリベクトルの数（通常**nq**として知られる）は、サブスクリプションプランによって異なります：

- Free および Serverless クラスターの場合、**nq** は**10**を超えてはいけません。

- Dedicated クラスターの場合、**nq** は**16,384**を超えてはいけません。

各検索レスポンスが含む数（通常**topK**として知られる）は、サブスクリプションプランによって異なります：

- Free および Serverless クラスターの場合、**topK** は返されるエンティティ数が**1,024**を超えてはいけません。

- Dedicated クラスターの場合、**topK** は返されるエンティティ数が**16,384**を超えてはいけません。

### クエリ\{#query}

各クエリリクエスト/レスポンスは**64** MB を超えてはいけません。

各クエリレスポンスは、返されるエンティティ数が最大16,384（通常**topK**として知られる）です。

### 削除\{#delete}

各削除リクエスト/レスポンスは**64** MB を超えてはいけません。

削除リクエストのレート制限は、クラスターあたり**0.5** MB/s です。

### ドロップ\{#drop}

ドロップリクエストのレート制限は、クラスターあたり**20** req/s です。

### データインポート\{#data-import}

コレクション内で実行中または保留中のインポートジョブは最大**10,000**個まで可能です。

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
     <td><p><strong>Free</strong>: 各インポートリクエストは最大1 GB のデータをインポートでき、ファイルあたり最大1 GB、インポートあたり最大1,000ファイルです。</p><p><strong>Serverless & Dedicated</strong>: 最大総インポートサイズは1 TB で、ファイルあたりの最大サイズは10 GB、最大1,000ファイルです。</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1 GB</p></td>
     <td><p><strong>Free</strong>: 各インポートリクエストは最大1 GB のデータをインポートでき、ファイルあたり最大1 GB、インポートあたり最大1,000ファイルです。</p><p><strong>Serverless & Dedicated</strong>: 最大総インポートサイズは1 TB で、ファイルあたりの最大サイズは10 GB、最大1,000ファイルです。</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>Not support</p></td>
     <td><p><strong>Free</strong>: 各インポートリクエストは最大1 GB のデータをインポートでき、サブディレクトリあたり最大1 GB、インポートあたり最大1,000サブディレクトリです。</p><p><strong>Serverless & Dedicated</strong>: 最大総インポートサイズは1 TB で、サブディレクトリあたりの最大サイズは10 GB、最大1,000サブディレクトリです。</p></td>
   </tr>
</table>

詳細については、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。

## コンソールでのバックアップ\{#backup-on-console}

手動で作成されたバックアップは永久に保持されます。

自動作成されたバックアップの最大保持期間は30日です。

## コンソールでの復元\{#restore-on-console}

バックアップファイルは、バックアップファイルの元のクラスターと同じリージョンで復元できます。復元の対象クラスターは、元のクラスターと同じ CU タイプを使用する必要があります。

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
     <td><p>コンソール IP 許可リストに最大100個の IP アドレスを追加できます。</p></td>
   </tr>
   <tr>
     <td><p>クラスター IP アクセス</p></td>
     <td><p>100</p></td>
     <td><p>クラスター IP 許可リストに最大100個の IP アドレスを追加できます。</p></td>
   </tr>
</table>

## マイグレーション\{#migration}

他のベンダーから Zilliz Cloud クラスターにデータを移行でき、マイグレーションあたりのコレクションの最大数は、Zilliz Cloud クラスターのサブスクリプションプランによって異なります。

<table>
   <tr>
     <th><p>ターゲットクラスターのサブスクリプションプラン</p></th>
     <th><p>マイグレーションあたりのコレクション最大数</p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>5</p></td>
   </tr>
   <tr>
     <td><p>Serverless / Dedicated</p></td>
     <td><p>10</p></td>
   </tr>
</table>
