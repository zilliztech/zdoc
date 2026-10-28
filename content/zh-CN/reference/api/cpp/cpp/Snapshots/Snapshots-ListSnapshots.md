---
title: "ListSnapshots() | Cloud"
slug: /cpp/cpp/Snapshots-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出 Collection 的快照。您可以使用它发现可用的恢复点。 | Cloud"
type: docx
token: GJDKdgCbpoAxYkxpXygcdfFQnFe
sidebar_position: 6
keywords: 
  - KNN
  - 图像搜索
  - 大语言模型
  - 机器学习
  - zilliz
  - zilliz cloud
  - 云
  - ListSnapshots()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# ListSnapshots()

此操作会列出 Collection 的快照。您可以使用它发现可用的恢复点。

```c++
Status ListSnapshots(const ListSnapshotsRequest& request, ListSnapshotsResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::ListSnapshotsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book");
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置 Database 名称。

- `WithCollectionName(const std::string& collection_name)`

    设置 Collection 名称。

**返回：**

*Status*

**异常：**

- **std::exception**

    如果请求无法发送或响应无法解析，可能会引发此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListSnapshotsRequest()
    .WithDatabaseName("default")
    .WithCollectionName("book");
milvus::ListSnapshotsResponse response;
status = client->ListSnapshots(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Snapshots; action: CREATE; addedSince: v3.0.x */}
