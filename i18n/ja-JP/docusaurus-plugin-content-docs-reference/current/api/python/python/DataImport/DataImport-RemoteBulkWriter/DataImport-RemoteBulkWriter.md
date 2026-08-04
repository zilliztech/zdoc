---
title: "RemoteBulkWriter | Python"
slug: /python/python/DataImport-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "RemoteBulkWriter インスタンスは、生データを Zilliz Cloud が理解できる形式で AWS-S3 互換バケットに書き込みます。 | Python"
type: docx
token: BDP4dew9to9tQoxNEMPcBR5xnZb
sidebar_position: 4
keywords: 
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - RemoteBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

**RemoteBulkWriter** インスタンスは、生データを Zilliz Cloud が理解できる形式で AWS-S3 互換バケットに書き込みます。

```python
class pymilvus.RemoteBulkWriter
```

## Constructor\{#constructor}

**schema**、**remote_path**、**connect_param** などのパラメータセットを使用して **RemoteBulkWriter** オブジェクトを構築します。

<Admonition type="info" icon="📘" title="Notes">

**RemoteBulkWriter** オブジェクトは、生データを Zilliz Cloud が理解できる形式に書き換えて AWS-S3 互換バケットに格納することを目的としています。

</Admonition>

```python
from pymilvus import CollectionSchema
from pymilvus.bulk_writer import RemoteBulkWriter, BulkFileType

writer = RemoteBulkWriter(
    schema=CollectionSchema(),
    remote_path="string",
    connect_param=RemoteBulkWriter.ConnectParam()
    chunk_size=512*1024*1024,
    file_type=BulkFileType.PARQUET
)
```

**PARAMETERS:**

- **schema** (*CollectionSchema*) -

    **[REQUIRED]**

    書き換えられたデータのインポート先となる対象 collection のスキーマです。

- **remote_path** (*str*) -

    **[REQUIRED]**

    書き換えられたデータを格納するディレクトリへのパスです。

- **connect_param** (*[ConnectParam](./RemoteBulkWriter-S3ConnectParam)*) -

    リモートバケットへの接続に使用するパラメータです。

- **chunk_size** (*int*) -

    ファイルセグメントの最大サイズです。

    生データの書き換え時に、Zilliz Cloud は生データをセグメントに分割します。

    デフォルト値は 536,870,912 バイトで、512 MB です。

    <Admonition type="info" icon="📘" title="Note">

    BulkWriter はどのようにデータをセグメント化しますか？
    
        **BulkWriter** によるデータのセグメント化の方法は、対象のファイルタイプによって異なります。
    
        生成されたファイルが指定されたセグメントサイズを超える場合、**BulkWriter** は複数のファイルを作成し、それぞれがセグメントサイズを超えないように連番で名前を付けます。

    </Admonition>

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    出力ファイルのタイプです。

    デフォルト値は **BulkFileType.PARQUET** です。 

    指定可能なオプションは **BulkFileType.JSON**、**BulkFileType.PARQUET**、**BulkFileType.CSV** です。

- **config** (*dict*)

    CSV ファイルを処理するためのオプション設定を指定する辞書です。このパラメータは、**file_type** が **BulkFileType.CSV** に設定されている場合にのみ使用できます。設定例:

    ```python
    config={
        "sep": "\t",
        "nullkey": "NULL"
    }
    ```

    - **sep** (*string*)

        CSV ファイルの区切り文字です。値は長さ 1 の文字列である必要があり、デフォルトは `","` です。次の文字列は使用できません: `"\0"`、`"\n"`、`"\r"`、`"""`。

    - **nullkey** (*string*)

        null 値を表す特別な文字列です。デフォルト値は空文字列 `""` です。

**RETURN TYPE:**

*RemoteBulkWriter*

**RETURNS:**

**RemoteBulkWriter** オブジェクト。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    指定されたスキーマが無効な場合に、この例外が発生します。

## Properties\{#properties}

- **data_path** (*pathlib.PosixPath*) -

    出力ディレクトリへのパスです。

- **batch_files** (*str*) -

    生成されたファイル名のリストです。

## Classes\{#classes}

以下は `RemoteBulkWriter` クラスに含まれるクラスです。

- ConnectParam

## Methods\{#methods}

以下は `RemoteBulkWriter` クラスのメソッドです:
