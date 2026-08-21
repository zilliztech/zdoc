---
title: "RunAnalyzer() | Cloud"
slug: /cpp/cpp/Vector-RunAnalyzer
sidebar_label: "RunAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation dry-runs an analyzer. | Cloud"
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

This operation dry-runs an analyzer.

```c++
Status RunAnalyzer(const RunAnalyzerRequest& request, RunAnalyzerResponse& response)
```

## Request Syntax\{#request-syntax}

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

**REQUEST METHODS:**

- `WithDatabaseName(const std::string& db_name)`

    Sets the target database name. The default database applies if it is empty.

- `WithCollectionName(std::string collection_name)`

    Sets the name of the collection.

- `WithFieldName(std::string field_name)`

    Sets the name of the target field, which cannot be empty.

- `WithTexts(const std::vector<std::string>& texts)`

    Sets the texts to be analyzed.

- `AddText(std::string text)`

    Adds the text for analyze.

- `AddAnalyzerName(std::string name)`

    Sets the name of the analyzer to run.

- `WithAnalyzerParams(const nlohmann::json& params)`

    Sets the analyzer parameters.

- `WithDetail(bool with_detail)`

    Whether to include the details in the returned results.

- `WithHash(bool with_hash)`

    Whether to include the hashed values in the returned results.

**RETURNS:**

*Status* with *RunAnalyzerResponse*

Check `status.IsOk()` to confirm success.

### AnalyzerResults\{#analyzerresults}

This page documents `AnalyzerResults`, `AnalyzerResult`, and `AnalyzerToken`. `AnalyzerResults` is a type alias for `std::vector<AnalyzerResult>` and is returned via `Results()` on a `RunAnalyzerResponse`. Each `AnalyzerResult` corresponds to one input text string and contains the list of tokens produced by the analyzer.

```c++
using AnalyzerResults = std::vector<AnalyzerResult>;
```

Access the per-text results via the standard vector API:

```c++
const AnalyzerResults& results = response.Results();
for (const auto& result : results) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << "\n";
    }
}
```

**EXCEPTIONS:**

- **StatusCode**

    Check `status.Code()` and `status.Message()` for error details.

## AnalyzerResult\{#analyzerresult}

One `AnalyzerResult` holds all tokens for a single input text.

```c++
explicit AnalyzerResult(std::vector<AnalyzerToken>&& tokens);
```

- `const std::vector<AnalyzerToken>& Tokens() const`

    Returns the list of tokens produced by the analyzer for this input text.

## AnalyzerToken\{#analyzertoken}

`AnalyzerToken` is a plain struct describing a single token.

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

    The token string, such as a word or sub-word.

- `start_offset_`

    Byte offset in the original text where the token starts.

- `end_offset_`

    Byte offset in the original text where the token ends.

- `position_`

    Position index of the token in the token sequence.

- `position_length_`

    Number of positions the token spans. This is usually 1.

- `hash_`

    32-bit hash of the token string.

## Example\{#example}

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
