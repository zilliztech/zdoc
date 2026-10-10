---
title: "Arabic | BYOC"
slug: /arabic-analyzer
sidebar_label: "Arabic"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `arabic` analyzer is a built-in analyzer for Arabic text. Use this analyzer when you need Zilliz Cloud to normalize Arabic letter variants, remove diacritics and Tatweel, convert Arabic-Indic digits, apply Arabic stemming, and remove Arabic stop words. | BYOC"
type: origin
token: BgS6wjwgiiYARGkHlNccfdqznKF
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Arabic

The `arabic` analyzer is a built-in analyzer for Arabic text. Use this analyzer when you need Zilliz Cloud to normalize Arabic letter variants, remove diacritics and Tatweel, convert Arabic-Indic digits, apply Arabic stemming, and remove Arabic stop words.

## Configuration\{#configuration}

Built-in analyzers are Milvus-provided analyzer templates. To use a built-in analyzer, set `type` to a predefined analyzer name in `analyzer_params`.

To use the built-in Arabic analyzer, set `type` to `arabic`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "arabic",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "arabic");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "arabic"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "type": "arabic"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "arabic"},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "arabic",
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "arabic"
}'
```

</TabItem>
</Tabs>

The `arabic` analyzer accepts the following optional parameter:

| **Parameter** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_arabic_` | A list of additional stop words to remove from tokenization. By default, the `arabic` analyzer uses the built-in `_arabic_` dictionary. To inspect the default dictionary, refer to the [Arabic stop-word list](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/arabic.txt). The list is sourced from the Apache Lucene [Arabic stopwords file](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/ar/stopwords.txt). |

To add custom stop words, include `stop_words`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "arabic",
    "stop_words": ["ميلفوس"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "arabic");
analyzerParams.put("stop_words", Collections.singletonList("ميلفوس"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "arabic", "stop_words": []string{"ميلفوس"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "type": "arabic",
    "stop_words": ["ميلفوس"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "arabic"},
    {"stop_words", {"ميلفوس"}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "arabic",
    "stop_words": ["ميلفوس"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "arabic",
  "stop_words": [
    "ميلفوس"
  ]
}'
```

</TabItem>
</Tabs>

Zilliz Cloud applies custom stop words in addition to the built-in `_arabic_` dictionary.

The built-in `arabic` analyzer is equivalent to the following custom analyzer configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        "decimaldigit",
        "arabic_normalization",
        {
            "type": "stemmer",
            "language": "arabic",
        },
        {
            "type": "stop",
            "stop_words": "_arabic_",
        },
    ],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Arrays.asList(
        "lowercase",
        "decimaldigit",
        "arabic_normalization",
        new HashMap<String, Object>() {{
            put("type", "stemmer");
            put("language", "arabic");
        }},
        new HashMap<String, Object>() {{
            put("type", "stop");
            put("stop_words", "_arabic_");
        }}
));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{"lowercase", "decimaldigit", "arabic_normalization", map[string]any{
        "type":     "stemmer",
        "language": "arabic",
    }, map[string]any{
        "type":       "stop",
        "stop_words": "_arabic_",
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        "decimaldigit",
        "arabic_normalization",
        {"type": "stemmer", "language": "arabic"},
        {"type": "stop", "stop_words": "_arabic_"}
    ]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"lowercase", "decimaldigit", "arabic_normalization",
                {{"type", "stemmer"}, {"language", "arabic"}},
                {{"type", "stop"}, {"stop_words", "_arabic_"}}}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        "decimaldigit",
        "arabic_normalization",
        {"type": "stemmer", "language": "arabic"},
        {"type": "stop", "stop_words": "_arabic_"}
    ],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "lowercase",
    "decimaldigit",
    "arabic_normalization",
    {
      "type": "stemmer",
      "language": "arabic"
    },
    {
      "type": "stop",
      "stop_words": "_arabic_"
    }
  ]
}'
```

</TabItem>
</Tabs>

This analyzer applies the following processing steps:

- **Tokenization**: Uses the `standard` tokenizer to split text into tokens.

- **Digit normalization**: Uses the `decimaldigit` filter to convert Arabic-Indic and other Unicode decimal digits to ASCII digits.

- **Arabic normalization**: Uses the `arabic_normalization` filter to normalize Alef variants, Teh Marbuta, and Alef Maksura, and remove Harakat and Tatweel.

- **Stemming**: Uses the `stemmer` filter with `language` set to `arabic`.

- **Stop-word removal**: Uses the `stop` filter with the built-in `_arabic_` dictionary.

After defining `analyzer_params`, you can apply the analyzer to a `VARCHAR` field when defining a collection schema. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "arabic",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "arabic");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "arabic"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "type": "arabic"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "arabic"},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "arabic",
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "arabic"
}'
```

</TabItem>
</Tabs>

### Verification using `run_analyzer`\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "كِتَابٌ عـــربي ١٢٣"

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
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
texts.add("كِتَابٌ عـــربي ١٢٣");

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
    "encoding/json"
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

bs, _ := json.Marshal(analyzerParams)
texts := []string{"كِتَابٌ عـــربي ١٢٣"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParamsStr(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let texts = ["كِتَابٌ عـــربي ١٢٣".to_string()];
    let analyzer_params = serde_json::json!({
        "type": "arabic"
    });

    let result = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(texts)
            .analyzer_params(analyzer_params)
            .build()?,
    ).await?;

    println!("{:?}", result.results());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "كِتَابٌ عـــربي ١٢٣";
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
const res = await client.runAnalyzer({
    text: 'كِتَابٌ عـــربي ١٢٣',
    analyzer_params: analyzer_params
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"type\":\"arabic\"}",
    "text": ["كِتَابٌ عـــربي ١٢٣"]
  }'
```

</TabItem>
</Tabs>

### Expected output\{#expected-output}

```plaintext
['كتاب', 'عرب', '123']
```
