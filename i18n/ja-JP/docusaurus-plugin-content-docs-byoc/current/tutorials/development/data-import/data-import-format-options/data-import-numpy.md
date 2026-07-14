---
title: "NumPy ファイルからインポート | BYOC"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`.npy` 形式は、単一の配列を保存するための NumPy の標準バイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、その shape および dtype 情報を含むため、異なるマシン間でも正しく再構築できます。生データを Parquet ファイルに準備するには [BulkWriter tool を使用することを推奨します。次の図は、生データを `.npy` ファイル一式にどのようにマッピングできるかを示しています。 | BYOC"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# NumPy ファイルからインポート

`.npy` 形式は、単一の配列を保存するための [NumPy の標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html) であり、その shape および dtype 情報を含むため、異なるマシン間でも正しく再構築できます。生データを Parquet ファイルに準備するには、[BulkWriter tool](./use-bulkwriter) の使用を推奨します。次の図は、生データを `.npy` ファイル一式にどのようにマッピングできるかを示しています。

<Admonition type="warning" icon="🚧" title="注意">

この機能は非推奨になりました。本番環境での使用は推奨されません。

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpy_file_structure.png "numpy_file_structure")

<Admonition type="info" icon="📘" title="注">

- **AutoID を有効にするかどうか**

    **id** フィールドは collection の主フィールドとして機能します。主フィールドを自動インクリメントにするには、スキーマで **AutoID** を有効にします。この場合、ソースデータの各行から **id** フィールドを除外する必要があります。

- **動的フィールドを有効にするかどうか**

    対象 collection で動的フィールドが有効になっている場合、事前定義されたスキーマに含まれていないフィールドを保存する必要があるときは、書き込み操作中に **&#36;meta** 列を指定し、対応するキーと値のデータを提供できます。

- **大文字と小文字を区別**

    辞書キーと collection のフィールド名では大文字と小文字が区別されます。データ内の辞書キーが、対象 collection のフィールド名と完全に一致していることを確認してください。対象 collection に **id** というフィールドがある場合、各エンティティ辞書には **id.** という名前のキーが必要です。**ID** や **Id** を使用するとエラーになります。 

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

## データをインポート\{#import-data}

データの準備ができたら、以下のいずれかの方法を使用して Zilliz Cloud collection にインポートできます。

- [NumPy ファイルフォルダのリストからファイルをインポート（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPy ファイルフォルダからファイルをインポート](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="注">

ファイルが比較的小さい場合は、フォルダまたは複数パス方式を使用して一度にすべてをインポートすることを推奨します。この方法により、インポートプロセス中に内部最適化が行われ、後続のリソース消費を抑えるのに役立ちます。

</Admonition>

Zilliz Cloud コンソールまたは Milvus SDKs を使用してデータをインポートすることもできます。詳細については、[データのインポート（コンソール）](./import-data-on-web-ui) および [データのインポート（SDK）](./import-data-via-sdks) を参照してください。

### NumPy ファイルフォルダのリストからファイルをインポート（推奨）\{#import-files-from-a-list-of-numpy-file-folders-recommended}

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

### NumPy ファイルフォルダからファイルをインポート\{#import-files-from-a-numpy-file-folder}

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

Zilliz Cloud は、クラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルに使用できるストレージパスの例を示しています。

| **クラウド** | **簡単な例** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*numpy-folder*/ |
| **Google Cloud Storage** | gs://*bucket-name*/*numpy-folder*/ |
| **Azure Bolb** | *https:*//*myaccount*.blob.core.windows.net/*bucket-name*/*numpy-folder*/ |

## 制限\{#limits}

クラウドストレージから NumPy ファイルでデータをインポートする際には、いくつか守るべき制限があります。 

<Admonition type="info" icon="📘" title="注">

有効な NumPy ファイル一式は、対象 collection のスキーマ内のフィールド名に従って命名されている必要があり、そこに含まれるデータは対応するフィールド定義と一致している必要があります。

</Admonition>

<table>
   <tr>
     <th><p><strong>インポート方法</strong></p></th>
     <th><p><strong>インポートあたりの最大サブディレクトリ数</strong></p></th>
     <th><p><strong>サブディレクトリあたりの最大サイズ</strong></p></th>
     <th><p><strong>インポート総サイズの上限</strong></p></th>
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

[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) を参照して自分でデータを再構築するか、[BulkWriter tool](./use-bulkwriter) を使用してソースデータファイルを生成できます。[上図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。
