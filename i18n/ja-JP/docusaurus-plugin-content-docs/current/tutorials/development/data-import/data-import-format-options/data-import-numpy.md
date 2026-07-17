---
title: "NumPy ファイルからインポート | Cloud"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy` 形式は、単一の配列を保存するための [NumPy の標準バイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、shape と dtype の情報を含むため、異なるマシンでも正しく再構築できます。生データを Parquet ファイルに変換するには、[BulkWriter tool を使用する](./use-bulkwriter)ことを推奨します。次の図は、生データを一連の `.npy` ファイルにどのようにマッピングできるかを示しています。 | Cloud"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NumPy ファイルからインポート

`.npy` 形式は、単一の配列を保存するための [NumPy の標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、shape と dtype の情報を含むため、異なるマシンでも正しく再構築できます。生データを Parquet ファイルに変換するには、[BulkWriter tool](./use-bulkwriter) を使用することを推奨します。次の図は、生データを一連の `.npy` ファイルにどのようにマッピングできるかを示しています。

<Admonition type="warning" icon="🚧" title="注意">

この機能は非推奨になりました。本番環境での使用は推奨されません。

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpyfilestructure.png "numpy_file_structure")

<Admonition type="info" icon="📘" title="注">

- **AutoID を有効にするかどうか**

    **id** フィールドは collection の主フィールドとして機能します。主フィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にできます。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    ターゲット collection で動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があれば、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字を区別**

    辞書キーと collection のフィールド名は大文字と小文字を区別します。データ内の辞書キーがターゲット collection のフィールド名と完全に一致していることを確認してください。ターゲット collection に **id** というフィールドがある場合、各エンティティ辞書には **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを NumPy ファイルとして準備するには、同じサブセットのすべてのファイルを 1 つのフォルダに配置し、その後、以下のツリー図のようにこれらのフォルダをソースフォルダ内にまとめます。

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

データの準備ができたら、以下のいずれかの方法を使用して Zilliz Cloud collection にインポートできます。

- [NumPy ファイルフォルダのリストからファイルをインポートする（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPy ファイルフォルダからファイルをインポートする](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="注">

ファイルが比較的小さい場合は、フォルダまたは複数パス方式を使って一度にまとめてインポートすることを推奨します。この方法では、インポート処理中に内部最適化が可能になり、後続のリソース消費の削減に役立ちます。

</Admonition>

Milvus SDKs を使用して Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPy ファイルフォルダのリストからファイルをインポートする（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする場合は、各 NumPy ファイルフォルダのパスを個別のリストに含め、その後、以下のコード例のようにそれらすべてのリストを上位レベルのリストにまとめます。

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

### NumPy ファイルフォルダからファイルをインポートする\{#import-files-from-a-numpy-file-folder}

ソースフォルダにインポート対象の NumPy ファイルフォルダしか含まれていない場合は、以下のようにリクエストにそのソースフォルダを含めるだけでかまいません。

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

<Admonition type="info" icon="📘" title="注">

フォルダに複数形式のファイルが含まれている場合、リクエストは失敗します。

</Admonition>

## ストレージパス\{#storage-paths}

Zilliz Cloud は、お使いのクラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルに使用可能なストレージパスを示しています。

| **Cloud** | **クイック例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*numpy-folder*/ |
| **Google Cloud Storage** | gs://*bucket-name*/*numpy-folder*/ |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*numpy-folder*/ |

## 制限\{#limits}

クラウドストレージから NumPy ファイルでデータをインポートする際には、いくつか守るべき制限があります。 

<Admonition type="info" icon="📘" title="注">

有効な一式の NumPy ファイルは、ターゲット collection のスキーマ内のフィールド名に従って命名されており、それらに含まれるデータは対応するフィールド定義と一致している必要があります。

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>クラスタープラン</strong></p></th>
     <th><p><strong>インポートごとのサブディレクトリ最大数</strong></p></th>
     <th><p><strong>サブディレクトリごとの最大サイズ</strong></p></th>
     <th><p><strong>インポート全体の最大サイズ</strong></p></th>
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

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照して自分でデータを再構築することも、[BulkWriter tool](./use-bulkwriter) を使用してソースデータファイルを生成することもできます。[上図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。
