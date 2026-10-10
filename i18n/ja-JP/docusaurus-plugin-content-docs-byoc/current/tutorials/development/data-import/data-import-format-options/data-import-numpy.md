---
title: "NumPy ファイルからのインポート | BYOC"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy` 形式は、単一の配列を保存するための NumPy の標準バイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html) です。配列の shape と dtype 情報が含まれているため、異なるマシンでも正しく再構築できることが保証されます。生データを Parquet ファイルとして準備するには、BulkWriter ツールの使用をお勧めします。以下の図は、生データを一連の `.npy` ファイルにマッピングする方法を示しています。 | BYOC"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NumPy ファイルからのインポート

`.npy` 形式は、単一の配列を保存するための [NumPy の標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html) です。配列の shape と dtype 情報が含まれているため、異なるマシンでも正しく再構築できることが保証されます。生データを Parquet ファイルとして準備するには、[BulkWriter ツール](./use-bulkwriter) の使用をお勧めします。以下の図は、生データを一連の `.npy` ファイルにマッピングする方法を示しています。

<Admonition type="warning" title="Caution">

この機能は非推奨になりました。本番環境での使用はお勧めしません。

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpyfilestructure.png "numpy_file_structure")

<Admonition type="info" title="Notes">

- **AutoID を有効にするかどうか**

    **id** フィールドはコレクションの主フィールドとして機能します。主フィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にできます。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    ターゲットコレクションが動的フィールドを有効にしている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があるときは、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字の区別**

    辞書のキーとコレクションのフィールド名は大文字と小文字が区別されます。データ内の辞書のキーが、ターゲットコレクションのフィールド名と完全に一致していることを確認してください。ターゲットコレクションに **id** という名前のフィールドがある場合、各エンティティの辞書には **id** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを NumPy ファイルとして準備するには、同じサブセットのすべてのファイルを 1 つのフォルダーにまとめ、以下のツリー図に示すように、これらのフォルダーをソースフォルダー内にグループ化します。

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

データの準備ができたら、次のいずれかの方法で Zilliz Cloud コレクションにインポートできます。

- [NumPy ファイルフォルダーのリストからファイルをインポートする（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPy ファイルフォルダーからファイルをインポートする](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" title="Notes">

ファイルが比較的小さい場合は、フォルダーまたは複数パスの方法を使用して、それらを一度にまとめてインポートすることをお勧めします。このアプローチにより、インポートプロセス中に内部的な最適化が可能になり、後続のリソース消費を抑えることができます。

</Admonition>

Milvus SDK を使用して、Zilliz Cloud コンソールでもデータをインポートできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPy ファイルフォルダーのリストからファイルをインポートする（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする場合は、各 NumPy ファイルフォルダーのパスを個別のリストに含め、次のコード例のように、すべてのリストを上位レベルのリストにまとめます。

```bash
export TOKEN="YOUR_API_KEY"

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
        "accessKey": "YOUR_ACCESS_KEY",
        "secretKey": "YOUR_SECRET_KEY"
    }'
```

### NumPy ファイルフォルダーからファイルをインポートする\{#import-files-from-a-numpy-file-folder}

ソースフォルダーに、インポートする NumPy ファイルフォルダーのみが含まれている場合は、次のようにソースフォルダーをリクエストに含めるだけで済みます。

```bash
export TOKEN="YOUR_API_KEY"

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
        "accessKey": "YOUR_ACCESS_KEY",
        "secretKey": "YOUR_SECRET_KEY"
    }'
```

<Admonition type="info" title="Notes">

フォルダーに複数の形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

## ストレージパス\{#storage-paths}

Zilliz Cloud は、お使いのクラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルに使用できるストレージパスを示します。

| **クラウド** | **簡単な例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*numpy-folder*/ |
| **Google Cloud Storage** | gs://*bucket-name*/*numpy-folder*/ |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*numpy-folder*/ |

## 制限事項\{#limits}

クラウドストレージから NumPy ファイルでデータをインポートする際には、遵守すべきいくつかの制限があります。 

<Admonition type="info" title="Notes">

有効な NumPy ファイルのセットは、ターゲットコレクションのスキーマ内のフィールドにちなんで命名する必要があり、そのデータは対応するフィールド定義と一致している必要があります。

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>インポートあたりの最大サブディレクトリ数</strong></p></th>
     <th><p><strong>サブディレクトリあたりの最大サイズ</strong></p></th>
     <th><p><strong>インポートの最大合計サイズ</strong></p></th>
   </tr>
   <tr>
     <td><p>ローカルファイルから</p></td>
     <td colspan="3"><p>サポートされていません</p></td>
   </tr>
   <tr>
     <td><p>オブジェクトストレージから</p></td>
     <td><p>1,000 サブディレクトリ</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

データを自身で再構築するには [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照するか、[BulkWriter ツール](./use-bulkwriter) を使用してソースデータファイルを生成してください。[ここをクリックすると、上記の図のスキーマに基づいて準備されたサンプルデータをダウンロードできます](https://assets.zilliz.com/prepared_numpy_data.zip)。
