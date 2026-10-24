---
title: "タイ語 | Cloud"
slug: /thai-analyzer
sidebar_label: "タイ語"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`thai` アナライザーは、タイ語テキスト用の組み込みアナライザーです。Zilliz Cloud でタイ語テキストを単語に分割し、タイ語の数字を正規化し、混在するラテン文字を小文字化し、タイ語のストップワードを削除する必要がある場合にこのアナライザーを使用します。 | Cloud"
type: origin
token: FOmVwhh1XiHjLpkd4RAczZIEnHe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# タイ語

`thai` アナライザーは、タイ語テキスト用の組み込みアナライザーです。Zilliz Cloud でタイ語テキストを単語に分割し、タイ語の数字を正規化し、混在するラテン文字を小文字に変換し、タイ語のストップワードを削除する必要がある場合は、このアナライザーを使用します。

## 設定\{#configuration}

組み込みアナライザーは、Milvus が提供するアナライザーテンプレートです。組み込みアナライザーを使用するには、`analyzer_params` の `type` に定義済みのアナライザー名を設定します。

組み込みのタイ語アナライザーを使用するには、`type` を `thai` に設定します。

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
import java.util.HashMap;
import java.util.Map;

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
using System.Collections.Generic;

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

`thai` アナライザーは、次のオプションパラメーターを受け入れます。

| **パラメーター** | **型** | **デフォルト値** | **説明** |
| --- | --- | --- | --- |
| `stop_words` | `list[str]` | `_thai_` | トークン化から削除する追加のストップワードのリストです。デフォルトでは、`thai` アナライザーは組み込みの `_thai_` ディクショナリを使用します。デフォルトのディクショナリを確認するには、Zilliz Cloud の[タイ語ストップワードリスト](https://github.com/milvus-io/milvus/blob/1945ba399b4552fd0fd0b131f7c735ddde21e71c/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words/thai.txt)を参照してください。このリストは、Apache Lucene の[タイ語ストップワードファイル](https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/th/stopwords.txt)を由来としています。 |

カスタムストップワードを追加するには、`stop_words` を指定します。

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
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

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
using System.Collections.Generic;

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

Zilliz Cloud は、組み込みの `_thai_` ディクショナリに加えて、カスタムストップワードを適用します。

組み込みの `thai` アナライザーは、次のカスタムアナライザー構成と同等です。

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
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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
using System.Collections.Generic;

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

このアナライザーは、次の処理手順を適用します。

- **トークン化**: `thai` トークナイザーを使用して、空白に依存せずにタイ語テキストを単語トークンに分割します。トークナイザーは、空白および句読点のみのセグメントを除外します。詳細については、[タイ語トークナイザー](./thai-tokenizer)を参照してください。

- **大文字と小文字の正規化**: `lowercase` フィルターを使用します。これは、タイ語/English が混在するテキスト内のラテン文字に影響します。

- **数字の正規化**: `decimaldigit` フィルターを使用して、タイ語の数字やその他の Unicode 10 進数字を ASCII 数字に変換します。

- **ストップワードの削除**: 組み込みの `_thai_` ディクショナリとともに `stop` フィルターを使用します。

- **ステミングなし**: 組み込みの `thai` アナライザーは `stemmer` フィルターを適用しません。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に、アナライザーを `VARCHAR` フィールドに適用できます。詳細については、[使用例](./analyzer-overview#example-use)を参照してください。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー構成\{#analyzer-configuration}

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
import java.util.HashMap;
import java.util.Map;

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
using System.Collections.Generic;

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

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

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

### 期待される出力\{#expected-output}

```plaintext
['ฉัน', 'รัก', 'ค้นหา', 'ข้อความ', 'milvus', '123']
```
