---
title: "JSON/JSON Lines ファイルからのインポート | Cloud"
slug: /data-import-json
sidebar_label: "JSON/JSON Line"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON は軽量で人間が読みやすく、マシンが容易に解析・生成できるデータ形式です。言語に依存せず、C 系言語のプログラマーにとって馴染みのある規約に従うため、データ交換形式として理想的です。 | Cloud"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON/JSON Lines ファイルからのインポート

[JSON](https://www.json.org/json-en.html)（JavaScript Object Notation）は、軽量で人間が読みやすく、マシンが容易に解析・生成できるデータ形式です。言語に依存せず、C 系言語のプログラマーにとって馴染みのある規約に従うため、データ交換形式として理想的です。

JSON Line は、各行が完全で有効な JSON オブジェクトであるテキスト形式であり、標準的なテキストツールを使ってデータストリームを段階的に処理しやすくします。

以下の表に、JSON ファイルまたは JSON Line ファイルのデータ例を示します。

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

生データを JSON ファイルに準備するには、[the BulkWriter tool](./use-bulkwriter) の使用をお勧めします。以下の図は、生データをどのように JSON ファイルにマッピングできるかを示しています。

![json_data_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/jsondatastructure.png "json_data_structure")

<Admonition type="info" title="Notes">

- **AutoID を有効にするかどうか**

    **id** フィールドはコレクションの主フィールドとして機能します。主フィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にします。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれないフィールドを保存する必要があるときは、書き込み操作時に **&#36;meta** 列を指定し、対応するキーと値のデータを指定できます。

- **大文字と小文字の区別**

    ディクショナリのキーとコレクションのフィールド名は大文字と小文字を区別します。データ内のディクショナリのキーが、ターゲットコレクションのフィールド名と完全に一致することを確認してください。ターゲットコレクションに **id** という名前のフィールドがある場合、各エンティティのディクショナリには **id** という名前のキーが必要です。**ID** または **Id** を使用するとエラーになります。

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを JSON ファイルまたは JSON Lines ファイルとして準備する場合は、以下のツリー図に示すように、すべてのファイルをソースデータフォルダーに直接配置します。

```plaintext
├── json-folder
│   ├── 1.json
│   └── 2.json
```

## データのインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法で Zilliz Cloud コレクションにインポートできます。

- [複数のパスからのファイルのインポート（推奨）](./data-import-json#import-files-from-multiple-paths-recommended)

- [フォルダーからのファイルのインポート](./data-import-json#import-files-from-a-folder)

- [単一ファイルのインポート](./data-import-json#import-a-single-file)

<Admonition type="info" title="Notes">

ファイルが比較的小さい場合は、フォルダーまたは複数パスの方法を使用してすべてを一度にインポートすることをお勧めします。この方法により、インポートプロセス中に内部的な最適化が可能になり、その後のリソース消費を抑えるのに役立ちます。

</Admonition>

Milvus SDK を使用して Zilliz Cloud コンソールでデータをインポートすることもできます。詳細については、[Import Data (Console)](./import-data-on-web-ui) および [Import Data (SDK)](./import-data-via-sdks) を参照してください。

### 複数のパスからのファイルのインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、以下のコード例のように、各 JSON ファイルのパスを個別のリストに含め、その後ですべてのリストを上位のリストにまとめます。

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

### フォルダーからのファイルのインポート\{#import-files-from-a-folder}

ソースフォルダーにインポートするファイルが含まれている場合は、以下のようにリクエストにソースフォルダーを含めることができます。

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

<Admonition type="info" title="Notes">

フォルダーに複数の形式のファイルが含まれている場合、リクエストは失敗します。

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

Zilliz Cloud は、お使いのクラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルに使用できるストレージパスを示します。

| **Cloud** | **Quick Examples** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*json-folder*/<br/>s3://*bucket-name*/*json-folder*/*data.json* |
| **Google Cloud Storage** | gs://*bucket-name*/*json-folder*/<br/>gs://*bucket-name*/*json-folder*/*data.json* |
| **Azure Bolb** | *https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/<br/>*https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json |

## 制限事項\{#limits}

ローカルの JSON ファイルまたはクラウドストレージの JSON ファイルからデータをインポートする際には、守る必要があるいくつかの制限があります。

<Admonition type="info" title="Notes">

有効な JSON ファイルには **rows** という名前のルートキーがあり、その対応する値はディクショナリのリストで、各ディクショナリはターゲットコレクションのスキーマに一致するエンティティを表します。

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

[Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照してデータを自分で再構築するか、[the BulkWriter tool](./use-bulkwriter) を使用してソースデータファイルを生成できます。[上の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_json_data.json)。
