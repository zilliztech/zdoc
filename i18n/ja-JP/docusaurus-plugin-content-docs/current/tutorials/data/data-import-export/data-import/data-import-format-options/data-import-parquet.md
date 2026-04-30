---
title: "Parquet ファイルからのインポート | Cloud"
slug: /data-import-parquet
sidebar_key: data-import-parquet
sidebar_label: "Parquet（推奨）"
beta: FALSE
notebook: FALSE
description: "Apache Parquet は、効率的なデータ保存と取得を目的としたオープンソースの列指向データファイル形式です。高性能な圧縮およびエンコード方式を提供し、大量の複雑なデータを管理できるように設計されており、さまざまなプログラミング言語や分析ツールでサポートされています。| Cloud"
type: origin
token: WtkSwXgDdiB0eTkEkorcDCFlnme
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - データインポート
  - milvus
  - フォーマットオプション
  - parquet

---

import Admonition from '@theme/Admonition';


# Parquet ファイルからのインポート

[Apache Parquet](https://parquet.apache.org/docs/overview/) は、効率的なデータストレージおよび検索を目的として設計されたオープンソースの列指向データファイル形式です。複雑なデータを一括で処理するための高性能な圧縮およびエンコーディングスキームを提供し、さまざまなプログラミング言語や分析ツールでサポートされています。

生データを Parquet ファイルに変換するには、[BulkWriter ツール](./use-bulkwriter) を使用することをお勧めします。次の図は、生データが Parquet ファイルにどのようにマッピングされるかを示しています。

![parquet_file_structure_en](https://zdoc-images.s3.us-west-2.amazonaws.com/parquet_file_structure_en.png "parquet_file_structure_en")

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><strong>AutoID を有効にするかどうか</strong></li>
</ul>
<p><strong>id</strong> フィールドはコレクションの主キーとなるフィールドです。この主キーフィールドを自動的にインクリメントさせるには、スキーマで <strong>AutoID</strong> を有効化できます。その場合、ソースデータの各行から <strong>id</strong> フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、事前に定義されたスキーマに含まれていないフィールドを保存する必要がある場合は、書き込み操作中に <strong>&#36;meta</strong> 列を指定し、対応するキーと値のデータを提供できます。</p>
<ul>
<li><strong>大文字・小文字の区別</strong></li>
</ul>
<p>辞書のキーおよびコレクションのフィールド名は大文字・小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と完全に一致していることを確認してください。たとえば、ターゲットコレクションに <strong>id</strong> という名前のフィールドがある場合、各エンティティ辞書には <strong>id</strong> というキーが必要です。<strong>ID</strong> や <strong>Id</strong> を使用するとエラーになります。</p>

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを Parquet ファイルに準備する場合は、以下のツリーダイアグラムに示すように、すべての Parquet ファイルをソースデータフォルダ直下に配置してください。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## データのインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法で Zilliz Cloud コレクションにデータをインポートできます。

- [複数のパスからファイルをインポートする（推奨）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [ソースフォルダからファイルをインポートする](./data-import-parquet#import-files-from-a-folder)

- [単一のファイルをインポートする](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="Notes">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パス方式を使用して一度にすべてインポートすることを推奨します。この方法により、インポート処理中に内部で最適化が行われ、後続のリソース消費を削減できます。</p>

</Admonition>

Zilliz Cloud コンソールや Milvus SDK を使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数のパスからファイルをインポートする（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする際は、各 Parquet ファイルのパスを個別のリストに含め、それらすべてのリストをより上位のリストにまとめてください。次のコード例を参照してください。

```python
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrls": [
            ["s3://bucket-name/parquet-folder-1/1.parquet"],
            ["s3://bucket-name/parquet-folder-2/1.parquet"],
            ["s3://bucket-name/parquet-folder-3/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### フォルダからファイルをインポートする\{#import-files-from-a-folder}

ソースフォルダにインポート対象のParquetファイルのみが含まれている場合、リクエストにソースフォルダを以下のように指定できます。

```python
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrls": [
            ["s3://bucket-name/parquet-folder/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

<Admonition type="info" icon="📘" title="Notes">

<p>フォルダに複数の形式のファイルが含まれている場合、リクエストは失敗します。</p>

</Admonition>

### 単一ファイルのインポート\{#import-a-single-file}

準備したデータファイルが単一のParquetファイルである場合は、以下のコード例に示すようにインポートします。

```python
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrls": [
            ["s3://bucket-name/parquet-folder/1.parquet"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

## ストレージパス\{#storage-paths}

Zilliz Cloud は、お客様のクラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルの可能なストレージパスを示します。

<table>
   <tr>
     <th><p><strong>Cloud</strong></p></th>
     <th><p><strong>クイック例</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>AWS S3</strong></p></td>
     <td><p>s3://<em>bucket-name</em>/<em>parquet-folder</em>/</p><p>s3://<em>bucket-name</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p>gs://<em>bucket-name</em>/<em>parquet-folder</em>/</p><p>gs://<em>bucket-name</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><em>https:</em>//<em>myaccount</em>.blob.core.windows.net/<em>bucket-name</em>/<em>parquet-folder</em>/</p><p><em>https:</em>//myaccount.blob.core.windows.net/<em>bucket-name</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
</table>

## 制限\{#limits}

ローカルの Parquet ファイルまたはクラウドストレージ上の Parquet ファイルからデータをインポートする際には、いくつかの制限があります。

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>1 回のインポートあたりの最大ファイル数</strong></p></th>
     <th><p><strong>最大ファイルサイズ</strong></p></th>
     <th><p><strong>インポート合計サイズの上限</strong></p></th>
   </tr>
   <tr>
     <td><p>ローカルファイルから</p></td>
     <td><p>すべてのプラン</p></td>
     <td><p>1 ファイル</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>オブジェクトストレージから</p></td>
     <td><p>Free</p></td>
     <td><p>1,000 ファイル</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>Serverless & Dedicated</p></td>
     <td><p>1,000 ファイル</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

生データを Parquet ファイルに変換するには、[BulkWriter ツール](./use-bulkwriter) の使用を推奨します。[上記の図にあるスキーマに基づいて準備されたサンプルデータをダウンロードするにはここをクリックしてください](https://assets.zilliz.com/prepared_parquet_data.parquet)。