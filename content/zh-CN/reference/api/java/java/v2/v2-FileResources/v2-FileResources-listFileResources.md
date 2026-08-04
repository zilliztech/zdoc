---
title: "listFileResources() | Java | v2"
slug: /java/java/v2-FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "列出当前数据库中所有已上传的文件资源。 | Java | v2"
type: docx
token: JbG0d6GAdoOpkixsVUpcE0YMnPd
sidebar_position: 2
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - listFileResources()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listFileResources()

列出当前数据库中所有已上传的文件资源。

```java
public ListFileResourcesResp listFileResources(ListFileResourcesReq request)
```

## 请求语法\{#request-syntax}

```java
listFileResources(ListFileResourcesReq.builder().build());
```

此请求不接受任何参数。

**返回：**

*ListFileResourcesResp*

该响应封装了可通过 `getResources()` 访问的 `List<FileResourceInfo>`。每个 `FileResourceInfo` 条目包含：

- `name` (*String*) - 资源的唯一名称。

- `path` (*String*) - 已上传的原始本地路径。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.utility.request.ListFileResourcesReq;
import io.milvus.v2.service.utility.response.ListFileResourcesResp;
import io.milvus.v2.service.utility.response.FileResourceInfo;

ListFileResourcesResp resp = client.listFileResources(
    ListFileResourcesReq.builder().build()
);
for (FileResourceInfo res : resp.getResources()) {
    System.out.println(res.getName() + " → " + res.getPath());
}
```
