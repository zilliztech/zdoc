---
title: "Parquet ファイルからインポート | Cloud"
slug: /data-import-parquet
sidebar_label: "Parquet（推奨）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Parquet は、効率的なデータ保存と取得のために設計された、オープンソースの列指向データファイル形式です。複雑なデータを一括で管理するための高性能な圧縮およびエンコード方式を提供し、さまざまなプログラミング言語や分析ツールでサポートされています。 | Cloud"
type: origin
token: WtkSwXgDdiB0eTkEkorcDCFlnme
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Parquet ファイルからインポート

[Apache Parquet](https://parquet.apache.org/docs/overview/) は、効率的なデータ保存と取得のために設計された、オープンソースの列指向データファイル形式です。複雑なデータを一括で管理するための高性能な圧縮およびエンコード方式を提供し、さまざまなプログラミング言語や分析ツールでサポートされています。

生データを Parquet ファイルに準備するには、[BulkWriter ツール](./use-bulkwriter)を使用することを推奨します。次の図は、生データを Parquet ファイルにどのようにマッピングできるかを示しています。

![parquet_file_structure_en](https://zdoc-images.s3.us-west-2.amazonaws.com/parquet_file_structure_en.png "parquet_file_structure_en")

<Admonition type="info" icon="📘" title="注意">

- **AutoID を有効にするかどうか**

    **id** フィールドは collection の主フィールドとして機能します。主フィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にできます。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    対象の collection で動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があるときは、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字を区別**

    辞書キーと collection のフィールド名は大文字と小文字を区別します。データ内の辞書キーが、対象 collection のフィールド名と完全に一致していることを確認してください。対象 collection に **id** というフィールドがある場合、各エンティティ辞書には **id** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを Parquet ファイルとして準備する場合は、以下のツリー図のように、すべての Parquet ファイルをソースデータフォルダ直下に配置してください。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## データをインポート\{#import-data}

データの準備ができたら、次のいずれかの方法を使用して Zilliz Cloud collection にインポートできます。

- [複数パスからファイルをインポート（推奨）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [ソースフォルダからファイルをインポート](./data-import-parquet#import-files-from-a-folder)

- [単一ファイルをインポート](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="注意">

ファイルが比較的小さい場合は、フォルダまたは複数パスの方法を使用して一度にまとめてインポートすることを推奨します。この方法ではインポート処理中に内部最適化が行われるため、その後のリソース消費を減らすのに役立ちます。

</Admonition>

Milvus SDK を使用して Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細については、[Import Data (Console)](./import-data-on-web-ui) および [Import Data (SDK)](./import-data-via-sdks) を参照してください。

### 複数パスからファイルをインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数パスからファイルをインポートする場合は、各 Parquet ファイルのパスを個別のリストに含め、それらすべてのリストを次のコード例のように上位レベルのリストにまとめます。

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

ソースフォルダにインポート対象の Parquet ファイルのみが含まれている場合は、次のようにリクエストにソースフォルダを含めるだけで済みます。

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

フォルダに複数形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

### 単一ファイルをインポート\{#import-a-single-file}

準備したデータファイルが単一の Parquet ファイルである場合は、次のコード例のようにインポートします。

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

Zilliz Cloud は、クラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルに使用可能なストレージパスを示しています。

| **Cloud** | **簡単な例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*parquet-folder*/<br/>s3://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Google Cloud Storage** | gs://*bucket-name*/*parquet-folder*/<br/>gs://*bucket-name*/*parquet-folder*/*data.parquet* |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*parquet-folder*/<br/>*https:*//myaccount.blob.core.windows.net/*bucket-name*/*parquet-folder*/*data.parquet* |

## 制限\{#limits}

ローカルの Parquet ファイル、またはクラウドストレージ上の Parquet ファイルからデータをインポートする際には、いくつかの制限を守る必要があります。

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>Cluster プラン</strong></p></th>
     <th><p><strong>1 回のインポートあたりの最大ファイル数</strong></p></th>
     <th><p><strong>最大ファイルサイズ</strong></p></th>
     <th><p><strong>最大インポート合計サイズ</strong></p></th>
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

生データを parquet ファイルに準備するには、[BulkWriter ツール](./use-bulkwriter)を使用することを推奨します。[上の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_parquet_data.parquet)。
