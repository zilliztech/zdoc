---
title: "NumPy ファイルからのインポート | BYOC"
slug: /data-import-numpy
sidebar_key: data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
notebook: FALSE
description: "`.npy` フォーマットは、形状や dtype 情報を含む単一の配列を保存するための NumPy の標準バイナリフォーマット](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、異なるマシンでも正しく再構築できるように保証します。生データを Parquet ファイルに準備するには、[BulkWriter ツールの使用をお勧めします。以下の図は、生データを `.npy` ファイルのセットにマッピングする方法を示しています。| BYOC"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - データインポート
  - milvus
  - フォーマットオプション
  - numpy

---

import Admonition from '@theme/Admonition';


# NumPyファイルからのインポート

`.npy` 形式は、[NumPyの標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、単一の配列（そのshapeおよびdtype情報も含む）を保存するためのものです。これにより、異なるマシン上でも正しく再構築できます。生データをParquetファイルに変換するには、[BulkWriterツール](./use-bulkwriter)の使用を推奨します。以下の図は、生データが一連の `.npy` ファイルにどのようにマッピングされるかを示しています。

<Admonition type="danger" icon="🚧" title="Caution">

<p>この機能は非推奨になりました。本番環境での使用は推奨されません。</p>

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpy_file_structure.png "numpy_file_structure")

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p><strong>id</strong> フィールドはコレクションの主キー（primary field）として機能します。主キーを自動的にインクリメントさせるには、スキーマ内で <strong>AutoID</strong> を有効化できます。この場合、ソースデータの各行から <strong>id</strong> フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、事前に定義されたスキーマに含まれないフィールドを保存する必要があるときは、書き込み操作時に <strong>$meta</strong> 列を指定し、対応するキーと値のデータを提供できます。</p>
<ul>
<li><strong>大文字・小文字を区別する</strong></li>
</ul>
<p>辞書のキーおよびコレクションのフィールド名は大文字・小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と完全に一致していることを確認してください。たとえば、ターゲットコレクションに <strong>id</strong> という名前のフィールドがある場合、各エンティティ辞書には <strong>id</strong> というキーが必要です。<strong>ID</strong> や <strong>Id</strong> を使用するとエラーになります。</p>

</Admonition>

## ディレクトリ構造\{#directory-structure}

データをNumPyファイルとして準備するには、同じサブセットに属するすべてのファイルを1つのフォルダ内に配置し、それらのフォルダをソースフォルダ内にまとめてください。以下のツリーダイアグラムに示すとおりです。

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

データの準備が完了したら、以下のいずれかの方法で Zilliz Cloud コレクションにデータをインポートできます。

- [NumPy ファイルフォルダのリストからファイルをインポートする（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPy ファイルフォルダからファイルをインポートする](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="Notes">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パス方式を使用して一度にすべてをインポートすることを推奨します。この方法により、インポート処理中に内部で最適化が行われ、後続のリソース消費を削減できます。</p>

</Admonition>

また、Zilliz Cloud コンソールや Milvus SDK を使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPy ファイルフォルダのリストからファイルをインポートする（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする際は、各 NumPy ファイルフォルダのパスを個別のリストに含め、それらすべてのリストをより上位のリストにまとめてください。次のコード例を参照してください。

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

### NumPyファイルフォルダからファイルをインポートする\{#import-files-from-a-numpy-file-folder}

ソースフォルダにインポートするNumPyファイルフォルダのみが含まれている場合、リクエストに次のようにしてソースフォルダをそのまま含めることができます:

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

<Admonition type="info" icon="📘" title="Notes">

<p>フォルダーに複数の形式のファイルが含まれている場合、リクエストは失敗します。</p>

</Admonition>

## Storage paths\{#storage-paths}

Zilliz Cloud は、クラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルの可能なストレージパスを示します。

<table>
   <tr>
     <th><p><strong>Cloud</strong></p></th>
     <th><p><strong>Quick Examples</strong></p></th>
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
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><em>https:</em>//<em>myaccount</em>.blob.core.windows.net/<em>bucket-name</em>/<em>numpy-folder</em>/</p></td>
   </tr>
</table>

## 制限\{#limits}

クラウドストレージから NumPy ファイルでデータをインポートする際に遵守すべきいくつかの制限があります。

<Admonition type="info" icon="📘" title="Notes">

<p>有効な NumPy ファイルのセットは、ターゲットコレクションのスキーマ内のフィールド名に従って命名され、その中のデータは対応するフィールド定義と一致している必要があります。</p>

</Admonition>

<table>
   <tr>
     <th><p><strong>Import 方法</strong></p></th>
     <th><p><strong>Max Subdirectories per Import</strong></p></th>
     <th><p><strong>Max Size per Subdirectory</strong></p></th>
     <th><p><strong>Max Total Import Size</strong></p></th>
   </tr>
   <tr>
     <td><p>From local file</p></td>
     <td colspan="3"><p>Not supported</p></td>
   </tr>
   <tr>
     <td><p>From object storage</p></td>
     <td><p>1,000 subdirectories</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

[データの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照して自分でデータを再構築するか、[BulkWriter ツール](./use-bulkwriter) を使用してソースデータファイルを生成できます。[上記の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、こちらをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。