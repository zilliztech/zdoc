---
title: "LocalBulkWriter | Python"
slug: /python/python/DataImport-LocalBulkWriter
sidebar_label: "LocalBulkWriter"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "LocalBulkWriter インスタンスは、生データを Zilliz Cloud が理解できる形式にローカルで書き換えます。 | Python"
type: docx
token: RcvXdmCVBog9M8xNyUFcwefnneh
sidebar_position: 3
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - LocalBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# LocalBulkWriter

LocalBulkWriter インスタンスは、生データを Zilliz Cloud が理解できる形式にローカルで書き換えます。

```python
class pymilvus.LocalBulkWriter
```

## Constructor\{#constructor}

schema、出力パス、セグメントサイズ、およびファイルタイプに基づいて LocalBulkWriter オブジェクトを構築します。

<Admonition type="info" icon="📘" title="Notes">

**LocalBulkWriter** オブジェクトは、生データを Zilliz Cloud が理解できる形式にローカルで書き換えることを目的としています。

</Admonition>

```python
from pymilvus import CollectionSchema
from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType

writer = LocalBulkWriter(
    schema=CollectionSchema(),
    local_path="string",
    chunk_size=512*1024*1024,
    file_type=BulkFileType.PARQUET
)
```

**PARAMETERS:**

- **schema** (*CollectionSchema*) -

    **[REQUIRED]**

    書き換えられたデータのインポート先となる target collection の schema です。

- **local_path** (*str*) -

    **[REQUIRED]**

    書き換えられたデータを格納するディレクトリのパスです。

- **chunk_size** (*int*) -

    ファイルセグメントの最大サイズです。

    生データを書き換える際、Zilliz Cloud は生データをセグメントに分割します。

    デフォルト値は **536,870,912** バイト、つまり **512** MB です。

    <Admonition type="info" icon="📘" title="Note">

    BulkWriter はどのようにデータをセグメント化しますか？
    
        **BulkWriter** によるデータのセグメント化の方法は、対象のファイルタイプによって異なります。
    
        生成されたファイルが指定されたセグメントサイズを超える場合、**BulkWriter** は複数のファイルを作成し、各ファイルがセグメントサイズを超えないように連番で名前を付けます。

    </Admonition>

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    出力ファイルのタイプです。

    デフォルト値は **BulkFileType.PARQUET** です。 

    使用可能なオプションは **BulkFileType.JSON**、**BulkFileType.PARQUET**、**BulkFileType.CSV** です。

- **config** (*dict*)

    CSV ファイルを処理するためのオプション設定を指定する辞書です。このパラメータは、**file_type** が **BulkFileType.CSV** に設定されている場合にのみ使用できます。設定例:

    ```python
    config={
        "sep": "\t",
        "nullkey": "NULL"
    }
    ```

    - **sep** (*string*)

        CSV ファイルの区切り文字です。値は長さ 1 の文字列である必要があり、デフォルトは `","` です。次の文字列は使用できません: `"\0"`, `"\n"`, `"\r"`, `"""`.

    - **nullkey** (*string*)

        null 値を表す特別な文字列です。デフォルト値は空文字列: `""` です。

**RETURN TYPE:**

*LocalBulkWriter*

**RETURNS:**

**LocalBulkWriter** オブジェクトです。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    指定された schema が無効な場合に、この例外が発生します。

## Properties\{#properties}

- **uuid** (*str*) -

    ランダムに生成される UUID で、出力ファイルまたはディレクトリの名前付けに使用されます。JSON、Parquet、および NumPy 形式をサポートします。

- **data_path** (*pathlib.PosixPath*) -

    出力ディレクトリへのパスです。

- **batch_files** (*str*) -

    生成されたファイル名のリストです。

## Methods\{#methods}

以下は **LocalBulkWriter** クラスのメソッドです。

