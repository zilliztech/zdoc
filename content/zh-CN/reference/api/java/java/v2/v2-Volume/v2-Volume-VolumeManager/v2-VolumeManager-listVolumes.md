---
title: "listVolumes() | Java | v2"
slug: /java/java/v2-VolumeManager-listVolumes
sidebar_label: "listVolumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "此操作以分页方式列出特定项目中的所有卷。 | Java | v2"
type: docx
token: Cde1dlUbDosa86xjuShcoKgQnvg
sidebar_position: 3
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - listVolumes()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listVolumes()

此操作以分页方式列出特定项目中的所有卷。

```java
public ListVolumesResponse listVolumes(ListVolumesRequest request)
```

## 请求语法\{#request-syntax}

```java
listVolumes(ListVolumesRequest.builder()
    .projectId(String projectId)
    .currentPage(Integer currentPage)
    .pageSize(Integer pageSize)
    .build();
)
```

**参数**

- **projectId** (*str*) -

    **[必需]**

    要创建的卷所属项目的 ID。

- **currentPage** (*int*) -

    卷列表的当前页码。指定后，将仅返回指定页上的卷。

    此参数为可选参数，默认值为 `1`，表示返回第一页。

- **pageSize** (*int*) -

    卷列表的当前分页大小。指定后，将仅返回指定数量的卷。

    此参数为可选参数，默认值为 `10`，表示最多返回 10 个卷的列表。

**返回类型**

*ListVolumesResponse*

**返回**

一个 **ListVolumesResponse** 对象，包含以分页方式返回的卷列表。

- **count** (*Integer*) -

    找到的卷总数。

- **currentPage** (*Integer*) -

    当前页码。

- **pageSize** (*Integer*) -

    每页的最大卷数量。

- **volumes** (*List&lt;VolumeInfo&gt;*) -

    `VolumeInfo` 实例列表。

    - **volumeName** (*String*) -

        卷名称。

## 示例\{#example}

```java
import com.google.gson.Gson;
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;
import io.milvus.bulkwriter.request.volume.ListVolumesRequest;
import io.milvus.bulkwriter.response.volume.ListVolumesResponse;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);

ListVolumesRequest request = ListVolumesRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .currentPage(1)
    .pageSize(10)
    .build();
    
ListVolumesResponse listVolumesResponse = volumeManager.listVolumes(request);

System.out.println("\nlistVolumes results: " + new Gson().toJson(listVolumesResponse));

// listVolumes results: 
// 
// {
//     "count": 1,
//     "currentPage": 1,
//     "pageSize": 10,
//     "volumes": [
//         {
//             "volumeName": "my_volume"
//         }        
//     ]
// }
```

