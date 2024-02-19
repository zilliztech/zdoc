---
displayed_sidbar: pythonSidebar
slug: /python/DataImport-RemoteBulkWriter
beta: false
notebook: false
token: Yhy1fHTMnlLKvydKzsIcnfPdnmb
sidebar_position: 1
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
from pymilvus import CollectionSchema, RemoteBulkWriter, BulkFileType

writer = RemoteBulkWriter(
    schema=CollectionSchema(),
    remote_path="string",
    connect_param=RemoteBulkWriter.ConnectParam()
    segment_size=512*1024*1024,
    file_type=BulkFileType.NPY
)
```

**PARAMETERS:**

- **schema** (*CollectionSchema*) -

    **[REQUIRED]**

    The schema of a target collection to which the rewritten data is to be imported.

- **remote_path** (*str*) -

    **[REQUIRED]**

    The path to the directory that is to hold the rewritten data.

- **connect_param** (*ConnectParam*) -

    The parameters used to connect to a remote bucket.

- **segment_size** (*int*) -

    The maximum size of a file segment.

    While rewriting your raw data, Zilliz Cloud splits your raw data into segments.

    The value defaults to 536,870,912 in bytes, which is 512 MB.

    <Admonition type="info" icon="📘" title="How does **BulkWriter** segment my data?">

    <p>The way <strong>BulkWriter</strong> segments your data varies with the target file type.</p>
    <ul>
    <li>**JSON_RB *<em>or</em>* Parquet**</li>
    </ul>
    <p>If the generated file exceeds the specified segment size, <strong>BulkWriter</strong> creates multiple files and names them in sequence numbers, each no larger than the segment size.</p>
    <ul>
    <li><strong>NPY</strong></li>
    </ul>
    <p>If the generated file exceeds the specified segment size, <strong>BulkWriter</strong> creates multiple subdirectories and names them in sequence numbers. Each subdirectory contains all the necessary NumPy files that are no larger than the segment size.</p>

    </Admonition>

- **file_type** (*BulkFileType*) -

    The type of the output file.

    The value defaults to **BulkFileType.NPY**. 

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

import DocCardList from '@theme/DocCardList';

<DocCardList />