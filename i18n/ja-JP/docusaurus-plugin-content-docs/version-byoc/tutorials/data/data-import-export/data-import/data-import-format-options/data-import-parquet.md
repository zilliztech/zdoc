---
title: "Parquetファイルからのインポート | BYOC"
slug: /data-import-parquet
sidebar_label: "Parquet（推奨）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Parquetは、効率的なデータストレージと取得を目的としたオープンソースの列指向データファイル形式です。複雑なデータを一括して管理するための高性能な圧縮およびエンコーディング方式を提供し、さまざまなプログラミング言語およびアナリティクスツールでサポートされています。| BYOC"
type: origin
token: WtkSwXgDdiB0eTkEkorcDCFlnme
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - parquet
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';


# Parquetファイルからのインポート

[Apache Parquet](https://parquet.apache.org/docs/overview/)は、効率的なデータストレージと取得を目的としたオープンソースの列指向データファイル形式です。複雑なデータを一括して管理するための高性能な圧縮およびエンコーディング方式を提供し、さまざまなプログラミング言語およびアナリティクスツールでサポートされています。

[バッチライターツール](./use-bulkwriter)を使用して、生データをParquetファイルに変換することをお勧めします。以下の図は、生データをParquetファイルにどのようにマッピングできるかを示しています。

![parquet_file_structure_en](/img/parquet_file_structure_en.png)

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p><strong>id</strong>フィールドはコレクションの主フィールドとして機能します。主フィールドを自動的にインクリメントするには、スキーマで<strong>AutoID</strong>を有効にできます。この場合、ソースデータの各行から<strong>id</strong>フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要がある場合は、書き込み操作中に<strong>&#36;meta</strong>列を指定し、対応するキーと値のデータを提供できます。</p>
<ul>
<li><strong>大文字と小文字の区別</strong></li>
</ul>
<p>辞書キーとコレクションフィールド名は大文字と小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と正確に一致していることを確認してください。ターゲットコレクションに<strong>id</strong>という名前のフィールドがある場合、各エンティティ辞書には<strong>id</strong>という名前のキーが含まれている必要があります。<strong>ID</strong>や<strong>Id</strong>を使用するとエラーになります。</p>

</Admonition>

## ディレクトリ構造\{#directory-structure}

データをParquetファイルに変換することを選択した場合、以下のツリー図に示すように、すべてのParquetファイルをソースデータフォルダに直接配置します。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet
```

## データのインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法を使用してZilliz Cloudコレクションにインポートできます。

- [複数のパスからのファイルインポート（推奨）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [ソースフォルダからのファイルインポート](./data-import-parquet#import-files-from-a-folder)

- [単一ファイルのインポート](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="注意">

<p>ファイルが比較的小さな場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることをお勧めします。この方法により、インポートプロセス中に内部的な最適化が可能になり、後のリソース消費を減らすのに役立ちます。</p>

</Admonition>

Zilliz CloudコンソールまたはMilvus SDKを使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数のパスからのファイルインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、各Parquetファイルパスを別々のリストに含め、その後ですべてのリストをより上位のリストにグループ化します。以下のコード例を参照してください。

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

### フォルダからのファイルインポート\{#import-files-from-a-folder}

ソースフォルダにインポートするParquetファイルのみが含まれている場合は、以下のようにリクエストにソースフォルダを単純に含めることができます。

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

### 単一ファイルのインポート\{#import-a-single-file}

準備したデータファイルが単一のParquetファイルの場合は、以下のコード例に示すようにインポートします。

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

Zilliz Cloudはクラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルの可能性のあるストレージパスを示しています。

<table>
   <tr>
     <th><p><strong>クラウド</strong></p></th>
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
     <td><p><strong>Azure Blob</strong></p></td>
     <td><p><em>https:</em>//<em>myaccount</em>.blob.core.windows.net/<em>bucket-name</em>/<em>parquet-folder</em>/</p><p><em>https:</em>//myaccount.blob.core.windows.net/<em>bucket-name</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
</table>

## 制限事項\{#limits}

ローカルParquetファイルまたはクラウドストレージからParquetファイルでデータをインポートする際には、いくつかの制限事項に注意する必要があります。

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>1回のインポートあたりの最大ファイル数</strong></p></th>
     <th><p><strong>最大ファイルサイズ</strong></p></th>
     <th><p><strong>最大合計インポートサイズ</strong></p></th>
   </tr>
   <tr>
     <td><p>ローカルファイルから</p></td>
     <td><p>1ファイル</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>オブジェクトストレージから</p></td>
     <td><p>1,000ファイル</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

[バッチライターツール](./use-bulkwriter)を使用して、生データをparquetファイルに変換することをお勧めします。[上記図のスキーマに基づいて準備されたサンプルデータをダウンロードするにはこちらをクリックしてください](https://assets.zilliz.com/prepared_parquet_data.parquet)。
