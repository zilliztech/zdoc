---
title: "Zilliz Cloud 制限 | Cloud"
slug: /limits
sidebar_label: "Zilliz Cloud 制限"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud プラットフォームの制限についての情報を提供します。これらの制限に関連する問題を報告する必要がある場合は、リクエストを送信してください。| Cloud"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - milvus
  - limits
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud 制限

このページでは、Zilliz Cloud プラットフォーム上の制限に関する情報を提供します。これらの制限に関連する問題を報告する必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

## 組織とプロジェクト\{#organizations-and-projects}

以下の表は、1人のユーザーが作成できる組織とプロジェクトの最大数の制限を示しています。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>組織</p></td>
     <td><p>1</p></td>
     <td><p>Zilliz Cloudは、アカウント登録が完了すると自動的に1つの組織を作成します。さらに多くの組織が必要な場合は、<a href="http://support.zilliz.com">サポートチケットを作成</a>してください。ユーザーは複数の組織に参加できます。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト</p></td>
     <td><p>100</p></td>
     <td><p>各ユーザーは1つの組織で最大100個のプロジェクトを作成できます。</p></td>
   </tr>
</table>

## ユーザーとロール\{#users-and-roles}

以下の表は、Zilliz Cloudで許可されているユーザーの最大数に関する制限を示しています。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>組織ユーザー</p></td>
     <td><p>100</p></td>
     <td><p>1つの組織は最大100人の組織ユーザーを持つことができます。</p></td>
   </tr>
   <tr>
     <td><p>クラスターユーザー</p></td>
     <td><p>100</p></td>
     <td><p>1つのクラスターは最大100人のユーザーを持つことができます。</p></td>
   </tr>
   <tr>
     <td><p>クラスター カスタムロール</p></td>
     <td><p>20</p></td>
     <td><p>1つのクラスターは最大20個のカスタムロールを持つことができます。<a href="http://support.zilliz.com">お問い合わせ</a>よりこの制限を解除できます。</p></td>
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
     <td><p>各組織は、リソースの最適な利用とセキュリティのために最大100個のカスタマイズされたAPIキーを含むことができます。</p></td>
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
     <td><p>ボリューム</p></td>
     <td><p>100</p></td>
     <td><p>各組織は最大100個のボリュームを含むことができます。</p></td>
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
         <td><p>フリープラン</p></td>
         <td><p>1</p></td>
         <td><p>各組織に許可されるフリープランのクラスターは1つだけです。必要に応じて既存のフリープランクラスターを削除し、新しいクラスターに置き換えることができます。</p></td>
       </tr>
       <tr>
         <td><p>サーバーレス/専用</p></td>
         <td><p>1</p></td>
         <td><p>無料トライアル期間中は、1つのサーバーレス/専用クラスターのみを作成できます。追加のクラスターが必要な場合は、支払い方法を追加してください。</p></td>
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
         <td><p>フリープラン</p></td>
         <td><p>1</p></td>
         <td><p>各組織に許可されるフリープランのクラスターは1つだけです。必要に応じて既存のフリープランクラスターを削除し、新しいクラスターに置き換えることができます。</p></td>
       </tr>
       <tr>
         <td><p>サーバーレス</p></td>
         <td><p>N/A</p></td>
         <td><p>N/A</p></td>
       </tr>
       <tr>
         <td><p>専用</p></td>
         <td><p>合計CUサイズ&lt;320</p></td>
         <td><p>組織内のクラスターの最大数は、クラスターのCUの合計数によって異なります。各組織のすべての専用クラスターのCU数の合計は320を超えてはなりません。</p></td>
       </tr>
    </table>

### CU\{#cus}

CUはデータの並列処理に使用される基本的な計算リソース単位であり、異なるCUタイプはCPU、メモリ、ストレージのさまざまな組み合わせで構成されます。CUの概念は専用クラスターにのみ適用されます。

<table>
   <tr>
     <th><p><strong>プロジェクトプランおよびクラスターデプロイオプション</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>スタンダードプロジェクトの専用クラスター</p></td>
     <td><p>CUサイズ × レプリカ数 &lt;=32</p></td>
     <td><p>コンソール上では、1つのクラスターに最大32CUを作成できます。</p><p>ただし、レプリカが追加された場合、制限はCUサイズ × レプリカ数 &lt;=32になります。</p></td>
   </tr>
   <tr>
     <td><p>エンタープライズプロジェクトの専用クラスター</p></td>
     <td><p>CUサイズ × レプリカ数 &lt;=256</p></td>
     <td><p>コンソール上では、1つのクラスターに最大256CUを作成できます。</p><p>ただし、レプリカが追加された場合、制限はCUサイズ × レプリカ数 &lt;=256になります。</p></td>
   </tr>
</table>

[お問い合わせ](https://support.zilliz.com/hc/en-us)は以下の場合に歓迎します

- スタンダードプロジェクトの専用クラスターに32CU以上が必要な場合
- エンタープライズプロジェクトの専用クラスターに256CU以上が必要な場合

### vCU\{#vcus}

仮想コンピューティングユニット（vCU）は、検索やクエリなどの読み取り操作および挿入、アップサート、削除などの書き込み操作で消費されるリソースを測定するために使用されます。vCUの概念は、フリープランおよびサーバーレスクラスターにのみ適用されます。

<table>
   <tr>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>制限</strong></p></th>
   </tr>
   <tr>
     <td><p>フリープラン</p></td>
     <td><p>月あたり250万vCU</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### 容量\{#capacity}

以下の表は、各タイプのクラスタープランの容量に関する制限を示しています。

<table>
   <tr>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>制限</strong></p></th>
   </tr>
   <tr>
     <td><p>フリープラン</p></td>
     <td><p>クラスターあたり5GB（768次元のベクトル100万個に相当）</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス</p></td>
     <td><p>Zilliz Cloudのサーバーレスクラスターには容量制限はありません。</p></td>
   </tr>
   <tr>
     <td><p>専用（1CUあたり）</p></td>
     <td><p>Zilliz Cloudの専用クラスターには容量制限はありません。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注意">

<p>専用クラスターの上限容量は使用されるCUのタイプとサイズによって異なります。クラスターの容量が不足している場合は、CUのタイプとサイズを調整することを検討してください。詳しくは、<a href="./scale-cluster">クラスターのスケーリング</a>をご覧ください。</p>

</Admonition>

## レプリカ\{#replicas}

レプリカを追加するには、クラスターに**8CU以上**が必要です。以下の制限も適用されます。

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>レプリカ</p></td>
     <td><p>10</p></td>
     <td><p>最大10個のレプリカを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>レプリカ数 × CUサイズ</p></td>
     <td><p>&lt;= 256</p></td>
     <td><p>クラスターのCUサイズ × レプリカ数は256を超えてはなりません。</p></td>
   </tr>
</table>

## データベース\{#databases}

- データベースは専用クラスターでのみ作成できます。
- 各専用クラスターは最大1024個のデータベースを持つことができます。
- デフォルトデータベースは削除できません。

## コレクション\{#collections}

Zilliz Cloudクラスター内のコレクションとパーティションの最大数は、クラスターに割り当てられたCU数と互換性のあるMilvusバージョンによって異なります。以下の説明を参照して、クラスター内のコレクションとパーティションの最大数を計算できます。

1CUあたり最大**1,024**個のコレクションまたは**4,096**個のパーティションを作成でき、1つのコレクションにつき最大**1,024**個のパーティションが許可されます。クラスター内のコレクションおよびパーティションの上限を計算するには、以下の数式を使用できます。

![I1aJwA2LShihxQbyG30cFm14ngf](/img/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスター内のコレクションの総数は、クラスター内のCU数の1,024倍または16,384のいずれか小さい方以下でなければなりません。
- クラスター内のすべてのコレクションにわたるパーティションの総数は、クラスターに割り当てられたCU数の4,096倍または65,536のいずれか小さい方以下でなければなりません。
- 両方の条件を満たす必要があります。

### フィールド\{#fields}

<table>
   <tr>
     <th><p><strong>項目</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションあたりのフィールド</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>コレクションあたりのベクトルフィールド</p></td>
     <td><ul><li><p>フリープラン &amp; サーバーレス: 4</p></li><li><p>専用: 10</p></li></ul></td>
   </tr>
</table>

その他のフィールドの制限:

- VarCharやJSONなどの一部のフィールドは予想よりも多くのメモリを使用し、クラスターがいっぱいになる原因になることがあります。

### 次元\{#dimensions}

ベクトルフィールドの最大次元数は**32,768**です。

### シャード\{#shards}

許可される最大シャード数は、クラスタープランとクラスターCUサイズによって異なります。

<table>
   <tr>
     <th colspan="2"><p><strong>クラスタープラン &amp; CU サイズ</strong></p></th>
     <th><p><strong>最大数</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>フリープラン</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>サーバーレス</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>専用</p></td>
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
     <td><p>&gt; 64 CU</p></td>
     <td><p>16</p></td>
   </tr>
</table>

### レート制限\{#rate-limit}

Zilliz Cloudでは、コレクションおよびパーティションのデータ定義言語（DDL）操作（作成、ロード、リリース、ドロップなど）にもレート制限が課されます。以下のレート制限は、サーバーレスクラスターと専用クラスターの両方のコレクションに適用されます。

<table>
   <tr>
     <th></th>
     <th><p><strong>レート制限</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションDDL操作</p><p>（作成、ロード、リリース、削除）</p></td>
     <td><p>20回/秒/クラスター</p></td>
   </tr>
   <tr>
     <td><p>パーティションDDL操作</p><p>（作成、ロード、リリース、削除）</p></td>
     <td><p>20回/秒/クラスター</p></td>
   </tr>
</table>

## 操作\{#operations}

このセクションでは、Zilliz Cloudクラスターの一般的なデータ操作に関するレート制限について説明します。

### 挿入\{#insert}

各挿入要求/応答は、**64MB**を超えてはなりません。

適用されるレート制限は、クラスタータイプと使用中のCU数によって異なります。以下の表は、挿入操作のレート制限を示しています。

<table>
   <tr>
     <th></th>
     <th><p>最大挿入レート制限</p></th>
   </tr>
   <tr>
     <td><p>フリープランクラスター</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>サーバーレスクラスター</p></td>
     <td><p>10 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [1 CU, 2 CUs]</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [4 CUs, 8 CUs]</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [12 CUs, 20 CUs]</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [24 CUs, 64 CUs)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [64 CUs, 128CUs)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [128 CUs, 256CUs)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター &gt;= 256 CUs</p></td>
     <td><p>64 MB/s</p></td>
   </tr>
</table>

データを挿入する際は、スキーマで定義されたすべてのフィールドを含めてください。コレクションにAutoIDが有効になっている場合は、プライマリーキーを除外してください。

挿入されたエンティティを検索およびクエリですぐに取得できるようにするには、検索またはクエリ要求の整合性レベルを**Strong**に変更することを検討してください。詳しくは[整合性レベル](./consistency-level)をご覧ください。

### アップサート\{#upsert}

各アップサート要求/応答は、**64MB**を超えてはなりません。

適用されるレート制限は、クラスタータイプと使用中のCU数によって異なります。以下の表は、アップサート操作のレート制限を示しています。

<table>
   <tr>
     <th></th>
     <th><p>最大アップサートレート制限</p></th>
   </tr>
   <tr>
     <td><p>フリープランクラスター</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>サーバーレスクラスター</p></td>
     <td><p>10 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [1 CU, 2 CUs]</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [4 CUs, 8 CUs]</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [12 CUs, 20 CUs]</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [24 CUs, 64 CUs)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [64 CUs, 128CUs)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター [128 CUs, 256CUs)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><p>専用クラスター &gt;= 256 CUs</p></td>
     <td><p>64 MB/s</p></td>
   </tr>
</table>

データをアップサートする際は、スキーマで定義されたすべてのフィールドを含めてください。

アップサートされたエンティティを検索およびクエリですぐに取得できるようにするには、検索またはクエリ要求の整合性レベルを**Strong**に変更することを検討してください。詳しくは[整合性レベル](./consistency-level)をご覧ください。

### インデックス\{#index}

インデックスタイプはフィールドタイプによって異なります。以下の表は、インデックス可能なフィールドタイプと対応するインデックスタイプを示しています。

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
     <td><p>VarCharフィールド</p></td>
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

フラッシュ要求のレート制限は、クラスタータイプごとにコレクションレベルで0.1回/秒です。このレート制限は以下に適用されます：

- Milvus v2.4.x以降に互換性があるサーバーレスクラスター
- Milvus v2.4.x以降に互換性があるベータ版にアップグレードされた専用クラスター

<Admonition type="info" icon="📘" title="注意">

<p>フラッシュ操作を手動で実行することは推奨されていません。Zilliz Cloudクラスターはこの処理を適切に処理します。</p>

</Admonition>

### ロード\{#load}

ロード要求のレート制限は**20**回/秒/クラスターです。

<Admonition type="info" icon="📘" title="注意">

<p>既にロードされているコレクションに対してコレクションをロードする必要はありません（新しいデータがこれらのコレクションに流入している場合でも）。</p>

</Admonition>

### 検索\{#search}

各検索要求/応答は、**64MB**を超えてはなりません。

各検索要求が持つクエリーベクトルの数（通常は**nq**と呼ばれます）は、サブスクリプションプランによって異なります：

- フリープランおよびサーバーレスクラスターの場合、**nq**は**10**以下です。
- 専用クラスターの場合、**nq**は**16,384**以下です。

各検索応答が持つ数（通常は**topK**と呼ばれます）は、サブスクリプションプランによって異なります：

- フリープランおよびサーバーレスクラスターの場合、返される**topK**は**1,024**個のエンティティ以下です。
- 専用クラスターの場合、返される**topK**は**16,384**個のエンティティ以下です。

### クエリ\{#query}

各クエリ要求/応答は、**64MB**を超えてはなりません。

各クエリ応答は、返されるエンティティ（通常は**topK**と呼ばれます）が16,384個以下です。

### 削除\{#delete}

各削除要求/応答は、**64** MBを超えてはなりません。

削除要求のレート制限は**0.5** MB/s / クラスターです。

### ドロップ\{#drop}

ドロップ要求のレート制限は**20**回/秒/クラスターです。

### データインポート\{#data-import}

1つのコレクションで最大**10,000**個の実行中または保留中のインポートジョブを持つことができます。

Zilliz Cloudでは、Webコンソールにインポートするファイルにも制限が課されます。

<table>
   <tr>
     <th><p>ファイルタイプ</p></th>
     <th><p>ローカルアップロード</p></th>
     <th><p>オブジェクトストレージから</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1GB</p></td>
     <td><p><strong>フリープラン</strong>: 各インポート要求は最大1GBのデータをインポートでき、ファイルごとの最大サイズは1GB、1回のインポートあたり最大1,000ファイルです。</p><p><strong>サーバーレス &amp; 専用</strong>: 最大合計インポートサイズは1TB、各ファイルの最大サイズは10GB、最大1,000ファイルです。</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1GB</p></td>
     <td><p><strong>フリープラン</strong>: 各インポート要求は最大1GBのデータをインポートでき、ファイルごとの最大サイズは1GB、1回のインポートあたり最大1,000ファイルです。</p><p><strong>サーバーレス &amp; 専用</strong>: 最大合計インポートサイズは1TB、各ファイルの最大サイズは10GB、最大1,000ファイルです。</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>サポートされていません</p></td>
     <td><p><strong>フリープラン</strong>: 各インポート要求は最大1GBのデータをインポートでき、サブディレクトリごとの最大サイズは1GB、1回のインポートあたり最大1,000サブディレクトリです。</p><p><strong>サーバーレス &amp; 専用</strong>: 最大合計インポートサイズは1TB、各サブディレクトリの最大サイズは10GB、最大1,000サブディレクトリです。</p></td>
   </tr>
</table>

詳しくは、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。

## コンソールでのバックアップ\{#backup-on-console}

手動で作成されたバックアップは永久に保持されます。

自動作成されたバックアップの最大保持期間は30日です。

## コンソールでのリストア\{#restore-on-console}

スナップショットの元のクラスターと同じリージョンにスナップショットを復元できます。復元の対象クラスターは、元のクラスターと同じCUタイプを使用する必要があります。

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
     <td><p>最大100個のIPアドレスを許可リストに追加できます。</p></td>
   </tr>
</table>

## マイグレーション\{#migration}

他社のデータをZilliz Cloudクラスターに移行でき、マイグレーションごとのコレクションの最大数は、Zilliz Cloudクラスターのサブスクリプションプランによって異なります。

<table>
   <tr>
     <th><p>ターゲットクラスターのサブスクリプションプラン</p></th>
     <th><p>マイグレーションごとの最大コレクション数</p></th>
   </tr>
   <tr>
     <td><p>フリープラン</p></td>
     <td><p>5</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス / 専用</p></td>
     <td><p>10</p></td>
   </tr>
</table>