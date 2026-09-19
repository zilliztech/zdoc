---
title: "NumPy ファイルからインポート | Cloud"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy` 形式は、単一の配列を保存するための NumPy の標準バイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、その shape と dtype 情報を含むため、異なるマシン上でも正しく再構築できます。生データを Parquet ファイルに準備するには、[BulkWriter ツールを使用することを推奨します。以下の図は、生データを一連の `.npy` ファイルにどのようにマッピングできるかを示しています。 | Cloud"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NumPy ファイルからインポート

`.npy` 形式は、単一の配列を保存するための [NumPy の標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、その shape と dtype 情報を含むため、異なるマシン上でも正しく再構築できます。  生データを Parquet ファイルに準備するには、[BulkWriter ツール](./use-bulkwriter) の使用を推奨します。以下の図は、生データを一連の `.npy` ファイルにどのようにマッピングできるかを示しています。

<Admonition type="warning" title="Caution">

この機能は非推奨になりました。本番環境での使用は推奨されません。

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpyfilestructure.png "numpy_file_structure")

<Admonition type="info" title="Notes">

- **AutoID を有効にするかどうか**

    **id** フィールドはコレクションのプライマリフィールドとして機能します。プライマリフィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にできます。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    対象のコレクションで動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があるときは、書き込み時に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字の区別**

    辞書のキーとコレクションのフィールド名は大文字と小文字を区別します。データ内の辞書キーが対象コレクションのフィールド名と完全に一致していることを確認してください。対象コレクションに **id** という名前のフィールドがある場合、各エンティティの辞書には **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。

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

データの準備ができたら、以下のいずれかの方法を使用して、Zilliz Cloud のコレクションにインポートできます。

- [NumPy ファイルフォルダーのリストからファイルをインポート（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPy ファイルフォルダーからファイルをインポート](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" title="Notes">

ファイルが比較的小さい場合は、フォルダーまたは複数パスの方法を使用して一度にすべてインポートすることを推奨します。この方法では、インポート処理中に内部最適化が可能になり、後続のリソース消費を抑えるのに役立ちます。

</Admonition>

Milvus SDK を使用して Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPy ファイルフォルダーのリストからファイルをインポート（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする場合は、各 NumPy ファイルフォルダーのパスを個別のリストに含め、次に以下のコード例のように、すべてのリストを上位レベルのリストにまとめます。

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

### NumPy ファイルフォルダーからファイルをインポート\{#import-files-from-a-numpy-file-folder}

ソースフォルダーにインポート対象の NumPy ファイルフォルダーのみが含まれている場合は、以下のようにリクエストにそのソースフォルダーを含めるだけで済みます。

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

<Admonition type="info" title="Notes">

フォルダーに複数形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

## ストレージパス\{#storage-paths}

Zilliz Cloud は、お使いのクラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルで使用できるストレージパスを示します。

| **Cloud** | **Quick Examples** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*numpy-folder*/ |
| **Google Cloud Storage** | gs://*bucket-name*/*numpy-folder*/ |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*numpy-folder*/ |

## 制限事項\{#limits}

クラウドストレージから NumPy ファイルでデータをインポートする際には、守る必要がある制限がいくつかあります。

<Admonition type="info" title="Notes">

有効な NumPy ファイルのセットは、対象コレクションのスキーマ内のフィールドにちなんで命名する必要があり、それらのデータは対応するフィールド定義と一致している必要があります。

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>インポートあたりの最大サブディレクトリ数</strong></p></th>
     <th><p><strong>サブディレクトリあたりの最大サイズ</strong></p></th>
     <th><p><strong>インポートの最大合計サイズ</strong></p></th>
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

[Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照してデータを自分で再構築するか、[BulkWriter ツール](./use-bulkwriter) を使用してソースデータファイルを生成できます。[上の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。
