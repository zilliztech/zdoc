---
title: "CollectionInfo | Cloud"
slug: /cpp/cpp/Collections-CollectionInfo
sidebar_label: "CollectionInfo"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类包含列表结果中单个 Collection 的摘要信息。`ListCollectionsResponse:CollectionInfos()` 返回一个 `CollectionsInfo` 值，它是 `std::vector` 的类型别名。 | Cloud"
type: docx
token: Er8qdUCUAok3j4xBCP0cVYIQnk0
sidebar_position: 10
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionInfo
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CollectionInfo

此类包含列表结果中单个 Collection 的摘要信息。`ListCollectionsResponse::CollectionInfos()` 返回一个 `CollectionsInfo` 值，它是 `std::vector<CollectionInfo>` 的类型别名。

```c++
CollectionInfo();
CollectionInfo(std::string collection_name, int64_t collection_id, uint64_t create_time);

using CollectionsInfo = std::vector<CollectionInfo>;
```

**方法：**

- `const std::string& Name() const`

    Collection 的名称。

- `int64_t ID() const`

    由服务器分配的 Collection 内部 ID。

- `uint64_t CreatedTime() const`

    Collection 创建时的 UTC 时间戳（微秒）。

- `uint64_t MemoryPercentage() const`

    已弃用。始终返回 `0`。请改用 `GetLoadState()` 检查加载进度。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

ListCollectionsResponse response;
auto status = client->ListCollections(
    ListCollectionsRequest().WithDatabaseName("default"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

const CollectionsInfo& infos = response.CollectionInfos();
for (const auto& info : infos) {
    std::cout << "Name:    " << info.Name() << "\n"
              << "ID:      " << info.ID() << "\n"
              << "Created: " << info.CreatedTime() << "\n";
}
```
