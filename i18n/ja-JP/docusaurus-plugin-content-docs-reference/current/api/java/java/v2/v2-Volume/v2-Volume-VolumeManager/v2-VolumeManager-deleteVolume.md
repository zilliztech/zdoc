---
title: "deleteVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-deleteVolume
sidebar_label: "deleteVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はボリュームを削除します。 | Java | v2"
type: docx
token: OalndLUMRoUqpMxr2QscYTCenre
sidebar_position: 2
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - deleteVolume()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# deleteVolume()

この操作はボリュームを削除します。

```java
public void deleteVolume(DeleteVolumeRequest request)
```

## リクエスト構文\{#request-syntax}

```java
deleteVolume(DeleteVolumeRequest.builder()
    .volumeName(String volumeName)
    .build();
)
```

**パラメーター**

- **volumeName** (*str*) -

    **[必須]**

    削除するボリュームの名前。

**戻り値の型**

*void*

**戻り値**

なし

## 例\{#example}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;
import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);

DeleteVolumeRequest request = DeleteVolumeRequest.builder()
    .volumeName("my_volume")
    .build();

volumeManager.deleteVolume(request);

System.out.printf("\nVolume %s deleted%n", "my_volume");

// Volume my_volume deleted
```

