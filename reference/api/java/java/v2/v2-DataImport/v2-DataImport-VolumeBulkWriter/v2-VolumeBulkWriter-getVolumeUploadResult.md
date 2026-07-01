---
title: "getVolumeUploadResult() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getVolumeUploadResult
sidebar_key: java/v2-VolumeBulkWriter-getVolumeUploadResult
sidebar_label: "getVolumeUploadResult()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation retrieves the result of the update to the specified volume. | Java | v2"
type: docx
token: GoMYdKZRforUT0x23CDcyDKgnFf
sidebar_position: 6
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - getVolumeUploadResult()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getVolumeUploadResult()

This operation retrieves the result of the update to the specified volume.

```java
public UploadFilesResult getVolumeUploadResult()
```

**PARAMETERS:**

*None*

**RETURN TYPE:**

*UploadFilesResult*

**RETURNS:**

An UploadFilesResult instance that has the following methods:

- `getVolumeName()`

    Returns the name of the target volume.

- `setVolumeName()`

    Sets the name of the target volume.

- `getPath()`

    Returns the path of the uploaded file to the target volume.

- `setPath()`

    Sets the path of the uploaded file to the target volume.

- `toString()`

    Strigifies the UploadFilesResult instance.

## Example\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
UploadFilesResult result = writer.getVolumeUploadResult();

System.out.println("Target volume: " + result.getVolumeName());
System.out.println("Target paths: " + result.getPath());
```

