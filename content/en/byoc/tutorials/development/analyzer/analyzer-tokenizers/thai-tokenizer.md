---
title: "Thai | BYOC"
slug: /thai-tokenizer
sidebar_label: "Thai"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `thai` tokenizer segments Thai text into word tokens without relying on spaces. Use this tokenizer when you need to build a custom analyzer pipeline for Thai or mixed Thai/English text. | BYOC"
type: origin
token: KT4yw9ZWriYDilkhFR7cr00Znfb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Thai

The `thai` tokenizer segments Thai text into word tokens without relying on spaces. Use this tokenizer when you need to build a custom analyzer pipeline for Thai or mixed Thai/English text.

## Configuration\{#configuration}

<Admonition type="info" title="Notes">

For Thai text, use the built-in `thai` analyzer in most cases. The built-in analyzer includes this tokenizer together with lowercasing, decimal digit normalization, and Thai stop-word removal. Use the `thai` tokenizer directly only when you need to build a custom analyzer pipeline. For details, refer to [Thai analyzer](./thai-analyzer).

</Admonition>

To configure an analyzer using the `thai` tokenizer, set `tokenizer` to `thai` in `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "thai",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "thai");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "thai"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "thai"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "thai"},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "thai",
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "thai"
}'
```

</TabItem>
</Tabs>

The `thai` tokenizer has no configurable parameters.

The tokenizer can work with one or more filters. For example, the following configuration uses the `thai` tokenizer with the `lowercase` and `decimaldigit` filters:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "thai",
    "filter": [
        "lowercase",
        "decimaldigit",
    ],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "thai");
analyzerParams.put("filter", Arrays.asList("lowercase", "decimaldigit"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "thai", "filter": []any{"lowercase", "decimaldigit"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "thai",
    "filter": ["lowercase", "decimaldigit"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "thai"},
    {"filter", {"lowercase", "decimaldigit"}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "thai",
    "filter": ["lowercase", "decimaldigit"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "thai",
  "filter": [
    "lowercase",
    "decimaldigit"
  ]
}'
```

</TabItem>
</Tabs>

This custom pipeline is not equivalent to the built-in `thai` analyzer because it does not include the built-in `_thai_` stop-word dictionary. For the complete predefined pipeline, use `{"type": "thai"}`.

The tokenizer applies the following behavior:

- **Thai segmentation**: Segments Thai text into word tokens without relying on whitespace.

- **Whitespace and punctuation filtering**: Filters out whitespace and punctuation-only segments. This differs from the `icu` tokenizer, which can preserve punctuation and spaces as tokens.

- **Mixed-script text**: Emits Latin word tokens in mixed Thai/English text.

- **Tokenizer only**: Does not lowercase tokens, normalize Unicode digits, or remove stop words. Add filters or use the built-in `thai` analyzer for those steps.

- **Position semantics**: Uses character-based token positions that include skipped whitespace and punctuation, which keeps phrase and proximity matching behavior consistent with other non-Latin tokenizers.

After defining `analyzer_params`, you can apply the analyzer to a `VARCHAR` field when defining a collection schema. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "thai",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "thai");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "thai"}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "thai"
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "thai"},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "thai",
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "thai"
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

sample_text = "สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓"

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
texts.add("สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓");

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
texts := []string{"สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓"}
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

    let texts = ["สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓".to_string()];
    let analyzer_params = serde_json::json!({
        "tokenizer": "thai"
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

std::string text = "สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓";
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
    text: 'สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓',
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
    "text": ["สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓"],
    "analyzerParams": "{\"tokenizer\":\"thai\"}"
  }'
```

</TabItem>
</Tabs>

### Expected output\{#expected-output}

```plaintext
['สวัสดี', 'ทดสอบ', 'ระบบ', 'Milvus', '๑๒๓']
```
