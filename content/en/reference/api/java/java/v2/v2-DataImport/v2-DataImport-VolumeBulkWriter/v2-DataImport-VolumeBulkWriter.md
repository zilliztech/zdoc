---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "A VolumeBulkWriter instance rewrites your raw data to a Zilliz Cloud Volume in a format that Milvus understands. | Java | v2"
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

A **VolumeBulkWriter** instance rewrites your raw data to a Zilliz Cloud Volume in a format that Milvus understands.

```java
io.milvus.bulkwriter.VolumeBulkWriter
```

## Constructor\{#constructor}

Constructs a **VolumeBulkWriter** instance by schema, output path, segment size, and file type.

<Admonition type="info" icon="📘" title="Notes">

A **VolumeBulkWriter** object intends to rewrite your raw data to a Zilliz Cloud Volume in a format that Milvus understands.

</Admonition>

```java
VolumeBulkWriter(VolumeBulkWriterParam bulkWriterParam)
```

**PARAMETERS:**

- **bulkWriterParam** (*VolumeBulkWriterParam*) -

    A [VolumeBulkWriterParam](./v2-DataImport-VolumeBulkWriter#volumebulkwriterparam) instance.

## VolumeBulkWriterParam\{#volumebulkwriterparam}

**VolumeBulkWriterParam** allows you to configure properties for your **VolumeBulkWriter** instances in one place so that you can instantiate the **VolumeBulkWriter** class.

```java
VolumeBulkWriterParam.newBuilder()
    .withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .withLocalPath(String localPath)
    .withChunkSize(long chunkSize)
    .withFileType(BulkFileType fileType)
    .withConfig(String key, Object val)
    .withCloudEndpoint(string cloudEndpoint)
    .withApiKey(string apiKey)
    .withVolumeName(string volumeName)
    .build()
```

**BUILDER METHODS:**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    The schema of the target collection that is defined by instantiating **CreateCollectionReq.CollectionSchema**.

- `withLocalPath(String localPath)`

    The path to the directory that is to hold the rewritten data.

- `withChunkSize(long chunkSize)`

    The maximum size of a file segment. While rewriting your raw data, Milvus splits it into segments.

    The value defaults to **536,870,912** in bytes, which is **512 MB**.

    <Admonition type="info" icon="📘" title="**How does BulkWriter segment my data?**">

    The way BulkWriter segments your data varies with the target file type.
    
    If the generated file exceeds the specified segment size, BulkWriter creates multiple files and names them in sequence numbers, each no larger than the segment size.

    </Admonition>

- `withFileType(BulkFileType fileType)`

    The type of the output file. Possible options are listed in [BulkFileType](./v2-DataImport-BulkFileType).

- `withConfig(String key, Object val)`

    A dictionary specifying optional configurations for processing CSV files. This parameter applies only when you set `fileType` to `CSV` in `withFileType()`. The dictionary contains the following fields:

    - **sep** (*string*) -

        The delimiter of CSV file. The value must be a string of length 1, which defaults to `","`. The following strings are not allowed: `"\0"`, `"\n"`, `"\r"`, `"""`.

    - **nullkey** (*string*) -

        Special string representing null value. The value defaults to empty string: `""`.

- `withCloudEndpoint(string cloudEndpoint)`

    The Zilliz Cloud public endpoint is always `https:*//*api.cloud.zilliz.com`.

- `withApiKey(string apiKey)`

    A valid Zilliz Cloud API key with sufficient permissions to operate resources related to this operation.

- `withVolumeName(string volumeName)`

    A valid volume name. Ensure that the volume by the specified name exists.

## Example\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.VolumeBulkWriter;
import io.milvus.bulkwriter.VolumeBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

private static void volumeWriter(CreateCollectionReq.CollectionSchema collectionSchema) throws Exception {
    VolumeBulkWriterParam bulkWriterParam = VolumeBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withRemotePath("/tmp/bulk_writer")
            .withFileType(BulkFileType.PARQUET)
            .withChunkSize(128 * 1024 * 1024)
            .withCloudEndpoint("https://api.cloud.zilliz.com")
            .withApiKey("YOUR_API_KEY")
            .withVolumeName("my_volume")
            .build();

    try (VolumeBulkWriter volumeBulkWriter = new VolumeBulkWriter(bulkWriterParam)) {
        // append rows
        Gson GSON_INSTANCE = new Gson();
        for (int i = 0; i < 10000; i++) {
            JsonObject row = new JsonObject();
            row.addProperty("path", "path_" + i);
            row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
            row.addProperty("label", "label_" + i);

            volumeBulkWriter.appendRow(row);
        }

        volumeBulkWriter.commit(false);
        UploadFilesResult uploadResult = volumeBulkWriter.getVolumeUploadResult();
        System.out.printf("Data files have been uploaded: %s%n", uploadResult);
    } catch (Exception e) {
        System.out.println("Local writer catch exception: " + e);
        throw e;
    }
}
```

