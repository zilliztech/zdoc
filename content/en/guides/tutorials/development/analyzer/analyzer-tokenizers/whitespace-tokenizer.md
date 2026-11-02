---
title: "Whitespace | Cloud"
slug: /whitespace-tokenizer
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The whitespace tokenizer splits text at five ASCII whitespace characters: tab, line feed, form feed, carriage return, and space. | Cloud"
type: origin
displayed_sidebar: default
token: shared-whitespace-tokenizer
sidebar_label: "Whitespace"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/tokenizer/whitespace-tokenizer.md"

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Whitespace

The `whitespace` tokenizer splits text at five ASCII whitespace characters: tab, line feed, form feed, carriage return, and space.

## Tokenization rules\{#tokenization-rules}

The `whitespace` tokenizer splits text only at the following five ASCII whitespace characters:

| Character | Name | Unicode code point |
| --- | --- | --- |
| `\t` | Horizontal tab | U+0009 |
| `\n` | Line feed | U+000A |
| `\x0C` or `\f` | Form feed | U+000C |
| `\r` | Carriage return | U+000D |
| `' '` | Space | U+0020 |

These separators are discarded, and consecutive separators do not produce empty tokens. Punctuation and other characters remain in the tokens. In particular, vertical tab (`\x0B`, U+000B), no-break space (`\u00A0`), and ideographic space (`\u3000`) do not trigger splitting.

This set follows Rust's [`char::is_ascii_whitespace()`](https://doc.rust-lang.org/std/primitive.char.html#method.is_ascii_whitespace), which excludes other Unicode whitespace characters.

The following examples use `{"tokenizer": "whitespace"}` with no filters. Inputs and outputs use Python string notation: escape sequences such as `\t` and `\u00A0` represent the actual characters.

| Input | Output tokens |
| --- | --- |
| `"a\tb\nc\x0Cd\re f"` | `["a", "b", "c", "d", "e", "f"]` |
| `"Hello,World! foo_bar"` | `["Hello,World!", "foo_bar"]` |
| `"a\x0Bb"` | `["a\x0Bb"]` |
| `"a\u00A0b"` | `["a\u00A0b"]` |
| `"a\u3000b"` | `["a\u3000b"]` |
| `" a  b "` | `["a", "b"]` |

## Configuration\{#configuration}

To configure an analyzer using the `whitespace` tokenizer, set `tokenizer` to `whitespace` in `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "whitespace"}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({"tokenizer": "whitespace"});
```

</TabItem>

<TabItem value='c++'>

```c++
#include <milvus/thirdparty/nlohmann/json.hpp>

nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace"
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "whitespace"
};
```

</TabItem>

<TabItem value='bash'>

```bash
analyzerParams='{"tokenizer": "whitespace"}'
```

</TabItem>

</Tabs>

The whitespace tokenizer can work in conjunction with one or more filters. For example, the following code defines an analyzer that uses the `whitespace` tokenizer and the [lowercase filter](./lowercase-filter):

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "whitespace", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "whitespace",
    "filter": ["lowercase"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
#include <milvus/thirdparty/nlohmann/json.hpp>

nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"},
    {"filter", {"lowercase"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "whitespace",
    ["filter"] = new List<object> { "lowercase" }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "whitespace",
  "filter": [
    "lowercase"
  ]
}'
```

</TabItem>

</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method. Use the configuration below with the verification example for your selected language.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "whitespace", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "whitespace",
    "filter": ["lowercase"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
#include <milvus/thirdparty/nlohmann/json.hpp>

nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"},
    {"filter", {"lowercase"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "whitespace",
    ["filter"] = new List<object> { "lowercase" }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "whitespace",
  "filter": [
    "lowercase"
  ]
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
sample_text = "The Milvus vector database is built for scale!"

# Run the whitespace analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Whitespace analyzer output:", result)
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
texts.add("The Milvus vector database is built for scale!");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();

for (RunAnalyzerResp.AnalyzerResult result : results) {
    for (RunAnalyzerResp.AnalyzerToken token : result.getTokens()) {
        System.out.println(token.getToken());
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
    panic(err)
}

defer client.Close(ctx)

texts := []string{"The Milvus vector database is built for scale!"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    panic(err)
}

for _, r := range result {
    for _, token := range r.Tokens {
        fmt.Println(token.Text)
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
            .texts(["The Milvus vector database is built for scale!"])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;

for result in response.results() {
    for token in result.get_tokens() {
        println!("Whitespace analyzer output: {}", token.get_text());
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <string>
#include <iostream>
#include <stdexcept>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

std::string text = "The Milvus vector database is built for scale!";
auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: "YOUR_CLUSTER_TOKEN",
});

const sample_text = 'The Milvus vector database is built for scale!';
const result = await client.runAnalyzer({
  text: sample_text,
  analyzer_params,
});
const tokens = result.results.flatMap(r => r.tokens.map(t => t.token));
console.log('Whitespace analyzer output:', tokens);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System;
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Responses.Utility;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});

// Sample text to analyze
string sampleText = "The Milvus vector database is built for scale!";

// Run the whitespace analyzer with the defined configuration
RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});

foreach (AnalyzerResult r in result.Results)
{
    foreach (AnalyzerToken t in r.Tokens)
    {
        Console.WriteLine($"Whitespace analyzer output: {t.Token}");
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
    "analyzerParams": "{\"tokenizer\": \"whitespace\", \"filter\": [\"lowercase\"]}",
    "text": ["The Milvus vector database is built for scale!"]
  }'
```

</TabItem>

</Tabs>

### Expected output\{#expected-output}

For the sample text, the analyzer produces the following tokens in order. SDK response objects and printed formatting vary by language; the REST response contains these tokens at `data.results[].tokens[].token`.

```plaintext
['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale!']
```
