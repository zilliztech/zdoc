---
title: "Regex | BYOC"
slug: /regex-filter
sidebar_label: "Regex"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`regex` 过滤器是一种正则表达式过滤器：只有匹配你提供的表达式的 token 才会被保留，其余的都会被丢弃。 | BYOC"
type: origin
token: EcNmwuOtTi8VTDk6XtLcJsxznWx
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Regex

`regex` 过滤器是一种正则表达式过滤器：只有匹配你提供的表达式的 token 才会被保留，其余的都会被丢弃。

<Admonition type="info" title="Note">

本页面介绍分析器流水线中的 regex 过滤器。该过滤器会处理分词器生成的 token，并影响文本分析期间生成的词项。如果要使用 field =~ "pattern" 或 field !~ "pattern" 等标量表达式，在 query、search 或混合搜索中筛选实体，请参阅[模式匹配](./pattern-match)。

</Admonition>

## 配置\{#configuration}

`regex` 过滤器在 Zilliz Cloud 中属于自定义过滤器。
 要使用它，请在过滤器配置中指定 `"type": "regex"`，并通过 `expr` 参数设定所需的正则表达式。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"}]}>
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
</Tabs>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "regex"}, {"expr", "^(?!test)"}}
    }}
};
```

<Tabs groupId="code" defaultValue='javascript' values={[{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "regex"}, {"expr", "^(?!test)"}}
    }}
};
```

`regex` 过滤器支持以下可配置参数：

| 参数 | 描述 |
| --- | --- |
| `expr` | 应用于每个 token 的正则表达式模式。匹配的 token 会被保留；不匹配的会被丢弃。<br/>关于正则语法的详细信息，请参考 [Syntax](https://docs.rs/regex/latest/regex/#syntax)。 |

`regex` 过滤器作用于分词器生成的词项，因此必须与分词器结合使用。

定义 `analyzer_params` 后，您可以在定义 Collection Schema 时将其应用于 VARCHAR 字段。这使得 Zilliz Cloud 能够使用指定的分析器处理该字段中的文本，以实现高效的分词和过滤。更多信息，请参阅[使用示例](./analyzer-overview)。  

## 示例输出\{#example-output}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

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

### 使用 run_analyzer 验证效果\{#verification-using-run_analyzer}

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

fmt.Println(result)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

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
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

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

### 预期结果\{#expected-output}

```python
['apple', 'banana']
```

