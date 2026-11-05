---
title: "Jieba | BYOC"
slug: /jieba-tokenizer
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "jieba トークナイザーは、中国語のテキストを構成する単語に分割して処理します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-jieba-tokenizer
sidebar_label: "Jieba"
sidebar_position: 3
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/tokenizer/jieba-tokenizer.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

`jieba` トークナイザーは、中国語のテキストを構成する単語に分割して処理します。

<Admonition type="info" icon="📘" title="Notes">

`jieba` トークナイザーは、出力内の句読点を個別のトークンとして保持します。たとえば、`"你好！世界。"` は `["你好", "！", "世界", "。"]` になります。これらの単独の句読点トークンを削除するには、[`removepunct`](./remove-punct-filter) フィルターを使用します。

</Admonition>

## 設定\{#configuration}

Zilliz Cloud は、`jieba` トークナイザーに対して、シンプル設定とカスタム設定の 2 つの構成方法をサポートしています。

### シンプル設定\{#simple-configuration}

シンプル設定では、トークナイザーを `"jieba"` に設定するだけです。以下に例を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Simple configuration: only specifying the tokenizer name
analyzer_params = {
    "tokenizer": "jieba",  # Use the default settings: dict=["_default_"], mode="search", hmm=True
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "jieba"}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({"tokenizer": "jieba"});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Simple configuration: only specifying the tokenizer name
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = "jieba" // Use the default settings: dict=["_default_"], mode="search", hmm=True
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba"
}'
```

</TabItem>

</Tabs>

このシンプル設定は、以下のカスタム設定と同等です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Custom configuration equivalent to the simple configuration above
analyzer_params = {
    "tokenizer": {                 # Tokenizer configuration
        "type": "jieba",           # Tokenizer type, fixed as "jieba"
        "dict": ["_default_"],     # Use the default dictionary
        "mode": "search",          # Use search mode for improved recall (see mode details below)
        "hmm": True                # Enable HMM for probabilistic segmentation
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");
  put("dict", Collections.singletonList("_default_"));
  put("mode", "search");
  put("hmm", true);
}});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
  "tokenizer": map[string]any{
    "type": "jieba",
    "dict": []any{"_default_"},
    "mode": "search",
    "hmm":  true,
  },
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": {
        "type": "jieba",
        "dict": ["_default_"],
        "mode": "search",
        "hmm": true
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "jieba"},
        {"dict", {"_default_"}},
        {"mode", "search"},
        {"hmm", true}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: {
    type: "jieba",
    dict: ["_default_"],
    mode: "search",
    hmm: true,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Custom configuration equivalent to the simple configuration above
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object> // Tokenizer configuration
    {
        ["type"] = "jieba",               // Tokenizer type, fixed as "jieba"
        ["dict"] = new[] { "_default_" }, // Use the default dictionary
        ["mode"] = "search",              // Use search mode for improved recall (see mode details below)
        ["hmm"] = true                    // Enable HMM for probabilistic segmentation
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "jieba",
    "dict": ["_default_"],
    "mode": "search",
    "hmm": true
  }
}'
```

</TabItem>

</Tabs>

パラメーターの詳細については、[カスタム設定](./jieba-tokenizer#custom-configuration) を参照してください。

### カスタム設定\{#custom-configuration}

より詳細な制御を行うには、カスタム設定を指定できます。カスタム設定では、カスタム辞書の指定、セグメンテーションモードの選択、および隠れマルコフモデル（HMM）の有効化または無効化が可能です。以下に例を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Custom configuration with user-defined settings
analyzer_params = {
    "tokenizer": {
        "type": "jieba",           # Fixed tokenizer type
        "dict": ["customDictionary"],  # Custom dictionary list; replace with your own terms
        "mode": "exact",           # Use exact mode (non-overlapping tokens)
        "hmm": False               # Disable HMM; unmatched text will be split into individual characters
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");
  put("dict", Arrays.asList("customDictionary"));
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
  "tokenizer": map[string]any{
      "type": "jieba",
      "dict": []string{"customDictionary"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": {
        "type": "jieba",
        "dict": ["customDictionary"],
        "mode": "exact",
        "hmm": false
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
  {"tokenizer", {
      {"type", "jieba"},
      {"dict", {"customDictionary"}},
      {"mode", "exact"},
      {"hmm", false}
  }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: {
    type: "jieba",
    dict: ["customDictionary"],
    mode: "exact",
    hmm: false,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Custom configuration with user-defined settings
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "jieba",                  // Fixed tokenizer type
        ["dict"] = new[] { "customDictionary" }, // Custom dictionary list; replace with your own terms
        ["mode"] = "exact",                  // Use exact mode (non-overlapping tokens)
        ["hmm"] = false                      // Disable HMM; unmatched text will be split into individual characters
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "jieba",
    "dict": ["customDictionary"],
    "mode": "exact",
    "hmm": false
  }
}'
```

</TabItem>

</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
     <th><p>デフォルト値</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>トークナイザーのタイプです。これは <code>"jieba"</code> に固定されています。</p></td>
     <td><p><code>"jieba"</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>アナライザーが語彙のソースとして読み込む辞書のリストです。組み込みオプションは以下のとおりです。</p><ul><li><p><code>"_default_"</code>: エンジンに組み込まれている簡体字中国語辞書を読み込みます。詳細については、<a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a> を参照してください。</p></li><li><p><code>"_extend_default_"</code>: <code>"_default_"</code> 内のすべてに加えて、繁体字中国語の補足辞書を読み込みます。詳細については、<a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a> を参照してください。</p><p>組み込み辞書を任意の数のカスタム辞書と組み合わせることもできます。例：<code>["_default_", "结巴分词器"]</code>。</p></li></ul></td>
     <td><p><code>["_default_"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>セグメンテーションモードです。指定できる値は以下のとおりです。</p><ul><li><p><code>"exact"</code>: 文を可能な限り正確に分割しようとするため、テキスト分析に適しています。</p></li><li><p><code>"search"</code>: exact モードを基に、長い単語をさらに分割して再現率を向上させるため、検索エンジンのトークン化に適しています。</p><p>詳細については、<a href="https://github.com/fxsjy/jieba">Jieba GitHub Project</a> を参照してください。</p></li></ul></td>
     <td><p><code>"search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>辞書に見つからない単語を確率的に分割するために、隠れマルコフモデル（HMM）を有効にするかどうかを示すブール値のフラグです。</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

`analyzer_params` を定義した後、コレクションスキーマを定義する際に、それらを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

{/* This section is published to both Cloud manuals, so the heading stays product-neutral. */}

## 例\{#examples}

アナライザーの設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザーの設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": False
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");
  put("dict", Arrays.asList("结巴分词器"));
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
  "tokenizer": map[string]any{
      "type": "jieba",
      "dict": []string{"结巴分词器"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": false
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
  {"tokenizer", {
      {"type", "jieba"},
      {"dict", {"结巴分词器"}},
      {"mode", "exact"},
      {"hmm", false}
  }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
  tokenizer: {
    type: "jieba",
    dict: ["结巴分词器"],
    mode: "exact",
    hmm: false,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "jieba",
        ["dict"] = new[] { "结巴分词器" },
        ["mode"] = "exact",
        ["hmm"] = false
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "jieba",
    "dict": ["结巴分词器"],
    "mode": "exact",
    "hmm": false
  }
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
sample_text = "milvus结巴分词器中文测试"

# Run the jieba tokenizer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Jieba analyzer output:", result)
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
texts.add("milvus结巴分词器中文测试");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();

for (RunAnalyzerResp.AnalyzerResult result : results) {
    for (RunAnalyzerResp.AnalyzerToken token : result.getTokens()) {
        System.out.println("Jieba analyzer output: " + token.getToken());
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

texts := []string{"milvus结巴分词器中文测试"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, r := range result {
    for _, token := range r.Tokens {
        fmt.Println("Jieba analyzer output:", token.Text)
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
            .texts(["milvus结巴分词器中文测试"])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;

for result in response.results() {
    for token in result.get_tokens() {
        println!("Jieba analyzer output: {}", token.get_text());
    }
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

std::string text = "milvus结巴分词器中文测试";
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
        std::cout << "Jieba analyzer output: " << token.token_ << std::endl;
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

const sample_text = 'milvus结巴分词器中文测试';
const result = await client.runAnalyzer({
  text: sample_text,
  analyzer_params,
});
const tokens = result.results.flatMap(r => r.tokens.map(t => t.token));
console.log('Jieba analyzer output:', tokens);
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
var sampleText = "milvus结巴分词器中文测试";

// Run the jieba tokenizer with the defined configuration
RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});

foreach (AnalyzerResult r in result.Results)
{
    foreach (AnalyzerToken t in r.Tokens)
    {
        Console.WriteLine($"Jieba analyzer output: {t.Token}");
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
    "text": ["milvus结巴分词器中文测试"],
    "analyzerParams": "{\"tokenizer\":{\"type\":\"jieba\",\"dict\":[\"结巴分词器\"],\"mode\":\"exact\",\"hmm\":false}}"
  }'
```

</TabItem>

</Tabs>

### 期待される出力\{#expected-output}

サンプルテキストに対して、アナライザーは次のトークンを順に生成します。SDK のレスポンスオブジェクトと出力形式は言語によって異なります。REST レスポンスでは、これらのトークンは `data.results[].tokens[].token` に含まれます。

```plaintext
['milvus', '结巴分词器', '中', '文', '测', '试']
```
