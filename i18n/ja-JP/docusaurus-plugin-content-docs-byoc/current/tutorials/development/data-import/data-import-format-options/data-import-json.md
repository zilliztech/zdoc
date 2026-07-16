---
title: "JSON/JSON Lines ファイルからインポート | BYOC"
slug: /data-import-json
sidebar_label: "JSON/JSON Line"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON は軽量で人間が読みやすいデータ形式であり、マシンが容易に解析および生成できます。言語に依存せず、C 系言語のプログラマに馴染みのある慣習に従っているため、理想的なデータ交換形式です。 | BYOC"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON/JSON Lines ファイルからインポート

[JSON](https://www.json.org/json-en.html)（JavaScript Object Notation）は、軽量で人間が読みやすく、マシンが容易に解析および生成できるデータ形式です。言語に依存せず、C 系言語のプログラマに馴染みのある慣習に従っているため、理想的なデータ交換形式です。

JSON Line は、各行が完全で有効な JSON オブジェクトであるテキスト形式で、標準的なテキストツールを使ってデータストリームを段階的に処理しやすくします。

次の表は、JSON または JSON Line ファイル内のデータ例を示しています。

<table>
   <tr>
     <th><p><strong>ファイル形式</strong></p></th>
     <th><p><strong>例</strong></p></th>
   </tr>
   <tr>
     <td><p>JSON (.json)</p></td>
     <td><pre><code class="json language-json"> [     \{"primary_key":89,"vector":[0.7857309327639853,0.6185684289533679]\},     \{"primary_key":-22,"vector":[0.7227987733802379,0.6910585598920134]\},     \{"primary_key":85,"vector":[0.7948503430666686,0.6068055142521362]\} ]</code></pre></td>
   </tr>
   <tr>
     <td><p>JSON Lines (.ndjson, .jsonl)</p></td>
     <td><pre><code class="json language-json"> \{"primary_key":89,"vector":[0.7857309327639853,0.6185684289533679]\} \{"primary_key":-22,"vector":[0.7227987733802379,0.6910585598920134]\} \{"primary_key":85,"vector":[0.7948503430666686,0.6068055142521362]\}</code></pre></td>
   </tr>
</table>

生データを JSON ファイルに準備するには、[BulkWriter ツール](./use-bulkwriter)の使用を推奨します。次の図は、生データを JSON ファイルにどのようにマッピングできるかを示しています。

![json_data_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/jsondatastructure.png "json_data_structure")

<Admonition type="info" icon="📘" title="注意">

- **AutoID を有効にするかどうか**

    **id** フィールドはコレクションのプライマリフィールドとして機能します。プライマリフィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にします。この場合、ソースデータの各行から **id** フィールドを除外してください。

- **動的フィールドを有効にするかどうか**

    対象コレクションで動的フィールドが有効になっていて、事前定義されたスキーマに含まれていないフィールドを保存する必要がある場合は、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字を区別**

    辞書キーとコレクションのフィールド名は大文字と小文字を区別します。データ内の辞書キーが対象コレクションのフィールド名と完全に一致していることを確認してください。対象コレクションに **id** というフィールドがある場合、各エンティティ辞書には **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを JSON または JSON Lines ファイルとして準備する場合は、以下のツリー図に示すように、すべてのファイルをソースデータフォルダに直接配置してください。

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json 
```

## データをインポート\{#import-data}

データの準備ができたら、次のいずれかの方法を使用して Zilliz Cloud コレクションにインポートできます。

- [複数パスからファイルをインポート（推奨）](./data-import-json#import-files-from-multiple-paths-recommended)

- [フォルダからファイルをインポート](./data-import-json#import-files-from-a-folder)

- [単一ファイルをインポート](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="注意">

ファイルが比較的小さい場合は、フォルダ方式または複数パス方式を使用して一度にすべてをインポートすることを推奨します。この方法では、インポート処理中に内部最適化が可能となり、後のリソース消費を抑えるのに役立ちます。

</Admonition>

また、Milvus SDK を使用して Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細は、[データのインポート（コンソール）](./import-data-on-web-ui)および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数パスからファイルをインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数パスからファイルをインポートする場合は、各 JSON ファイルパスを個別のリストに含め、その後、以下のコード例のようにそれらすべてのリストを上位レベルのリストにまとめてください。

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

### フォルダからファイルをインポート\{#import-files-from-a-folder}

ソースフォルダにインポート対象のファイルが含まれている場合は、次のようにリクエストにソースフォルダを含めることができます。

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

<Admonition type="info" icon="📘" title="注意">

フォルダに複数形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

### 単一ファイルをインポート\{#import-a-single-file}

準備したデータファイルが単一の JSON ファイルである場合は、以下のコード例のようにインポートします。

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

## ストレージパス\{#storage-paths}

Zilliz Cloud はクラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルに使用可能なストレージパスを示しています。

| **クラウド** | **簡単な例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*json-folder*/<br/>s3://*bucket-name*/*json-folder*/*data.json* |
| **Google Cloud Storage** | gs://*bucket-name*/*json-folder*/<br/>gs://*bucket-name*/*json-folder*/*data.json* |
| **Azure Bolb** | *https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/<br/>*https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json |

## 制限\{#limits}

ローカル JSON ファイルまたはクラウドストレージ上の JSON ファイルからデータをインポートする際には、いくつかの制限を守る必要があります。 

<Admonition type="info" icon="📘" title="注意">

有効な JSON ファイルには、**rows** という名前のルートキーがあり、その対応する値は辞書のリストです。各辞書は、対象コレクションのスキーマに一致するエンティティを表します。

</Admonition>

| **インポート方法** | **インポートあたりの最大ファイル数** | **最大ファイルサイズ** | **最大合計インポートサイズ** |
| --- | --- | --- | --- |
| ローカルファイルから | 1 ファイル | 1 GB | 1 GB |
| オブジェクトストレージから | 1,000 ファイル | 10 GB | 1 TB |

[データファイルを準備する](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照して自分でデータを再構築することも、[BulkWriter ツール](./use-bulkwriter) を使用してソースデータファイルを生成することもできます。[上記の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_json_data.json)。

