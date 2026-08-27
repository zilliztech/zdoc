---
title: "Function | Cloud"
slug: /cpp/cpp/Collections-Function
sidebar_label: "Function"
beta: false
added_since: v2.6.1
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、検索のリランキングや全文検索で利用されるすべての組み込み関数オブジェクトの基底クラスです。また、スキーマレベルの関数（例：BM25 トークナイザー）の基底としても使用されます。`FunctionPtr`（`std:sharedptr`）を `CollectionSchema::AddFunction()` または `FunctionScore::AddFunction()` に渡します。 | Cloud"
type: docx
token: MvE4d5F6vovZTUxxLtqcwedbndf
sidebar_position: 25
keywords: 
  - ベクトルインデックス
  - ベクトルデータベース open source
  - open source ベクトル db
  - ベクトルデータベース example
  - zilliz
  - zilliz cloud
  - cloud
  - Function
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Function

このクラスは、検索のリランキングや全文検索で利用されるすべての組み込み関数オブジェクトの基底クラスです。また、スキーマレベルの関数（例：BM25 トークナイザー）の基底としても使用されます。`FunctionPtr`（`std::shared_ptr<Function>`）を `CollectionSchema::AddFunction()` または `FunctionScore::AddFunction()` に渡します。

```c++
Function();
Function(std::string name, FunctionType function_type, std::string description = "");

using FunctionPtr = std::shared_ptr<Function>;
```

**パラメーター:**

- **name** (*std::string*)

    この関数インスタンスの一意な名前。

- **function_type** (*FunctionType*)

    関数の種類。指定可能な値: `UNKNOWN=0`、`BM25=1`、`TEXTEMBEDDING=2`、`RERANK=3`。

- **description** (*std::string*)

    任意の説明。デフォルト: `""`。

**メソッド:**

- `const std::string& Name() const` / `Status SetName(std::string name)`

    関数名の取得または設定を行います。

- `FunctionType GetFunctionType() const` / `virtual Status SetFunctionType(FunctionType ft)`

    関数種類の取得または設定を行います。

- `const std::vector<std::string>& InputFieldNames() const` / `Status AddInputFieldName(std::string name)`

    入力フィールド名（この関数が参照するフィールド）の取得または追加を行います。

- `const std::vector<std::string>& OutputFieldNames() const` / `Status AddOutputFieldName(std::string name)`

    出力フィールド名（この関数が書き込むフィールド）の取得または追加を行います。

- `virtual Status AddParam(const std::string& key, const std::string& value)`

    関数の種類に固有の追加キー・バリューパラメーターを追加します。

- `virtual const std::unordered_map<std::string, std::string>& Params() const`

    すべての追加パラメーターを返します。

## RRFRerank\{#rrfrerank}

`HybridSearch` 用の Reciprocal Rank Fusion リランカーです。複数のランキングリストを逆順位の合計に基づいて結合します。`FunctionScore::AddFunction()` または `HybridSearchRequest::WithRerank()` を通じて設定します。

```c++
RRFRerank();
explicit RRFRerank(int k);
```

- **k** (*int*) — ランク差に対するペナルティの強さを制御する平滑化定数です。デフォルト: `60`。

- `Status SetK(int k)` — インスタンス生成後に平滑化定数を更新します。

## WeightedRerank\{#weightedrerank}

`HybridSearch` 用の重み付きリランカーです。各サブ検索結果にスカラー重みを割り当て、重み付き合計によってスコアを結合します。

```c++
explicit WeightedRerank(const std::vector<float>& weights);
```

- **weights** (*std::ベクトル&lt;float&gt;*) — 各サブ検索に対する重みです。サブリクエストが `HybridSearchRequest` に追加された順序に従って指定します。値の合計は 1.0 であることが推奨されますが、必須ではありません。

- `Status SetWeights(const std::vector<float>& weights)` — 重みベクトルを置き換えます。

## BoostRerank\{#boostrerank}

単一の `Search` 向けスコアブースト型リランカーです。フィルター式に基づき、条件付きでスコア乗数を適用します。

```c++
explicit BoostRerank(std::string name);
```

- `void SetFilter(const std::string& filter)` — ブール型のフィルター式です。このフィルターに一致するエンティティにはブーストされたスコアが適用されます。

- `void SetWeight(float weight)` — 一致するエンティティのベースラインスコアに対して適用される乗数です。

- `void SetRandomScoreField(const std::string& field)` — スコアのランダム化において、ランダムスコアの生成元として使用されるフィールドです。

- `void SetRandomScoreSeed(int64_t seed)` — ランダムスコア生成器のシード値です。

## DecayRerank\{#decayrerank}

単一の `Search` 向け減衰型リランカーです。減衰曲線を用いて、フィールド値が原点から離れているエンティティのスコアを低下させます。

```c++
explicit DecayRerank(std::string name);
```

- `void SetFunction(const std::string& name)` — 減衰曲線の種類: `"gauss"`、`"exp"`、または `"linear"`。

- `template<typename T> void SetOrigin(T val)` — 減衰計算の基準となる点です。INT8/INT16/INT32/INT64/FLOAT/DOUBLE フィールドに適用されます。

- `template<typename T> void SetOffset(T val)` — 原点を中心にスコアが減衰せずフルスコアが維持される範囲の半幅です。

- `template<typename T> void SetScale(T val)` — スコアが減衰値と等しくなる地点の、原点からの距離です。

- `void SetDecay(float val)` — スケール距離におけるスコア値です（例: `0.5` は元のスコアの半分を意味します）。

## ModelRerank\{#modelrerank}

単一の `Search` 向けモデルベースリランカーです。検索結果を外部のリランキングモデルへ送信し、再スコアリングを行います。

```c++
explicit ModelRerank(std::string name);
```

- `void SetProvider(const std::string& name)` — リランキングサービスのプロバイダー名です。

- `void SetQueries(const std::vector<std::string>& queries)` — モデルに渡すクエリ文字列のリストです。要素数は検索操作に含まれるクエリ数と一致している必要があります。

- `void SetEndpoint(const std::string& url)` — リランキングモデルサービスの URL です。

- `void SetMaxClientBatchSize(int64_t val)` — バッチごとに処理されるドキュメントの最大数です。

## 例\{#example}

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
