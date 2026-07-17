---
title: "NumPy ファイルからのインポート | BYOC"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy` 形式は、NumPy の[標準バイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、単一の配列をその shape および dtype 情報とともに保存し、異なるマシンでも正しく再構築できるようにします。生データを Parquet ファイルに準備するには、[BulkWriter ツールの使用を推奨します。この図は、生データが `.npy` ファイルのセットにどのようにマッピングされるかを示しています。 | BYOC"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NumPy ファイルからのインポート

`.npy` 形式は、単一の配列をその shape および dtype 情報とともに保存するための [NumPy の標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、異なるマシンでも正しく再構築できるようにします。生データを Parquet ファイルに準備するには、[BulkWriter ツール](./use-bulkwriter)の使用を推奨します。以下の図は、生データが `.npy` ファイルのセットにどのようにマッピングされるかを示しています。

<Admonition type="warning" icon="🚧" title="注意">

この機能は非推奨になりました。本番環境での使用は推奨されません。

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpyfilestructure.png "numpy_file_structure")

<Admonition type="info" icon="📘" title="注">

- **AutoID を有効にするかどうか**

    **id** フィールドは collection の主フィールドとして機能します。主フィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にできます。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    対象の collection で動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があれば、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字を区別**

    辞書キーと collection フィールド名は大文字と小文字を区別します。データ内の辞書キーが、対象 collection のフィールド名と完全に一致していることを確認してください。対象 collection に **id** という名前のフィールドがある場合、各エンティティ辞書には **id** というキーが必要です。**ID** や **Id** を使用するとエラーになります。 

</Admonition>

## ディレクトリ構造\{#directory-structure}

データを NumPy ファイルとして準備するには、同じサブセットのすべてのファイルを 1 つのフォルダに配置し、その後、以下のツリー図のようにそれらのフォルダをソースフォルダ内にまとめます。

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

データの準備ができたら、以下のいずれかの方法を使用して、それらを Zilliz Cloud collection にインポートできます。

- [NumPy ファイルフォルダのリストからファイルをインポート（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPy ファイルフォルダからファイルをインポート](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="注">

ファイルが比較的小さい場合は、フォルダまたは複数パスの方法を使用して一度にすべてインポートすることを推奨します。このアプローチにより、インポート処理中に内部最適化が可能になり、後のリソース消費の削減に役立ちます。

</Admonition>

Milvus SDK を使用して、Zilliz Cloud コンソール上でデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui)および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPy ファイルフォルダのリストからファイルをインポート（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする場合は、各 NumPy ファイルフォルダのパスを別々のリストに含め、その後、以下のコード例のようにそれらのすべてのリストを上位レベルのリストにまとめます。

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

### NumPy ファイルフォルダからファイルをインポート\{#import-files-from-a-numpy-file-folder}

ソースフォルダにインポート対象の NumPy ファイルフォルダだけが含まれている場合は、以下のようにリクエストにそのソースフォルダを含めるだけで構いません。

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

Zilliz Cloud は、お使いのクラウドストレージからのデータインポートをサポートしています。以下の表に、データファイルで使用可能なストレージパスを示します。

| **Cloud** | **Quick Examples** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*numpy-folder*/ |
| **Google Cloud Storage** | gs://*bucket-name*/*numpy-folder*/ |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*numpy-folder*/ |

## 制限\{#limits}

クラウドストレージから NumPy ファイル内のデータをインポートする際には、いくつかの制限を守る必要があります。 

<Admonition type="info" icon="📘" title="注">

有効な NumPy ファイルのセットは、対象 collection のスキーマ内のフィールド名に従って命名されている必要があり、その中のデータは対応するフィールド定義に一致している必要があります。

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>インポートごとの最大サブディレクトリ数</strong></p></th>
     <th><p><strong>サブディレクトリごとの最大サイズ</strong></p></th>
     <th><p><strong>インポート全体の最大サイズ</strong></p></th>
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

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)を参照して自分でデータを再構築することも、[BulkWriter ツール](./use-bulkwriter)を使用してソースデータファイルを生成することもできます。[ここをクリックして、上の図のスキーマに基づいて準備されたサンプルデータをダウンロードしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。
