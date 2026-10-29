---
title: "Stop | Cloud"
slug: /stop-filter
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "分析中にトークン化されたテキストから設定済みのストップワードを削除するには、stop フィルターを使用します。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-stop-filter
sidebar_label: "Stop"
sidebar_position: 8
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/filter/stop-filter.md"

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stop

`stop` フィルターは、トークン化されたテキストから指定したストップワードを削除し、一般的で意味の薄い単語を排除するのに役立ちます。`stop_words` パラメーターを使用してストップワードのリストを設定できます。

## 構成\{#configuration}


インラインリストで `stop` フィルターを使用するには、フィルター構成で `"type": "stop"` を指定し、ストップワードのリストを提供する `stop_words` パラメーターを併せて指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stop", # Specifies the filter type as stop
        "stop_words": ["of", "to", "_english_"], # Defines custom stop words and includes the English stop word list
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
                    put("type", "stop");
                    put("stop_words", Arrays.asList("of", "to", "_english_"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "stop",
        "stop_words": ["of", "to", "_english_"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "stop"}, {"stop_words", {"of", "to", "_english_"}}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    tokenizer: "standard",
    filter: [{
        type: "stop",  // Specifies the filter type as stop
        stop_words: ["of", "to", "_english_"],  // Custom stop words + built-in English list
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "standard",
    ["filter"] = new List<object>
    {
        new Dictionary<string, object>
        {
            ["type"] = "stop", // Specifies the filter type as stop
            ["stop_words"] = new List<object> { "of", "to", "_english_" } // Defines custom stop words and includes the English stop word list
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
      "type": "stop",
      "stop_words": [
        "of",
        "to",
        "_english_"
      ]
    }
  ]
}'
```

</TabItem>

</Tabs>

`stop` フィルターは、以下の構成可能なパラメーターを受け取ります。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>トークン化から削除する単語のリストです。デフォルトでは、フィルターは組み込みの <code>_english_</code> 辞書を使用します。上書きまたは拡張するには、次の 3 つの方法があります：</p><ul><li><p><strong>組み込み辞書</strong> – 定義済みの辞書を使用するには、次のいずれかの言語エイリアスを指定します：</p><p><code>"_arabic_"</code>, <code>"_english_"</code>, <code>"_danish_"</code>, <code>"_dutch_"</code>, <code>"_finnish_"</code>, <code>"_french_"</code>, <code>"_german_"</code>, <code>"_hungarian_"</code>, <code>"_italian_"</code>, <code>"_norwegian_"</code>, <code>"_portuguese_"</code>, <code>"_russian_"</code>, <code>"_spanish_"</code>, <code>"_swedish_"</code>, <code>"_thai_"</code></p></li><li><p><strong>カスタムリスト</strong> – 独自の用語の配列を渡します（例：<code>["foo", "bar", "baz"]</code>）。</p></li><li><p><strong>混合リスト</strong> – エイリアスとカスタム用語を組み合わせます（例：<code>["of", "to", "_english_"]</code>）。</p><p>各定義済み辞書の正確な内容については、<a href="https://github.com/milvus-io/milvus/blob/master/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words.rs">stop_words</a> を参照してください。アラビア語またはタイ語の辞書を確認するには、<a href="https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/arabic.txt">Arabic stop-word list</a> または <a href="https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/thai.txt">Thai stop-word list</a> を参照してください。</p></li></ul></td>
   </tr>
</table>

`stop` フィルターはトークナイザーが生成した用語に対して動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloud で利用可能なトークナイザーの一覧については、[Standard Tokenizer](./standard-tokenizer) およびその関連ページを参照してください。

`analyzer_params` を定義した後、コレクションスキーマを定義するときにそれを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定したアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。


## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を検証します。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stop", # Specifies the filter type as stop
        "stop_words": ["of", "to", "_english_"], # Defines custom stop words and includes the English stop word list
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
                    put("type", "stop");
                    put("stop_words", Arrays.asList("of", "to", "_english_"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "stop",
        "stop_words": ["of", "to", "_english_"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "stop"}, {"stop_words", {"of", "to", "_english_"}}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    tokenizer: "standard",
    filter: [{
        type: "stop",  // Specifies the filter type as stop
        stop_words: ["of", "to", "_english_"],  // Custom stop words + built-in English list
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "standard",
    ["filter"] = new List<object>
    {
        new Dictionary<string, object>
        {
            ["type"] = "stop", // Specifies the filter type as stop
            ["stop_words"] = new List<object> { "of", "to", "_english_" } // Defines custom stop words and includes the English stop word list
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
      "type": "stop",
      "stop_words": [
        "of",
        "to",
        "_english_"
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
sample_text = "The stop filter allows control over common stop words for text processing."

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
texts.add("The stop filter allows control over common stop words for text processing.");

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

texts := []string{"The stop filter allows control over common stop words for text processing."}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

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
use milvus::v2::prelude::*;
use serde_json::json;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "stop",
        "stop_words": ["of", "to", "_english_"]
    }]
});
let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec!["The stop filter allows control over common stop words for text processing."])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
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

std::string text = "The stop filter allows control over common stop words for text processing.";
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

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN",
});

const sample_text = "The stop filter allows control over common stop words for text processing.";

// Run the analyzer with the defined configuration
const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log("Analyzer output:", result);
```

</TabItem>

<TabItem value='csharp'>

```csharp
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
string sampleText = "The stop filter allows control over common stop words for text processing.";

// Run the analyzer with the defined configuration
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
# restful
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["The stop filter allows control over common stop words for text processing."],
        "analyzerParams": "{\"tokenizer\": \"standard\", \"filter\": [{\"type\": \"stop\", \"stop_words\": [\"of\", \"to\", \"_english_\"]}]}"
     }'
```

</TabItem>

</Tabs>

### 期待される出力\{#expected-output}

```plaintext
['The', 'stop', 'filter', 'allows', 'control', 'over', 'common', 'stop', 'words', 'text', 'processing']
```
