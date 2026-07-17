---
title: "Parquet ファイルからインポート | BYOC"
slug: /data-import-parquet
sidebar_label: "Parquet（推奨）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Parquet は、効率的なデータ保存と取得のために設計された、オープンソースの列指向データファイル形式です。複雑なデータを一括で扱うための高性能な圧縮およびエンコーディング方式を提供し、さまざまなプログラミング言語や分析ツールでサポートされています。 | BYOC"
type: origin
token: WtkSwXgDdiB0eTkEkorcDCFlnme
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Parquet ファイルからインポート

[Apache Parquet](https://parquet.apache.org/docs/overview/) は、効率的なデータ保存と取得のために設計された、オープンソースの列指向データファイル形式です。複雑なデータを一括で扱うための高性能な圧縮およびエンコーディング方式を提供し、さまざまなプログラミング言語や分析ツールでサポートされています。

生データを Parquet ファイルに変換する準備には、[BulkWriter ツール](./use-bulkwriter)の使用を推奨します。以下の図は、生データがどのように Parquet ファイルへマッピングされるかを示しています。

![parquet_file_structure_en](https://zdoc-images.s3.us-west-2.amazonaws.com/parquetfilestructureen.png "parquet_file_structure_en")

<Admonition type="info" icon="📘" title="注意">

- **AutoID を有効にするかどうか**

    **id** フィールドは collection の主フィールドとして機能します。主フィールドを自動インクリメントにするには、schema で **AutoID** を有効にできます。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    対象の collection で動的フィールドが有効になっている場合、事前定義済みの schema に含まれていないフィールドを保存する必要があれば、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字を区別**

    辞書キーと collection のフィールド名は大文字と小文字を区別します。データ内の辞書キーが、対象の collection 内のフィールド名と完全に一致していることを確認してください。対象の collection に **id** というフィールドがある場合、各エンティティ辞書には **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## Directory structure\{#directory-structure}

データを Parquet ファイルとして準備する場合は、以下のツリー図のように、すべての Parquet ファイルをソースデータフォルダ直下に配置してください。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## データをインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法で Zilliz Cloud collection にインポートできます。

- [複数パスからファイルをインポート（推奨）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [ソースフォルダからファイルをインポート](./data-import-parquet#import-files-from-a-folder)

- [単一ファイルをインポート](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="注意">

ファイルが比較的小さい場合は、フォルダまたは複数パスの方法で一度にまとめてインポートすることを推奨します。この方法では、インポート処理中に内部最適化を行えるため、後続のリソース消費を抑えるのに役立ちます。

</Admonition>

Milvus SDK を使用して、Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細は、[データのインポート（コンソール）](./import-data-on-web-ui)および[データのインポート（SDK）](./import-data-via-sdks)を参照してください。

### 複数パスからファイルをインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数パスからファイルをインポートする場合は、各 Parquet ファイルのパスを個別のリストに含め、その後以下のコード例のように、すべてのリストを上位レベルのリストにまとめます。

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

### フォルダからファイルをインポート\{#import-files-from-a-folder}

ソースフォルダにインポート対象の Parquet ファイルのみが含まれている場合は、以下のようにリクエストにソースフォルダを含めるだけで済みます。

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

<Admonition type="info" icon="📘" title="注意">

フォルダ内に複数の形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

### 単一ファイルをインポート\{#import-a-single-file}

準備したデータファイルが単一の Parquet ファイルである場合は、以下のコード例のようにインポートします。

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

## Storage paths\{#storage-paths}

Zilliz Cloud は、クラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルで使用可能なストレージパスを示します。

| **Cloud** | **Quick Examples** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*parquet-folder*/<br/>s3://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Google Cloud Storage** | gs://*bucket-name*/*parquet-folder*/<br/>gs://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*parquet-folder*/<br/>*https:*//myaccount.blob.core.windows.net/*bucket-name*/*parquet-folder*/*data.parquet* |

## 制限\{#limits}

ローカルの Parquet ファイル、またはクラウドストレージ上の Parquet ファイルからデータをインポートする際には、いくつかの制限を守る必要があります。

| **Import Method** | **Max Files per Import** | **Max File Size** | **Max Total Import Size** |
| --- | --- | --- | --- |
| From local file | 1 File | 1 GB | 1 GB |
| From object storage | 1,000 Files | 10 GB | 1 TB |

生データを parquet ファイルに変換する準備には、[BulkWriter ツール](./use-bulkwriter)の使用を推奨します。[上記図の schema に基づいて準備されたサンプルデータのダウンロードはこちら](https://assets.zilliz.com/prepared_parquet_data.parquet)。
