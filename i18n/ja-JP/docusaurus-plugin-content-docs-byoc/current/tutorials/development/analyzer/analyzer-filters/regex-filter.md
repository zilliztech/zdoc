---
title: "Regex | BYOC"
slug: /regex-filter
sidebar_label: "Regex Analyzer Filter"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`regex` フィルターは正規表現フィルターです。トークナイザーによって生成されたトークンのうち、指定した式に一致するものだけが保持され、それ以外はすべて破棄されます。 | BYOC"
type: origin
token: AwmtwHGQii1j9Wk1W04cNxvBnth
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Regex

`regex` フィルターは正規表現フィルターです。トークナイザーによって生成されたトークンのうち、指定した式に一致するものだけが保持され、それ以外はすべて破棄されます。

<Admonition type="info" title="Note">

このページでは、アナライザーパイプラインにおける regex フィルターについて説明します。このフィルターはトークナイザーが生成したトークンをフィルタリングし、テキスト解析時に生成される用語に影響を与えます。query、search、またはハイブリッド検索で field =~ "pattern" や field !~ "pattern" などのスカラー式を使用してエンティティをフィルタリングする方法については、[パターンマッチング](./pattern-match) を参照してください。

</Admonition>

## 設定\{#configuration}

`regex` フィルターは、Zilliz Cloud のカスタムフィルターです。使用するには、フィルター設定で `"type": "regex"` を指定するとともに、適用したい正規表現を `expr` パラメーターで指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [{
        "type": "regex",
        "expr": "^(?!test)" # keep tokens that do NOT start with "test"
    }]
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Arrays.asList(new HashMap<String, Object>() {{
            put("type", "regex");
            put("expr", "^(?!test)");
        }})
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "regex",
        "expr": "^(?!test)",
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "regex",
        "expr": "^(?!test)"
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "regex"}, {"expr", "^(?!test)"}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        {
            "type": "regex",
            "expr": "^(?!test)"
        }
    ],
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
      "type": "regex",
      "expr": "^(?!test)"
    }
  ]
}'
```

</TabItem>
</Tabs>

`regex` フィルターでは、以下のパラメーターを設定できます。

| パラメーター | 説明 |
| --- | --- |
| `expr` | 各トークンに適用される正規表現パターンです。一致するトークンは保持され、一致しないトークンは破棄されます。<br/>正規表現の構文の詳細については、[Syntax](https://docs.rs/regex/latest/regex/#syntax) を参照してください。 |

`regex` フィルターはトークナイザーが生成した用語に対して動作するため、トークナイザーと組み合わせて使用する必要があります。

`analyzer_params` を定義したら、コレクションスキーマの定義時にそれを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud が指定されたアナライザーを使用して該当フィールドのテキストを処理し、効率的なトークン化とフィルタリングを行えるようになります。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [{
        "type": "regex",
        "expr": "^(?!test)"
    }]
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
analyzerParams.put("filter",
        Collections.singletonList(new HashMap<String, Object>() {{
            put("type", "regex");
            put("expr", "^(?!test)");
        }}));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "regex",
        "expr": "^(?!test)",
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "regex",
        "expr": "^(?!test)"
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "regex"}, {"expr", "^(?!test)"}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        {
            "type": "regex",
            "expr": "^(?!test)"
        }
    ],
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
      "type": "regex",
      "expr": "^(?!test)"
    }
  ]
}'
```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Sample text to analyze
sample_text = "testItem apple testCase banana"

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
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
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("testItem apple testCase banana");

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

texts := []string{"testItem apple testCase banana"}
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
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");
    let client = ClientV2::new(&config).await?;

    let analyzer_params = serde_json::json!({
        "tokenizer": "standard",
        "filter": [{
            "type": "regex",
            "expr": "^(?!test)"
        }]
    });

    let sample_text = "testItem apple testCase banana";
    let result = client
        .run_analyzer(
            RunAnalyzerRequest::builder()
                .texts(vec![sample_text])
                .analyzer_params(analyzer_params)
                .build()?,
        )
        .await?;

    println!("Standard analyzer output: {:?}", result);
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "testItem apple testCase banana";
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

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const sampleText = "testItem apple testCase banana";
const result = await client.runAnalyzer({
    text: sampleText,
    analyzer_params,
});
console.log("Standard analyzer output:", result);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "text": ["testItem apple testCase banana"],
    "analyzerParams": "{\"tokenizer\": \"standard\", \"filter\": [{\"type\": \"regex\", \"expr\": \"^(?!test)\"}]}"
}'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['apple', 'banana']
```

