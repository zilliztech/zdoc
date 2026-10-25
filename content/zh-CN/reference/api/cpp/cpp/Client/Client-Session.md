---
title: "Session() | Cloud"
slug: /cpp/cpp/Client-Session
sidebar_label: "Session()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "创建一个仅暴露 DQL 接口的集群级会话。 | Cloud"
type: docx
token: VTkhdUYKvoYBPRx7EDiczhJhnhe
sidebar_position: 15
keywords: 
  - RAG LLM 架构
  - 私有 LLM
  - 最近邻搜索
  - LLM 评估
  - Zilliz
  - Zilliz Cloud
  - 云
  - Session()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Session()

创建一个仅暴露 DQL 接口的集群级会话。

```c++
Status Session(const std::string& cluster_id, MilvusClientV2SessionPtr& session)
```

**参数：**

- **cluster_id**（*const std::string&*）

    目标集群标识符。

- **session**（*MilvusClientV2SessionPtr&*）

    用于接收集群级客户端视图的输出参数。

**返回：**

*Status*

检查 `status.IsOk()` 以确认成功。

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

### MilvusClientV2Session\{#milvusclientv2session}

一种集群级客户端视图，暴露绑定到特定集群的只读（DQL）接口。

**方法：**

- `const std::string& ClusterID() const`

    返回目标集群的标识符。

- `Status Search(const SearchRequest& request, SearchResponse& response)`

    针对目标集群运行搜索。请参见 [Search](./Vector-Search)。

- `Status SearchIterator(const SearchIteratorRequest& request, SearchIteratorPtr& iterator)`

    为目标集群创建搜索迭代器。请参见 [SearchIterator](./Vector-SearchIterator)。

- `Status HybridSearch(const HybridSearchRequest& request, HybridSearchResponse& response)`

    针对目标集群运行混合搜索。请参见 [HybridSearch](./Vector-HybridSearch)。

- `Status Query(const QueryRequest& request, QueryResponse& response)`

    针对目标集群运行查询。请参见 [Query](./Vector-Query)。

- `Status Get(const GetRequest& request, GetResponse& response)`

    针对目标集群运行按主键查询。请参见 [Get](./Vector-Get)。

- `Status QueryIterator(const QueryIteratorRequest& request, QueryIteratorPtr& iterator)`

    为目标集群创建查询迭代器。请参见 [QueryIterator](./Vector-QueryIterator)。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::MilvusClientV2SessionPtr session;
status = client->Session(cluster_id, session);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
