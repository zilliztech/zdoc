---
title: "NumPyファイルからインポート | BYOC"
slug: /data-import-numpy
sidebar_label: "NumPyファイルからインポート"
beta: FALSE
notebook: FALSE
description: "NPY形式は、NumPyの標準バイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、形状とdtype情報を含む単一の配列を保存し、異なるマシンで正しく再構築できるようにします。生データをParquetファイルに準備するには、[BulkWriterツールを使用することをお勧めします。次の図は、生データを`. npy`ファイルのセットにマップする方法を示しています。 | BYOC"
type: origin
token: XBkrwC23yicDq0kxz3rcnYZxn5b
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - numpy
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


# NumPyファイルからインポート

NPY形式は、[NumPyの標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、形状とdtype情報を含む単一の配列を保存し、異なるマシンで正しく再構築できるようにします。生データをParquetファイルに準備するには、[BulkWriterツール](./use-bulkwriter)を使用することをお勧めします。次の図は、生データを`. npy`ファイルのセットにマップする方法を示しています。

![data_import-preparetion_en](/byoc/ja-JP/data_import-preparetion_en.png)

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p>「<strong>id</strong>」フィールドは、コレクションのプライマリフィールドとして機能します。プライマリフィールドを自動的にインクリメントするには、スキーマで「<strong>AutoID</strong>」を有効にします。この場合、ソースデータの各行から「<strong>id</strong>」フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、定義済みスキーマに含まれていないフィールドを格納する必要がある場合は、書き込み操作中に<strong>$meta</strong>列を指定し、対応するキー値データを指定できます。</p>
<ul>
<li><strong>大文字と小文字を区別する</strong></li>
</ul>
<p>ディクショナリのキーとコレクションのフィールド名は大文字と小文字を区別します。データ内のディクショナリのキーがターゲットコレクションのフィールド名と完全に一致するようにしてください。ターゲットコレクションに<strong>id</strong>という名前のフィールドがある場合、各エンティティディクショナリにはidという名前のキーが必要です<strong>。ID</strong>または<strong>Idを使用するとエラーが発生します。</strong></p>

</Admonition>

## ディレクトリ構造{#directory-structure}

NumPyファイルとしてデータを準備するには、以下のツリー図に示すように、同じサブセットのすべてのファイルをフォルダに置くし、これらのフォルダをソースフォルダ内にグループ化します。

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

## データのインポート{#import-data}

データの準備ができたら、次のいずれかの方法を使用して、Zilliz Cloudコレクションにデータをインポートできます。

- [NumPyファイルフォルダのリストからファイルをインポートする（推奨）](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [NumPyファイルフォルダからファイルをインポートする](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="ノート">

<p>ファイルが比較的小さい場合は、フォルダまたは複数パスの方法を使用して一度にすべてをインポートすることをお勧めします。このアプローチにより、インポート過程で内部最適化が可能になり、後でリソースの消費を減らすことができます。</p>

</Admonition>

Milvus SDKを使用して、Zilliz Cloudコンソールからデータをインポートすることもできます。詳細については、「[データのインポート(コンソール)](./import-data-on-web-ui)」および「[データのインポート(SDK)](./import-data-via-sdks)」を参照してください。

### NumPyファイルフォルダのリストからファイルをインポートする（推奨）{#import-files-from-a-list-of-numpy-file-folders-recommended}

複数のパスからファイルをインポートする場合は、各NumPyファイルフォルダーパスを個別のリストに含め、次のコード例のようにすべてのリストを上位レベルのリストにグループ化します。

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

### NumPyファイルフォルダからファイルをインポートする{#import-files-from-a-numpy-file-folder}

ソースフォルダにインポートするNumPyファイルフォルダのみが含まれている場合は、次のようにソースフォルダを要求に含めることができます。

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

## ストレージパス{#storage-paths}

Zilliz Cloudは、クラウドストレージからのデータインポートをサポートしています。以下の表は、データファイルの可能なストレージパスを示しています。

<table>
   <tr>
     <th><p><strong>クラウド</strong></p></th>
     <th><p><strong>クイックな例</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>AWS S3</strong></p></td>
     <td><p><code>s3://bucket-name/numpy-folder/</code></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p><code>gs://bucket-name/numpy-folder/</code></p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><code>https://myaccount.blob.core.windows.net/bucket-name/numpy-folder/</code></p></td>
   </tr>
</table>

## 限界{#limits}

有効なNumPyファイルのセットは、ターゲットコレクションのスキーマ内のフィールドにちなんで名前が付けられ、それらのデータは対応するフィールド定義と一致する必要があります。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>一度に複数のファイルをインポートする</strong></p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p><strong>第1レベルのサブフォルダからのデータインポート</strong></p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p><strong>第1レベルのサブフォルダの最大数</strong></p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p><strong>インポートごとの最大ファイル体格</strong></p></td>
     <td><p>クラスタの空き容量:合計512 MB サーバーレス&amp;専用クラスター:</p><ul><li><p>各第1レベルのサブフォルダのファイル体格の合計: 10 GB</p></li><li><p>ファイルの体格: 100 GB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>使用可能なデータファイルの場所</strong></p></td>
     <td><p>リモートファイルのみ</p></td>
   </tr>
</table>

「[データファイルの準備](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)」を参照して、自分でデータを再構築するか、[BulkWriterツール](./use-bulkwriter)を使用してソースデータファイルを生成できます。[上の図のスキーマに基づいて準備されたサンプルデータをダウンロードするには、ここをクリックしてください](https://assets.zilliz.com/prepared_numpy_data.zip)。

