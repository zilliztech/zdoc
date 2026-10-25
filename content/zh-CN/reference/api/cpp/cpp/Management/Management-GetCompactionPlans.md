---
title: "GetCompactionPlans() | Cloud"
slug: /cpp/cpp/Management-GetCompactionPlans
sidebar_label: "GetCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会获取 Collection 上某个 Compaction 作业的当前状态和合并计划。请传入 Compact() 返回的 Compaction 作业 ID。 | Cloud"
type: docx
token: Q9LBd7Mano2Sgyx3wJUcv4YrnLc
sidebar_position: 9
keywords: 
  - OpenAI 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetCompactionPlans()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# GetCompactionPlans()

此操作会获取 Collection 上某个 Compaction 作业的当前状态和合并计划。请传入 Compact() 返回的 Compaction 作业 ID。

```c++
Status GetCompactionPlans(const GetCompactionPlansRequest& request, GetCompactionPlansResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = GetCompactionPlansRequest()
    .WithCompactionID(id);
```

**请求方法：**

- `WithCompactionID(int64_t id)`

    设置要查询的 Compaction 作业 ID，该 ID 由 Compact() 返回。

**返回值：**

*Status*

返回一个 Status，指示操作是否成功。Compaction 状态和合并计划包含在响应中：调用 Plans() 可获取计划列表，其中每个计划将其源 Segment 映射到合并后的目标 Segment，而调用 State() 可获取 CompactionStateCode。

- **response** (*GetCompactionPlansResponse*) -

    - **Plans** (*const CompactionPlans&*) -

        获取 Compaction 的计划。

        - **SourceSegments** (*const std::vector&lt;int64_t&gt;&*) -

            要合并的 Segment ID 数组。

        - **DestinySegemnt** (*int64_t*) -

            合并后新生成的 Segment ID。

    - **CompactionID** (*int64_t*) -

        获取 Compaction 的 ID。

    - **State** (*CompactionStateCode*) -

        获取 Compaction 的状态。

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以了解失败详情。

## 示例\{#example}

在已连接的 MilvusClientV2 上调用 GetCompactionPlans()，以获取某个 Compaction 作业的状态和合并计划。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

int64_t compaction_id = 448702239994542855;

auto request = milvus::GetCompactionPlansRequest().WithCompactionID(compaction_id);
milvus::GetCompactionPlansResponse response;
status = client->GetCompactionPlans(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "compaction state: " << static_cast<int>(response.State()) << std::endl;
for (const auto& plan : response.Plans()) {
    std::cout << "plan merges " << plan.SourceSegments().size() << " segments into segment "
              << plan.DestinySegemnt() << std::endl;
}
```
