---
title: "アラビア語 | BYOC"
slug: /arabic-analyzer
sidebar_label: "アラビア語"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`arabic` アナライザーは、アラビア語テキスト用の組み込みアナライザーです。Zilliz Cloud でアラビア語の文字バリアントを正規化し、発音区別符号とタトウィールを削除し、アラビア・インド数字を変換し、アラビア語のステミングを適用し、アラビア語のストップワードを削除する必要がある場合に使用します。 | BYOC"
type: origin
token: BgS6wjwgiiYARGkHlNccfdqznKF
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# アラビア語

`arabic` アナライザーは、アラビア語テキスト用の組み込みアナライザーです。Zilliz Cloud でアラビア語の文字バリアントを正規化し、発音区別符号とタトウィールを削除し、アラビア・インド数字を変換し、アラビア語のステミングを適用し、アラビア語のストップワードを削除する必要がある場合に使用します。

## 設定\{#configuration}

組み込みアナライザーは、Milvus が提供するアナライザーテンプレートです。組み込みアナライザーを使用するには、`analyzer_params` で `type` を事前定義されたアナライザー名に設定します。

組み込みのアラビア語アナライザーを使用するには、`type` を `arabic` に設定します。

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
import java.util.HashMap;
import java.util.Map;

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
using System.Collections.Generic;

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

`arabic` アナライザーは、次のオプションのパラメーターを受け入れます。

| **パラメーター** | **タイプ** | **デフォルト** | **説明** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_arabic_` | トークン化から削除する追加のストップワードのリストです。デフォルトでは、`arabic` アナライザーは組み込みの `_arabic_` 辞書を使用します。デフォルトの辞書を確認するには、[アラビア語のストップワードリスト](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/arabic.txt) を参照してください。このリストは、Apache Lucene の [アラビア語のストップワードファイル](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/ar/stopwords.txt) から取得されています。 |

カスタムのストップワードを追加するには、`stop_words` を含めます。

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
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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
using System.Collections.Generic;

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

Zilliz Cloud は、組み込みの `_arabic_` 辞書に加えて、カスタムのストップワードを適用します。

組み込みの `arabic` アナライザーは、次のカスタムアナライザー設定と同等です。

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
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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
                {{"type", "stop"}, {"stop_words", "_arabic_"}}}},
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
using System.Collections.Generic;

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
      "stop_words": "_arabic_"
    }
  ]
}'
```

</TabItem>
</Tabs>

このアナライザーは、次の処理ステップを適用します。

- **トークン化**: `standard` トークナイザーを使用して、テキストをトークンに分割します。

- **数字の正規化**: `decimaldigit` フィルターを使用して、アラビア・インド数字およびその他の Unicode 10 進数字を ASCII 数字に変換します。

- **アラビア語の正規化**: `arabic_normalization` フィルターを使用して、アリフのバリアント、テー・マルブータ、アリフ・マクスーラを正規化し、ハラカートとタトウィールを削除します。

- **ステミング**: `language` を `arabic` に設定して `stemmer` フィルターを使用します。

- **ストップワードの削除**: 組み込みの `_arabic_` 辞書で `stop` フィルターを使用します。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に、アナライザーを `VARCHAR` フィールドに適用できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

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
import java.util.HashMap;
import java.util.Map;

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
using System.Collections.Generic;

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

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

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

### 期待される出力\{#expected-output}

```plaintext
['كتاب', 'عرب', '123']
```
