---
title: "泰语 Analyzer | Cloud"
slug: /thai-analyzer
sidebar_label: "泰语 Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`thai` 分析器是一款用于处理泰语文本的内置分析器。当您需要 Zilliz Cloud 对泰语文本进行分词、规范化泰文数字、将混合文本中的拉丁字母转换为小写，以及移除泰语停用词时，可使用此分析器。 | Cloud"
type: origin
token: QWPqwmppOiIPhEkLAEXcZKMznlh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 泰语 Analyzer

`thai` 分析器是一款用于处理泰语文本的内置分析器。当您需要 Zilliz Cloud 对泰语文本进行分词、规范化泰文数字、将混合文本中的拉丁字母转换为小写，以及移除泰语停用词时，可使用此分析器。

## 配置\{#configuration}

内置分析器是由 Milvus 提供的分析器模板。要使用内置分析器，请在 `analyzer_params` 中将 `type` 设置为预定义的分析器名称。

要使用内置的泰语分析器，请将 `type` 设置为 `thai`：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["type"] = "thai"
};
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

`thai` 分析器接受以下可选参数：

| **参数** | **类型** | **默认值** | **说明** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_thai_` | 要在分词时额外移除的停用词列表。默认情况下，`thai` 分析器使用内置的 `_thai_` 词典。要查看默认词典，请参阅 Zilliz Cloud 的[泰语停用词列表](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/thai.txt)。该列表来源于 Apache Lucene 的[泰语停用词文件](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/th/stopwords.txt)。 |

要添加自定义停用词，请添加 `stop_words`：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["type"] = "thai",
    ["stop_words"] = new List<object> { "มิลวัส" }
};
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

除内置的 `_thai_` 词典外，Zilliz Cloud 还会应用自定义停用词。

内置的 `thai` 分析器等同于以下自定义分析器配置：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "thai",
    ["filter"] = new List<object>
    {
        "lowercase",
        "decimaldigit",
        new Dictionary<string, object>
        {
            ["type"] = "stop",
            ["stop_words"] = new List<object> { "_thai_" }
        }
    }
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

此分析器执行以下处理步骤：

- **分词**：使用 `thai` 分词器将泰语文本切分为词元，无需依赖空格。该分词器会过滤掉仅包含空白字符或标点符号的片段。有关详细信息，请参阅[泰语 Analyzer](./thai-analyzer)。

- **大小写规范化**：使用 `lowercase` 过滤器，该过滤器会处理泰语和英语混合文本中的拉丁字母。

- **数字规范化**：使用 `decimaldigit` 过滤器，将泰文数字和其他 Unicode 十进制数字转换为 ASCII 数字。

- **移除停用词**：使用 `stop` 过滤器和内置的 `_thai_` 词典。

- **不进行词干提取**：内置的 `thai` 分析器不应用 `stemmer` 过滤器。

定义 `analyzer_params` 后，您可以在定义 Collection Schema 时，将该分析器应用于 `VARCHAR` 字段。有关详细信息，请参阅[使用示例](./analyzer-overview)。

## 示例\{#examples}

将分析器配置应用于 Collection Schema 前，请使用 `run_analyzer` 方法验证其行为。

### Analyzer 配置\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["type"] = "thai"
};
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

### 使用 `run_analyzer` 验证\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.Collections;
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

ctx := context.Background()

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

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Responses.Utility;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

string sampleText = "ฉันรักการค้นหาข้อความใน Milvus ๑๒๓";

RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = [sampleText]
});

foreach (AnalyzerToken t in result.Results.SelectMany(r => r.Tokens))
{
    Console.WriteLine(t.Token);
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
    "analyzerParams": "{\"type\": \"thai\"}",
    "text": ["ฉันรักการค้นหาข้อความใน Milvus ๑๒๓"]
  }'
```

</TabItem>
</Tabs>

### 预期输出\{#expected-output}

```plaintext
['ฉัน', 'รัก', 'ค้นหา', 'ข้อความ', 'milvus', '123']
```
