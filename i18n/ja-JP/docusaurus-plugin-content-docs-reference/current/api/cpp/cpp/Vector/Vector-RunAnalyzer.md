---
title: "RunAnalyzer() | Cloud"
slug: /cpp/cpp/Vector-RunAnalyzer
sidebar_label: "RunAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "アナライザーのドライランを実行します。 | Cloud"
type: docx
token: ACnNdxazbo8zRUx2zeMcmoN2nah
sidebar_position: 7
keywords: 
  - Pinecone ベクトル データベース
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

この操作は、アナライザーのドライランを実行します。

```c++
Status RunAnalyzer(const RunAnalyzerRequest& request, RunAnalyzerResponse& response)
```

## リクエスト構文\{#request-syntax}

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

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(std::string collection_name)`

    コレクション名を設定します。

- `WithFieldName(std::string field_name)`

    対象フィールドの名前を設定します。この値は必須です。

- `WithTexts(const std::vector<std::string>& texts)`

    解析対象のテキストを設定します。

- `AddText(std::string text)`

    解析するテキストを追加します。

- `AddAnalyzerName(std::string name)`

    実行するアナライザー名を設定します。

- `WithAnalyzerParams(const nlohmann::json& params)`

    アナライザーのパラメーターを設定します。

- `WithDetail(bool with_detail)`

    返される結果に詳細を含めるかどうかを指定します。

- `WithHash(bool with_hash)`

    返される結果にハッシュ値を含めるかどうかを指定します。

**戻り値:**

*Status* および *RunAnalyzerResponse*

成功したかどうかを確認するには、`status.IsOk()` をチェックします。

### AnalyzerResults\{#analyzerresults}

このページでは、`AnalyzerResults`、`AnalyzerResult`、および `AnalyzerToken` について説明します。`AnalyzerResults` は `std::vector<AnalyzerResult>` の型エイリアスであり、`RunAnalyzerResponse` 上の `Results()` を通じて返されます。各 `AnalyzerResult` は 1 つの入力テキスト文字列に対応し、アナライザーによって生成されたトークンのリストを含みます。

```c++
using AnalyzerResults = std::vector<AnalyzerResult>;
```

テキストごとの結果には、標準のベクトル API を使用してアクセスできます。

```c++
const AnalyzerResults& results = response.Results();
for (const auto& result : results) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << "\n";
    }
}
```

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## AnalyzerResult\{#analyzerresult}

1 つの `AnalyzerResult` には、単一の入力テキストに対するすべてのトークンが格納されます。

```c++
explicit AnalyzerResult(std::vector<AnalyzerToken>&& tokens);
```

- `const std::vector<AnalyzerToken>& Tokens() const`

    この入力テキストに対してアナライザーが生成したトークンのリストを返します。

## AnalyzerToken\{#analyzertoken}

`AnalyzerToken` は、単一のトークンを表すプレーンな構造体です。

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

    単語やサブワードなどのトークン文字列です。

- `start_offset_`

    元のテキスト内におけるトークンの開始バイトオフセットです。

- `end_offset_`

    元のテキスト内におけるトークンの終了バイトオフセットです。

- `position_`

    トークンシーケンス内でのトークンの位置インデックスです。

- `position_length_`

    トークンが占める位置の数です。通常は 1 です。

- `hash_`

    トークン文字列の 32 ビットハッシュ値です。

## 例\{#example}

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
