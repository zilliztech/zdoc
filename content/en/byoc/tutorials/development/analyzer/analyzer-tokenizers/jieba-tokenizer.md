---
title: "Jieba | BYOC"
slug: /jieba-tokenizer
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The jieba tokenizer processes Chinese text by breaking it down into its component words. | BYOC"
type: origin
displayed_sidebar: default
token: shared-jieba-tokenizer
sidebar_label: "Jieba"
sidebar_position: 3
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/tokenizer/jieba-tokenizer.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

The `jieba` tokenizer processes Chinese text by breaking it down into its component words.

<Admonition type="info" icon="📘" title="Notes">

The `jieba` tokenizer preserves punctuation marks as separate tokens in the output. For example, `"你好！世界。"` becomes `["你好", "！", "世界", "。"]`. To remove these standalone punctuation tokens, use the [`removepunct`](./remove-punct-filter) filter.

</Admonition>

## Configuration\{#configuration}

Zilliz Cloud supports two configuration approaches for the `jieba` tokenizer: a simple configuration and a custom configuration.

### Simple configuration\{#simple-configuration}

With the simple configuration, you only need to set the tokenizer to `"jieba"`. For example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Simple configuration: only specifying the tokenizer name
analyzer_params = {
    "tokenizer": "jieba",  # Use the default settings: dict=["_default_"], mode="search", hmm=True
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "jieba"}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({"tokenizer": "jieba"});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Simple configuration: only specifying the tokenizer name
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "jieba" // Use the default settings: dict=["_default_"], mode="search", hmm=True
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba"
}'
```

</TabItem>

</Tabs>

This simple configuration is equivalent to the following custom configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Custom configuration equivalent to the simple configuration above
analyzer_params = {
    "tokenizer": {                 # Tokenizer configuration
        "type": "jieba",           # Tokenizer type, fixed as "jieba"
        "dict": ["_default_"],     # Use the default dictionary
        "mode": "search",          # Use search mode for improved recall (see mode details below)
        "hmm": True                # Enable HMM for probabilistic segmentation
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");
  put("dict", Collections.singletonList("_default_"));
  put("mode", "search");
  put("hmm", true);
}});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
  "tokenizer": map[string]any{
    "type": "jieba",
    "dict": []any{"_default_"},
    "mode": "search",
    "hmm":  true,
  },
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": {
        "type": "jieba",
        "dict": ["_default_"],
        "mode": "search",
        "hmm": true
    }
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "jieba"},
        {"dict", {"_default_"}},
        {"mode", "search"},
        {"hmm", true}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: {
    type: "jieba",
    dict: ["_default_"],
    mode: "search",
    hmm: true,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Custom configuration equivalent to the simple configuration above
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object> // Tokenizer configuration
    {
        ["type"] = "jieba",               // Tokenizer type, fixed as "jieba"
        ["dict"] = new[] { "_default_" }, // Use the default dictionary
        ["mode"] = "search",              // Use search mode for improved recall (see mode details below)
        ["hmm"] = true                    // Enable HMM for probabilistic segmentation
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "jieba",
    "dict": ["_default_"],
    "mode": "search",
    "hmm": true
  }
}'
```

</TabItem>

</Tabs>

For details on parameters, refer to [Custom configuration](./jieba-tokenizer#custom-configuration).

### Custom configuration\{#custom-configuration}

For more control, you can provide a custom configuration that allows you to specify a custom dictionary, select the segmentation mode, and enable or disable the Hidden Markov Model (HMM). For example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Custom configuration with user-defined settings
analyzer_params = {
    "tokenizer": {
        "type": "jieba",           # Fixed tokenizer type
        "dict": ["customDictionary"],  # Custom dictionary list; replace with your own terms
        "mode": "exact",           # Use exact mode (non-overlapping tokens)
        "hmm": False               # Disable HMM; unmatched text will be split into individual characters
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");
  put("dict", Arrays.asList("customDictionary"));
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
  "tokenizer": map[string]any{
      "type": "jieba",
      "dict": []string{"customDictionary"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": {
        "type": "jieba",
        "dict": ["customDictionary"],
        "mode": "exact",
        "hmm": false
    }
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
  {"tokenizer", {
      {"type", "jieba"},
      {"dict", {"customDictionary"}},
      {"mode", "exact"},
      {"hmm", false}
  }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: {
    type: "jieba",
    dict: ["customDictionary"],
    mode: "exact",
    hmm: false,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Custom configuration with user-defined settings
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "jieba",                  // Fixed tokenizer type
        ["dict"] = new[] { "customDictionary" }, // Custom dictionary list; replace with your own terms
        ["mode"] = "exact",                  // Use exact mode (non-overlapping tokens)
        ["hmm"] = false                      // Disable HMM; unmatched text will be split into individual characters
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "jieba",
    "dict": ["customDictionary"],
    "mode": "exact",
    "hmm": false
  }
}'
```

</TabItem>

</Tabs>

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Default Value</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>The type of tokenizer. This is fixed to <code>"jieba"</code>.</p></td>
     <td><p><code>"jieba"</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>A list of dictionaries that the analyzer will load as its vocabulary source. Built-in options:</p><ul><li><p><code>"_default_"</code>: Loads the engine's built‑in Simplified‑Chinese dictionary. For details, refer to <a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a>.</p></li><li><p><code>"_extend_default_"</code>: Loads everything in <code>"_default_"</code> plus an additional Traditional‑Chinese supplement. For details, refer to <a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a>.</p><p>You can also mix the built‑in dictionary with any number of custom dictionaries. Example: <code>["_default_", "结巴分词器"]</code>.</p></li></ul></td>
     <td><p><code>["_default_"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>The segmentation mode. Possible values:</p><ul><li><p><code>"exact"</code>: Tries to segment the sentence in the most precise manner, making it ideal for text analysis.</p></li><li><p><code>"search"</code>: Builds on exact mode by further breaking down long words to improve recall, making it suitable for search engine tokenization.</p><p>For more information, refer to <a href="https://github.com/fxsjy/jieba">Jieba GitHub Project</a>.</p></li></ul></td>
     <td><p><code>"search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>A boolean flag indicating whether to enable the Hidden Markov Model (HMM) for probabilistic segmentation of words not found in the dictionary.</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

{/* This section is published to both Cloud manuals, so the heading stays product-neutral. */}

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": False
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");
  put("dict", Arrays.asList("结巴分词器"));
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
  "tokenizer": map[string]any{
      "type": "jieba",
      "dict": []string{"结巴分词器"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": false
    }
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
  {"tokenizer", {
      {"type", "jieba"},
      {"dict", {"结巴分词器"}},
      {"mode", "exact"},
      {"hmm", false}
  }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: {
    type: "jieba",
    dict: ["结巴分词器"],
    mode: "exact",
    hmm: false,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "jieba",
        ["dict"] = new[] { "结巴分词器" },
        ["mode"] = "exact",
        ["hmm"] = false
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "jieba",
    "dict": ["结巴分词器"],
    "mode": "exact",
    "hmm": false
  }
}'
```

</TabItem>

</Tabs>

### Verification using `run_analyzer`\{#verification-using-runanalyzer}

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
sample_text = "milvus结巴分词器中文测试"

# Run the jieba tokenizer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Jieba analyzer output:", result)
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
texts.add("milvus结巴分词器中文测试");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();

for (RunAnalyzerResp.AnalyzerResult result : results) {
    for (RunAnalyzerResp.AnalyzerToken token : result.getTokens()) {
        System.out.println("Jieba analyzer output: " + token.getToken());
    }
}
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

texts := []string{"milvus结巴分词器中文测试"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, r := range result {
    for _, token := range r.Tokens {
        fmt.Println("Jieba analyzer output:", token.Text)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let response = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["milvus结巴分词器中文测试"])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;

for result in response.results() {
    for token in result.get_tokens() {
        println!("Jieba analyzer output: {}", token.get_text());
    }
}
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

std::string text = "milvus结巴分词器中文测试";
auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << "Jieba analyzer output: " << token.token_ << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const sample_text = 'milvus结巴分词器中文测试';
const result = await client.runAnalyzer({
  text: sample_text,
  analyzer_params,
});
const tokens = result.results.flatMap(r => r.tokens.map(t => t.token));
console.log('Jieba analyzer output:', tokens);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Responses.Utility;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

// Sample text to analyze
var sampleText = "milvus结巴分词器中文测试";

// Run the jieba tokenizer with the defined configuration
RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});

foreach (AnalyzerResult r in result.Results)
{
    foreach (AnalyzerToken t in r.Tokens)
    {
        Console.WriteLine($"Jieba analyzer output: {t.Token}");
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "text": ["milvus结巴分词器中文测试"],
    "analyzerParams": "{\"tokenizer\":{\"type\":\"jieba\",\"dict\":[\"结巴分词器\"],\"mode\":\"exact\",\"hmm\":false}}"
  }'
```

</TabItem>

</Tabs>

### Expected output\{#expected-output}

For the sample text, the analyzer produces the following tokens in order. SDK response objects and printed formatting vary by language; the REST response contains these tokens at `data.results[].tokens[].token`.

```plaintext
['milvus', '结巴分词器', '中', '文', '测', '试']
```
