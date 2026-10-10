---
title: "Parquet ファイルからのインポート | BYOC"
slug: /data-import-parquet
sidebar_label: "Parquet（推奨）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Parquet は、効率的なデータの保存と取得のために設計されたオープンソースの列指向データファイルフォーマットです。高性能な圧縮およびエンコーディング方式により複雑なデータを一括で管理でき、さまざまなプログラミング言語や分析ツールでサポートされています。 | BYOC"
type: origin
token: WtkSwXgDdiB0eTkEkorcDCFlnme
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Parquet ファイルからインポートする

[Apache Parquet](https://parquet.apache.org/docs/overview/) は、効率的なデータの保存と取得のために設計されたオープンソースの列指向データファイルフォーマットです。高性能な圧縮およびエンコーディング方式により複雑なデータを一括で管理でき、さまざまなプログラミング言語や分析ツールでサポートされています。

生データを Parquet ファイルに変換するには、[BulkWriter ツール](./use-bulkwriter) の使用をお勧めします。次の図は、生データを Parquet ファイルにどのようにマッピングできるかを示しています。

![parquet_file_structure_en](https://zdoc-images.s3.us-west-2.amazonaws.com/parquetfilestructureen.png "parquet_file_structure_en")

<Admonition type="info" title="Notes">

- **AutoID を有効にするか**

    **id** フィールドは、コレクションのプライマリフィールドとして機能します。プライマリフィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にします。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするか**

    ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれないフィールドを保存する必要があるときは、書き込み操作時に **&#36;meta** 列を指定し、対応するキーと値のデータを提供します。

- **大文字と小文字の区別**

    辞書のキーとコレクションのフィールド名は大文字と小文字を区別します。データ内の辞書のキーがターゲットコレクションのフィールド名と完全に一致することを確認してください。ターゲットコレクションに **id** という名前のフィールドがある場合、各エンティティの辞書には **id.** という名前のキーが必要です。**ID** または **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを Parquet ファイルとして準備する場合は、以下のツリー図に示すように、すべての Parquet ファイルをソースデータフォルダーに直接配置します。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## データをインポートする\{#import-data}

データの準備ができたら、次のいずれかの方法で Zilliz Cloud コレクションにインポートできます。

- [複数のパスからファイルをインポートする（推奨）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [ソースフォルダーからファイルをインポートする ](./data-import-parquet#import-files-from-a-folder)

- [単一のファイルをインポートする](./data-import-parquet#import-a-single-file)

<Admonition type="info" title="Notes">

ファイルのサイズが比較的小さい場合は、フォルダーまたは複数パスの方法を使用して一度にすべてインポートすることをお勧めします。この方法では、インポートプロセス中に内部的な最適化が行われるため、その後のリソース消費を抑えられます。

</Admonition>

Milvus SDK を使用して Zilliz Cloud コンソールでデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数のパスからファイルをインポートする（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、各 Parquet ファイルのパスを個別のリストに含め、次のコード例のように、すべてのリストを上位のリストにまとめます。

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

### フォルダーからファイルをインポートする\{#import-files-from-a-folder}

ソースフォルダーにインポート対象の Parquet ファイルのみが含まれている場合は、次のようにリクエストにソースフォルダーを含めるだけです。

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

フォルダーに複数の形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

### 単一のファイルをインポートする\{#import-a-single-file}

準備したデータファイルが単一の Parquet ファイルである場合は、次のコード例に示すようにインポートします。

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

Zilliz Cloud は、クラウドストレージからのデータインポートをサポートしています。次の表に、データファイルに使用できるストレージパスを示します。

| **クラウド** | **簡単な例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*parquet-folder*/<br/>s3://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Google Cloud Storage** | gs://*bucket-name*/*parquet-folder*/<br/>gs://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*parquet-folder*/<br/>*https:*//myaccount.blob.core.windows.net/*bucket-name*/*parquet-folder*/*data.parquet* |

## 制限事項\{#limits}

ローカルの Parquet ファイルまたはクラウドストレージの Parquet ファイルからデータをインポートする際には、いくつかの制限事項に注意する必要があります。

| **インポート方法** | **1 回のインポートあたりの最大ファイル数** | **最大ファイルサイズ** | **最大合計インポートサイズ** |
| --- | --- | --- | --- |
| ローカルファイルから | 1 ファイル | 1 GB | 1 GB |
| オブジェクトストレージから | 1,000 ファイル | 10 GB | 1 TB |

生データを Parquet ファイルに変換するには、[BulkWriter ツール](./use-bulkwriter) の使用をお勧めします。上記の図のスキーマに基づいて準備されたサンプルデータは、[こちらからダウンロードできます](https://assets.zilliz.com/prepared_parquet_data.parquet)。
