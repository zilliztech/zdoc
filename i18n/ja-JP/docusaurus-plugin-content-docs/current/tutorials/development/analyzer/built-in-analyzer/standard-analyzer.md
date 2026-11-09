---
title: "Standard アナライザー | Cloud"
slug: /standard-analyzer
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "standard アナライザーは Zilliz Cloud のデフォルトのアナライザーであり、アナライザーを指定しない場合はテキストフィールドに自動的に適用されます。standard トークナイザーと lowercase フィルターを組み合わせています。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-standard-analyzer
sidebar_label: "標準"
sidebar_position: 1
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/analyzer/standard-analyzer.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Standard アナライザー

`standard` アナライザーは Zilliz Cloud のデフォルトのアナライザーであり、アナライザーが指定されていない場合はテキストフィールドに自動的に適用されます。standard トークナイザーと lowercase フィルターを組み合わせています。

<Admonition type="info" icon="📘" title="Notes">

`standard` アナライザーは、単語の境界を区切るために区切り文字（スペースや句読点など）を使用する言語に適しています。ただし、中国語、アラビア語、タイ語、日本語、韓国語などの言語では、言語固有のトークン化または正規化が必要です。そのような場合は、[`chinese`](./chinese-analyzer)、[`arabic`](./arabic-analyzer)、[`thai`](./thai-analyzer) などの言語固有のアナライザー、または [`lindera`](./lindera-tokenizer) や [`icu`](./icu-tokenizer) などの特化したトークナイザーを備えたカスタムアナライザーを使用してください。

</Admonition>

## 定義\{#definition}

`standard` アナライザーは、次のコンポーネントで構成されています。

- **Tokenizer**: `standard` トークナイザーを使用して、連続する Unicode 文字と数字をトークンに保持し、その他の文字で分割します。正確な文字規則については、[Standard Tokenizer](./standard-tokenizer#tokenization-rules) を参照してください。

- **Filter**: `lowercase` フィルターを使用してすべてのトークンを小文字に変換し、大文字と小文字を区別しない検索を可能にします。詳細については、[Lowercase](./lowercase-filter) を参照してください。

`standard` アナライザーの機能は、次のカスタムアナライザー構成と同等です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": ["lowercase"]
});
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <milvus/thirdparty/nlohmann/json.hpp>

nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"lowercase"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "standard",
    ["filter"] = new[] { "lowercase" }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "lowercase"
  ]
}'
```

</TabItem>

</Tabs>

## 設定\{#configuration}

`standard` アナライザーをフィールドに適用するには、`analyzer_params` で `type` を `standard` に設定し、必要に応じてオプションパラメーターを含めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Specifies the standard analyzer type
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "standard"}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "standard"
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
    {"type", "standard"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Specifies the standard analyzer type
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["type"] = "standard" // Specifies the standard analyzer type
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard"
}'
```

</TabItem>

</Tabs>

`standard` アナライザーは、次のオプションパラメーターを受け付けます。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>トークン化から削除されるストップワードのリストを含む配列です。受け入れられる値については、<a href="./stop-filter">Stop</a> を参照してください。</p></td>
   </tr>
</table>

カスタムストップワードの設定例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Specifies the standard analyzer type
    "stop_words": ["of"] # Optional: List of words to exclude from tokenization
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Collections.singletonList("of"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "standard", "stop_words": []string{"of"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "standard",
    "stop_words": ["of"]
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
    {"type", "standard"},
    {"stop_words", {"of"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Specifies the standard analyzer type
    "stop_words": ["of"] // Optional: List of words to exclude from tokenization
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["type"] = "standard", // Specifies the standard analyzer type
    ["stop_words"] = new[] { "of" } // Optional: List of words to exclude from tokenization
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard",
  "stop_words": [
    "of"
  ]
}'
```

</TabItem>

</Tabs>

`analyzer_params` を定義した後、コレクションスキーマを定義する際に、これらを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定したアナライザーを使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを実行できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard",  # Standard analyzer configuration
    "stop_words": ["for"] # Optional: Custom stop words parameter
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Collections.singletonList("for"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "standard", "stop_words": []string{"for"}}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "type": "standard",
    "stop_words": ["for"]
});
```

</TabItem>

<TabItem value='c++'>

```cpp
nlohmann::json analyzer_params = {
    {"type", "standard"},
    {"stop_words", {"for"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Standard analyzer configuration
    "stop_words": ["for"] // Optional: Custom stop words parameter
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["type"] = "standard", // Standard analyzer configuration
    ["stop_words"] = new[] { "for" } // Optional: Custom stop words parameter
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard",
  "stop_words": [
    "for"
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

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
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
        System.out.println("Standard analyzer output: " + token.getToken());
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
    fmt.Println(err.Error())
    // handle error
}

texts := []string{"The Milvus vector database is built for scale!"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, r := range result {
    for _, token := range r.Tokens {
        fmt.Println("Standard analyzer output:", token.Text)
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
        println!("Standard analyzer output: {}", token.get_text());
    }
}
```

</TabItem>

<TabItem value='c++'>

```cpp
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "The Milvus vector database is built for scale!";
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
        std::cout << "Standard analyzer output: " << token.token_ << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const sample_text = 'The Milvus vector database is built for scale!';
const result = await client.runAnalyzer({
  text: sample_text,
  analyzer_params,
});
const tokens = result.results.flatMap(r => r.tokens.map(t => t.token));
console.log('Standard analyzer output:', tokens);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Responses.Utility;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

// Sample text to analyze
var sampleText = "The Milvus vector database is built for scale!";

// Run the standard analyzer with the defined configuration
RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});

foreach (AnalyzerResult r in result.Results)
{
    foreach (AnalyzerToken t in r.Tokens)
    {
        Console.WriteLine($"Standard analyzer output: {t.Token}");
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
    "analyzerParams": "{\"type\": \"standard\", \"stop_words\": [\"for\"]}",
    "text": ["The Milvus vector database is built for scale!"]
  }'
```

</TabItem>

</Tabs>

### 期待される出力\{#expected-output}

サンプルテキストに対して、アナライザーは次のトークンを順番に生成します。SDK の応答オブジェクトと出力形式は言語によって異なります。REST 応答では、これらのトークンが `data.results[].tokens[].token` に含まれています。

```plaintext
['the', 'milvus', 'vector', 'database', 'is', 'built', 'scale']
```
