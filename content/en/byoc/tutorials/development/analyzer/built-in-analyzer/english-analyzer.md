---
title: "English | BYOC"
slug: /english-analyzer
sidebar_label: "English"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `english` analyzer in Zilliz Cloud is designed to process English text, applying language-specific rules for tokenization and filtering. | BYOC"
type: origin
token: W0WhwqRyciRMRLklcsdca1U2nae
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# English

The `english` analyzer in Zilliz Cloud is designed to process English text, applying language-specific rules for tokenization and filtering.

## Definition\{#definition}

The `english` analyzer uses the following components:

- **Tokenizer**: Uses the [`standard`](./standard-tokenizer)[ tokenizer](./standard-tokenizer) to split text into discrete word units.

- **Filters**: Includes multiple filters for comprehensive text processing:

    - [`lowercase`](./lowercase-filter): Converts all tokens to lowercase, enabling case-insensitive searches.

    - [`stemmer`](./stemmer-filter): Reduces words to their root form to support broader matching (e.g., "running" becomes "run").

    - [`stop_words`](./stop-filter): Removes common English stop words to focus on key terms in text.

The functionality of the `english` analyzer is equivalent to the following custom analyzer configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
        "tokenizer": "standard",
        "filter": [
                "lowercase",
                {
                        "type": "stemmer",
                        "language": "english"
                }, {
                        "type": "stop",
                        "stop_words": "_english_"
                }
        ]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Arrays.asList("lowercase",
                new HashMap<String, Object>() {{
                    put("type", "stemmer");
                    put("language", "english");
                }},
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Collections.singletonList("_english_"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
        "filter": []any{"lowercase", map[string]any{
            "type":     "stemmer",
            "language": "english",
        }, map[string]any{
            "type":       "stop",
            "stop_words": "_english_",
        }}}
```

</TabItem>
</Tabs>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        { "type": "stemmer", "language": "english" },
        { "type": "stop", "stop_words": "_english_" }
    ]
});
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        "lowercase", 
        {{"type", "stemmer"}, {"language", "english"}},
        {{"type", "stop"}, {"stop_words", "_english_"}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        { "type": "stemmer", "language": "english" },
        { "type": "stop", "stop_words": "_english_" }
    ]
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "lowercase",
    {
      "type": "stemmer",
      "language": "english"
    },
    {
      "type": "stop",
      "stop_words": "_english_"
    }
  ]
}'
```

</TabItem>
</Tabs>

## Configuration\{#configuration}

To apply the `english` analyzer to a field, simply set `type` to `english` in `analyzer_params`, and include optional parameters as needed.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "english"}
```

</TabItem>
</Tabs>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "english"
});
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "english"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "english",
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "english"
}'
```

</TabItem>
</Tabs>

The `english` analyzer accepts the following optional parameters: 

| Parameter | Description |
| --- | --- |
| `stop_words` | An array containing a list of stop words, which will be removed from tokenization. Defaults to `_english_`, a built-in set of common English stop words. |

Example configuration with custom stop words:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
analyzerParams.put("stop_words", Arrays.asList("a", "an", "the"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "english", "stop_words": []string{"a", "an", "the"}}
```

</TabItem>
</Tabs>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "english",
    "stop_words": ["a", "an", "the"]
});
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "english"},
    {"stop_words", {"a", "an", "the"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "english",
  "stop_words": [
    "a",
    "an",
    "the"
  ]
}'
```

</TabItem>
</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
analyzerParams.put("stop_words", Arrays.asList("a", "an", "the"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "english", "stop_words": []string{"a", "an", "the"}}
```

</TabItem>
</Tabs>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "english",
    "stop_words": ["a", "an", "the"]
});
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "english"},
    {"stop_words", {"a", "an", "the"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "english",
  "stop_words": [
    "a",
    "an",
    "the"
  ]
}'
```

</TabItem>
</Tabs>

### Verification using `run_analyzer`\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
sample_text = "Milvus is a vector database built for scale!"

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("English analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

import java.util.ArrayList;
import java.util.List;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("Milvus is a vector database built for scale!");

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

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

texts := []string{"Milvus is a vector database built for scale!"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>
</Tabs>

```rust
use milvus::v2::prelude::*;

let response = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["Milvus is a vector database built for scale!"])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;

for result in response.results() {
    for token in result.get_tokens() {
        println!("English analyzer output: {}", token.get_text());
    }
}
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "Milvus is a vector database built for scale!";
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
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
});

const sample_text = 'Milvus is a vector database built for scale!';
const result = await client.runAnalyzer({
  text: sample_text,
  analyzer_params,
});
const tokens = result.results.flatMap(r => r.tokens.map(t => t.token));
console.log('English analyzer output:', tokens);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "analyzerParams": "{\"type\": \"english\", \"stop_words\": [\"a\", \"an\", \"the\"]}",
    "text": ["Milvus is a vector database built for scale!"]
  }' 
```

</TabItem>
</Tabs>

### Expected output\{#expected-output}

```python
English analyzer output: ['milvus', 'vector', 'databas', 'built', 'scale']
```

