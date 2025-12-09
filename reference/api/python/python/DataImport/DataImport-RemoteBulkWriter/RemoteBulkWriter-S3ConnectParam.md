---
title: "S3ConnectParam | Python"
slug: /python/python/RemoteBulkWriter-S3ConnectParam
sidebar_label: "S3ConnectParam"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "An S3ConnectParam instance sets connection parameters for a RemoteBulkWriter instance. | Python"
type: docx
token: CSpOd0XgWoVAhzx5xbVcpCVfnPg
sidebar_position: 5
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - S3ConnectParam
  - pymilvus26
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# S3ConnectParam

An **S3ConnectParam** instance sets connection parameters for a **RemoteBulkWriter** instance.

```python
class pymilvus.RemoteBulkWriter.S3ConnectParam
```

## Constructor\{#constructor}

Constructs an **S3ConnectParam** object by a set of parameters, such as **bucket_name**, **access_key**, **secret_key**, etc.

<Admonition type="info" icon="📘" title="Notes">

<p>An <strong>S3ConnectParam</strong> object defines the parameters necessary for Zilliz Cloud to connect to an AWS-S3-compatible bucket.</p>
<p>You need to create this object before initializing a <strong>RemoteBulkWriter</strong> object.</p>

</Admonition>

```python
from urllib3.poolmanager import PoolManager
from minio.credentials import Provider
from pymilvus.bulk_writer import RemoteBulkWriter

connect_param = RemoteBulkWriter.S3ConnectParam(
    bucket_name="string",
    endpoint="string",
    access_key="string",
    secret_key="string",
    secure=False,
    session_token="string",
    region="str",
    http_client=PoolManager(),
    credentials=Provider()
)
```

**PARAMETERS:**

- **bucket_name** (*str*)

    The name of the remote bucket to connect to.

- **endpoint** (*str*)

    The URL of the AWS-S3-compatible service.

    The value can be the URL of a MinIO service or that of any AWS S3 compatible public service.

    <table>
       <tr>
         <th><p><strong>Service Name</strong></p></th>
         <th><p><strong>Endpoint</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWS S3</strong></p></td>
         <td><p>s3.amazonaws.com</p></td>
       </tr>
       <tr>
         <td><p><strong>GCS</strong></p></td>
         <td><p>storage.googleapis.com</p></td>
       </tr>
    </table>

- **access_key** (*str*)

    The access key (user ID) used to authenticate access to the specified bucket.

- **secret_key** (*str*)

    The secret_key (password) used to authenticate access to the specified bucket.

- **secure** (*bool*)

    Whether to use secure (TLS) connection to the AWS S3 compatible service. 

- **session_token** (*str*)

    A session token of your account in the AWS S3 compatible service.

- **region** (*str*)

    The name or ID of the region where the bucket resides.

- **http_client** (*urllib3.poolmanager.PoolManager*)

    A customized HTTP client.

- **credentials** (*minio.credentials.Provider*)    

    A credentials provider of your account in the AWS S3 compatible service.

**RETURN TYPE:**

*RemoteBulkWriter*

**RETURNS:**

A **RemoteBulkWriter** object.

**EXCEPTIONS:**

- **Exception**

    This exception will be raised if the connection fails.

