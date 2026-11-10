---
title: "阿拉伯语 Analyzer | BYOC"
slug: /arabic-analyzer
sidebar_label: "阿拉伯语 Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`arabic` Analyzer 是一款用于处理阿拉伯语文本的内置 Analyzer。当您需要 Zilliz Cloud 对阿拉伯字母变体进行规范化、移除变音符号和 Tatweel 延长符、转换阿拉伯-印度数字、执行阿拉伯语词干提取以及移除阿拉伯语停用词时，可使用此 Analyzer。 | BYOC"
type: origin
token: B0CwwnxeRiBzu0knv5kch2EDn0d
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 阿拉伯语 Analyzer

`arabic` Analyzer 是一款用于处理阿拉伯语文本的内置 Analyzer。当您需要 Zilliz Cloud 对阿拉伯字母变体进行规范化、移除变音符号和 Tatweel 延长符、转换阿拉伯-印度数字、执行阿拉伯语词干提取以及移除阿拉伯语停用词时，可使用此 Analyzer。

## 配置\{#configuration}

内置 Analyzer 是由 Milvus 提供的 Analyzer 模板。要使用内置 Analyzer，请在 `analyzer_params` 中将 `type` 设置为预定义的 Analyzer 名称。

要使用内置的阿拉伯语 Analyzer，请将 `type` 设置为 `arabic`：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["type"] = "arabic"
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

`arabic` Analyzer 支持以下可选参数：

| **参数** | **类型** | **默认值** | **说明** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_arabic_` | 分词时要额外移除的停用词列表。默认情况下，`arabic` Analyzer 使用内置的 `_arabic_` 词典。要查看默认词典，请参阅[阿拉伯语停用词列表](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/arabic.txt)。该列表来源于 Apache Lucene 的[阿拉伯语停用词文件](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/ar/stopwords.txt)。 |

要添加自定义停用词，请添加 `stop_words`：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["type"] = "arabic",
    ["stop_words"] = new[] { "ميلفوس" }
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

除内置的 `_arabic_` 词典外，Zilliz Cloud 还会应用自定义停用词。

内置的 `arabic` Analyzer 等同于以下自定义 Analyzer 配置：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
            "stop_words": ["_arabic_"],
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
            put("stop_words", Collections.singletonList("_arabic_"));
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
        "stop_words": []string{"_arabic_"},
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
        {"type": "stop", "stop_words": ["_arabic_"]}
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
                {{"type", "stop"}, {"stop_words", {"_arabic_"}}}}},
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
        {"type": "stop", "stop_words": ["_arabic_"]}
    ],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "standard",
    ["filter"] = new object[]
    {
        "lowercase",
        "decimaldigit",
        "arabic_normalization",
        new Dictionary<string, object> { ["type"] = "stemmer", ["language"] = "arabic" },
        new Dictionary<string, object> { ["type"] = "stop", ["stop_words"] = new[] { "_arabic_" } }
    }
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
      "stop_words": [
        "_arabic_"
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

此 Analyzer 执行以下处理步骤：

- **分词**：使用 `standard` 分词器将文本切分为词元。

- **数字规范化**：使用 `decimaldigit` 过滤器将阿拉伯-印度数字及其他 Unicode 十进制数字转换为 ASCII 数字。

- **阿拉伯语规范化**：使用 `arabic_normalization` 过滤器规范化 Alef 变体、Teh Marbuta 和 Alef Maksura，并移除 Harakat 变音符号和 Tatweel 延长符。

- **词干提取**：使用 `stemmer` 过滤器，并将 `language` 设置为 `arabic`。

- **移除停用词**：使用 `stop` 过滤器和内置的 `_arabic_` 词典。

定义 `analyzer_params` 后，在定义 Collection Schema 时，可以将该 Analyzer 应用于 `VARCHAR` 字段。有关详细信息，请参阅[使用示例](./analyzer-overview)。

## 示例\{#examples}

将 Analyzer 配置应用于 Collection Schema 前，请使用 `run_analyzer` 方法验证其行为。

### Analyzer 配置\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["type"] = "arabic"
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

### 使用 `run_analyzer` 验证\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;
import java.util.Arrays;
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

ctx := context.Background()

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

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;

using var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

var sampleText = "كِتَابٌ عـــربي ١٢٣";

var result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});
foreach (var r in result.Results)
{
    Console.WriteLine(string.Join(", ", r.Tokens.Select(t => t.Token)));
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export TOKEN="YOUR_CLUSTER_TOKEN"

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

### 预期输出\{#expected-output}

```plaintext
['كتاب', 'عرب', '123']
```
