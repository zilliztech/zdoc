---
title: "JSON/JSON Lines ファイルからのインポート | Cloud"
slug: /data-import-json
sidebar_key: data-import-json
sidebar_label: "JSON/JSON Line"
beta: FALSE
notebook: FALSE
description: "JSON は軽量で人間が読みやすいデータ形式であり、機械による解析と生成が容易です。言語に依存せず、C 系言語のプログラマーに馴染みのある規約に従っているため、理想的なデータ交換形式と言えます。| Cloud"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - データインポート
  - milvus
  - フォーマットオプション
  - json

---

import Admonition from '@theme/Admonition';


# JSON/JSON Lines ファイルからのインポート

[JSON](https://www.json.org/json-en.html)（JavaScript Object Notation）は、機械が簡単に解析および生成できる、軽量で人間が読みやすいデータ形式です。言語に依存せず、C 系言語のプログラマーにとって馴染み深い規約に従っているため、理想的なデータ交換形式と言えます。

JSON Line は、各行が完全かつ有効な JSON オブジェクトであるテキスト形式であり、標準的なテキストツールを使用してデータストリームを段階的に処理しやすい特徴があります。

以下の表は、JSON または JSON Line ファイル内のデータ例を示しています。

<table>
   <tr>
     <th><p><strong>ファイル形式</strong></p></th>
     <th><p><strong>例</strong></p></th>
     <th></th>
   </tr>
   <tr>
     <td><p>JSON (.json)</p></td>
     <td><pre><code class="json language-json"> [     \{"primary_key":89,"vector":[0.7857309327639853,0.6185684289533679]\},     \{"primary_key":-22,"vector":[0.7227987733802379,0.6910585598920134]\},     \{"primary_key":85,"vector":[0.7948503430666686,0.6068055142521362]\} ]</code></pre></td>
     <td></td>
   </tr>
   <tr>
     <td><p>JSON Lines (.ndjson, .jsonl)</p></td>
     <td><pre><code class="json language-json"> \{"primary_key":89,"vector":[0.7857309327639853,0.6185684289533679]\} \{"primary_key":-22,"vector":[0.7227987733802379,0.6910585598920134]\} \{"primary_key":85,"vector":[0.7948503430666686,0.6068055142521362]\}</code></pre></td>
     <td></td>
   </tr>
</table>

生データを JSON ファイルに準備するには、[BulkWriter ツール](./use-bulkwriter) の使用をお勧めします。以下の図は、生データを JSON ファイルにマッピングする方法を示しています。

![json_data_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/json_data_structure.png "json_data_structure")

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><strong>AutoID を有効にするかどうか</strong></li>
</ul>
<p><strong>id</strong> フィールドはコレクションのプライマリフィールドとして機能します。プライマリフィールドを自動増分させるには、スキーマで <strong>AutoID</strong> を有効にできます。この場合、ソースデータの各行から <strong>id</strong> フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>対象コレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があるときは、書き込み操作中に <strong>&#36;meta</strong> 列を指定し、対応するキーと値のデータを提供できます。</p>
<ul>
<li><strong>大文字・小文字の区別</strong></li>
</ul>
<p>辞書のキーとコレクションのフィールド名は大文字・小文字を区別します。データ内の辞書キーが対象コレクションのフィールド名と完全に一致していることを確認してください。対象コレクションに <strong>id</strong> という名前のフィールドがある場合、各エンティティ辞書には <strong>id</strong> という名前のキーが必要です。<strong>ID</strong> や <strong>Id</strong> を使用するとエラーが発生します。</p>

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを JSON または JSON Lines ファイルに準備する場合は、以下のツリー図に示すように、すべてのファイルを直接ソースデータフォルダに配置してください。

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json 
```

## データのインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法で Zilliz Cloud コレクションにデータをインポートできます。

- [複数のパスからファイルをインポートする（推奨）](./data-import-json#import-files-from-multiple-paths-recommended)

- [フォルダからファイルをインポートする](./data-import-json#import-files-from-a-folder)

- [単一のファイルをインポートする](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="Notes">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パス方式を使用して一度にすべてインポートすることを推奨します。この方法により、インポート処理中に内部で最適化が行われ、後続のリソース消費を削減できます。</p>

</Admonition>

また、Zilliz Cloud コンソールや Milvus SDK を使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数のパスからファイルをインポートする（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合、各 JSON ファイルのパスを個別のリストに含め、それらすべてのリストをより上位のリストにまとめてください。次のコード例を参照してください。

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

### フォルダーからファイルをインポートする\{#import-files-from-a-folder}

ソースフォルダーにインポートするファイルが含まれている場合、リクエストに次のようにしてソースフォルダーを含めることができます。

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

<Admonition type="info" icon="📘" title="Notes">

<p>フォルダーに複数の形式のファイルが含まれている場合、リクエストは失敗します。</p>

</Admonition>

### 単一ファイルのインポート\{#import-a-single-file}

準備したデータファイルが単一の JSON ファイルである場合は、以下のコード例に示すようにインポートします。

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

Zilliz Cloud は、お客様のクラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルに使用可能なストレージパスの一覧です。

<table>
   <tr>
     <th><p><strong>Cloud</strong></p></th>
     <th><p><strong>クイック例</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>AWS S3</strong></p></td>
     <td><p>s3://<em>bucket-name</em>/<em>json-folder</em>/</p><p>s3://<em>bucket-name</em>/<em>json-folder</em>/<em>data.json</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p>gs://<em>bucket-name</em>/<em>json-folder</em>/</p><p>gs://<em>bucket-name</em>/<em>json-folder</em>/<em>data.json</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><em>https:</em>//myaccount.blob.core.windows.net/bucket-name/json-folder/</p><p><em>https:</em>//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json</p></td>
   </tr>
</table>

## 制限\{#limits}

ローカルの JSON ファイルまたはクラウドストレージ上の JSON ファイルからデータをインポートする際には、いくつかの制限があります。

<Admonition type="info" icon="📘" title="Notes">

<p>有効な JSON ファイルには <strong>rows</strong> という名前のルートキーが含まれており、その値は辞書のリストです。各辞書は、ターゲットコレクションのスキーマに一致するエンティティを表します。</p>

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>1 回のインポートあたりの最大ファイル数</strong></p></th>
     <th><p><strong>最大ファイルサイズ</strong></p></th>
     <th><p><strong>インポートの最大合計サイズ</strong></p></th>
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

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)を参考にして自分でデータを再構築するか、[BulkWriter ツール](./use-bulkwriter)を使用してソースデータファイルを生成できます。[上記の図にあるスキーマに基づいたサンプルデータをダウンロードするにはここをクリックしてください](https://assets.zilliz.com/prepared_json_data.json)。

