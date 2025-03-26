---
displayed_sidbar: pythonSidebar
title: "RemoteBulkWriter | Python"
slug: /python/python/DataImport-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: false
notebook: false
description: "A RemoteBulkWriter instance writes your raw data in a format that Zilliz Cloud understands into an AWS-S3-compatible bucket. | Python"
type: docx
token: BDP4dew9to9tQoxNEMPcBR5xnZb
sidebar_position: 4
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - RemoteBulkWriter
  - pymilvus25
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

A **RemoteBulkWriter** instance writes your raw data in a format that Zilliz Cloud understands into an AWS-S3-compatible bucket.

```python
class pymilvus.RemoteBulkWriter
```

## Constructor{#constructor}

Constructs a **RemoteBulkWriter** object with a set of parameters, such as **schema**, **remote_path**, **connect_param** etc.

<Admonition type="info" icon="📘" title="Notes">

<p>A <strong>RemoteBulkWriter</strong> object intends to rewrite your raw data in a format that Zilliz Cloud understands into an AWS-S3-compatible bucket.</p>

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

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) -

    **[REQUIRED]**

    The schema of a target collection to which the rewritten data is to be imported.

- **remote_path** (*str*) -

    **[REQUIRED]**

    The path to the directory that is to hold the rewritten data.

- **connect_param** (*[ConnectParam](./RemoteBulkWriter-S3ConnectParam)*) -

    The parameters used to connect to a remote bucket.

- **chunk_size** (*int*) -

    The maximum size of a file segment.

    While rewriting your raw data, Zilliz Cloud splits your raw data into segments.

    The value defaults to 536,870,912 in bytes, which is 512 MB.

    <Admonition type="info" icon="📘" title="How does BulkWriter segment my data?">

    <p>The way <strong>BulkWriter</strong> segments your data varies with the target file type.</p>
    <p>If the generated file exceeds the specified segment size, <strong>BulkWriter</strong> creates multiple files and names them in sequence numbers, each no larger than the segment size.</p>

    </Admonition>

- **file_type** (*BulkFileType*) -

    The type of the output file.

    The value defaults to **BulkFileType.PARQUET**. 

    Possible options are **BulkFileType.JSON**, **BulkFileType.PARQUET**, **BulkFileType.CSV**.

- **config** (*dict*)

    A dictionary specifying optional configurations for processing CSV files. This parameter is available only when **file_type** is set to **BulkFileType.CSV**. Example configuration:

    ```python
    config={
        "sep": "\t",
        "nullkey": "NULL"
    }
    ```

    -  **sep** (*string*)

        The delimiter of CSV file. The value must be a string of length 1, which defaults to `","`. The following strings are not allowed: `"\0"`, `"\n"`, `"\r"`, `"""`.

    - **nullkey** (*string*)

        Special string representing null value. The value defaults to empty string: `""`.

**RETURN TYPE:**

*RemoteBulkWriter*

**RETURNS:**

A **RemoteBulkWriter** object.

**EXCEPTIONS:**

- **SchemaNotReadyException**

    This exception will be raised when the provided schema is invalid.

## Properties{#properties}

- **data_path** (*pathlib.PosixPath*) -

    The path to the output directory.

- **batch_files** (*str*) -

    A list of the generated file names.

## Classes{#classes}

The following are the classes of the `RemoteBulkWriter` class:

- ConnectParam

## Methods{#methods}

The following are the methods of the `RemoteBulkWriter` class: