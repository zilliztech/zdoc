---
title: "NumPy ファイルからインポート | Cloud"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy` 形式は、配列の形状と dtype 情報を含む単一の配列を保存するための NumPy 標準のバイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、異なるマシンでも正しく再構築できることを保証します。生データを Parquet ファイルに準備するには、[BulkWriter ツールを使用することをお勧めします。次の図は、生データを一連の `.npy` ファイルにマッピングする方法を示しています。 | Cloud"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NumPy ファイルからインポート

`.npy` 形式は、形状と dtype 情報を含む単一の配列を保存するための [NumPy 標準のバイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、異なるマシンでも正しく再構築できることを保証します。 生データを Parquet ファイルに準備するには、[BulkWriter ツール](./use-bulkwriter) の使用をお勧めします。次の図は、生データを一連の `.npy` ファイルにマッピングする方法を示しています。

<Admonition type="warning" title="Caution">

この機能は非推奨です。本番環境での使用は推奨されません。

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpyfilestructure.png "numpy_file_structure")

<Admonition type="info" title="Notes">

- **AutoID を有効にするかどうか**

    **id** フィールドはコレクションの主フィールドとして機能します。主フィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にできます。この場合、ソースデータの各行から **id** フィールドを除外してください。

- **動的フィールドを有効にするかどうか**

    ターゲットコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを格納する必要があるときは、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字の区別**

    辞書のキーとコレクションのフィールド名では大文字と小文字が区別されます。データ内の辞書のキーがターゲットコレクションのフィールド名と完全に一致することを確認してください。ターゲットコレクションに **id** という名前のフィールドがある場合、各エンティティ辞書には **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを NumPy ファイルとして準備するには、同じサブセットのすべてのファイルを 1 つのフォルダーに配置し、次に以下のツリー図に示すように、これらのフォルダーをソースフォルダー内にまとめます。

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

ファイルが比較的小さい場合は、フォルダーまたは複数パスの方法を使用してすべてを一度にインポートすることをお勧めします。このアプローチにより、インポートプロセス中に内部最適化が可能になり、その後のリソース消費を削減できます。

</Admonition>

Zilliz Cloud コンソールで Milvus SDK を使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPy ファイルフォルダーのリストからファイルをインポートする（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする場合は、各 NumPy ファイルフォルダーのパスを個別のリストに含め、次に以下のコード例のように、すべてのリストを上位レベルのリストにまとめます。

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

ソースフォルダーに、インポートする NumPy ファイルフォルダーのみが含まれている場合は、次のようにリクエストにソースフォルダーを含めるだけです。

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

クラウドストレージから NumPy ファイルでデータをインポートする際に守る必要があるいくつかの制限があります。

<Admonition type="info" title="Notes">

有効な NumPy ファイルのセットは、ターゲットコレクションのスキーマ内のフィールドにちなんで命名する必要があり、その中のデータは対応するフィールド定義と一致している必要があります。

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>インポートあたりの最大サブディレクトリ数</strong></p></th>
     <th><p><strong>サブディレクトリあたりの最大サイズ</strong></p></th>
     <th><p><strong>最大合計インポートサイズ</strong></p></th>
   </tr>
   <tr>
     <td><p>ローカルファイルから</p></td>
     <td colspan="4"><p>サポートされていません</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>オブジェクトストレージから</p></td>
     <td><p>Free</p></td>
     <td><p>1,000 サブディレクトリ</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>Serverless & Dedicated</p></td>
     <td><p>1,000 サブディレクトリ</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照して自分でデータを再構築するか、[BulkWriter ツール](./use-bulkwriter) を使用してソースデータファイルを生成できます。[上の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。
