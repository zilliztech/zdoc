---
title: "JSONファイルからのインポート | BYOC"
slug: /data-import-json
sidebar_label: "JSON"
beta: FALSE
notebook: FALSE
description: "JSONは、機械が簡単に解析および生成できる軽量で人間が読めるデータ形式です。Language-independent、C系言語プログラマーにとって馴染みのある慣習に従うため、理想的なデータ交換形式です。 | BYOC"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - json
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store

---

import Admonition from '@theme/Admonition';


# JSONファイルからのインポート

[JSON](https://www.json.org/json-en.html)(Java Script Object Notation)は、機械が簡単に解析および生成できる軽量で人間が読めるデータ形式です。Language-independent、C系言語プログラマーにとって馴染みのある慣習に従うため、理想的なデータ交換形式です。

生データをJSONファイルに準備するには、[BulkWriterツール](./use-bulkwriter)を使用することをお勧めします。次の図は、生データをJSONファイルにマップする方法を示しています。

![json_data_structure](/img/json_data_structure.png)

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

データをJSONファイルに準備する場合は、下のツリー図に示すように、すべてのJSONファイルをソースデータフォルダに直接置くことができます。

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json 
```

## データのインポート{#import-data}

データの準備ができたら、次のいずれかの方法を使用して、Zilliz Cloudコレクションにデータをインポートできます。

- [複数のパスからファイルをインポートする（推奨）](./data-import-json#import-files-from-multiple-paths-recommended)

- [フォルダからファイルをインポートする](./data-import-json#import-files-from-a-folder)

- [単一のファイルをインポート](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="ノート">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることをお勧めします。このアプローチにより、インポート過程で内部最適化が可能になり、後でリソースの消費を減らすことができます。</p>

</Admonition>

Milvus SDKを使用して、Zilliz Cloudコンソールからデータをインポートすることもできます。詳細については、[データのインポート(コンソール)](./import-data-on-web-ui)と[データのインポート(SDK)](./import-data-via-sdks)を参照してください。

### 複数のパスからファイルをインポートする（推奨）{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、各JSONファイルパスを個別のリストに含め、次のコード例のようにすべてのリストを上位レベルのリストにグループ化します。

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
            ["s3://bucket-name/json-folder-1/1.json"],
            ["s3://bucket-name/json-folder-2/1.json"],
            ["s3://bucket-name/json-folder-3/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### フォルダからファイルをインポートする{#import-files-from-a-folder}

ソースフォルダにインポートするJSONファイルのみが含まれている場合は、次のようにソースフォルダをリクエストに含めることができます。

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
            ["s3://bucket-name/json-folder/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### 単一のファイルをインポート{#import-a-single-file}

準備したデータファイルが1つのJSONファイルの場合は、次のコード例に示すようにインポートします。

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
            ["s3://bucket-name/json-folder/1.json"]
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
     <td><p>s 3://<em>バケット名</em>/<em>JSONフォルダ</em>/</p><p>s 3://<em>バケット名</em>/<em>JSONフォルダ</em>/<em>data. json</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloudストレージ</strong></p></td>
     <td><p>gs://<em>バケット名</em>/<em>JSONフォルダ</em>/</p><p>gs://<em>バケット名</em>/<em>JSONフォルダ</em>/<em>data. json</em></p></td>
   </tr>
   <tr>
     <td><p><strong>アズールボルブ</strong></p></td>
     <td><p>*https://www.myaccount.blob.core.windows.net/bucket-name/json-foldercom/</p><p>*https://www.myaccount.blob.core.windows.net/bucket-name/json-folder/data.json</p></td>
   </tr>
</table>

## 限界{#limits}

クラウドストレージからJSON形式のデータをインポートする際には、観察する必要がある制限がいくつかあります。有効なJSONファイルには、**rows**というルートキーがあり、その対応する値は、ターゲットコレクションのスキーマに一致するエンティティを表す辞書のリストです。

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
     <td><p>ローカルファイルとリモートファイル</p></td>
   </tr>
</table>

[データファイルを準備する](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)を参照して自分でデータを再構築するか、[BulkWriterツール](./use-bulkwriter)を使用してソースデータファイルを生成することができます。