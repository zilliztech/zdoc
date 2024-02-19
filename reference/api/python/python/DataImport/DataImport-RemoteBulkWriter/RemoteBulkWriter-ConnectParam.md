---
displayed_sidbar: pythonSidebar
slug: /python/RemoteBulkWriter-ConnectParam
beta: false
notebook: false
token: CSpOd0XgWoVAhzx5xbVcpCVfnPg
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# ConnectParam

A **ConnectParam** instance sets connection parameters for a **RemoteBulkWriter** instance.

```python
class pymilvus.RemoteBulkWriter.ConnectParam
```

## Constructor{#constructor}

Constructs a **ConnectParam** object by a set of parameters, such as **bucket_name**, **access_key**, **secret_key**, etc.

<Admonition type="info" icon="📘" title="Notes">

<p>A <strong>ConnectParam</strong> object defines the parameters necessary for Zilliz Cloud to connect to an AWS-S3-compatible bucket.</p>
<p>You need to create this object before initializing a <strong>RemoteBulkWriter</strong> object.</p>

</Admonition>

```python
from urllib3.poolmanager import PoolManager
from minio.credentials import Provider
from pymilvus.RemoteBulkWriter import ConnectParam

connect_param = ConnectParam(
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

    |  **Service Name** |  **Endpoint**           |
    | ----------------- | ----------------------- |
    |  **AWS S3**       |  s3.amazonaws.com       |
    |  **GCS**          |  storage.googleapis.com |

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

- **http_client **(*urllib3.poolmanager.PoolManager*)

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

## Methods{#methods}

The following are the methods of the `ConnectParam` class:

