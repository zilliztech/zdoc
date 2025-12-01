---
title: "NumPyファイルからのインポート | BYOC"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy`形式は、形状とデータ型情報を含む単一配列を保存するためのNumPyの標準バイナリフォーマットです。https//numpy.org/devdocs/reference/generated/numpy.lib.format.html異なるマシン上で正しく再構成できることを保証します。生データをParquetファイルに変換するには、[バッチライターツール]の使用をお勧めします。次の図は、生データを一連の`.npy`ファイルにどのようにマッピングできるかを示しています。| BYOC"
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
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data

---

import Admonition from '@theme/Admonition';


# NumPyファイルからのインポート

`.npy`形式は、形状とデータ型情報を含む単一配列を保存するための[NumPyの標準バイナリフォーマット](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、異なるマシン上で正しく再構成できることを保証します。生データをParquetファイルに変換するには、[バッチライターツール](./use-bulkwriter)の使用をお勧めします。以下の図は、生データを一連の`.npy`ファイルにどのようにマッピングできるかを示しています。

<Admonition type="danger" icon="🚧" title="注意">

<p>この機能は非推奨になりました。本番環境で使用することは推奨されません。</p>

</Admonition>

![numpy_file_structure](/img/numpy_file_structure.png)

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p><strong>id</strong>フィールドはコレクションの主フィールドとして機能します。主フィールドを自動的にインクリメントするには、スキーマで<strong>AutoID</strong>を有効にできます。この場合、ソースデータの各行から<strong>id</strong>フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要がある場合は、書き込み操作中に<strong>&#36;meta</strong>列を指定し、対応するキーと値のデータを提供できます。</p>
<ul>
<li><strong>大文字と小文字の区別</strong></li>
</ul>
<p>辞書キーとコレクションフィールド名は大文字と小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と完全に一致していることを確認してください。ターゲットコレクションに<strong>id</strong>という名前のフィールドがある場合、各エンティティ辞書には<strong>id</strong>という名前のキーが含まれている必要があります。<strong>ID</strong>や<strong>Id</strong>を使用するとエラーになります。</p>

</Admonition>

## ディレクトリ構造\{#directory-structure}

データをNumPyファイルとして準備するには、同じサブセットからのすべてのファイルをフォルダに配置し、その後、これらのフォルダをソースフォルダ内にグループ化します。以下のツリー図を参照してください。

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

データの準備ができたら、以下のいずれかの方法を使用してZilliz Cloudコレクションにインポートできます。

- [NumPyファイルフォルダのリストからのファイルインポート（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPyファイルフォルダからのファイルインポート](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="注意">

<p>ファイルが比較的小さな場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることをお勧めします。この方法により、インポートプロセス中に内部的な最適化が可能になり、後のリソース消費を減らすのに役立ちます。</p>

</Admonition>

Zilliz CloudコンソールまたはMilvus SDKを使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPyファイルフォルダのリストからのファイルインポート（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする場合は、各NumPyファイルフォルダパスを別々のリストに含め、その後ですべてのリストを上位のリストにグループ化します。以下のコード例を参照してください。

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

### NumPyファイルフォルダからのファイルインポート\{#import-files-from-a-numpy-file-folder}

ソースフォルダにインポートするNumPyファイルフォルダのみが含まれている場合は、以下のようにリクエストにソースフォルダを単純に含めることができます。

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

Zilliz Cloudはクラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルの可能性のあるストレージパスを示しています。

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

クラウドストレージからNumPyファイルでデータをインポートする際には、いくつかの制限事項に注意する必要があります。

<Admonition type="info" icon="📘" title="注意">

<p>有効なNumPyファイルセットは、ターゲットコレクションのスキーマ内のフィールド名に従って名前が付けられる必要があり、それらのデータは対応するフィールド定義と一致している必要があります。</p>

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>1回のインポートあたりの最大サブディレクトリ数</strong></p></th>
     <th><p><strong>サブディレクトリごとの最大サイズ</strong></p></th>
     <th><p><strong>最大合計インポートサイズ</strong></p></th>
   </tr>
   <tr>
     <td><p>ローカルファイルから</p></td>
     <td colspan="3"><p>サポートされていません</p></td>
   </tr>
   <tr>
     <td><p>オブジェクトストレージから</p></td>
     <td><p>1,000サブディレクトリ</p></td>
     <td><p>10GB</p></td>
     <td><p>1TB</p></td>
   </tr>
</table>

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)を参照して独自にデータを再構築するか、[バッチライターツール](./use-bulkwriter)を使用してソースデータファイルを生成できます。[上記図のスキーマに基づいて準備されたサンプルデータをダウンロードするにはこちらをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。
