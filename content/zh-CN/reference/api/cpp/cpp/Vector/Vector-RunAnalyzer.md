---
title: "RunAnalyzer() | Cloud"
slug: /cpp/cpp/Vector-RunAnalyzer
sidebar_label: "RunAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于试运行 Analyzer。| Cloud"
type: docx
token: ACnNdxazbo8zRUx2zeMcmoN2nah
sidebar_position: 7
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - RunAnalyzer()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RunAnalyzer()

此操作用于试运行 Analyzer。

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
    .WithAnalyzerParams(params)
    .WithDetail(with_detail)
    .WithHash(with_hash);
```

**请求方法：**

- `WithDatabaseName(const std::string& db_name)`

    设置目标 Database 名称。若未指定，则使用默认 Database。

- `WithCollectionName(std::string collection_name)`

    设置 Collection 名称。

- `WithFieldName(std::string field_name)`

    设置目标字段名称，该字段不能为空。

- `WithTexts(const std::vector<std::string>& texts)`

    设置待分析的文本列表。

- `AddText(std::string text)`

    添加一条待分析的文本。

- `AddAnalyzerName(std::string name)`

    设置要运行的 Analyzer 名称。

- `WithAnalyzerParams(const nlohmann::json& params)`

    设置 Analyzer 参数。

- `WithDetail(bool with_detail)`

    是否在返回结果中包含详细信息。

- `WithHash(bool with_hash)`

    是否在返回结果中包含哈希值。

**返回值：**

包含 *RunAnalyzerResponse* 的 *Status*

检查 `status.IsOk()` 以确认操作成功。

### AnalyzerResults\{#analyzerresults}

本页介绍 `AnalyzerResults`、`AnalyzerResult` 和 `AnalyzerToken`。`AnalyzerResults` 是 `std::vector<AnalyzerResult>` 的类型别名，通过 `Results()` 在 `RunAnalyzerResponse` 中返回。每个 `AnalyzerResult` 对应一个输入文本字符串，并包含由 Analyzer 生成的 token 列表。

```c++
using AnalyzerResults = std::vector<AnalyzerResult>;
```

您可以通过标准 vector API 访问各文本的分析结果：

```c++
const AnalyzerResults& results = response.Results();
for (const auto& result : results) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << "\n";
    }
}
```

**异常：**

- **StatusCode**

    检查 `status.Code()` 和 `status.Message()` 以获取错误详情。

## AnalyzerResult\{#analyzerresult}

一个 `AnalyzerResult` 包含单个输入文本的所有 token。

```c++
explicit AnalyzerResult(std::vector<AnalyzerToken>&& tokens);
```

- `const std::vector<AnalyzerToken>& Tokens() const`

    返回 Analyzer 针对该输入文本生成的 token 列表。

## AnalyzerToken\{#analyzertoken}

`AnalyzerToken` 是一个描述单个 token 的简单结构体。

```c++
struct AnalyzerToken {
    std::string token_;
    int64_t start_offset_;
    int64_t end_offset_;
    int64_t position_;
    int64_t position_length_;
    uint32_t hash_;
};
```

- `token_`

    token 字符串，例如单词或子词。

- `start_offset_`

    token 在原始文本中的起始字节偏移量。

- `end_offset_`

    token 在原始文本中的结束字节偏移量。

- `position_`

    token 在序列中的位置索引。

- `position_length_`

    token 占用的位置数，通常为 1。

- `hash_`

    token 字符串的 32 位哈希值。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Define analyzer parameters (stop-word filter example)
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {{{"type", "stop"}, {"stop_words", {"and", "for"}}}}},
};
std::string text = "Milvus supports L2 distance and IP similarity for float vector.";

// Build and execute the RunAnalyzer request
auto request =
    milvus::RunAnalyzerRequest().AddText(text).WithAnalyzerParams(analyzer_params).WithDetail(true).WithHash(true);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Process analyzer results
for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << "{token: " << token.token_
                  << ", start: " << token.start_offset_
                  << ", end: " << token.end_offset_
                  << "}" << std::endl;
    }
}
```
