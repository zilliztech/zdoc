---
title: "Parquetファイルからインポート | Cloud"
slug: /data-import-parquet
sidebar_label: "Parquetファイルからインポート"
beta: FALSE
notebook: FALSE
description: "Apache Parquetは、効率的なデータストレージと検索のために設計されたオープンソースの列指向データファイル形式です。複雑なデータを大量に管理するための高性能な圧縮およびエンコーディングスキームを提供し、さまざまなプログラミング言語や分析ツールでサポートされています。 | Cloud"
type: origin
token: TVgYwqTGHivSODk5AbhcfLFjntc
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - parquet
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


# Parquetファイルからインポート

[Apache Parquet](https://parquet.apache.org/docs/overview/)は、効率的なデータストレージと検索のために設計されたオープンソースの列指向データファイル形式です。複雑なデータを大量に管理するための高性能な圧縮およびエンコーディングスキームを提供し、さまざまなプログラミング言語や分析ツールでサポートされています。

生データをParquetファイルに準備するには、[BulkWriterツール](./use-bulkwriter)を使用することをお勧めします。次の図は、生データをParquetファイルにマッピングする方法を示しています。

![parquet_file_structure_en](/img/parquet_file_structure_en.png)

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p>「<strong>id</strong>」フィールドは、コレクションのプライマリフィールドとして機能します。プライマリフィールドを自動的にインクリメントするには、スキーマで「<strong>AutoID</strong>」を有効にします。この場合、ソースデータの各行から「<strong>id</strong>」フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、定義済みスキーマに含まれていないフィールドを格納する必要がある場合は、書き込み操作中に<strong>$meta</strong>列を指定し、対応するキー値データを指定できます。</p>
<ul>
<li><strong>大文字と小文字を区別する</strong></li>
</ul>
<p>ディクショナリのキーとコレクションのフィールド名は大文字と小文字を区別します。データ内のディクショナリのキーがターゲットコレクションのフィールド名と完全に一致するようにしてください。ターゲットコレクションに<strong>id</strong>という名前のフィールドがある場合、各エンティティディクショナリにはidという名前のキーが必要です<strong>。ID</strong>または<strong>Idを使用するとエラーが発生します。</strong></p>

</Admonition>

## ディレクトリ構造{#directory-structure}

Parquetファイルにデータを準備する場合は、以下のツリー図に示すように、すべてのParquetファイルをソースデータフォルダに直接置くことができます。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## データのインポート{#import-data}

データの準備ができたら、次のいずれかの方法を使用して、Zilliz Cloudコレクションにデータをインポートできます。

- [複数のパスからファイルをインポートする（推奨）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [ソースフォルダからファイルをインポートする](./data-import-parquet#import-files-from-a-folder)

- [単一のファイルをインポート](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="ノート">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることをお勧めします。このアプローチにより、インポート過程で内部最適化が可能になり、後でリソースの消費を減らすことができます。</p>

</Admonition>

Milvus SDKを使用して、Zilliz Cloudコンソールからデータをインポートすることもできます。詳細については、「[データのインポート(コンソール)](./import-data-on-web-ui)」および「[データのインポート(RESTful API)](./import-data-via-restful-api)」を参照してください。

### 複数のパスからファイルをインポートする（推奨）{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、各Parquetファイルパスを個別のリストに含め、次のコード例のようにすべてのリストを上位レベルのリストにグループ化します。

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

### フォルダからファイルをインポートする{#import-files-from-a-folder}

ソースフォルダにインポートするParquetファイルのみが含まれている場合は、次のようにソースフォルダをリクエストに含めることができます。

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

### 単一のファイルをインポート{#import-a-single-file}

準備したデータファイルが1つのParquetファイルである場合は、次のコード例に示すようにインポートします。

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

## ストレージパス{#storage-paths}

Zilliz Cloudは、クラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルの可能なストレージパスを示しています。

<table>
   <tr>
     <th><p><strong>クラウド</strong></p></th>
     <th><p><strong>クイックな例</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>AWS S3</strong></p></td>
     <td><p><code>s3://bucket-name/parquet-folder/</code></p><p><code>s3://bucket-name/parquet-folder/data.parquet</code></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p><code>gs://bucket-name/parquet-folder/</code></p><p><code>gs://bucket-name/parquet-folder/data.parquet</code></p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><code>https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/</code></p><p><code>https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/data.parquet</code></p></td>
   </tr>
</table>

## 限界{#limits}

クラウドストレージからParquet形式のデータをインポートする際には、いくつかの制限を守る必要があります。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>一度に複数のファイルをインポートする</strong></p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p><strong>インポートごとの最大ファイル体格</strong></p></td>
     <td><p>クラスタの空き容量:合計512 MB</p><p>サーバーレス&amp;専用クラスター</p><ul><li><p>ファイルの体格: 10 GB</p></li><li><p>ファイルの体格: 100 GB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>使用可能なデータファイルの場所</strong></p></td>
     <td><p>リモートファイルのみ</p></td>
   </tr>
</table>

生データをパルケファイルに準備するは[BulkWriterツール](./use-bulkwriter)を使用することをお勧めします。[上の図のスキーマに基づいて準備されたサンプルデータをダウンロードするにはここをクリック](https://assets.zilliz.com/prepared_parquet_data.parquet)してください。