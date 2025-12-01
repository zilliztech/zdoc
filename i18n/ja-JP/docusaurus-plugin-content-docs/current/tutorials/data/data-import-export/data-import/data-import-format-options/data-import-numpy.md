---
title: "NumPyファイルからのインポート | Cloud"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy`形式は、NumPyの標準バイナリ形式です](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html)。単一の配列を形状およびdtype情報を含めて保存し、異なるマシン上で正しく再構築できることを保証します。生データをParquetファイルに準備するには[BulkWriterツール](./use-bulkwriter)の使用を推奨します。以下の図は、生データが`.npy`ファイルセットにどのようにマッピングされるかを示しています。 | Cloud"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - numpy
  - Machine Learning
  - RAG
  - NLP
  - Neural Network

---

import Admonition from '@theme/Admonition';


# NumPyファイルからのインポート

`.npy`形式は、[NumPyの標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html)で、単一の配列を形状およびdtype情報を含めて保存し、異なるマシン上で正しく再構築できることを保証します。生データをParquetファイルに準備するには[BulkWriterツール](./use-bulkwriter)の使用を推奨します。以下の図は、生データが`.npy`ファイルセットにどのようにマッピングされるかを示しています。

<Admonition type="danger" icon="🚧" title="警告">

<p>この機能は非推奨になりました。本番環境での使用は推奨されません。</p>

</Admonition>

![numpy_file_structure](/img/numpy_file_structure.png "numpy_file_structure")

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p><strong>id</strong>フィールドはコレクションの主フィールドとして機能します。主フィールドを自動的にインクリメントするには、スキーマで<strong>AutoID</strong>を有効にすることができます。この場合、ソースデータの各行から<strong>id</strong>フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを格納する必要がある場合は、書き込み操作中に<strong>&#36;meta</strong>列を指定して対応するキーバリューデータを提供できます。</p>
<ul>
<li><strong>大文字小文字の区別</strong></li>
</ul>
<p>辞書のキーとコレクションフィールド名は大文字小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と完全に一致するようにしてください。ターゲットコレクションに<strong>id</strong>という名前のフィールドがある場合、各エンティティ辞書には<strong>id</strong>という名前のキーが必要です。<strong>ID</strong>や<strong>Id</strong>を使用するとエラーになります。</p>

</Admonition>

## ディレクトリ構造\{#directory-structure}

データをNumPyファイルとして準備するには、同じサブセットのすべてのファイルをフォルダに配置し、これらのフォルダをソースフォルダ内にグループ化します。以下のツリー図に示すようにします。

```bash
├── numpy-folders
│       ├── 1
│       │   ├── id.npy
│       │   ├── vector.npy
│       │   ├── scalar_1.npy
│       │   ├── scalar_2.npy
│       │   └── $meta.npy
│       └── 2
│           ├── id.npy
│           ├── vector.npy
│           ├── scalar_1.npy
│           ├── scalar_2.npy
│           └── $meta.npy
```

## データのインポート\{#import-data}

データの準備が完了したら、以下のいずれかの方法を使用してZilliz Cloudコレクションにインポートできます。

- [NumPyファイルフォルダのリストからのファイルのインポート（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPyファイルフォルダからのファイルのインポート](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="注意">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることを推奨します。このアプローチにより、インポートプロセス中の内部最適化が可能になり、後のリソース消費を削減するのに役立ちます。</p>

</Admonition>

Milvus SDKを使用してZilliz Cloudコンソールでデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui)および[データのインポート（SDK）](./import-data-via-sdks)を参照してください。

### NumPyファイルフォルダのリストからのファイルのインポート（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数パスからファイルをインポートする場合は、各NumPyファイルフォルダパスを個別のリストに含め、その後すべてのリストを上位のリストにグループ化します。以下のコード例を参照してください。

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
            ["s3://bucket-name/numpy-folder-1/1/"],
            ["s3://bucket-name/numpy-folder-2/1/"],
            ["s3://bucket-name/numpy-folder-3/1/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### NumPyファイルフォルダからのファイルのインポート\{#import-files-from-a-numpy-file-folder}

ソースフォルダにインポートするNumPyファイルフォルダのみが含まれている場合は、リクエストにソースフォルダを以下のように含めることができます。

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
            ["s3://bucket-name/numpy-folder/1/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

## ストレージパス\{#storage-paths}

Zilliz Cloudは、クラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルの可能なストレージパスを一覧表示しています。

<table>
   <tr>
     <th><p><strong>クラウド</strong></p></th>
     <th><p><strong>クイック例</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>AWS S3</strong></p></td>
     <td><p>s3://<em>bucket-name</em>/<em>numpy-folder</em>/</p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p>gs://<em>bucket-name</em>/<em>numpy-folder</em>/</p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Blob</strong></p></td>
     <td><p><em>https:</em>//<em>myaccount</em>.blob.core.windows.net/<em>bucket-name</em>/<em>numpy-folder</em>/</p></td>
   </tr>
</table>

## 制限事項\{#limits}

クラウドストレージからのNumPyファイルをインポートする際には、いくつかの制限事項があります。

<Admonition type="info" icon="📘" title="注意">

<p>有効なNumPyファイルセットは、ターゲットコレクションのスキーマにあるフィールド名に従って名付ける必要があり、それらのデータは対応するフィールド定義と一致する必要があります。</p>

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>1回のインポートあたりの最大サブディレクトリ数</strong></p></th>
     <th><p><strong>サブディレクトリごとの最大サイズ</strong></p></th>
     <th><p><strong>最大総インポートサイズ</strong></p></th>
   </tr>
   <tr>
     <td><p>ローカルファイルからのインポート</p></td>
     <td colspan="4"><p>サポートされていません</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>オブジェクトストレージからのインポート</p></td>
     <td><p>無料</p></td>
     <td><p>1,000サブディレクトリ</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>サーバーレス & 専用</p></td>
     <td><p>1,000サブディレクトリ</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

[Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)を参照して独自にデータを再構築するか、[BulkWriterツール](./use-bulkwriter)を使用してソースデータファイルを生成できます。[上記の図のスキーマに基づいて準備されたサンプルデータをダウンロードするにはここをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。