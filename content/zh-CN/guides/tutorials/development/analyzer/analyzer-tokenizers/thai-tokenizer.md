---
title: "泰语分词器 | Cloud"
slug: /thai-tokenizer
sidebar_label: "泰语分词器"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`thai` 分词器无需依赖空格即可将泰语文本切分为词元。当您需要为泰语文本或泰语/英语混合文本构建自定义 Analyzer 管道时，请使用此分词器。 | Cloud"
type: origin
token: QBsRwmVohirAJWkD0PgcBsILn6X
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 泰语分词器

`thai` 分词器无需依赖空格即可将泰语文本切分为词元。当您需要为泰语文本或泰语/英语混合文本构建自定义 Analyzer 管道时，请使用此分词器。

## 配置\{#configuration}

<Admonition type="info" title="说明">

对于泰语文本，大多数情况下应使用内置的 `thai` Analyzer。内置 Analyzer 将此分词器与小写转换、十进制数字规范化和泰语停用词移除功能组合使用。只有在需要构建自定义 Analyzer 管道时，才应直接使用 `thai` 分词器。有关详细信息，请参阅[泰语 Analyzer](./thai-analyzer)。

</Admonition>

要使用 `thai` 分词器配置 Analyzer，请在 `analyzer_params` 中将 `tokenizer` 设置为 `thai`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "thai"
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

`thai` 分词器没有可配置参数。

该分词器可与一个或多个过滤器配合使用。例如，以下配置将 `thai` 分词器与 `lowercase` 和 `decimaldigit` 过滤器搭配使用：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "thai",
    ["filter"] = new List<object> { "lowercase", "decimaldigit" }
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

此自定义管道不等同于内置的 `thai` Analyzer，因为它不包含内置的 `_thai_` 停用词词典。要使用完整的预定义管道，请指定 `{"type": "thai"}`。

该分词器具有以下行为：

- **泰语分词**：无需依赖空白字符，将泰语文本切分为词元。

- **空白字符和标点符号过滤**：过滤掉仅含空白字符或标点符号的片段。这与 `icu` 分词器不同，后者可以将标点符号和空格保留为词元。

- **混合文字文本**：在泰语/英语混合文本中输出拉丁字母单词词元。

- **仅分词器**：不将词元转为小写、不规范化 Unicode 数字，也不移除停用词。如需执行这些步骤，请添加过滤器或使用内置的 `thai` Analyzer。

- **位置语义**：采用基于字符的词元位置，并计入跳过的空白字符和标点符号，从而使短语匹配和邻近匹配行为与其他非拉丁文字分词器保持一致。

定义 `analyzer_params` 后，在定义 Collection Schema 时，可以将该 Analyzer 应用于 `VARCHAR` 字段。有关详细信息，请参阅[使用示例](./analyzer-overview)。

## 示例\{#examples}

将 Analyzer 配置应用于 Collection Schema 前，请使用 `run_analyzer` 方法验证其行为。

### Analyzer 配置\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "thai"
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

### 使用 `run_analyzer` 验证\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Responses.Utility;
using Milvus.Client.V2.Types;
using System.Collections.Generic;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

string sampleText = "สวัสดี! ทดสอบ, ระบบ Milvus ๑๒๓";

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
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export TOKEN="YOUR_CLUSTER_TOKEN"

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

### 预期输出\{#expected-output}

```plaintext
['สวัสดี', 'ทดสอบ', 'ระบบ', 'Milvus', '๑๒๓']
```
