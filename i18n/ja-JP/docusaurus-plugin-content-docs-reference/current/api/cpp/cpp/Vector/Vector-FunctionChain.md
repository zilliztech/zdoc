---
title: "FunctionChain | Cloud"
slug: /cpp/cpp/Vector-FunctionChain
sidebar_label: "FunctionChain"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、検索結果を後処理する関数チェーンを構築します。関数チェーンは、`Search` 呼び出しの結果列に対して一連の操作（map、sort、limit など）をパイプラインとして実行します。1 つ以上の `FunctionChain` オブジェクトを `SearchRequest:WithFunctionChains()` または `SearchRequest::AddFunctionChain()` に渡します。関数チェーンと再ランクは併用できません。 | Cloud"
type: docx
token: O5LQdgKNToskGyxVoGUc7Mj1nrb
sidebar_position: 11
keywords: 
  - Chroma と Milvus
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionChain
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# FunctionChain

このクラスは、検索結果を後処理する関数チェーンを構築します。関数チェーンは、`Search` 呼び出しの結果列に対して一連の操作（map、sort、limit など）をパイプラインとして実行します。1 つ以上の `FunctionChain` オブジェクトを `SearchRequest::WithFunctionChains()` または `SearchRequest::AddFunctionChain()` に渡します。関数チェーンと再ランクは併用できません。

```c++
FunctionChain();
explicit FunctionChain(FunctionChainStage stage, std::string name = "");
```

**パラメーター：**

- **stage** (*FunctionChainStage*)

    チェーンの実行ステージです。検索結果の後処理には、`FunctionChainStage::L0_RERANK`、`L1_RERANK`、または `L2_RERANK` を使用します。

- **name** (*std::string*)

    チェーン名です。デフォルト値は `""` です。

**メソッド：**

- `WithName(std::string name)`

    チェーンの名前を設定します。

- `Map(const std::string& output, const FunctionChainExpr& expr)`

    式の結果を指定した出力列に書き込む map 操作を追加します。

- `Sort(const std::string& by, bool desc = true, const std::string& tie_break_col = "")`

    指定した列で並べ替える sort 操作を、必要に応じてタイブレーク列とともに追加します。

- `Limit(int64_t limit, int64_t offset = 0)`

    省略可能なオフセットを指定して limit 操作を追加します。

- `AddOp(const FunctionChainOp& op)`

    未加工の操作をパイプラインに追加します。

- `FunctionChainStage Stage() const`

    チェーンの実行ステージを返します。

- `const std::string& Name() const`

    チェーン名を返します。

- `const std::vector<FunctionChainOp>& Ops() const`

    パイプライン順にチェーンの操作を返します。

## FunctionChainStage\{#functionchainstage}

関数チェーンが実行される実行ステージです。数値は `schema.proto FunctionChainStage` と同じです。

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

**値：**

- **UNSPECIFIED** (0) - 未設定のステージです。

- **INGESTION** (1) - データ取り込み中に実行されます。

- **PRE_PROCESS** (2) - 検索前に実行されます。

- **L0_RERANK** (3) - 検索結果に対する最初の再ランクステージです。

- **L1_RERANK** (4) - 検索結果に対する 2 番目の再ランクステージです。

- **L2_RERANK** (5) - 検索結果に対する 3 番目の再ランクステージです。

- **POST_PROCESS** (6) - 検索後に実行されます。

## FunctionChainColumnRef\{#functionchaincolumnref}

関数チェーンの引数として使用するコレクションフィールドへの参照です。

```c++
FunctionChainColumnRef();
explicit FunctionChainColumnRef(std::string name);
```

- **name** (*std::string*) — フィールド名（例：`"$score"`）。

**メソッド：**

- `const std::string& Name() const` — 参照先のフィールド名を返します。

- `void SetName(std::string name)` — 参照先のフィールド名を設定します。

## col()\{#col}

関数チェーンの式で使用する列参照を作成します。

```c++
FunctionChainColumnRef col(const std::string& name);
```

- **name** (*std::string*) — 参照先のフィールド名です。

## FunctionChainExprArg\{#functionchainexprarg}

関数チェーンの式の単一の引数です。列参照またはリテラルのいずれかになります。

```c++
FunctionChainExprArg();
explicit FunctionChainExprArg(FunctionChainColumnRef column);
explicit FunctionChainExprArg(nlohmann::json literal);
```

**メソッド：**

- `bool IsColumn() const` — この引数が列参照の場合は `true` を返します。

- `bool IsLiteral() const` — この引数がリテラル値の場合は `true` を返します。

- `const std::string& ColumnName() const` — これが列参照の場合は列名を返します。

- `const nlohmann::json& Literal() const` — これがリテラルの場合はリテラル値を返します。

## FunctionChainExpr\{#functionchainexpr}

関数チェーン操作で使用される関数呼び出し式です（例：`"num_combine"`、`"decay"`、`"round_decimal"`）。

```c++
FunctionChainExpr();
explicit FunctionChainExpr(std::string name);
```

- **name** (*std::string*) — 式名（例：`"num_combine"`）。

**メソッド：**

- `FunctionChainExpr& AddColumnArg(const std::string& column)` — 列参照の引数を追加します。

- `FunctionChainExpr& AddLiteralArg(const nlohmann::json& literal)` — リテラル引数を追加します。

- `FunctionChainExpr& AddParam(const std::string& key, const nlohmann::json& value)` — 式の名前付きパラメーターを設定します。

- `const std::string& Name() const` — 式名を返します。

- `const std::vector<FunctionChainExprArg>& Args() const` — 式の引数を返します。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const` — 式の名前付きパラメーターを返します。

## FunctionChainOp\{#functionchainop}

関数チェーンパイプライン内の単一の操作です（例：`"map"`、`"sort"`、`"limit"`）。

```c++
FunctionChainOp();
explicit FunctionChainOp(std::string op);
```

- **op** (*std::string*) — 操作名（例：`"map"`、`"sort"`、`"limit"`）。

**メソッド：**

- `FunctionChainOp& WithExpr(const FunctionChainExpr& expr)` — 関数式をこの操作に関連付けます。

- `FunctionChainOp& AddInput(const std::string& input)` — 入力列をこの操作に追加します。

- `FunctionChainOp& AddOutput(const std::string& output)` — 出力列をこの操作に追加します。

- `FunctionChainOp& AddParam(const std::string& key, const nlohmann::json& value)` — この操作の名前付きパラメーターを設定します。

- `const std::string& Op() const` — 操作名を返します。

- `bool HasExpr() const` — 関数式が関連付けられている場合は `true` を返します。

- `const FunctionChainExpr& Expr() const` — 関連付けられた関数式を返します。

- `const std::vector<std::string>& Inputs() const` — この操作の入力列を返します。

- `const std::vector<std::string>& Outputs() const` — この操作の出力列を返します。

- `const std::unordered_map<std::string, nlohmann::json>& Params() const` — この操作の名前付きパラメーターを返します。

## 例\{#example}

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
