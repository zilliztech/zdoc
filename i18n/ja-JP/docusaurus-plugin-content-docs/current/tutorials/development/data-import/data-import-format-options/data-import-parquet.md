---
title: "Parquet ファイルからインポート | Cloud"
slug: /data-import-parquet
sidebar_label: "Parquet（推奨）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Parquet は、効率的なデータ保存と取得のために設計された、オープンソースの列指向データファイル形式です。複雑なデータを大量に管理するための高性能な圧縮およびエンコーディング方式を備えており、さまざまなプログラミング言語や分析ツールでサポートされています。 | Cloud"
type: origin
token: WtkSwXgDdiB0eTkEkorcDCFlnme
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Parquet ファイルからインポート

[Apache Parquet](https://parquet.apache.org/docs/overview/) は、効率的なデータ保存と取得のために設計された、オープンソースの列指向データファイル形式です。複雑なデータを大量に管理するための高性能な圧縮およびエンコーディング方式を備えており、さまざまなプログラミング言語や分析ツールでサポートされています。

生データを Parquet ファイルとして準備するには、[BulkWriter ツール](./use-bulkwriter)を使用することをお勧めします。以下の図は、生データを Parquet ファイルにどのようにマッピングできるかを示しています。

![parquet_file_structure_en](https://zdoc-images.s3.us-west-2.amazonaws.com/parquetfilestructureen.png "parquet_file_structure_en")

<Admonition type="info" title="Notes">

- **AutoID を有効にするかどうか**

    **id** フィールドはコレクションの主フィールドとして機能します。主フィールドを自動的にインクリメントさせるには、スキーマで **AutoID** を有効にできます。この場合、ソースデータ内の各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があるときは、書き込み操作中に **&#36;meta** 列を指定し、対応するキー・バリューデータを提供できます。

- **大文字と小文字を区別**

    ディクショナリのキーとコレクションのフィールド名は大文字と小文字を区別します。データ内のディクショナリキーが、ターゲットコレクションのフィールド名と完全に一致していることを確認してください。ターゲットコレクションに **id** という名前のフィールドがある場合、各エンティティディクショナリには **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを Parquet ファイルとして準備する場合は、以下のツリー図に示すように、すべての Parquet ファイルをソースデータフォルダに直接配置します。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## データのインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法で Zilliz Cloud コレクションにインポートできます。

- [複数のパスからファイルをインポート（推奨）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [ソースフォルダからファイルをインポート](./data-import-parquet#import-files-from-a-folder)

- [単一ファイルをインポート](./data-import-parquet#import-a-single-file)

<Admonition type="info" title="Notes">

ファイルが比較的小さい場合は、フォルダ方式または複数パス方式を使用して一度にすべてインポートすることをお勧めします。この方式では、インポート処理中に内部最適化を行えるため、後続のリソース消費を抑えるのに役立ちます。

</Admonition>

Milvus SDK を使用すると、Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細は、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数のパスからファイルをインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、各 Parquet ファイルのパスを個別のリストに含め、それらのすべてのリストを、以下のコード例のように上位レベルのリストにまとめます。

```bash
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

### フォルダからファイルをインポート\{#import-files-from-a-folder}

ソースフォルダにインポート対象の Parquet ファイルのみが含まれている場合は、以下のようにリクエストにソースフォルダを含めるだけで済みます。

```bash
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

<Admonition type="info" title="Notes">

フォルダに複数の形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

### 単一ファイルをインポート\{#import-a-single-file}

準備したデータファイルが単一の Parquet ファイルの場合は、以下のコード例に示すようにインポートします。

```bash
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

Zilliz Cloud は、クラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルに使用できるストレージパスを示します。

| **クラウド** | **簡単な例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*parquet-folder*/<br/>s3://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Google Cloud Storage** | gs://*bucket-name*/*parquet-folder*/<br/>gs://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*parquet-folder*/<br/>*https:*//myaccount.blob.core.windows.net/*bucket-name*/*parquet-folder*/*data.parquet* |

## 制限\{#limits}

ローカルの Parquet ファイル、またはクラウドストレージ上の Parquet ファイルからデータをインポートする際には、いくつかの制限に従う必要があります。

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>インポートあたりの最大ファイル数</strong></p></th>
     <th><p><strong>最大ファイルサイズ</strong></p></th>
     <th><p><strong>最大合計インポートサイズ</strong></p></th>
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

生データを parquet ファイルとして準備するには、[BulkWriter ツール](./use-bulkwriter)を使用することをお勧めします。[上記の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_parquet_data.parquet)。
