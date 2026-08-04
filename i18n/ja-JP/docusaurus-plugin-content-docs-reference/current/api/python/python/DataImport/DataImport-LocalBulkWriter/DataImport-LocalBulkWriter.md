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

schema、出力パス、segment サイズ、ファイルタイプを指定して LocalBulkWriter オブジェクトを構築します。

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

    書き換えられたデータのインポート先となる対象 collection の schema。

- **local_path** (*str*) -

    **[REQUIRED]**

    書き換えられたデータを格納するディレクトリへのパス。

- **chunk_size** (*int*) -

    ファイル segment の最大サイズ。

    生データを書き換える際、Zilliz Cloud は生データを複数の segment に分割します。

    デフォルト値は **536,870,912** バイト、つまり **512** MB です。

    <Admonition type="info" icon="📘" title="Note">

    BulkWriter はどのようにデータを segment 化しますか？
    
        **BulkWriter** がデータを segment 化する方法は、対象のファイルタイプによって異なります。
    
        生成されたファイルが指定された segment サイズを超える場合、**BulkWriter** は複数のファイルを作成し、segment サイズを超えないようにそれぞれに連番の名前を付けます。

    </Admonition>

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    出力ファイルのタイプ。

    デフォルト値は **BulkFileType.PARQUET** です。 

    使用可能なオプションは **BulkFileType.JSON**、**BulkFileType.PARQUET**、**BulkFileType.CSV** です。

- **config** (*dict*)

    CSV ファイル処理用のオプション設定を指定する辞書です。このパラメーターは、**file_type** が **BulkFileType.CSV** に設定されている場合にのみ使用できます。設定例:

    ```python
    config={
        "sep": "\t",
        "nullkey": "NULL"
    }
    ```

    - **sep** (*string*)

        CSV ファイルの区切り文字。値は長さ 1 の文字列である必要があり、デフォルトは `","` です。次の文字列は使用できません: `"\0"`, `"\n"`, `"\r"`, `"""`.

    - **nullkey** (*string*)

        null 値を表す特別な文字列。デフォルト値は空文字列です: `""`.

**RETURN TYPE:**

*LocalBulkWriter*

**RETURNS:**

**LocalBulkWriter** オブジェクト。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    指定された schema が無効な場合にこの例外が発生します。

## Properties\{#properties}

- **uuid** (*str*) -

    ランダムに生成される UUID。JSON、Parquet、NumPy 形式をサポートし、出力ファイルまたはディレクトリの命名に使用されます。

- **data_path** (*pathlib.PosixPath*) -

    出力ディレクトリへのパス。

- **batch_files** (*str*) -

    生成されたファイル名のリスト。

## Methods\{#methods}

以下は **LocalBulkWriter** クラスのメソッドです:

