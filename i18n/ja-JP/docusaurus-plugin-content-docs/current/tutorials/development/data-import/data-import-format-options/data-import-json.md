---
title: "JSON/JSON Lines ファイルからインポート | Cloud"
slug: /data-import-json
sidebar_label: "JSON/JSON Line"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON は軽量で人間が読みやすく、機械が容易に解析および生成できるデータ形式です。言語に依存せず、C 系言語のプログラマになじみのある規約に従っているため、理想的なデータ交換形式です。 | Cloud"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON/JSON Lines ファイルからインポート

[JSON](https://www.json.org/json-en.html)（JavaScript Object Notation）は、軽量で人間が読みやすく、機械が容易に解析および生成できるデータ形式です。言語に依存せず、C 系言語のプログラマになじみのある規約に従っているため、理想的なデータ交換形式です。

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

生データを JSON ファイルに変換するには、[BulkWriter ツール](./use-bulkwriter)の使用を推奨します。次の図は、生データを JSON ファイルにどのようにマッピングできるかを示しています。

![json_data_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/json_data_structure.png "json_data_structure")

<Admonition type="info" icon="📘" title="注記">

- **AutoID を有効にするかどうか**

    **id** フィールドはコレクションの主フィールドとして機能します。主フィールドを自動増分にするには、スキーマで **AutoID** を有効にします。この場合、ソースデータ内の各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があるときは、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字を区別**

    ディクショナリキーとコレクションのフィールド名は大文字と小文字を区別します。データ内のディクショナリキーが、ターゲットコレクションのフィールド名と完全に一致していることを確認してください。ターゲットコレクションに **id** という名前のフィールドがある場合、各エンティティのディクショナリには **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを JSON または JSON Lines ファイルとして準備する場合は、以下のツリー図のようにすべてのファイルをソースデータフォルダ直下に配置してください。

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

<Admonition type="info" icon="📘" title="注記">

ファイルが比較的小さい場合は、フォルダまたは複数パスの方法で一度にまとめてインポートすることを推奨します。この方法では、インポート処理中に内部最適化を行えるため、後続のリソース消費を抑えるのに役立ちます。

</Admonition>

Milvus SDK を使用して Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細については、[Import Data (Console)](./import-data-on-web-ui) および [Import Data (SDK)](./import-data-via-sdks) を参照してください。

### 複数パスからファイルをインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数パスからファイルをインポートする場合は、各 JSON ファイルのパスを個別のリストに含め、それらすべてのリストを次のコード例のように上位レベルのリストへまとめます。

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

<Admonition type="info" icon="📘" title="注記">

フォルダに複数形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

### 単一ファイルをインポート\{#import-a-single-file}

準備したデータファイルが単一の JSON ファイルである場合は、次のコード例のようにインポートします。

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

Zilliz Cloud は、クラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルに使用可能なストレージパスを示しています。

| **クラウド** | **簡単な例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*json-folder*/<br/>s3://*bucket-name*/*json-folder*/*data.json* |
| **Google Cloud Storage** | gs://*bucket-name*/*json-folder*/<br/>gs://*bucket-name*/*json-folder*/*data.json* |
| **Azure Bolb** | *https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/<br/>*https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json |

## 制限\{#limits}

ローカル JSON ファイル、またはクラウドストレージ上の JSON ファイルからデータをインポートする際には、いくつか守るべき制限があります。 

<Admonition type="info" icon="📘" title="注記">

有効な JSON ファイルには **rows** というルートキーがあり、その対応する値はディクショナリのリストです。各ディクショナリはターゲットコレクションのスキーマに一致するエンティティを表します。

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>1 回のインポートあたりの最大ファイル数</strong></p></th>
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

[Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照して自分でデータを再構築することも、[BulkWriter ツール](./use-bulkwriter) を使用してソースデータファイルを生成することもできます。[上図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_json_data.json)。

