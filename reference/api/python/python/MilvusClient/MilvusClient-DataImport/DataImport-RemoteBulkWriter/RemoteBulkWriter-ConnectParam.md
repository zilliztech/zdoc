---
displayed_sidbar: pythonSidebar
slug: /python/RemoteBulkWriter-ConnectParam
beta: false
notebook: false
token: CSpOd0XgWoVAhzx5xbVcpCVfnPg
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# ConnectParam

A __ConnectParam__ instance sets connection parameters for a __RemoteBulkWriter__ instance.

```python
class pymilvus.RemoteBulkWriter.ConnectParam
```

## Constructor{#constructor}

Constructs a __ConnectParam__ object by a set of parameters, such as __bucket_name__, __access_key__, __secret_key__, etc.

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

__PARAMETERS:__

- __bucket_name__ (_str_)

    The name of the remote bucket to connect to.

- __endpoint__ (_str_)

    The URL of the AWS-S3-compatible service.

    The value can be the URL of a MinIO service or that of any AWS S3 compatible public service.

    |  __Service Name__ |  __Endpoint__           |
    | ----------------- | ----------------------- |
    |  __AWS S3__       |  s3.amazonaws.com       |
    |  __GCS__          |  storage.googleapis.com |

- __access_key__ (_str_)

    The access key (user ID) used to authenticate access to the specified bucket.

- __secret_key__ (_str_)

    The secret_key (password) used to authenticate access to the specified bucket.

- __secure__ (_bool_)

    Whether to use secure (TLS) connection to the AWS S3 compatible service. 

- __session_token__ (_str_)

    A session token of your account in the AWS S3 compatible service.

- __region__ (_str_)

    The name or ID of the region where the bucket resides.

- __http_client __(_urllib3.poolmanager.PoolManager_)

    A customized HTTP client.

- __credentials__ (_minio.credentials.Provider_)    

    A credentials provider of your account in the AWS S3 compatible service.

__RETURN TYPE:__

_RemoteBulkWriter_

__RETURNS:__

A __RemoteBulkWriter__ object.

__EXCEPTIONS:__

- __Exception__

    This exception will be raised if the connection fails.

## Methods{#methods}

The following are the methods of the `ConnectParam` class:

