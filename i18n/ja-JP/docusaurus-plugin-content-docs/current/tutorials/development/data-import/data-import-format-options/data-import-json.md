---
title: "JSON/JSON Lines ファイルからのインポート | Cloud"
slug: /data-import-json
sidebar_label: "JSON/JSON Line"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON は、機械が容易に解析・生成できる軽量で人間が読みやすいデータ形式です。言語に依存せず、C 系言語のプログラマーに馴染みのある規則に従っているため、データ交換形式として最適です。 | Cloud"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON/JSON Lines ファイルからのインポート

[JSON](https://www.json.org/json-en.html) (JavaScript Object Notation) は、機械が容易に解析・生成できる軽量で人間が読みやすいデータ形式です。言語に依存せず、C 系言語のプログラマーに馴染みのある規則に従っているため、データ交換形式として最適です。

JSON Line は、各行が完全かつ有効な JSON オブジェクトであるテキスト形式です。標準的なテキストツールを使用してデータストリームを段階的に処理するのに適しています。

次の表に、JSON または JSON Line ファイルのデータ例を示します。

<table>
   <tr>
     <th><p><strong>ファイル形式</strong></p></th>
     <th><p><strong>例</strong></p></th>
   </tr>
   <tr>
     <td><p>JSON (.json)</p></td>
     <td><pre><code class="language-json"> [     \{&quot;primary_key&quot;:89,&quot;vector&quot;:[0.7857309327639853,0.6185684289533679]\},     \{&quot;primary_key&quot;:-22,&quot;vector&quot;:[0.7227987733802379,0.6910585598920134]\},     \{&quot;primary_key&quot;:85,&quot;vector&quot;:[0.7948503430666686,0.6068055142521362]\} ]</code></pre></td>
   </tr>
   <tr>
     <td><p>JSON Lines (.ndjson, .jsonl)</p></td>
     <td><pre><code class="language-json"> \{&quot;primary_key&quot;:89,&quot;vector&quot;:[0.7857309327639853,0.6185684289533679]\} \{&quot;primary_key&quot;:-22,&quot;vector&quot;:[0.7227987733802379,0.6910585598920134]\} \{&quot;primary_key&quot;:85,&quot;vector&quot;:[0.7948503430666686,0.6068055142521362]\}</code></pre></td>
   </tr>
</table>

生データを JSON ファイルとして準備するには、[BulkWriter ツール](./use-bulkwriter)の使用をお勧めします。次の図は、生データを JSON ファイルにマッピングする方法を示しています。

![json_data_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/json_data_structure.png "json_data_structure")

<Admonition type="info" icon="📘" title="Notes">

- **AutoID の有効化**

    **id** フィールドはコレクションのプライマリフィールドとして機能します。プライマリフィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にします。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドの有効化**

    対象のコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれないフィールドを保存するには、書き込み時に **&#36;meta** 列を指定して対応するキーと値のデータを渡します。

- **大文字・小文字の区別**

    辞書キーとコレクションのフィールド名は、大文字と小文字が区別されます。データ内の辞書キーが、対象コレクションのフィールド名と完全に一致していることを確認してください。例えば、対象コレクションに **id** というフィールドがある場合、各エンティティの辞書には **id.** というキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを JSON または JSON Lines ファイルとして準備する場合は、以下のツリー図に示すように、すべてのファイルをソースデータフォルダー直下に配置してください。

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json 
```

## データのインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法で Zilliz Cloud コレクションにインポートできます。

- [複数のパスからファイルをインポート（推奨）](./data-import-json#import-files-from-multiple-paths-recommended)

- [フォルダーからファイルをインポート](./data-import-json#import-files-from-a-folder)

- [単一ファイルをインポート](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="Notes">

ファイルサイズが比較的小さい場合は、フォルダーまたは複数パスの方法を使用して一括でインポートすることをお勧めします。これによりインポート処理中の内部最適化が働き、その後のリソース消費を抑えられます。

</Admonition>

Zilliz Cloud コンソールや Milvus SDK を使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数のパスからファイルをインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、各 JSON ファイルのパスを個別のリストに含め、次のコード例のようにそれらのリストを上位のリストにまとめます。

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

### フォルダーからファイルをインポート\{#import-files-from-a-folder}

インポート対象のファイルが含まれるソースフォルダーを、次のようにリクエストに指定できます。

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

フォルダー内に複数の形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

### 単一ファイルをインポート\{#import-a-single-file}

準備したデータが単一の JSON ファイルである場合は、次のコード例のようにインポートします。

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

Zilliz Cloud はクラウドストレージからのデータインポートをサポートしています。データファイルに使用可能なストレージパスを下表に示します。

| **クラウド** | **クイック例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*json-folder*/<br/>s3://*bucket-name*/*json-folder*/*data.json* |
| **Google Cloud Storage** | gs://*bucket-name*/*json-folder*/<br/>gs://*bucket-name*/*json-folder*/*data.json* |
| **Azure Bolb** | *https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/<br/>*https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json |

## 制限事項\{#limits}

ローカルの JSON ファイルやクラウドストレージ上の JSON ファイルからデータをインポートする際は、以下の制限事項に従う必要があります。 

<Admonition type="info" icon="📘" title="Notes">

有効な JSON ファイルには **rows** というルートキーが必要であり、その値は辞書のリストでなければなりません。各辞書は、対象コレクションのスキーマに適合するエンティティを表します。

</Admonition>

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

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)を参照して手動でデータを作成するか、[BulkWriter ツール](./use-bulkwriter)を使用してソースデータファイルを生成できます。[上記の図のスキーマに基づいたサンプルデータをダウンロードする](https://assets.zilliz.com/prepared_json_data.json)。

