---
title: "Whitespace | BYOC"
slug: /whitespace-tokenizer
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "whitespace トークナイザーは、タブ、ラインフィード、フォームフィード、キャリッジリターン、スペースの 5 つの ASCII 空白文字でテキストを分割します。 | BYOC"
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

`whitespace` トークナイザーは、タブ、ラインフィード、フォームフィード、キャリッジリターン、スペースの 5 つの ASCII 空白文字でテキストを分割します。

## トークン化ルール\{#tokenization-rules}

`whitespace` トークナイザーは、次の 5 つの ASCII 空白文字でのみテキストを分割します。

| 文字 | 名前 | Unicode コードポイント |
| --- | --- | --- |
| `\t` | 水平タブ | U+0009 |
| `\n` | ラインフィード | U+000A |
| `\x0C` or `\f` | フォームフィード | U+000C |
| `\r` | キャリッジリターン | U+000D |
| `' '` | スペース | U+0020 |

これらの区切り文字は破棄され、連続する区切り文字から空のトークンは生成されません。句読点やその他の文字はトークン内に残ります。特に、垂直タブ（`\x0B`、U+000B）、非改行スペース（`\u00A0`）、および全角スペース（`\u3000`）では分割されません。

このセットは Rust の [`char::is_ascii_whitespace()`](https://doc.rust-lang.org/std/primitive.char.html#method.is_ascii_whitespace) に従っており、他の Unicode 空白文字は除外されます。

次の例では、フィルターを指定せずに `{"tokenizer": "whitespace"}` を使用します。入力と出力では Python の文字列表記を使用しており、`\t` や `\u00A0` などのエスケープシーケンスは実際の文字を表します。

| 入力 | 出力トークン |
| --- | --- |
| `"a\tb\nc\x0Cd\re f"` | `["a", "b", "c", "d", "e", "f"]` |
| `"Hello,World! foo_bar"` | `["Hello,World!", "foo_bar"]` |
| `"a\x0Bb"` | `["a\x0Bb"]` |
| `"a\u00A0b"` | `["a\u00A0b"]` |
| `"a\u3000b"` | `["a\u3000b"]` |
| `" a  b "` | `["a", "b"]` |

## 構成\{#configuration}

`whitespace` トークナイザーを使用するアナライザーを構成するには、`analyzer_params` で `tokenizer` を `whitespace` に設定します。

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

whitespace トークナイザーは、1 つ以上のフィルターと組み合わせて使用できます。たとえば、次のコードは、`whitespace` トークナイザーと [小文字フィルター](./lowercase-filter) を使用するアナライザーを定義します。

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

`analyzer_params` を定義したら、コレクションスキーマを定義するときにそれを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを実行できます。詳細は、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を検証してください。選択した言語の検証例では、以下の構成を使用します。

### アナライザー構成\{#analyzer-configuration}

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

### 期待される出力\{#expected-output}

サンプルテキストに対して、アナライザーは次のトークンを順番に生成します。SDK の応答オブジェクトと出力形式は言語によって異なります。REST 応答には、これらのトークンが `data.results[].tokens[].token` に含まれます。

```plaintext
['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale!']
```
