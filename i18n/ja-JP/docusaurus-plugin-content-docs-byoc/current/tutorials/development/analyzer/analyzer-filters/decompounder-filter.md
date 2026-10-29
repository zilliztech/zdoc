---
title: "Decompounder | BYOC"
slug: /decompounder-filter
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`decompounder` フィルターは、指定した辞書に基づいて複合語を個々の構成要素に分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語のように複合語を頻繁に使用する言語で特に役立ちます。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-decompounder-filter
sidebar_label: "Decompounder"
sidebar_position: 9
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/filter/decompounder-filter.md"

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decompounder

`decompounder` フィルターは、指定した辞書に基づいて複合語を個々の構成要素に分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語のように複合語を頻繁に使用する言語で特に役立ちます。

## 構成\{#configuration}

`decompounder` フィルターは Zilliz Cloud のカスタムフィルターです。これを使用するには、フィルター構成で `"type": "decompounder"` を指定し、認識する単語構成要素の辞書を提供する `word_list` パラメーターを指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", # Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "decompounder");
                    put("word_list", Arrays.asList("dampf", "schiff", "fahrt", "brot", "backen", "automat"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "decompounder",
        "word_list": []string{"dampf", "schiff", "fahrt", "brot", "backen", "automat"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "decompounder",
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "decompounder"},
            {"word_list", {"dampf", "schiff", "fahrt", "brot", "backen", "automat"}}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", // Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "standard",
    ["filter"] = new object[]
    {
        new Dictionary<string, object>
        {
            ["type"] = "decompounder", // Specifies the filter type as decompounder
            ["word_list"] = new[] { "dampf", "schiff", "fahrt", "brot", "backen", "automat" }
        }
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
    {
      "type": "decompounder",
      "word_list": [
        "dampf",
        "schiff",
        "fahrt",
        "brot",
        "backen",
        "automat"
      ]
    }
  ]
}'
```

</TabItem>

</Tabs>

`decompounder` フィルターでは、次の構成可能なパラメーターを使用できます。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>word_list</code></p></td>
     <td><p>複合語を分割するために使用する単語構成要素のリストです。この辞書によって、複合語が個々の用語に分解される方法が決まります。</p></td>
   </tr>
</table>

`decompounder` フィルターはトークナイザーによって生成された用語に対して動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloud で使用できるトークナイザーの一覧については、[Standard Tokenizer](./standard-tokenizer) およびその関連ページを参照してください。

`analyzer_params` を定義したら、コレクションスキーマを定義するときにそれを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定したアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[Example use](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", # Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "decompounder");
                    put("word_list", Arrays.asList("dampf", "schiff", "fahrt", "brot", "backen", "automat"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "decompounder",
        "word_list": []string{"dampf", "schiff", "fahrt", "brot", "backen", "automat"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "decompounder",
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "decompounder"},
            {"word_list", {"dampf", "schiff", "fahrt", "brot", "backen", "automat"}}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", // Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "standard",
    ["filter"] = new object[]
    {
        new Dictionary<string, object>
        {
            ["type"] = "decompounder", // Specifies the filter type as decompounder
            ["word_list"] = new[] { "dampf", "schiff", "fahrt", "brot", "backen", "automat" }
        }
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
    {
      "type": "decompounder",
      "word_list": [
        "dampf",
        "schiff",
        "fahrt",
        "brot",
        "backen",
        "automat"
      ]
    }
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

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# Sample text to analyze
sample_text = "dampfschifffahrt brotbackautomat"

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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("dampfschifffahrt brotbackautomat");

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
texts := []string{"dampfschifffahrt brotbackautomat"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParamsStr(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(result)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;
use serde_json::json;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "decompounder",
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"]
    }]
});

let result = client.run_analyzer(
    RunAnalyzerRequest::builder()
        .texts(["dampfschifffahrt brotbackautomat".to_string()])
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

std::string text = "dampfschifffahrt brotbackautomat";
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
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

const res = await client.runAnalyzer({
  text: 'dampfschifffahrt brotbackautomat',
  analyzer_params: analyzer_params
});

console.log(res);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig { Uri = "YOUR_CLUSTER_ENDPOINT", ApiKey = "YOUR_CLUSTER_TOKEN" });
await client.ConnectAsync();

// Sample text to analyze
var sampleText = "dampfschifffahrt brotbackautomat";

var result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});
foreach (var r in result.Results)
{
    Console.WriteLine("Analyzer output: " + string.Join(", ", r.Tokens.Select(t => t.Token)));
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[{\"type\":\"decompounder\",\"word_list\":[\"dampf\",\"schiff\",\"fahrt\",\"brot\",\"backen\",\"automat\"]}]}",
    "text": ["dampfschifffahrt brotbackautomat"]
  }'
```

</TabItem>

</Tabs>

### 期待される出力\{#expected-output}

```python
['dampf', 'schiff', 'fahrt', 'brotbackautomat']
```
