---
title: "listVolumes() | Java | v2"
slug: /java/java/v2-VolumeManager-listVolumes
sidebar_label: "listVolumes()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の project 内のすべての volume をページネーション形式で一覧表示します。 | Java | v2"
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

この操作は、特定の project 内のすべての volume をページネーション形式で一覧表示します。

```java
public ListVolumesResponse listVolumes(ListVolumesRequest request)
```

## Request Syntax\{#request-syntax}

```java
listVolumes(ListVolumesRequest.builder()
    .projectId(String projectId)
    .currentPage(Integer currentPage)
    .pageSize(Integer pageSize)
    .build();
)
```

**PARAMETERS**

- **projectId** (*str*) -

    **[REQUIRED]**

    作成対象の volume が属する project の ID。

- **currentPage** (*int*) -

    volume リストの現在のページです。指定した場合、指定されたページ上の volume のみが返されます。

    このパラメータは任意で、デフォルト値は `1` です。これは最初のページが返されることを示します。

- **pageSize** (*int*) -

    volume リストの現在のページサイズです。指定した場合、指定した数の volume のみが返されます。

    このパラメータは任意で、デフォルト値は `10` です。これは最大 10 件の volume のリストが返されることを示します。

**RETURN TYPE**

*ListVolumesResponse*

**RETURNS**

volume のリストをページネーション形式で含む **ListVolumesResponse** オブジェクト。

- **count** (*Integer*) -

    見つかった volume の総数。

- **currentPage** (*Integer*) -

    現在のページ。

- **pageSize** (*Integer*) -

    1 ページあたりの volume の最大数。

- **volumes** (*List&lt;VolumeInfo&gt;*) -

    `VolumeInfo` インスタンスのリスト。

    - **volumeName** (*String*) -

        volume の名前。

## Example\{#example}

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

