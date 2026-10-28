---
title: "句読点の削除 | Cloud"
slug: /remove-punct-filter
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "removepunct フィルターは、句読点または空白を含むトークンを削除します。単語内の句読点を保持するトークナイザーでは、影響を受けるトークン全体を削除します。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-remove-punct-filter
sidebar_label: "句読点の削除"
sidebar_position: 11
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/filter/removepunct-filter.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 句読点の削除

`removepunct` フィルターは、トークンストリームから句読点または空白を含むトークンを削除します。句読点ではなく意味のある内容語に焦点を当てた、よりクリーンなテキスト処理を行う場合に使用します。

<Admonition type="info" icon="📘" title="Notes">

このフィルターは、句読点を個別のトークンとして保持する `jieba`、`lindera`、`icu` の各トークナイザーと組み合わせると最も効果的です（例：`"Hello!"` → `["Hello", "!"]`）。`standard` トークナイザーは、トークン化の際に句読点を破棄します。`whitespace` トークナイザーは、トークン内の句読点を含め、句読点を保持します。`whitespace` と組み合わせた場合、`removepunct` は、トークンに句読点または空白が含まれているとトークン全体を削除しますが、トークンから個々の文字を削除するわけではありません。

</Admonition>

## 設定\{#configuration}

`removepunct` フィルターは Zilliz Cloud に組み込まれています。使用するには、`analyzer_params` 内の `filter` セクションでその名前を指定するだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["removepunct"]
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("removepunct"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "jieba", "filter": []any{"removepunct"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": ["removepunct"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"removepunct"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["removepunct"],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "jieba",
    ["filter"] = new[] { "removepunct" }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": [
    "removepunct"
  ]
}'
```

</TabItem>

</Tabs>

`removepunct` フィルターはトークナイザーによって生成された各タームを処理するため、トークナイザーと組み合わせて使用する必要があります。

`analyzer_params` を定義したら、コレクションスキーマを定義する際に、それを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[Example use](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を検証します。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["removepunct"]
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
analyzerParams.put("filter", Collections.singletonList("removepunct"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "icu", "filter": []string{"removepunct"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "icu",
    "filter": ["removepunct"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "icu"},
    {"filter", {"removepunct"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "icu",
    "filter": ["removepunct"],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "icu",
    ["filter"] = new[] { "removepunct" }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "icu",
  "filter": [
    "removepunct"
  ]
}'
```

</TabItem>

</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

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
sample_text = "Привет! Как дела?"

# Run the analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
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
texts.add("Привет! Как дела?");

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

texts := []string{"Привет! Как дела?"}
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
use serde_json::json;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let text = "Привет! Как дела?";

let response = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts([text])
            .analyzer_params(json!({"tokenizer": "icu", "filter": ["removepunct"]}))
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
#include <iostream>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "Привет! Как дела?";
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

const sampleText = "Привет! Как дела?";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const result = await client.runAnalyzer({
  analyzer_params: analyzer_params,
  text: sampleText,
});

console.log("Analyzer output:", result);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Types;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Responses.Utility;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

// Sample text to analyze
string sampleText = "Привет! Как дела?";

// Run the analyzer with the defined configuration
RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    Texts = [sampleText],
    AnalyzerParams = analyzerParams
});
Console.WriteLine($"Analyzer output: {result}");
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -d '{
    "analyzerParams": "{\"tokenizer\": \"icu\", \"filter\": [\"removepunct\"]}",
    "text": ["Привет! Как дела?"]
  }'
```

</TabItem>

</Tabs>

### 期待される出力\{#expected-output}

```plaintext
['Привет', 'Как', 'дела']
```
