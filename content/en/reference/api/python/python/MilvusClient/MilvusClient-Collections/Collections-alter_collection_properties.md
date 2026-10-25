---
title: "alter_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_properties
sidebar_label: "alter_collection_properties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation alters the specified collection properties. | Python | MilvusClient"
type: docx
token: SJ1FdUQQnohtObxhNgpcHalMnUc
sidebar_position: 3
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_collection_properties()

This operation alters the specified collection properties.

<Admonition type="info" title="Note">

This does not apply to external collections.

</Admonition>

<Admonition type="info" title="Note">

This does not apply to external collections.

</Admonition>

<Admonition type="info" title="Note">

This does not apply to external collections.

</Admonition>

<Admonition type="info" title="Note">

This does not apply to external collections.

</Admonition>

<Admonition type="info" title="Note">

This does not apply to external collections.

</Admonition>

<Admonition type="info" title="Notes">

This does not apply to external collections.

</Admonition>

## Request Syntax\{#request-syntax}

```python
alter_collection_properties(
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **properties** (*dict*) -

    The properties and their new values in a dictionary. Possible dictionary keys are as follows: collection.ttl.seconds (int): The time-to-live (TTL) of a collection in seconds. ttl_field (str): Name of the TIMESTAMPTZ field to use as the logical timestamp for entity-level TTL expiration. mmap.enabled (bool): Whether to enable mmap for the raw data and indexes of all fields in the collection. For details, refer to Mmap-enabled Data Storage. partitionkey.isolation (bool): Whether to enable partition key isolation. For details, refer to Use Partition Key. dynamicfield.enabled (bool): Whether to enable the dynamic field. For details, refer to Dynamic Field. allow_insert_auto_id (str): Whether to allow a collection to accept user-provided primary key values when AutoID has been enabled for the collection. When set to "true": Inserts, upserts, and bulk imports use the user-provided primary key if present; otherwise, primary key values are auto-generated. When set to "false": User-provided primary key values are rejected or ignored and primary key values are always auto-generated. The default is "false". timezone (str): Sets a default time zone for your collection. The value must be a valid IANA time zone identifier (for example, Asia/Shanghai, America/Chicago, or UTC). For more information, refer to TIMESTAMPZ Field and Query.

- **timeout** (*Optional[float]*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist. This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# upsert properties
properties = {"collection.ttl.seconds": 500, "mmap.enabled": True}

client.alter_collection_properties(
    collection_name="collection_name", 
    properties = properties
)
```
