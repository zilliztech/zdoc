---
title: "refresh_external_collection() | Python | MilvusClient"
slug: /python/python/Collections-refresh_external_collection
sidebar_label: "refresh_external_collection()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation scans the data files in the schema-defined external storage and generates metadata files that record their mapping relationship to those data files. | Python | MilvusClient"
type: docx
token: ZVs4dDpvmoXI0OxOnKhc9numnJd
sidebar_position: 30
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - refresh_external_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# refresh_external_collection()

This operation scans the data files in the schema-defined external storage and generates metadata files that record their mapping relationship to those data files.

<Admonition type="info" title="Notes">

This requires a MilvusClient set up using the project endpoint as follows:

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
refresh_external_collection(
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing external collection.

- **external_source** (*str*) -

    The external source URI, which is similar to an AWS S3 object path.

- **external_spec** (*str*) -

    The external source specifications, which are a set of secondary parameters: format (str): The format of the target source data files. Possible values are parquet, vortex, lance-table, and iceberg-table. snapshot_id (str): The ID of an Iceberg table. This applies only when format is iceberg-table. extfs (string): External file system settings in a stringified JSON structure. Possible options are as follows: access_key_id (string): The access key ID of your object storage service. access_key_val (string): The access key value of your object storage service. cloud_provider (string): The cloud provider of your object storage service. region (string): The region of your object storage service. use_iam (string): Whether to use AWS IAM for bucket access authentication. Possible values are "true" or "false". iam_endpoint (string): The AWS IAM STS endpoint. use_ssl (string): Whether to use SSL to access your object storage bucket. Possible values are "true" or "false". use_virtual_host (string): Whether to use virtual hosting for bucket access. For details, refer to this article. storage_type (string): The storage type. Possible values is remote. role_arn (string): The AWS IAM Role ARN that is obtained from the bucket owner. external_id (string): The external ID obtained from the bucket owner. load_frequency (string): The interval at which Milvus retrieves temporary authentication credentials in seconds.

- **timeout** (*float*) -

    The timeout duration for this operation. Setting this to None indicates that this operation times out when any response arrives or any error occurs.

- **external_source** (*str*) -

    The external source URI, which should be a `volume://` URI that points to an accessible external volume. For example, `volume://<volume-name>/path/to/folder/`..

- **external_spec** (*str*) -

    The external source specifications, which are a set of secondary parameters:

    - **format** (*str*) - 

        The format of the target source data files.

        Possible values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

    - **snapshot_id** (*str*) -

        The ID of an Iceberg table. This applies only when `format` is `iceberg-table`.

**RETURN TYPE:**

*int*

**RETURNS:**

An integer that indicates an asynchronous job that has been created.

## Examples\{#examples}

```python
import time

from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        break
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        break

    time.sleep(2)
```

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_PROJECT_ENDPOINT",
    token="YOUR_API_KEY"
)

job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        return job_id
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        return job_id

    time.sleep(2)
```

