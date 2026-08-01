---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Configures a VolumeBulkWriter, including its collection schema, output path, and volume connection. | Java | v2"
type: docx
token: NtxedWgOpof2Qtx8BU2ckktunWc
sidebar_position: 7
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

Configures a VolumeBulkWriter, including its collection schema, output path, and volume connection.

```java
public class VolumeBulkWriter
```

<Admonition type="info" icon="📘" title="Notes">

A **VolumeBulkWriter** object intends to rewrite your raw data to a Zilliz Cloud Volume in a format that Milvus understands.

</Admonition>

**BUILDER METHODS:**

- `withCollectionSchema(CollectionSchemaParam collectionSchema)`

    The schema of the target collection, defined with `CollectionSchemaParam`. The builder converts it to the v2 collection schema internally.

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    The schema of the target collection, defined with [`CreateCollectionReq.CollectionSchema`](./v2-Collections-CollectionSchema).

- `withRemotePath(String remotePath)`

    The path in the target volume where the rewritten data files are stored.

- `withChunkSize(long chunkSize)`

    The maximum size of each generated file segment, in bytes. The value defaults to **134,217,728** bytes (**128 MB**).

- `withFileType(BulkFileType fileType)`

    The output file format. For available values, refer to [`BulkFileType`](./v2-DataImport-BulkFileType).

- `withConfig(String key, Object value)`

    An optional key-value configuration for output-file processing. For `CSV` output, use `sep` to set the delimiter and `nullkey` to set the string that represents a null value.

- `withCloudEndpoint(String cloudEndpoint)`

    The Zilliz Cloud public API endpoint. Set this value to `https://api.cloud.zilliz.com`.

- `withApiKey(String apiKey)`

    The Zilliz Cloud API key used to authenticate the request.

- `withVolumeName(String volumeName)`

    The name of the target Zilliz Cloud volume.

- `withConnectType(ConnectType connectType)`

    The connection strategy used to access the volume. The value defaults to `ConnectType.AUTO`.

## Example\{#example}

Configures a VolumeBulkWriter, including its collection schema, output path, and volume connection.

```java
VolumeBulkWriterParam params = VolumeBulkWriterParam.newBuilder()
    .withCollectionSchema(collectionSchema)
    .withRemotePath("imports/books")
    .withCloudEndpoint(CLOUD_ENDPOINT)
    .withApiKey(API_KEY)
    .withVolumeName("bulk-data")
    .build();
VolumeBulkWriter writer = new VolumeBulkWriter(params);
```
