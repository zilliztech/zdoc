---
title: "Thai | Cloud"
slug: /thai-analyzer
sidebar_label: "Thai"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `thai` analyzer is a built-in analyzer for Thai text. Use this analyzer when you need Zilliz Cloud to segment Thai text into words, normalize Thai digits, lowercase mixed Latin text, and remove Thai stop words. | Cloud"
type: origin
token: FOmVwhh1XiHjLpkd4RAczZIEnHe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Thai

The `thai` analyzer is a built-in analyzer for Thai text. Use this analyzer when you need Zilliz Cloud to segment Thai text into words, normalize Thai digits, lowercase mixed Latin text, and remove Thai stop words.

## Configuration\{#configuration}

Built-in analyzers are Milvus-provided analyzer templates. To use a built-in analyzer, set `type` to a predefined analyzer name in `analyzer_params`.

To use the built-in Thai analyzer, set `type` to `thai`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "thai",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "thai");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "thai"}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "thai"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "thai"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "thai",
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "thai"
}'
```

</TabItem>
</Tabs>

The `thai` analyzer accepts the following optional parameter:

| **Parameter** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_thai_` | A list of additional stop words to remove from tokenization. By default, the `thai` analyzer uses the built-in `_thai_` dictionary. To inspect the default dictionary, refer to the Zilliz Cloud [Thai stop-word list](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/thai.txt). The list is sourced from the Apache Lucene [Thai stopwords file](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/th/stopwords.txt). |

To add custom stop words, include `stop_words`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "thai",
    "stop_words": ["มิลวัส"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "thai");
analyzerParams.put("stop_words", Arrays.asList("มิลวัส"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "thai", "stop_words": []string{"มิลวัส"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "thai",
    "stop_words": ["มิลวัส"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "thai"},
    {"stop_words", {"มิลวัส"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "thai",
    "stop_words": ["มิลวัส"]
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "thai",
  "stop_words": ["มิลวัส"]
}'
```

</TabItem>
</Tabs>

Zilliz Cloud applies custom stop words in addition to the built-in `_thai_` dictionary.

The built-in `thai` analyzer is equivalent to the following custom analyzer configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "thai",
    "filter": [
        "lowercase",
        "decimaldigit",
        {
            "type": "stop",
            "stop_words": ["_thai_"],
        },
    ],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "thai");
analyzerParams.put("filter",
        Arrays.asList("lowercase",
                "decimaldigit",
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Collections.singletonList("_thai_"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "thai",
        "filter": []any{"lowercase", "decimaldigit", map[string]any{
            "type":       "stop",
            "stop_words": []string{"_thai_"},
        }}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "thai",
    "filter": [
        "lowercase",
        "decimaldigit",
        { "type": "stop", "stop_words": ["_thai_"] }
    ]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "thai"},
    {"filter", {
        "lowercase",
        "decimaldigit",
        {{"type", "stop"}, {"stop_words", {"_thai_"}}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "thai",
    "filter": [
        "lowercase",
        "decimaldigit",
        { "type": "stop", "stop_words": ["_thai_"] }
    ]
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "thai",
  "filter": [
    "lowercase",
    "decimaldigit",
    {
      "type": "stop",
      "stop_words": ["_thai_"]
    }
  ]
}'
```

</TabItem>
</Tabs>

This analyzer applies the following processing steps:

- **Tokenization**: Uses the `thai` tokenizer to segment Thai text into word tokens without relying on whitespace. The tokenizer filters out whitespace and punctuation-only segments. For details, refer to [Thai tokenizer](./thai-tokenizer).

- **Case normalization**: Uses the `lowercase` filter, which affects Latin letters in mixed Thai/English text.

- **Digit normalization**: Uses the `decimaldigit` filter to convert Thai digits and other Unicode decimal digits to ASCII digits.

- **Stop-word removal**: Uses the `stop` filter with the built-in `_thai_` dictionary.

- **No stemming**: The built-in `thai` analyzer does not apply a `stemmer` filter.

After defining `analyzer_params`, you can apply the analyzer to a `VARCHAR` field when defining a collection schema. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "thai",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "thai");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "thai"}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "thai"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"type", "thai"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "thai",
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "thai"
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

sample_text = "ฉันรักการค้นหาข้อความใน Milvus ๑๒๓"

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
texts.add("ฉันรักการค้นหาข้อความใน Milvus ๑๒๓");

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

texts := []string{"ฉันรักการค้นหาข้อความใน Milvus ๑๒๓"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let response = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["ฉันรักการค้นหาข้อความใน Milvus ๑๒๓"])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;

for result in response.results() {
    for token in result.get_tokens() {
        println!("{}", token.get_text());
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "ฉันรักการค้นหาข้อความใน Milvus ๑๒๓";
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

const sample_text = 'ฉันรักการค้นหาข้อความใน Milvus ๑๒๓';
const result = await client.runAnalyzer({
  text: sample_text,
  analyzer_params,
});
const tokens = result.results.flatMap(r => r.tokens.map(t => t.token));
console.log(tokens);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "analyzerParams": "{\"type\": \"thai\"}",
    "text": ["ฉันรักการค้นหาข้อความใน Milvus ๑๒๓"]
  }'
```

</TabItem>
</Tabs>

### Expected output\{#expected-output}

```plaintext
['ฉัน', 'รัก', 'ค้นหา', 'ข้อความ', 'milvus', '123']
```
