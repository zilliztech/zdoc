---
title: "Parquetファイルからのインポート | Cloud"
slug: /data-import-parquet
sidebar_label: "Parquet (Recommended)"
beta: FALSE
notebook: FALSE
description: "アパッチパルケは、効率的なデータの保存と取得のために設計されたオープンソースの列指向データファイル形式です。複雑なデータを大量に管理するための高性能な圧縮およびエンコード方式を提供し、さまざまなプログラミング言語や分析ツールでサポートされています。 | Cloud"
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
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model

---

import Admonition from '@theme/Admonition';


# Parquetファイルからのインポート

[アパッチパルケ](https://parquet.apache.org/docs/overview/)は、効率的なデータの保存と取得のために設計されたオープンソースの列指向データファイル形式です。複雑なデータを大量に管理するための高性能な圧縮およびエンコード方式を提供し、さまざまなプログラミング言語や分析ツールでサポートされています。

生データをParquetファイルに準備するには、[BulkWriterツール](./use-bulkwriter)を使用することをお勧めします。次の図は、生データをParquetファイルにマッピングする方法を示しています。

![parquet_file_structure_en](/img/parquet_file_structure_en.png)

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p>「id」フィールドは、コレクションの主要なフィールドとして機能します。主要なフィールドを自動的にインクリメントするには、スキーマで「AutoID」を有効にすることができます。この場合、ソースデータの各行から「id」フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、定義済みスキーマに含まれていないフィールドを格納する必要がある場合は、書き込み操作中に<strong>$meta</strong>列を指定し、対応するキー値データを指定できます。</p>
<ul>
<li><strong>大文字と小文字を区別</strong></li>
</ul>
<p>辞書のキーとコレクションフィールド名は大文字と小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と完全に一致するようにしてください。ターゲットコレクションにidという名前のフィールドがある場合、各エンティティ辞書にはidという名前のキーが必要です。IDまたはIdを使用するとエラーが発生します。 </p>

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

- [ソースフォルダからファイルをインポートする ](./data-import-parquet#import-files-from-a-folder)

- [単一のファイルをインポート](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="ノート">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることをお勧めします。このアプローチにより、インポート過程で内部最適化が可能になり、後でリソースの消費を減らすことができます。</p>

</Admonition>

Milvus SDKを使用して、Zilliz Cloudコンソールからデータをインポートすることもできます。詳細については、[データのインポート(コンソール)](./import-data-on-web-ui)と[データのインポート(SDK)](./import-data-via-sdks)を参照してください。

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
     <th><p><strong>簡単な例</strong></p></th>
   </tr>
   <tr>
     <td><p>AWS S 3とは</p></td>
     <td><p>s 3://<em>バケット名</em>/<em>parquet-folder</em>/</p><p>s 3://<em>バケット名</em>/<em>parquet-folder</em>/<em>data. parquet</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloudストレージ</strong></p></td>
     <td><p>gs://<em>バケット名</em>/<em>parquet-folder</em>/</p><p>gs://<em>バケット名</em>/<em>parquet-folder</em>/<em>data. parquet</em></p></td>
   </tr>
   <tr>
     <td><p><strong>アズールボルブ</strong></p></td>
     <td><p><em>https://</em>myaccount<em>.blob.core.windows.net/</em>バケット名<em>/</em>parquet-folder*/</p><p><em>https://www. parquet.myaccount.blob.core.windows.netバケット名</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
</table>

## 限界{#limits}

クラウドストレージからParquet形式のデータをインポートする際には、いくつかの制限を守る必要があります。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>インポートごとに複数のファイル</strong></p></td>
     <td><p>はい。</p><p>各インポートでは最大100,000ファイルまで使用できます。</p></td>
   </tr>
   <tr>
     <td><p><strong>インポートごとの最大ファイル体格</strong></p></td>
     <td><p>クラスタの空き容量:合計512 MB</p><p>サーバーレス&amp;専用クラスター</p><ul><li><p>ファイルの体格: 10 GB</p></li><li><p>ファイルの体格: 1 TB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>適用可能なデータファイルの場所</strong></p></td>
     <td><p>リモートファイルのみ</p></td>
   </tr>
</table>

生データをParquetファイルに準備するには、[BulkWriterツール](./use-bulkwriter)を使用することをお勧めします。