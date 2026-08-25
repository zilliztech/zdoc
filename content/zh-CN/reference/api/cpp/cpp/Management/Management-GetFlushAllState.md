---
title: "GetFlushAllState() | Cloud"
slug: /cpp/cpp/Management-GetFlushAllState
sidebar_label: "GetFlushAllState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于检查 flush-all 操作是否已完成。如果您需要在发起初始 flush 请求后单独轮询其完成状态，请使用此操作。 | Cloud"
type: docx
token: TBtpd6bsLoelhbx2iXDccaVDnqe
sidebar_position: 22
keywords: 
  - 音频相似性搜索
  - Elastic 向量 Database
  - Pinecone 对比 Milvus
  - Chroma 对比 Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GetFlushAllState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetFlushAllState()

此操作用于检查 flush-all 操作是否已完成。如果您需要在发起初始 flush 请求后单独轮询其完成状态，请使用此操作。

```c++
Status GetFlushAllState(const GetFlushAllStateRequest& request, GetFlushAllStateResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = milvus::GetFlushAllStateRequest()
    .WithDatabaseName("default")
    .WithFlushAllTs(flush_all_ts);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    指定原始 flush-all 操作所使用的 Database。

- `WithFlushAllTs(uint64_t flush_all_ts)`

    设置由 `FlushAll()` 返回的时间戳。

**返回值：**

*Status*

**异常：**

- **std::exception**

    当请求无法发送或响应无法解析时，可能会抛出此异常。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::GetFlushAllStateRequest()
    .WithDatabaseName("default")
    .WithFlushAllTs(flush_all_ts);
milvus::GetFlushAllStateResponse response;
status = client->GetFlushAllState(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
