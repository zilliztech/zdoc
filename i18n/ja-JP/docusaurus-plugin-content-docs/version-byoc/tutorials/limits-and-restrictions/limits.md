---
title: "Zillizクラウドの制限 | BYOC"
slug: /limits
sidebar_label: "Zillizクラウドの制限"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloudプラットフォームの制限に関する情報を提供しています。Zillizが提供するOPSシステムを使用して、このページに記載されているほとんどの設定を調整することができます。さらにヘルプが必要な場合は、お問い合わせを使用することもできます。 | BYOC"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - limits
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases

---

import Admonition from '@theme/Admonition';


# Zillizクラウドの制限

このページでは、Zilliz Cloudプラットフォームの制限に関する情報を提供しています。Zillizが提供するOPSシステムを使用して、このページに記載されているほとんどの設定を調整することができます。さらにヘルプが必要な場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)を使用することもできます。

## 組織とプロジェクト{#organizations-and-projects}

次の表に、1人のユーザーに許可される組織化とプロジェクトの最大数の制限を示します。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>プロジェクト</p></td>
     <td><p>100</p></td>
     <td><p>各ユーザーは1つの組織で最大100のプロジェクトを作成できます。</p></td>
   </tr>
</table>

## ユーザーと役割{#users-and-roles}

以下の表は、Zilliz Cloudで許可される最大ユーザー数の制限を示しています。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>組織ユーザー</p></td>
     <td><p>100</p></td>
     <td><p>1つの組織には、合計で最大100人の組織ユーザーを含めることができます。</p></td>
   </tr>
   <tr>
     <td><p>クラスタユーザ</p></td>
     <td><p>100</p></td>
     <td><p>クラスターは合計で最大100人のユーザーを持つことができます。</p></td>
   </tr>
   <tr>
     <td><p>クラスタのカスタムロール</p></td>
     <td><p>20</p></td>
     <td><p>クラスタは最大20個のカスタムロールを持つことができます。この制限を解除するには、<a href="http://support.zilliz.com">お問い合わせ</a>を使用してください。</p></td>
   </tr>
</table>

## APIキー{#api-keys}

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>APIキー</p></td>
     <td><p>100</p></td>
     <td><p>各組織は、最適なリソース利用とセキュリティのために最大100個のカスタマイズされたAPIキーを含めることができます。</p></td>
   </tr>
</table>

## クラスタ{#clusters}

### クラスタ数{#number-of-clusters}

クラスタの最大数は、支払い方法とサブスクリプションプランによって異なります。

- **有効な支払い方法がない場合**

    <table>
       <tr>
         <th><p><strong>クラスター計画</strong></p></th>
         <th><p><strong>マックス数</strong></p></th>
         <th><p><strong>備考</strong></p></th>
       </tr>
       <tr>
         <td><p>フリー</p></td>
         <td><p>1</p></td>
         <td><p>Freeクラスタプランには1つのクラスタしか利用できません。必要に応じて、既存のクラスタを削除して新しいクラスタに置き換えることができます。</p></td>
       </tr>
       <tr>
         <td><p>サーバーレス/専用(Standard)/専用(Enterprise)</p></td>
         <td><p>1</p></td>
         <td><p>無料トライアルでは1つの有料クラスタしか作成できません。追加クラスタをご希望の場合は、支払い方法を追加してください。</p></td>
       </tr>
    </table>

- **有効な支払い方法で**

    <table>
       <tr>
         <th><p><strong>クラスター計画</strong></p></th>
         <th><p><strong>マックス数</strong></p></th>
         <th><p><strong>備考</strong></p></th>
       </tr>
       <tr>
         <td><p>フリー</p></td>
         <td><p>1</p></td>
         <td><p>Freeクラスタプランには1つのクラスタしか利用できません。必要に応じて、既存のクラスタを削除して新しいクラスタに置き換えることができます。</p></td>
       </tr>
       <tr>
         <td><p>サーバーレス</p></td>
         <td><p>N/A</p></td>
         <td><p>N/A</p></td>
       </tr>
       <tr>
         <td><p>専用(スタンダード)/専用(エンタープライズ)</p></td>
         <td><p>総CUの体格<32 0></p></td>
         <td><p>組織内のクラスターの最大数は、クラスターCUの合計金額によって異なります。組織内のすべての専用クラスターの累積CU数は320を超えてはなりません。</p></td>
       </tr>
    </table>

### CU{#cus}

CUは、データの並列処理に使用される計算リソースの基本単位であり、異なるCUタイプには、CPU、メモリ、ストレージのさまざまな組み合わせが含まれます。CUの概念は、専用クラスタにのみ適用されます。

<table>
   <tr>
     <th><p><strong>クラスター計画</strong></p></th>
     <th><p><strong>の制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>専用（スタンダード）</p></td>
     <td><p>CU体格xレプリカ数&lt;=32</p></td>
     <td><p>コンソールでは、1つのクラスターに対して最大32個のCUを作成できます。 </p><p>ただし、レプリカを追加する場合は、CU体格xレプリカ数&lt;=32となります。</p></td>
   </tr>
   <tr>
     <td><p>専用(エンタープライズ)</p></td>
     <td><p>CU体格xレプリカ数&lt;=25 6</p></td>
     <td><p>コンソールでは、1つのクラスターに対して最大256個のCUを作成できます。</p><p>ただし、レプリカを追加する場合はCU体格xレプリカ数&lt;=256となります。</p></td>
   </tr>
</table>

[お問い合わせ](https://support.zilliz.com/hc/en-us)へようこそ 

- Dedicated(Standard)クラスタが32 CU以上必要な場合

- Dedicated(Enterprise)クラスタが256 CU以上必要な場合

### vCU{#vcus}

仮想コンピュートユニット(vCU)は、読み取り操作(検索やクエリなど)および書き込み操作(挿入、アップロード、削除など)によって消費されるリソースを測定するために使用されます。vCUの概念は、FreeおよびServerlessクラスターにのみ適用されます。

<table>
   <tr>
     <th><p><strong>クラスター計画</strong></p></th>
     <th><p><strong>の制限</strong></p></th>
   </tr>
   <tr>
     <td><p>フリー</p></td>
     <td><p>月間250万個のvCU</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### キャパシティ{#capacity}

次の表に、クラスタープランの種類ごとの容量の制限を示します。

<table>
   <tr>
     <th><p><strong>クラスター計画</strong></p></th>
     <th><p><strong>の制限</strong></p></th>
   </tr>
   <tr>
     <td><p>フリー</p></td>
     <td><p>クラスタあたり5 GB(クラスタあたり100万個の768-dimベクトルに相当)</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス</p></td>
     <td><p>パーティションごとに1億個の768-dimベクトル</p></td>
   </tr>
   <tr>
     <td><p>専用（CUごと）</p></td>
     <td><p>Zilliz Cloudの専用クラスターには容量制限はありません。以下は、さまざまなCUタイプの専用クラスターの容量のクイックリファレンスです。より大きな容量の場合は、専用クラスターをスケーリングしてください。詳細については、<a href="./scale-cluster">スケールクラスタ</a>を参照してください。</p><ul><li><p>Performance-optimizedCU: CUごとの150万の768 dimベクトル</p></li><li><p>容量最適化されたCU: CUあたり500万個の768-dimベクトル</p></li><li><p>拡張容量CU: CUあたり2000万個の768暗ベクトル</p></li></ul></td>
   </tr>
</table>

## レプリカ{#replicas}

レプリカを追加するには、クラスターに**8 CU以上**が必要です。以下の制限も適用されます。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>の制限</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>レプリカ</p></td>
     <td><p>10</p></td>
     <td><p>最大10個のレプリカを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>レプリカ数×CU体格</p></td>
     <td><p>&lt;= 256</p></td>
     <td><p>クラスターCU体格xレプリカ数は256を超えてはいけません。</p></td>
   </tr>
</table>

## データベース{#databases}

- データベースは専用クラスターでのみ作成できます。

- 各専用クラスターには最大1024のデータベースを持つことができます。

- デフォルトのデータベースは削除できません。

</exclude>

## コレクション{#collections}

Zilliz Cloudクラスター内の最大コレクション数とパーティション数は、割り当てられたCU数と互換性のあるMilvusバージョンによって異なります。以下の説明を参照して、クラスター内の最大コレクション数とパーティション数を計算できます。

### Milvus v 2.4. xに対応したクラスタ{#clusters-compatible-with-milvus-v24x}

1つのCUあたり最大256個のコレクションまたは1,024個のパーティションを作成でき、コレクションあたり最大1,024個のパーティションが許可されます。クラスター内のコレクションとパーティションの数の上限を計算するには、次の式を使用できます

![MhA4wDlMwhhXrvbFio6cS3LNnNe](/img/MhA4wDlMwhhXrvbFio6cS3LNnNe.png)

- クラスター内のコレクションの合計数は、クラスター内のCU数の256倍または16,384の小なりの数にする必要があります。

- クラスタ内のすべてのコレクションのパーティションの合計数は、クラスタに割り当てられたCUの数の1,024倍または65,536のいずれか小さい方の小なりにする必要があります。

- 両方の条件を満たす必要があります。

### Milvus v 2.5. xと互換性のあるクラスタ{#cluster-compatible-with-milvus-v25x}

1つのCUあたり最大1,024個のコレクションまたは4,096個のパーティションを作成でき、コレクションあたり最大1,024個のパーティションが許可されます。クラスター内のコレクションとパーティションの数の上限を計算するには、次の式を使用できます

![I1aJwA2LShihxQbyG30cFm14ngf](/img/I1aJwA2LShihxQbyG30cFm14ngf.png)

- クラスタ内のすべてのコレクションのパーティションの合計数は、クラスタに割り当てられたCUの数の4,096倍または65,536の小なり倍または65,536の小なりになる必要があります。以下のレシピを参照してください。

- クラスター内のコレクションの合計数は、クラスター内のCU数の1,024倍または16,384倍の小なりにする必要があります。

- 両方の条件を満たす必要があります。

### フィールド{#fields}

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションごとのフィールド</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>コレクションごとのベクトルフィールド</p></td>
     <td><p>4</p></td>
   </tr>
</table>

他のフィールドの制限:

- Null値はどのフィールドタイプでもサポートされていません。

- VarCharやJSONなどの一部のフィールドは、予想よりも多くのメモリを使用し、クラスターがいっぱいになる可能性があります。

### ディメンション{#dimensions}

ベクトル場の最大次元数は32,768です。

### 破片{#shards}

許可されるシャードの最大数は、クラスタープランとクラスターCUの体格によって異なります。

<table>
   <tr>
     <th colspan="2"><p><strong>クラスタ計画とCUサイズ</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>フリー</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>サーバーレス</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>専用の</p></td>
     <td><p>1-2のCU</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>4-8のCU</p></td>
     <td><p>4</p></td>
   </tr>
   <tr>
     <td><p>12-64のCU</p></td>
     <td><p>8</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>64のCU</p></blockquote></td>
     <td><p>16</p></td>
   </tr>
</table>

### レート制限{#rate-limit}

Zilliz Cloudは、コレクションの作成、読み込み、リリース、削除を含むコレクション操作に対してレート制限を課しました。以下のレート制限は、サーバーレスおよび専用クラスターのコレクションに適用されます。

<table>
   <tr>
     <th></th>
     <th><p><strong>レート制限</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションオペレーション</p><p>(作成、ロード、リリース、ドロップ)</p></td>
     <td><p>クラスタあたり5 req/s</p></td>
   </tr>
</table>

## オペレーション{#operations}

このセクションでは、Zilliz Cloudクラスターでの一般的なデータ操作のレート制限に焦点を当てています。

### 挿入する{#insert}

各挿入要求/応答は、大なり**64**MBであってはなりません。

適用されるレート制限は、クラスターの種類と使用中のCUの数によって異なります。次の表に、挿入操作のレート制限を示します。

<table>
   <tr>
     <th></th>
     <th><p>最大挿入レート制限</p></th>
   </tr>
   <tr>
     <td><p>専用クラスタ[1 CU,2 CU]</p></td>
     <td><p>8メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[4 CU、8 CU]</p></td>
     <td><p>12メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[12 CU、20 CU]</p></td>
     <td><p>16メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[24 CU、64 CU]</p></td>
     <td><p>24メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[64 CUs,128 CUs)</p></td>
     <td><p>36メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[128 CUs,256 CUs)</p></td>
     <td><p>48メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>256 CU以上の専用クラスタ</p></td>
     <td><p>64メガバイト/秒</p></td>
   </tr>
</table>

データを挿入するときは、すべてのスキーマ定義フィールドを含めます。コレクションでAutoIDが有効になっている場合は、主キーを除外します。

検索やクエリで挿入されたエンティティをすぐに取得できるようにするには、検索やクエリの要求の一貫性レベルを**Strong**に変更することを検討してください。詳細については、[一貫性レベル](./consistency-level)を参照してください。

### アップサート{#upsert}

各upsertリクエスト/レスポンスは大なり**64**MBでなければなりません。

適用されるレート制限は、クラスターの種類と使用中のCUの数によって異なります。次の表に、upsert操作のレート制限を示します。

<table>
   <tr>
     <th></th>
     <th><p>最大Upsertレート制限</p></th>
   </tr>
   <tr>
     <td><p>専用クラスタ[1 CU,2 CU]</p></td>
     <td><p>8メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[4 CU、8 CU]</p></td>
     <td><p>12メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[12 CU、20 CU]</p></td>
     <td><p>16メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[24 CU、64 CU]</p></td>
     <td><p>24メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[64 CUs,128 CUs)</p></td>
     <td><p>36メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ[128 CUs,256 CUs)</p></td>
     <td><p>48メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>256 CU以上の専用クラスタ</p></td>
     <td><p>64メガバイト/秒</p></td>
   </tr>
</table>

データを更新する際には、スキーマで定義されたすべてのフィールドを含めてください。 

アップサートされたエンティティを検索やクエリですぐに取得できるようにするには、検索やクエリリクエストの一貫性レベルを**Strong**に変更することを検討してください。詳細については、[一貫性レベル](./consistency-level)を参照してください。

### インデックス{#index}

インデックスの種類はフィールドの種類によって異なります。次の表に、インデックス可能なフィールドの種類と対応するインデックスの種類を示します。

<table>
   <tr>
     <th><p><strong>フィールドタイプ</strong></p></th>
     <th><p><strong>インデックスタイプ</strong></p></th>
     <th><p><strong>メトリックタイプ</strong></p></th>
   </tr>
   <tr>
     <td><p>ベクトル場</p></td>
     <td><p>AUTOINDEX</p></td>
     <td><p>L 2、IP、およびCOSINE</p></td>
   </tr>
   <tr>
     <td><p>VarCharフィールド</p></td>
     <td><p>TRIE</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Int 8/16/32/64</p></td>
     <td><p>STLソート</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>フロート32/64</p></td>
     <td><p>STLソート</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### フラッシュ{#flush}

フラッシュ要求のレート制限は、特定のクラスタータイプのコレクションレベルで課せられる1秒あたり0.1要求です。このレート制限は、以下に適用されます。

- Milvus 2.4. x以降と互換性のあるサーバーレスクラスター。

- Milvus 2.4. x以降に対応したベータ版にアップグレードされた専用クラスタ。

<Admonition type="info" icon="📘" title="ノート">

<p>手動でフラッシュ操作を実行することはお勧めできません。Zilliz Cloudクラスターが優雅に処理します。</p>

</Admonition>

### ロードする{#load}

クラスターあたりのロード要求のレート制限は**5**req/sです。

<Admonition type="info" icon="📘" title="ノート">

<p>新しいデータがこれらのコレクションに入ってくる場合でも、すでにロードされているコレクションのロードコレクションを実行する必要はありません。</p>

</Admonition>

### 検索する{#search}

各検索リクエスト/レスポンスは、大なり**64**MBであってはなりません。

各検索リクエストに含まれるクエリベクトルの数（通常は**nq**）は、サブスクリプションプランによって異なります。

- FreeクラスタとServerlessクラスタでは、**nq**は大なり**10**ではありません。

- 専用クラスタの場合、**nq**は大なり**16,384**ではありません。

各検索応答に含まれる番号（通常は「topK」として知られています）は、サブスクリプションプランによって異なります。

- FreeおよびServerlessクラスターの場合、**topK**は大なり**1,024**エンティティではありません。

- 専用クラスタの場合、**topK**は大なり**16,384**エンティティではありません。

### クエリ{#query}

各クエリリクエスト/レスポンスは、大なり**64**MBであってはなりません。

各クエリ応答には、通常「topK」として知られる16,384以上のエンティティが含まれていません。

### 削除する{#delete}

各削除リクエスト/レスポンスは、大なり**64**MBであってはなりません。

削除要求のレート制限は、クラスターあたり0.5 MB/sです。

### 落とす{#drop}

ドロップ要求のレート制限は、クラスターあたり**5**req/sです。

### データのインポート{#data-import}

コレクションには、最大10個の実行中または保留中のインポートジョブを含めることができます。

Zilliz Cloudは、Webコンソールにインポートするファイルに制限を課しています。

<table>
   <tr>
     <th><p>ファイルタイプ</p></th>
     <th><p>ローカルアップロード</p></th>
     <th><p>S 3/GCS/その他のOSSからの同期</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p>フリー: 512 MB</p><p>サーバーレス&amp;専用: 1 TB</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>サポートしない</p></td>
     <td><p>フリー: 512 MB</p><p>サーバーレス&amp;専用:フォルダの最大体格は1 TBで、各サブディレクトリの最大体格は10 GBです。</p></td>
   </tr>
   <tr>
     <td><p>パーケット</p></td>
     <td><p>サポートしない</p></td>
     <td><p>フリー: 512 MB</p><p>サーバーレス&amp;専用: 1 TB</p></td>
   </tr>
</table>

詳細については、[ストレージオプション](./data-import-storage-options)と[書式オプション](./data-import-format-options)を参照してください。

## コンソールでのバックアップ{#backup-on-console}

手動で作成したバックアップは永久に保持されます。

自動的に作成されたバックアップの最大保存期間は30日間です。 

## コンソールでの復元{#restore-on-console}

スナップショットの元のクラスタと同じリージョンのスナップショットを復元することができます。復元の対象クラスタは、元のクラスタと同じCUタイプを使用する必要があります。

## IPアクセスリスト{#ip-access-list}

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td><p>IPアドレス(CIDR)</p></td>
     <td><p>20</p></td>
     <td><p>許可リストには最大20個のIPアドレスを追加できます。</p></td>
   </tr>
</table>

## マイグレーション{#migration}

他のベンダーからデータをZilliz Cloudクラスターに移行することができます。移行ごとの最大コレクション数は、Zilliz Cloudクラスターのサブスクリプションプランによって異なります。

<table>
   <tr>
     <th><p>対象クラスタのサブスクリプションプラン</p></th>
     <th><p>マイグレーションごとの最大コレクション数</p></th>
   </tr>
   <tr>
     <td><p>フリー</p></td>
     <td><p>5</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス/専用</p></td>
     <td><p>10</p></td>
   </tr>
</table>

## パイプライン|NEAR DEPRECATE{#pipelines}

### パイプラインの数{#number-of-pipelines}

次の表に、プロジェクトで作成できるさまざまな種類のパイプラインの制限を示します。

<table>
   <tr>
     <th><p><strong>パイプラインタイプ</strong></p></th>
     <th><p><strong>プロジェクトごとの最大数</strong></p></th>
   </tr>
   <tr>
     <td><p>摂取パイプライン</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>削除パイプライン</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>検索パイプライン</p></td>
     <td><p>100</p></td>
   </tr>
</table>

### 摂取する{#ingestion}

次の表は、各埋め込みモデルでサポートされるカスタマイズされたチャンク体格の制限を示しています。

<table>
   <tr>
     <th><p><strong>埋め込みモデル</strong></p></th>
     <th><p><strong>チャンクサイズの範囲（トークン）</strong></p></th>
   </tr>
   <tr>
     <td><p>zilliz/bge-based-en-v 1.5-ダウンロード</p></td>
     <td><p>20-500</p></td>
   </tr>
   <tr>
     <td><p>zilliz/bge-base-zh-v 1.5-ダウンロード</p></td>
     <td><p>20-500</p></td>
   </tr>
   <tr>
     <td><p>タイトル: voyageai/voyage-2</p></td>
     <td><p>20-3,000</p></td>
   </tr>
   <tr>
     <td><p>voyageai/航海コード-2</p></td>
     <td><p>20-12,000</p></td>
   </tr>
   <tr>
     <td><p>voyageai/ヴォヤージュラージ2</p></td>
     <td><p>20-12,000</p></td>
   </tr>
   <tr>
     <td><p>OPENAI/text-embedding-3-small</p></td>
     <td><p>250-8,191</p></td>
   </tr>
   <tr>
     <td><p>OPENAI/text-embedding-3-large</p></td>
     <td><p>250-8,191</p></td>
   </tr>
</table>

次の表は、取り込みパイプラインでPRESERVE関数によって生成されるメタデータフィールドの制限を示しています。

<table>
   <tr>
     <th></th>
     <th><p><strong>マックス。数</strong></p></th>
   </tr>
   <tr>
     <td><p>メタデータフィールドの数</p></td>
     <td><p>50</p></td>
   </tr>
   <tr>
     <td><p>VARCHARフィールドのmax_length</p></td>
     <td><p>4,000</p></td>
   </tr>
</table>

次の表は、毎回摂取できるチャンクの数の制限を示しています。

<table>
   <tr>
     <th><p><strong>埋め込みモデル</strong></p></th>
     <th><p><strong>最大チャンク/摂取量</strong></p></th>
   </tr>
   <tr>
     <td><p>zilliz/bge-based-en-v 1.5-ダウンロード</p></td>
     <td><p>3,500</p></td>
   </tr>
   <tr>
     <td><p>タイトル: voyageai/voyage-2</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>voyageai/航海コード-2</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>OPENAI/text-embedding-3-small</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>OPENAI/text-embedding-large</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>zilliz/bge-base-zh-v 1.5-ダウンロード</p></td>
     <td><p>3,500</p></td>
   </tr>
</table>

### パイプラインの使用{#pipeline-usage}

<table>
   <tr>
     <th></th>
     <th><p><strong>マックス。使用</strong></p></th>
   </tr>
   <tr>
     <td><p>それぞれの組織</p></td>
     <td><p>20ドル/月</p></td>
   </tr>
</table>

### トークンの使用{#token-usage}

次の表に、トークンの使用制限を示します。

<table>
   <tr>
     <th><p><strong>パイプラインタイプ</strong></p></th>
     <th><p><strong>埋め込みモデル</strong></p></th>
     <th><p><strong>最大トークン使用量</strong></p></th>
   </tr>
   <tr>
     <td rowspan="2"><p>摂取パイプライン</p></td>
     <td><p>Openai/text-embedding-3-small&amp;Openai/text-embedding-3-large</p></td>
     <td><p>80,000,000</p></td>
   </tr>
   <tr>
     <td><p>その他</p></td>
     <td><p>100,000,000</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>検索パイプライン</p></td>
     <td><p>Openai/text-embedding-3-small&amp;Openai/text-embedding-3-large</p></td>
     <td><p>30,000,000</p></td>
   </tr>
   <tr>
     <td><p>その他</p></td>
     <td><p>20,000,000</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>組織内のすべてのパイプライン</p></td>
     <td><p>Openai/text-embedding-3-small&amp;Openai/text-embedding-3-large</p></td>
     <td><p>150,000,000</p></td>
   </tr>
   <tr>
     <td><p>その他</p></td>
     <td><p>200,000,000</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>組織内のすべてのパイプラインの最大トークン使用量については、削除されたパイプラインのトークン使用量も全体のカウントに含まれます。</p>

</Admonition>

</exclude>