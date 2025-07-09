---
title: "NumPyファイルからインポート | BYOC"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: FALSE
notebook: FALSE
description: "`.npy`フォーマットは、形状とdtype情報を含む単一の配列を保存するためのNumPyの標準バイナリ形式](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、異なるマシンで正しく再構築できるようにします。生データをParquetファイルに準備するには、[BulkWriterツールを使用することをお勧めします。次の図は、生データを`.npy`ファイルのセットにマップする方法を示しています。 | BYOC"
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
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval

---

import Admonition from '@theme/Admonition';


# NumPyファイルからインポート

`.npy`フォーマットは、形状とdtype情報を含む単一の配列を保存するための[NumPyの標準バイナリ形式](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html)であり、異なるマシンで正しく再構築できるようにします。生データをParquetファイルに準備するには、[BulkWriterツール](./use-bulkwriter)を使用することをお勧めします。次の図は、生データを`.npy`ファイルのセットにマップする方法を示しています。

![numpy_file_structure](/img/numpy_file_structure.png)

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><strong>AutoIDを有効にするかどうか</strong></li>
</ul>
<p>「id」フィールドは、コレクションの主要なフィールドとして機能します。主要なフィールドを自動的にインクリメントするには、スキーマで「AutoID」を有効にすることができます。この場合、ソースデータの各行から「id」フィールドを除外する必要があります。</p>
<ul>
<li><strong>動的フィールドを有効にするかどうか</strong></li>
</ul>
<p>ターゲットコレクションで動的フィールドが有効になっている場合、定義済みスキーマに含まれていないフィールドを格納する必要がある場合は、書き込み操作中に<strong>$meta</strong>列を指定し、対応するキー値データを指定できます。</p>
<ul>
<li><strong>大文字と小文字を区別</strong></li>
</ul>
<p>辞書のキーとコレクションフィールド名は大文字と小文字を区別します。データ内の辞書キーがターゲットコレクションのフィールド名と完全に一致するようにしてください。ターゲットコレクションにidという名前のフィールドがある場合、各エンティティ辞書にはidという名前のキーが必要です。IDまたはIdを使用するとエラーが発生します。 </p>

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

Milvus SDKを使用して、Zilliz Cloudコンソールからデータをインポートすることもできます。詳細については、[データのインポート(コンソール)](./import-data-on-web-ui)と[データのインポート(SDK)](./import-data-via-sdks)を参照してください。

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
     <th><p><strong>簡単な例</strong></p></th>
   </tr>
   <tr>
     <td><p>AWS S 3とは</p></td>
     <td><p>s 3://<em>バケット名</em>/<em>numpy-folder</em>/</p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloudストレージ</strong></p></td>
     <td><p>gs://<em>バケット名</em>/<em>numpy-folder</em>/</p></td>
   </tr>
   <tr>
     <td><p><strong>アズールボルブ</strong></p></td>
     <td><p><em>https://</em>myaccount<em>.blob.core.windows.net/</em>バケット名<em>/</em>numpy-folder*/</p></td>
   </tr>
</table>

## 限界{#limits}

有効なNumPyファイルのセットは、ターゲットコレクションのスキーマ内のフィールドにちなんで名前が付けられ、それらのデータは対応するフィールド定義と一致する必要があります。

<table>
   <tr>
     <th><p><strong>アイテム</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>インポートごとに複数のファイル</strong></p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p><strong>第1レベルのサブフォルダからのデータインポート</strong></p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p><strong>第1レベルのサブフォルダの最大数</strong></p></td>
     <td><p>100,000</p></td>
   </tr>
   <tr>
     <td><p><strong>インポートごとの最大ファイル体格</strong></p></td>
     <td><p>クラスタの空き容量:合計512 MB</p><p>サーバーレス&amp;専用クラスター:</p><ul><li><p>各第1レベルのサブフォルダのファイル体格の合計: 10 GB</p></li><li><p>ファイルの体格: 1 TB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>適用可能なデータファイルの場所</strong></p></td>
     <td><p>リモートファイルのみ</p></td>
   </tr>
</table>

[データファイルを準備する](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file)を参照して自分でデータを再構築するか、[BulkWriterツール](./use-bulkwriter)を使用してソースデータファイルを生成することができます。