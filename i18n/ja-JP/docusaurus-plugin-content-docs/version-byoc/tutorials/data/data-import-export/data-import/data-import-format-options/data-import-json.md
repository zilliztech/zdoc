---
title: "JSONファイルからのインポート | BYOC"
slug: /data-import-json
sidebar_label: "JSON"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSONは、マシンが簡単に解析および生成できる軽量で人間が読みやすいデータ形式です。言語に依存せず、C言語ファミリーのプログラマーに馴染みのある規則に従っているため、理想的なデータ交換形式です。 | BYOC"
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
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db

---

import Admonition from '@theme/Admonition';


# JSONファイルからのインポート

[JSON](https://www.json.org/json-en.html)（JavaScriptオブジェクト記法）は、マシンが簡単に解析および生成できる軽量で人間が読みやすいデータ形式です。言語に依存せず、C言語ファミリーのプログラマーに馴染みのある規則に従っているため、理想的なデータ交換形式です。

[バッチライターツール](./use-bulkwriter)を使用して、生データをJSONファイルに変換することをお勧めします。次の図は、生データをJSONファイルにどのようにマッピングできるかを示しています。

![json_data_structure](/img/json_data_structure.png)

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p><strong>id</strong> フィールドはコレクションの主キーとして機能します。主キーを自動的にインクリメントするには、スキーマで <strong>AutoID</strong> を有効にすることができます。この場合、ソースデータの各行から <strong>id</strong> フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要がある場合は、書き込み操作中に <strong>&#36;meta</strong> 列を指定し、対応するキーと値のデータを提供できます。</p>
<ul>
<li><strong>大文字と小文字の区別</strong></li>
</ul>
<p>辞書のキーとコレクションのフィールド名は大文字と小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と正確に一致していることを確認してください。ターゲットコレクションに <strong>id</strong> という名前のフィールドがある場合、各エンティティ辞書には <strong>id</strong> という名前のキーが含まれている必要があります。<strong>ID</strong> や <strong>Id</strong> を使用するとエラーになります。</p>

</Admonition>

## ディレクトリ構造\{#directory-structure}

データをJSONファイルに変換することを選択した場合、以下のツリー図に示すように、すべてのJSONファイルをソースデータフォルダに直接配置します。

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json
```

## データのインポート\{#import-data}

データの準備が完了したら、以下のいずれかの方法を使用してZilliz Cloudコレクションにデータをインポートできます。

- [複数のパスからファイルをインポート（推奨）](./data-import-json#import-files-from-multiple-paths-recommended)

- [フォルダからファイルをインポート](./data-import-json#import-files-from-a-folder)

- [単一ファイルをインポート](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="注意">

<p>ファイルが比較的小さな場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることをお勧めします。この方法により、インポートプロセス中に内部的な最適化が可能になり、後のリソース消費を減らすのに役立ちます。</p>

</Admonition>

Zilliz CloudコンソールまたはMilvus SDKを使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### 複数のパスからファイルをインポート（推奨）\{#import-files-from-multiple-paths-recommended}

複数のパスからファイルをインポートする場合は、各JSONファイルパスを別々のリストに含め、その後ですべてのリストをより上位のリストにグループ化します。以下のコード例を参照してください。

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

ソースフォルダにインポートするJSONファイルのみが含まれている場合は、以下のようにリクエストにソースフォルダを単純に含めることができます。

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

### 単一ファイルをインポート\{#import-a-single-file}

準備したデータファイルが単一のJSONファイルの場合は、次のコード例に示すようにインポートします。

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

Zilliz Cloudは、クラウドストレージからのデータインポートをサポートしています。以下の表は、データファイル用の可能なストレージパスを示しています。

<table>
   <tr>
     <th><p><strong>クラウド</strong></p></th>
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
     <td><p><strong>Azure Blob</strong></p></td>
     <td><p><em>https:</em>//myaccount.blob.core.windows.net/bucket-name/json-folder/</p><p><em>https:</em>//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json</p></td>
   </tr>
</table>

## 制限事項\{#limits}

ローカルJSONファイルまたはクラウドストレージからのJSONファイルをインポートする際には、いくつかの制限事項に注意する必要があります。

<Admonition type="info" icon="📘" title="注意">

<p>有効なJSONファイルには、<strong>rows</strong> という名前のルートキーが存在し、その対応する値はターゲットコレクションのスキーマに一致する各エンティティを表す辞書のリストです。</p>

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>1回のインポートあたりの最大ファイル数</strong></p></th>
     <th><p><strong>最大ファイルサイズ</strong></p></th>
     <th><p><strong>最大合計インポートサイズ</strong></p></th>
   </tr>
   <tr>
     <td><p>ローカルファイルから</p></td>
     <td><p>1ファイル</p></td>
     <td><p>1GB</p></td>
     <td><p>1GB</p></td>
   </tr>
   <tr>
     <td><p>オブジェクトストレージから</p></td>
     <td><p>1,000ファイル</p></td>
     <td><p>10GB</p></td>
     <td><p>1TB</p></td>
   </tr>
</table>

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照して独自にデータを再構築するか、[バッチライターツール](./use-bulkwriter) を使用してソースデータファイルを生成できます。[上記図のスキーマに基づいて準備されたサンプルデータをダウンロードするにはこちらをクリックしてください](https://assets.zilliz.com/prepared_json_data.json)。
