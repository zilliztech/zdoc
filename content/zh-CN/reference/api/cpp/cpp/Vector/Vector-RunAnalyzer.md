---
title: "RunAnalyzer() | Cloud"
slug: /cpp/cpp/Vector-RunAnalyzer
sidebar_label: "RunAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "运行 Analyzer。返回分析结果的 token。 | Cloud"
type: docx
token: ACnNdxazbo8zRUx2zeMcmoN2nah
sidebar_position: 7
keywords: 
  - Pinecone 向量 Database
  - 音频搜索
  - 什么是语义搜索
  - Embedding 模型
  - zilliz
  - Zilliz Cloud
  - 云
  - RunAnalyzer()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RunAnalyzer()

运行 Analyzer。返回分析结果的 token。

```c++
Status RunAnalyzer(const RunAnalyzerRequest& request, RunAnalyzerResponse& response)
```

## 请求语法\{#request-syntax}

```c++
auto request = RunAnalyzerRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithTexts(texts)
    .AddText(text)
    .AddAnalyzerName(name)
    .WithAnalyzerParams(params)
    .WithDetail(with_detail)
    .WithHash(with_hash);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称；默认为空，表示使用 MilvusClient 的 Database 名称。

- `WithCollectionName(std::string collection_name)`

    设置此 Collection 的名称，不能为空。

- `WithFieldName(std::string field_name)`

    设置目标字段的名称，不能为空。

- `WithTexts(const std::vector<std::string>& texts)`

    设置要分析的文本。

- `AddText(std::string text)`

    添加要分析的文本。

- `AddAnalyzerName(std::string name)`

    指定 Analyzer。

- `WithAnalyzerParams(const nlohmann::json& params)`

    设置 Analyzer 参数。

- `WithDetail(bool with_detail)`

    在结果中包含详细信息。

- `WithHash(bool with_hash)`

    在结果中包含哈希值。

**返回值：**

*Status*

返回一个状态，指示操作是否成功。

- **response** (*RunAnalyzerResponse*) -

    - **Results** (*const AnalyzerResults&*) -

        获取 Analyzer 的结果。

        - **Tokens** (*const std::vector&lt;AnalyzerToken&gt;&*) -

            设置要分析的 token。

            - **token_** (*std::string*) -

            - **start_offset_** (*int64_t*) -

            - **end_offset_** (*int64_t*) -

            - **position_** (*int64_t*) -

            - **position_length_** (*int64_t*) -

            - **hash_** (*uint32_t*) -

**错误处理：**

- **std::exception**

    当请求构建、传输或响应处理失败时抛出。请检查异常消息或返回的 Status，以获取失败详细信息。

## 示例\{#example}

连接 MilvusClientV2 后，请使用 RunAnalyzer()。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::RunAnalyzerRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name);
status = client->RunAnalyzer(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
