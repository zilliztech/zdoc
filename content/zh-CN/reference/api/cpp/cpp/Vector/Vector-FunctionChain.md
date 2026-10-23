---
title: "FunctionChain | Cloud"
slug: /cpp/cpp/Vector-FunctionChain
sidebar_label: "FunctionChain"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "该类构建一个用于对搜索结果进行后处理的函数链。函数链会对 `Search` 调用的结果列执行一系列操作（map、sort、limit……）。将一个或多个 `FunctionChain` 对象传递给 `SearchRequest:WithFunctionChains()` 或 `SearchRequest::AddFunctionChain()`。函数链和 rerank 不能一起使用。 | Cloud"
type: docx
token: O5LQdgKNToskGyxVoGUc7Mj1nrb
sidebar_position: 11
keywords: 
  - Chroma vs Milvus
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChain
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChain

该类构建一个用于对搜索结果进行后处理的函数链。函数链会对 `Search` 调用的结果列执行一系列操作（map、sort、limit……）。将一个或多个 `FunctionChain` 对象传递给 `SearchRequest::WithFunctionChains()` 或 `SearchRequest::AddFunctionChain()`。函数链和 rerank 不能一起使用。

```c++
FunctionChain();
explicit FunctionChain(FunctionChainStage stage, std::string name = "");
```

**参数：**

- **stage** (*FunctionChainStage*)

    链的执行阶段。对于搜索结果后处理，请使用 `FunctionChainStage::L0_RERANK`、`L1_RERANK` 或 `L2_RERANK`。

- **name** (*std::string*)

    链名称。默认值：`""`。

**方法：**

- `WithName(std::string name)`

    设置链名称。

- `Map(const std::string& output, const FunctionChainExpr& expr)`

    追加一个 map 操作，将表达式结果写入指定的输出列。

- `Sort(const std::string& by, bool desc = true, const std::string& tie_break_col = "")`

    追加一个按指定列排序的操作，并可选指定平局决胜列。

- `Limit(int64_t limit, int64_t offset = 0)`

    追加一个带可选偏移量的 limit 操作。

- `AddOp(const FunctionChainOp& op)`

    向管道追加一个原始操作。

- `FunctionChainStage Stage() const`

    返回链的执行阶段。

- `const std::string& Name() const`

    返回链名称。

- `const std::vector<FunctionChainOp>& Ops() const`

    按管道顺序返回链的操作。

## FunctionChainStage\{#functionchainstage}

函数链运行所在的执行阶段。数值与 `schema.proto FunctionChainStage` 对应。

```c++
enum class FunctionChainStage {
    UNSPECIFIED = 0,
    INGESTION = 1,
    PRE_PROCESS = 2,
    L0_RERANK = 3,
    L1_RERANK = 4,
    L2_RERANK = 5,
    POST_PROCESS = 6,
};
```

**值：**

- **UNSPECIFIED** (0) - 未设置的阶段。

- **INGESTION** (1) - 在数据摄取期间运行。

- **PRE_PROCESS** (2) - 在搜索之前运行。

- **L0_RERANK** (3) - 针对搜索结果的第一个 rerank 阶段。

- **L1_RERANK** (4) - 针对搜索结果的第二个 rerank 阶段。

- **L2_RERANK** (5) - 针对搜索结果的第三个 rerank 阶段。

- **POST_PROCESS** (6) - 在搜索之后运行。

## FunctionChainColumnRef\{#functionchaincolumnref}

对用作函数链参数的 Collection 字段的引用。

```c++
FunctionChainColumnRef();
explicit FunctionChainColumnRef(std::string name);
```

- **name** (*std::string*) — 字段名，例如 `"$score"`。

**方法：**

- `const std::string& Name() const` — 返回所引用的字段名。

- `void SetName(std::string name)` — 设置所引用的字段名。

## col()\{#col}

创建一个列引用，以供在函数链表达式中使用。

```c++
FunctionChainColumnRef col(const std::string& name);
```

- **name** (*std::string*) — 所引用的字段名。

## FunctionChainExprArg\{#functionchainexprarg}

函数链表达式的单个参数：列引用或字面量。

```c++
FunctionChainExprArg();
explicit FunctionChainExprArg(FunctionChainColumnRef column);
explicit FunctionChainExprArg(nlohmann::json literal);
```

**方法：**

- `bool IsColumn() const` — 如果此参数是列引用，则返回 `true`。

- `bool IsLiteral() const` — 如果此参数是字面量值，则返回 `true`。

- `const std::string& ColumnName() const` — 当此参数是列引用时，返回列名。

- `const nlohmann::json& Literal() const` — 当此参数是字面量时，返回字面量值。

## FunctionChainExpr\{#functionchainexpr}

函数链操作所使用的函数调用表达式，例如 `"num_combine"`、`"decay"`、`"round_decimal"`。

```c++
FunctionChainExpr();
explicit FunctionChainExpr(std::string name);
```

- **name** (*std::string*) — 表达式名称，例如 `"num_combine"`。

**方法：**

- `FunctionChainExpr& AddColumnArg(const std::string& column)` — 追加一个列引用参数。

- `FunctionChainExpr& AddLiteralArg(const nlohmann::json& literal)` — 追加一个字面量参数。

- `FunctionChainExpr& AddParam(const std::string& key, const nlohmann::json& value)` — 设置表达式的命名参数。

- `const std::string& Name() const` — 返回表达式名称。

- `const std::vector<FunctionChainExprArg>& Args() const` — 返回表达式参数。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const` — 返回表达式的命名参数。

## FunctionChainOp\{#functionchainop}

函数链管道中的单个操作，例如 `"map"`、`"sort"` 或 `"limit"`。

```c++
FunctionChainOp();
explicit FunctionChainOp(std::string op);
```

- **op** (*std::string*) — 操作名称，例如 `"map"`、`"sort"`、`"limit"`。

**方法：**

- `FunctionChainOp& WithExpr(const FunctionChainExpr& expr)` — 将一个函数表达式附加到此操作。

- `FunctionChainOp& AddInput(const std::string& input)` — 向此操作添加一个输入列。

- `FunctionChainOp& AddOutput(const std::string& output)` — 向此操作添加一个输出列。

- `FunctionChainOp& AddParam(const std::string& key, const nlohmann::json& value)` — 设置此操作的命名参数。

- `const std::string& Op() const` — 返回操作名称。

- `bool HasExpr() const` — 如果已附加函数表达式，则返回 `true`。

- `const FunctionChainExpr& Expr() const` — 返回已附加的函数表达式。

- `const std::vector<std::string>& Inputs() const` — 返回此操作的输入列。

- `const std::vector<std::string>& Outputs() const` — 返回此操作的输出列。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const` — 返回此操作的命名参数。

## 示例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

// Build a function chain that combines and re-scores search results.
auto expr = milvus::FunctionChainExpr("num_combine")
    .AddColumnArg("$score")
    .AddColumnArg("$boost")
    .AddParam("method", "multiply");

auto chain = milvus::FunctionChain(milvus::FunctionChainStage::L1_RERANK, "combine_chain")
    .Map("$score", expr)
    .Sort("$score", true)
    .Limit(10);

auto request = milvus::SearchRequest()
    .WithCollectionName("demo")
    .WithLimit(10)
    .AddFloatVector({0.1f, 0.2f, 0.3f})
    .WithFunctionChains({chain});

milvus::SearchResponse response;
util::CheckStatus(client->Search(request, response));
```
