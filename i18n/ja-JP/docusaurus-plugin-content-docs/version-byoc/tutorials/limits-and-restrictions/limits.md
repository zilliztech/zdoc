---
title: "Zillizクラウドの制限 | BYOC"
slug: /limits
sidebar_label: "Zillizクラウドの制限"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloudプラットフォームの制限に関する情報を提供します。Zillizが提供するOPSシステムを使用して、このページに記載されているほとんどの設定を調整できます。さらにヘルプが必要な場合は、引き続きお問い合わせください。 | BYOC"
type: origin
token: WOB5ww3CziJbjGkZLVuc2tEXnTf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - limits
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';


# Zillizクラウドの制限

このページでは、Zilliz Cloudプラットフォームの制限に関する情報を提供します。Zillizが提供するOPSシステムを使用して、このページに記載されているほとんどの設定を調整できます。さらにヘルプが必要な場合は、引き続き[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

## 組織とプロジェクト{#organizations-and-projects}

次の表に、1人のユーザーに許可される組織とプロジェクトの最大数の制限を示します。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td></td>
     <td></td>
     <td><p>アカウント登録が完了すると、Zilliz Cloudは自動的に1つの組織を作成します。それ以上の組織が必要な場合は、<a href="http://support.zilliz.com">サポートチケットを作成</a>してください。ユーザーは複数の組織に参加できます。</p></td>
   </tr>
   <tr>
     <td><p>プロジェクト</p></td>
     <td><p>100</p></td>
     <td><p>各ユーザーは1つの組織で最大100のプロジェクトを作成できます。</p></td>
   </tr>
</table>

## コレクション{#collections}

### Milvus v 2.4. xに対応したクラスタ{#clusters-compatible-with-milvus-v24x}

CUごとに最大256個のコレクションまたは1,024個のパーティションを作成でき、コレクションごとに最大1,024個のパーティションが許可されます。次の式を使用して、クラスター内のコレクションとパーティションの数の上限を計算できます。

![GaPtwwjdXhgqnwb7dTEcBZKUnWf](/img/GaPtwwjdXhgqnwb7dTEcBZKUnWf.png)

- クラスター内のコレクションの合計数は、クラスター内のCU数の256倍または16,384の小なりの数にする必要があります。

- クラスタ内のすべてのコレクションのパーティションの合計数は、クラスタに割り当てられたCUの数の1,024倍または65,536のいずれか小さい方の小なりにする必要があります。

- 両方の条件を満たす必要があります。

### Milvus v 2.5. xと互換性のあるクラスタ{#clusters-compatible-with-milvus-v25x}

CUごとに最大1,024個のコレクションまたは4,096個のパーティションを作成できます。コレクションごとに最大1,024個のパーティションが許可されます。次の式を使用して、クラスター内のコレクションとパーティションの数の上限を計算できます。

![Yn0Bws7QGhDdAsbkQKhcx2AYnHc](/img/Yn0Bws7QGhDdAsbkQKhcx2AYnHc.png)

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

ベクトル場の最大次元数は32,768であ**る**。

### **レート制限**{#rate-limit}

Zilliz Cloudは、コレクションの作成、読み込み、リリース、削除を含むコレクション操作に対してレート制限を課しました。以下のレート制限は、サーバーレスおよび専用クラスターのコレクションに適用されます。

<table>
   <tr>
     <th></th>
     <th><p><strong>レート制限</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションオペレーション (作成、ロード、リリース、ドロップ)</p></td>
     <td><p>クラスタあたり5 req/s</p></td>
   </tr>
</table>

## オペレーション{#operations}

このセクションでは、Zilliz Cloudクラスターでの一般的なデータ操作のレート制限に焦点を当てています。

### 挿入する{#insert}

各挿入要求/応答は大なり**64**MBでなければなりません。

適用されるレート制限は、クラスターの種類と使用中のCUの数によって異なります。次の表に、挿入操作のレート制限を示します。

<table>
   <tr>
     <th></th>
     <th><p>最大挿入レート制限</p></th>
   </tr>
   <tr>
     <td><p>専用クラスタ1-2 CU</p></td>
     <td><p>8メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ4-8 CU</p></td>
     <td><p>12メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ12-20 CU</p></td>
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

挿入されたエンティティを検索やクエリですぐに取得できるようにするには、検索またはクエリリクエストの一貫性レベルを**強く**することを検討してください。詳細については、[一貫性レベル](./consistency-level)を参照してください。

### アップサート{#upsert}

各upsertリクエスト/レスポンスは**64**MB以上である必要があります。

適用されるレート制限は、クラスターの種類と使用中のCUの数によって異なります。次の表に、upsert操作のレート制限を示します。

<table>
   <tr>
     <th></th>
     <th><p>最大Upsertレート制限</p></th>
   </tr>
   <tr>
     <td><p>専用クラスタ1-2 CU</p></td>
     <td><p>8メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ4-8 CU</p></td>
     <td><p>12メガバイト/秒</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ12-20 CU</p></td>
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

挿入されたエンティティを検索やクエリですぐに取得できるようにするには、検索またはクエリ要求の一貫性レベルを**強く**することを検討してください。詳細については、[一貫性レベル](./consistency-level)を参照してください。

### インデックス{#index}

インデックスの種類はフィールドの種類によって異なります。次の表に、インデックス可能なフィールドの種類と対応するインデックスの種類を示します。

<table>
   <tr>
     <th><p><strong>フィールドタイプ</strong></p></th>
     <th><p><strong>インデックスタイプ</strong></p></th>
     <th><p><strong>メートルタイプ</strong></p></th>
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

- Milvus 2.4. x以降に対応したサーバーレスクラスター。

- Milvus 2.4. x以降に対応したベータ版にアップグレードされた専用クラスタ。

<Admonition type="info" icon="📘" title="ノート">

<p>手動でフラッシュ操作を実行することはお勧めできません。Zilliz Cloudクラスターが優雅に処理します。</p>

</Admonition>

### ロードする{#load}

ロード要求のレート制限は、クラスターあたり**5**req/sです。

<Admonition type="info" icon="📘" title="ノート">

<p>新しいデータがこれらのコレクションに入ってくる場合でも、すでにロードされているコレクションのロードコレクションを実行する必要はありません。</p>

</Admonition>

### 検索する{#search}

各検索リクエスト/レスポンスは**64**MB以上である必要があります。

各検索要求に含まれるクエリベクトルの数(通常は**nq**と呼ばれます)は、サブスクリプションプランによって異なります。

- FreeおよびServerlessクラスタの場合、**nq**は大なり**10**ではありません。

- Dedicatedクラスタの場合、**nq**は16,384ではな**い**。

各検索応答に含まれる番号（通常は**topK**と呼ばれます）は、サブスクリプションプランによって異なります。

- FreeクラスタとServerlessクラスタの場合、**topK**は**1,024**個のエンティティとは異なります。

- Dedicatedクラスタの場合、**topK**は16,**384**個のエンティティを返しません。

### クエリ{#query}

各クエリリクエスト/レスポンスは**64**MB以上である必要があります。

各クエリ応答には、通常**topK**として知られる16,384個を超えるエンティティは含まれません。

### 削除する{#delete}

各削除要求/応答は、大なり**64**MBであってはならない。

削除要求のレート制限は、クラスターあたり**0.5**MB/sです。

### ドロップとす{#drop}

ドロップ要求のレート制限は、クラスターあたり**5**req/sです。

### データのインポート{#data-import}

1つのコレクションには、実行中または保留中のインポートジョブを最大**10**件まで含めることができます。

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
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>サポートしない</p></td>
     <td><p>フォルダの最大体格は100 GBで、各サブディレクトリの最大体格は15 GBです。</p></td>
   </tr>
   <tr>
     <td><p>パーケット</p></td>
     <td><p>サポートしない</p></td>
     <td><p>10ギガバイト</p></td>
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

## パイプライン | NEAR DEPRECATE{#pipelines}

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

次の表に、取り込みパイプラインでPRESERVE関数によって生成されるメタデータフィールドの制限を示します。

<table>
   <tr>
     <th></th>
     <th><p><strong>マックス数</strong></p></th>
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
     <th><p><strong>マックス。チャンク/摂取</strong></p></th>
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
     <th><p><strong>マックス。使用法</strong></p></th>
   </tr>
   <tr>
     <td><p>それぞれの組織</p></td>
     <td><p>20ドル/月</p></td>
   </tr>
</table>

### トークンの使用{#pipeline-usage}

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

