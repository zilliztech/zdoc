---
title: "コレクションの管理(コンソール) | BYOC"
slug: /manage-collections-console
sidebar_label: "コレクションの管理(コンソール)"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudでコレクションを作成および管理するためのステップバイステップの手順を説明します。ビジュアルインターフェイスを好むユーザーを対象としています。SDKに精通している場合は、S DKを使用してコレクションを作成および管理することもできます。詳細については、Collectionを参照してください。 | BYOC"
type: origin
token: VBiwwmxdZiP3gekrQMScj8T7nLg
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - drop
  - drop by filter
  - drop by id
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search

---

import Admonition from '@theme/Admonition';


# コレクションの管理(コンソール)

このガイドでは、Zilliz Cloudでコレクションを作成および管理するためのステップバイステップの手順を説明します。ビジュアルインターフェイスを好むユーザーを対象としています。SDKに精通している場合は、S DKを使用してコレクションを作成および管理することもできます。詳細については、Collectionを参照してください。

## コレクションを作成{#create-collection}

Zilliz Cloudは、異なるニーズに対応する3つのコレクション作成方法を提供しています。

- [自分のデータを使用](./manage-collections-console#1)する:完全な制御を望むユーザーに最適です。データセットと特定のニーズに応じて、スキーマとインデックスパラメータを自主的に定義できます。

- [サンプルデータを使用](./manage-collections-console#create-sample-collection)する: Zilliz Cloudを初めて使用するユーザーに最適です。Zilliz Cloudは、サンプルデータセットに一致するスキーマを持つサンプルコレクションを提供しています。この方法は手間がかかりませんが、設定の変更はできません。

- [既存のコレクションを複製](./manage-collections-console#copy-collection)する:既存のコレクションをクラスタ内で複製するのに適しています。

### 方法1:自分のデータを使用する{#1}

コレクションを完全に制御するには、次の手順に従ってください。

![create_custom_collection](/byoc/ja-JP/create_custom_collection.png)

1. [**コレクションを作成**]ページで、コレクションのスキーマを定義し ます。

    <table>
       <tr>
         <th><p>設定ファイル</p></th>
         <th><p>説明する</p></th>
       </tr>
       <tr>
         <td><p>フィールド名</p></td>
         <td><p>フィールドの名前。各コレクションには一意の主キーと少なくとも1つのベクトルフィールド（最大4つ）があります。 デフォルトのスキーマ設計では、Zilliz Cloudはプライマリフィールド（<code>primary_key</code>）とフロートベクトル（<code>vector</code>）を予約します。必要に応じて設定をカスタマイズできます。</p></td>
       </tr>
       <tr>
         <td><p>フィールドタイプ</p></td>
         <td><p>フィールドのデータタイプ。Zilliz Cloudがサポートするフィールドは、主キー、ベクトルフィールド、スカラーフィールドの3つの主要なカテゴリに分類されます。異なるフィールドでサポートされるデータタイプは、フィールドタイプによって異なります。</p><ul><li><p>プライマリフィールド:<code>INT64</code>,<code>VARCHAR</code></p></li><li><p>ベクトルフィールド:<code>FLOAT_VECTOR</code>,<code>BINARY_VECTOR</code>,<code>FLOAT 16_VECTOR</code>,<code>BFLOAT 16_VECTOR</code>,<code>SPARSE_FLOAT_VECTOR</code>.</p></li><li><p>スカラーフィールド:<code>INT64</code>、<code>VARCHAR</code>、<code>INT 8</code>、<code>INT16</code>、<code>INT32</code>、<code>FLOAT</code>、<code>DOUBLE</code>、<code>BOOL</code>、<code>JSON</code>、<code>ARRAY</code>。</p><p>詳細は「<a href="./schema-explained">スキーマの説明</a>」を参照してください。</p></li></ul></td>
       </tr>
       <tr>
         <td><p>インデックス</p></td>
         <td><p>検索パフォーマンスを向上させるためにフィールドをインデックス化するかどうか。有効にすると、Zilliz CloudはフィールドのAUTOINDEXを作成します。詳細については、「<a href="./autoindex-explained">AUTOINDEXの説明</a>」を参照してください。</p></td>
       </tr>
       <tr>
         <td><p>メートルタイプ</p></td>
         <td><p>ベクトル間の類似性を測定するために使用されるメトリックのタイプです。このパラメータはベクトル場に対してのみ設定可能です。詳細については、「<a href="./search-metrics-explained">メトリックの種類</a>」を参照してください。</p></td>
       </tr>
       <tr>
         <td><p>デフォルト値</p></td>
         <td><p>スカラーフィールド（プライマリフィールドを除く）に対してのみ設定可能なフィールドのデフォルト値を設定するかどうか。詳細については、「<a href="./nullable-and-default">Nullableデフォルト(D)</a>」を参照してください。</p></td>
       </tr>
       <tr>
         <td><p>Nullableは無効です。</p></td>
         <td><p>スカラーフィールド（プライマリフィールドを除く）に対して、フィールドにnull値を許可するかどうかを設定できます。詳細については、「<a href="./nullable-and-default">Nullableデフォルト(D)</a>」を参照してください。</p></td>
       </tr>
       <tr>
         <td><p>Mmap</p></td>
         <td><p>MMAPを有効にするかどうか。このパラメータは、スカラーフィールド（プライマリフィールドを除く）に対してのみ設定可能です。詳細については、「<a href="./use-mmap">mmapを使う</a>」を参照してください。</p></td>
       </tr>
       <tr>
         <td><p>説明する</p></td>
         <td><p>任意です。フィールドの説明です。</p></td>
       </tr>
       <tr>
         <td><p>オートID</p></td>
         <td><p>プライマリフィールドにAuto IDを有効にするかどうか。有効にすると、Zilliz Cloudはプライマリキーの一意のIDを自動的に生成します。データ挿入時に手動で割り当てたり管理したりする必要はありません。</p></td>
       </tr>
    </table>

1. (オプション)[**詳細設定**]では、動的フィールドとパーティションキーを詳細設定に使用します。

    - **動的フィールド**:定義済みのスキーマを超えた新しいフィールドの挿入を許可します。詳細については、「[スキーマの説明](./schema-explained)」を参照してください。

    - **パーティションキー**:データをパーティションにグループ化することで、クエリの効率を改善します。詳細については、「[パーティションキーを使う](./use-partition-key)」を参照してください。

1. 「**コレクションを作成**」をクリックします。その後、コレクションに[データを挿入](./insert-entities)できます。

### 方法2:サンプルデータを使用する{#create-sample-collection}

[**Load Sample Data**]を選択し、プリセットコレクションを確認して作成を確認します。

<Admonition type="info" icon="📘" title="ノート">

<p>サンプルコレクションを作成すると、Zilliz Cloudがすべての詳細を処理しますが、設定の調整は許可されません。</p>

</Admonition>

![create_sample_collection](/byoc/ja-JP/create_sample_collection.png)

### 方法3:既存のコレクションを複製する{#copy-collection}

[アクション]メニューから[**クローンコレクション**]を**選択し**ます。

1. 新しいコレクションの名前と説明を入力します。

1. クローンアクションのスコープを選択します。コレクションのスキーマと既存のデータの両方をクローンするか、現在のクラスターにデータがないコレクションスキーマのみをクローンすることができます。

1. [**クローン**]をクリックします。

    ![copy_collection](/byoc/ja-JP/copy_collection.png)

1. [[ジョブ](./job-center)]ページでクローンの進行状況を確認できます。ジョブのステータスが**IN PROGRESS**から**SUCCESS FUL**に切り替わると、指定された属性を持つ新しいコレクションが現在のクラスタに作成されます。

    <Admonition type="info" icon="📘" title="ノート">

    <p>データとスキーマの両方を使用してコレクションを複製する場合にのみ、ジョブレコードが生成されます。スキーマのみを使用してコレクションを複製しても、ジョブレコードはトリガーされません。</p>

    </Admonition>

## コレクションを見る{#view-collections}

クラスタに作成されたすべての既存のコレクションのリストを閲覧可能にするか、コレクションの名前をクリックして詳細を表示できます。

![view_collection](/byoc/ja-JP/view_collection.png)

## ロード&リリースコレクション{#view-collections}

Zilliz Cloudでは、すべての検索およびクエリ操作はメモリ内で実行されます。したがって、コレクションをロードするには、これらの操作に必要なデータをメモリに書き込む必要があります。逆に、コレクションをリリースすると、メモリスペースが解放されます。

![load_release_collection](/byoc/ja-JP/load_release_collection.png)

## コレクションを別のデータベースに移動する{#move-collection-to-another-database}

コレクションを1つのデータベースから別のデータベースに移動できます。

![move-collection-to-another-database](/byoc/ja-JP/move-collection-to-another-database.png)

## ドロップコレクション{#drop-collection}

コレクションを削除することは、コレクションが必要なくなったときに使用される永続的なアクションです。リソースを節約するのに役立ちますが、慎重に行う必要があります。

<Admonition type="caution" icon="🚧" title="警告">

<p>コレクションを削除すると、その中のすべてのデータが不可逆的に削除されます。</p>

</Admonition>

![drop_collection](/byoc/ja-JP/drop_collection.png)

## コレクションの制限{#collection-limits}

<table>
   <tr>
     <th><p><strong>クラスタタイプ</strong></p></th>
     <th><p><strong>マックス数</strong></p></th>
     <th><p><strong>備考</strong></p></th>
   </tr>
   <tr>
     <td></td>
     <td></td>
     <td><p>最大5つのコレクションを作成できます。</p></td>
   </tr>
   <tr>
     <td></td>
     <td></td>
     <td><p>最大100個のコレクションを作成できます。</p></td>
   </tr>
   <tr>
     <td><p>専用クラスタ</p></td>
     <td><p>CUあたり64、および&lt;=409 6</p></td>
     <td><p>専用クラスターで使用されるCUごとに最大64個のコレクションを作成でき、クラスター内のコレクション数は4,096個までです。</p></td>
   </tr>
</table>

クラスタあたりのコレクション数の制限に加えて、Zilliz Cloudは消費容量の制限も適用します。これは、クラスタが消費する物理リソースを示します。次の表は、クラスタの一般的な容量の制限を示しています。

<table>
   <tr>
     <th><p><strong>CUの数</strong></p></th>
     <th><p><strong>概要キャパシティ</strong></p></th>
   </tr>
   <tr>
     <td><p>1-8のCU</p></td>
     <td><p>&lt;= 4,096</p></td>
   </tr>
   <tr>
     <td><p>12+のCU</p></td>
     <td><p>最小(512 x CUの数、655 3 6)</p></td>
   </tr>
</table>

一般容量と消費容量の計算の詳細については、「[Zillizクラウドの制限](./limits)」を参照してください。

