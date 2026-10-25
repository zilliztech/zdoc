---
title: "Function | Cloud"
slug: /cpp/cpp/Collections-Function
sidebar_label: "Function"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "此类是搜索重排序和全文搜索中使用的所有内置函数对象的基类。它也是 Schema 级函数（例如 BM25 分词器）的基类。将 `FunctionPtr`（`std:sharedptr`）传递给 `CollectionSchema::AddFunction()` 或 `FunctionScore::AddFunction()`。 | Cloud"
type: docx
token: MvE4d5F6vovZTUxxLtqcwedbndf
sidebar_position: 25
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - Zilliz
  - Zilliz Cloud
  - 云
  - Function
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Function

此类是搜索重排序和全文搜索中使用的所有内置函数对象的基类。它也是 Schema 级函数（例如 BM25 分词器）的基类。将 `FunctionPtr`（`std::shared_ptr<Function>`）传递给 `CollectionSchema::AddFunction()` 或 `FunctionScore::AddFunction()`。

```c++
Function();
Function(std::string name, FunctionType function_type, std::string description = "");

using FunctionPtr = std::shared_ptr<Function>;
```

**参数：**

- **name** （*std::string*）

    此函数实例的唯一名称。

- **function_type** （*FunctionType*）

    函数类型。可选值：`UNKNOWN=0`、`BM25=1`、`TEXTEMBEDDING=2`、`RERANK=3`。

- **description** （*std::string*）

    可选描述。默认值：`""`。

**方法：**

- `const std::string& Name() const` / `Status SetName(std::string name)`

    获取或设置函数名称。

- `FunctionType GetFunctionType() const` / `virtual Status SetFunctionType(FunctionType ft)`

    获取或设置函数类型。

- `const std::vector<std::string>& InputFieldNames() const` / `Status AddInputFieldName(std::string name)`

    获取或添加输入字段名称（此函数从中读取的字段）。

- `const std::vector<std::string>& OutputFieldNames() const` / `Status AddOutputFieldName(std::string name)`

    获取或添加输出字段名称（此函数写入的字段）。

- `virtual Status AddParam(const std::string& key, const std::string& value)`

    添加特定于该函数类型的额外键值参数。

- `virtual const std::unordered_map<std::string, std::string>& Params() const`

    返回所有额外参数。

## RRFRerank\{#rrfrerank}

用于 `HybridSearch` 的 Reciprocal Rank Fusion 重排序器。通过累加倒数排名来合并多个排名列表。可通过 `FunctionScore::AddFunction()` 或 `HybridSearchRequest::WithRerank()` 设置。

```c++
RRFRerank();
explicit RRFRerank(int k);
```

- **k** （*int*）— 用于控制排名差异受惩罚的陡峭程度的平滑常数。默认值：`60`。

- `Status SetK(int k)` — 在构造后更新平滑常数。

## WeightedRerank\{#weightedrerank}

用于 `HybridSearch` 的加权重排序器。为每个子搜索结果分配一个标量权重，并通过加权和合并分数。

```c++
explicit WeightedRerank(const std::vector<float>& weights);
```

- **weights** （*std::vector&lt;float&gt;*）— 每个子搜索的权重，按照子请求添加到 `HybridSearchRequest` 的顺序排列。各值之和应为 1.0，但不作强制要求。

- `Status SetWeights(const std::vector<float>& weights)` — 替换权重向量。

## BoostRerank\{#boostrerank}

用于单个 `Search` 的分数提升重排序器。根据过滤表达式应用条件性分数乘数。

```c++
explicit BoostRerank(std::string name);
```

- `void SetFilter(const std::string& filter)` — 布尔过滤表达式；与过滤器匹配的 Entity 将获得提升后的分数。

- `void SetWeight(float weight)` — 应用于匹配 Entity 的基线分数的乘法因子。

- `void SetRandomScoreField(const std::string& field)` — 用作随机分数来源的字段（用于分数随机化）。

- `void SetRandomScoreSeed(int64_t seed)` — 随机分数生成器的种子。

## DecayRerank\{#decayrerank}

用于单个 `Search` 的衰减重排序器。使用衰减曲线降低字段值远离原点的 Entity 的分数。

```c++
explicit DecayRerank(std::string name);
```

- `void SetFunction(const std::string& name)` — 衰减曲线类型：`"gauss"`、`"exp"` 或 `"linear"`。

- `template<typename T> void SetOrigin(T val)` — 计算衰减的参考点。适用于 INT8/INT16/INT32/INT64/FLOAT/DOUBLE 字段。

- `template<typename T> void SetOffset(T val)` — 原点周围无衰减区域的半宽，在该区域内项目保留完整分数。

- `template<typename T> void SetScale(T val)` — 分数等于衰减值的距原点距离。

- `void SetDecay(float val)` — 在缩放距离处的分数值（例如，`0.5` 表示原始分数的一半）。

## ModelRerank\{#modelrerank}

用于单个 `Search` 的基于模型的重排序器。将搜索结果发送到外部重排序模型以重新评分。

```c++
explicit ModelRerank(std::string name);
```

- `void SetProvider(const std::string& name)` — 重排序服务提供方名称。

- `void SetQueries(const std::vector<std::string>& queries)` — 传递给模型的查询字符串列表。其数量必须与搜索操作中的查询数量一致。

- `void SetEndpoint(const std::string& url)` — 重排序模型服务的 URL。

- `void SetMaxClientBatchSize(int64_t val)` — 每批处理的最大文档数量。

## 示例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// HybridSearch with RRF reranking
auto reranker = std::make_shared<RRFRerank>(60);

auto sub1 = SubSearchRequest()
    .WithAnnsField("dense_vec")
    .WithLimit(10)
    .AddFloatVector({/* query vector */});

auto sub2 = SubSearchRequest()
    .WithAnnsField("sparse_vec")
    .WithLimit(10)
    .AddSparseVector({{0, 0.3f}, {5, 0.7f}});

SearchResponse response;
auto status = client->HybridSearch(
    HybridSearchRequest()
        .WithCollectionName("my_collection")
        .WithLimit(5)
        .AddSubRequest(std::make_shared<SubSearchRequest>(std::move(sub1)))
        .AddSubRequest(std::make_shared<SubSearchRequest>(std::move(sub2)))
        .WithRerank(reranker),
    response);

// Search with WeightedRerank
auto weighted = std::make_shared<WeightedRerank>(std::vector<float>{0.7f, 0.3f});
```
