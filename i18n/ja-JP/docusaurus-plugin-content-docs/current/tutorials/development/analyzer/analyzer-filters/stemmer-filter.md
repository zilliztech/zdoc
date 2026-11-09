---
title: "Stemmer | Cloud"
slug: /stemmer-filter
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "stemmer フィルターは、単語を基本形または語根形に還元します（これをステミングと呼びます）。これにより、異なる語形変化を持つ類似した意味の単語を一致させやすくなります。stemmer フィルターは複数の言語をサポートしているため、さまざまな言語コンテキストで効果的な検索とインデックス作成が可能です。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-stemmer-filter
sidebar_label: "Stemmer"
sidebar_position: 10
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/filter/stemmer-filter.md"

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stemmer

`stemmer` フィルターは、単語を基本形または語根形に還元します（これをステミングと呼びます）。これにより、異なる語形変化を持つ類似した意味の単語を一致させやすくなります。`stemmer` フィルターは複数の言語をサポートしているため、さまざまな言語コンテキストで効果的な検索とインデックス作成が可能です。

## 設定\{#configuration}

`stemmer` フィルターは Zilliz Cloud のカスタムフィルターです。使用するには、フィルター設定で `"type": "stemmer"` を指定し、ステミング対象の言語を選択する `language` パラメーターを指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", # Specifies the filter type as stemmer
        "language": "english", # Sets the language for stemming to English
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "stemmer");
                    put("language", "english");
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":     "stemmer",
        "language": "english",
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [
        { "type": "stemmer", "language": "english" }
    ]
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "stemmer"},
            {"language", "english"}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", // Specifies the filter type as stemmer
        "language": "english", // Sets the language for stemming to English
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "standard",
    ["filter"] = new object[]
    {
        new Dictionary<string, object> { ["type"] = "stemmer", ["language"] = "english" } // Specifies the filter type as stemmer and the language to English
    },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "stemmer",
      "language": "english"
    }
  ]
}'
```

</TabItem>

</Tabs>

`stemmer` フィルターでは、以下の構成可能なパラメーターを使用できます。

| パラメーター | 説明 |
| --- | --- |
| `language` | ステミング処理の言語を指定します。サポートされる言語は、`"arabic"`、`"danish"`、`"dutch"`、`"english"`、`"finnish"`、`"french"`、`"german"`、`"greek"`、`"hungarian"`、`"italian"`、`"norwegian"`、`"portuguese"`、`"romanian"`、`"russian"`、`"spanish"`、`"swedish"`、`"tamil"`、`"turkish"` です。 |

`stemmer` フィルターはトークナイザーが生成したタームに対して動作するため、トークナイザーと組み合わせて使用する必要があります。

アラビア語のテキストについては、ほとんどの場合、組み込みの [`arabic`](./arabic-analyzer) アナライザーを使用してください。この組み込みアナライザーには、アラビア語のステミングに加えて、アラビア語の正規化、10 進数字の正規化、アラビア語のストップワード除去が含まれています。カスタムアナライザーパイプラインを構築する必要がある場合にのみ、`stemmer` フィルターを直接使用してください。

`analyzer_params` を定義したら、コレクションスキーマを定義する際に `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定したアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを実行できます。詳細は、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用して動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", # Specifies the filter type as stemmer
        "language": "english", # Sets the language for stemming to English
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "stemmer");
                    put("language", "english");
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":     "stemmer",
        "language": "english",
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [
        { "type": "stemmer", "language": "english" }
    ]
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "stemmer"},
            {"language", "english"}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", // Specifies the filter type as stemmer
        "language": "english", // Sets the language for stemming to English
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "standard",
    ["filter"] = new object[]
    {
        new Dictionary<string, object> { ["type"] = "stemmer", ["language"] = "english" } // Specifies the filter type as stemmer and the language to English
    },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "stemmer",
      "language": "english"
    }
  ]
}'
```

</TabItem>

</Tabs>

### `run_analyzer` を使用した確認\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Sample text to analyze
sample_text = "running runs looked ran runner"

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.*;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("running runs looked ran runner");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

texts := []string{"running runs looked ran runner"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, r := range result {
    for _, token := range r.Tokens {
        fmt.Println("Standard analyzer output:", token.Text)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let sample_text = "running runs looked ran runner";
let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec![sample_text])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;

println!("Standard analyzer output: {:?}", result);
```

</TabItem>

<TabItem value='c++'>

```cpp
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "running runs looked ran runner";
auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN",
});

// Sample text to analyze
const sample_text = "running runs looked ran runner";

// Run the standard analyzer with the defined configuration
const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params: analyzer_params
});
console.log("Standard analyzer output:", result);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Responses.Utility;
using Milvus.Client.V2.Types;

var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

// Sample text to analyze
var sampleText = "running runs looked ran runner";

// Run the standard analyzer with the defined configuration
RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});
Console.WriteLine("Standard analyzer output: " + string.Join(", ", result.Results.SelectMany(r => r.Tokens).Select(t => t.Token)));
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "text": ["running runs looked ran runner"],
    "analyzerParams": "{\"tokenizer\": \"standard\", \"filter\": [{\"type\": \"stemmer\", \"language\": \"english\"}]}"
}'
```

</TabItem>

</Tabs>

### 期待される出力\{#expected-output}

```plaintext
['run', 'run', 'look', 'ran', 'runner']
```
