---
title: "Pinyin | BYOC"
slug: /pinyin-filter
sidebar_label: "pinyin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Chinese text search often requires users to enter Chinese characters exactly as they appear in the indexed text. In name lookup, autocomplete, and search-as-you-type workflows, users frequently type Pinyin instead of Chinese characters. For example, a user may type `zuqiu` to search for `足球`. The `pinyin` filter adds Pinyin tokens to the analyzer output so Chinese text can match Pinyin input without maintaining a separate Pinyin field. | BYOC"
type: origin
token: EhXXwmJzBi8pg9kJcC4ccm9OnDe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pinyin

Chinese text search often requires users to enter Chinese characters exactly as they appear in the indexed text. In name lookup, autocomplete, and search-as-you-type workflows, users frequently type Pinyin instead of Chinese characters. For example, a user may type `zuqiu` to search for `足球`. The `pinyin` filter adds Pinyin tokens to the analyzer output so Chinese text can match Pinyin input without maintaining a separate Pinyin field.

The `pinyin` filter is typically used with the [Jieba](./jieba-tokenizer) tokenizer for Chinese text. It works in a custom analyzer filter pipeline and can emit multiple Pinyin token forms for the same Chinese token.

## Configuration\{#configuration}

To use the default options, specify `"pinyin"` in the `filter` section of `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-next-line
    "filter": ["pinyin"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("pinyin"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter":    []string{"pinyin"},
}
```

</TabItem>
</Tabs>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": ["pinyin"]
});
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"pinyin"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    tokenizer: "jieba",
    filter: ["pinyin"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": ["pinyin"]
}'
```

</TabItem>
</Tabs>

This shorthand keeps the original Chinese tokens and emits character-level Pinyin tokens. It does not emit joined Pinyin or Pinyin initials unless you enable those options explicitly.

For full control, specify the filter as an object and configure the Pinyin token forms that Zilliz Cloud emits.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-start
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": True,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": False,
        }
    ],
    # highlight-end
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
Map<String, Object> pinyinFilter = new HashMap<>();
pinyinFilter.put("type", "pinyin");
pinyinFilter.put("keep_original", true);
pinyinFilter.put("keep_full_pinyin", true);
pinyinFilter.put("keep_joined_full_pinyin", false);
pinyinFilter.put("keep_separate_first_letter", false);
analyzerParams.put("filter", Collections.singletonList(pinyinFilter));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter": []map[string]any{
        {
            "type":                       "pinyin",
            "keep_original":              true,
            "keep_full_pinyin":           true,
            "keep_joined_full_pinyin":    false,
            "keep_separate_first_letter": false,
        },
    },
}
```

</TabItem>
</Tabs>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": true,
            "keep_full_pinyin": true,
            "keep_joined_full_pinyin": false,
            "keep_separate_first_letter": false
        }
    ]
});
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {
        {
            {"type", "pinyin"},
            {"keep_original", true},
            {"keep_full_pinyin", true},
            {"keep_joined_full_pinyin", false},
            {"keep_separate_first_letter", false}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    tokenizer: "jieba",
    filter: [
        {
            type: "pinyin",
            keep_original: true,
            keep_full_pinyin: true,
            keep_joined_full_pinyin: false,
            keep_separate_first_letter: false,
        },
    ],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": [
    {
      "type": "pinyin",
      "keep_original": true,
      "keep_full_pinyin": true,
      "keep_joined_full_pinyin": false,
      "keep_separate_first_letter": false
    }
  ]
}'
```

</TabItem>
</Tabs>

The filter accepts the following parameters.

| **Parameter** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| `keep_original` | Boolean | `true` | Keeps the original Chinese token in the analyzer output. |
| `keep_full_pinyin` | Boolean | `true` | Emits character-level Pinyin tokens. For example, `中文` produces `zhong` and `wen`. |
| `keep_joined_full_pinyin` | Boolean | `false` | Emits a joined Pinyin token for each source token. For example, `中文` produces `zhongwen`. |
| `keep_separate_first_letter` | Boolean | `false` | Emits a Pinyin-initials token for each source token. For example, `中文` produces `zw`. |

The filter operates on tokens produced by the tokenizer. For Chinese text, use it with a tokenizer such as `jieba`.

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior with `run_analyzer`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "中文测试"
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import java.util.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("中文测试");
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

texts := []string{"中文测试"}
```

</TabItem>
</Tabs>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let sample_text = "中文测试";
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
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

std::string sample_text = "中文测试";
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN",
});

const sample_text = "中文测试";
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# The run_analyzer request is sent directly to the endpoint below.
```

</TabItem>
</Tabs>

### Match Chinese text with character-level Pinyin\{#match-chinese-text-with-character-level-pinyin}

The default `pinyin` filter keeps the original Chinese tokens and emits character-level Pinyin tokens.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["pinyin"],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("pinyin"));

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter":    []string{"pinyin"},
}

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
</Tabs>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": ["pinyin"]
});

let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec![sample_text])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"pinyin"}}
};

auto request = milvus::RunAnalyzerRequest()
                       .AddText(sample_text)
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
const analyzer_params = {
    tokenizer: "jieba",
    filter: ["pinyin"],
};

const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["中文测试"],
        "analyzerParams": "{\"tokenizer\": \"jieba\", \"filter\": [\"pinyin\"]}"
     }'
```

</TabItem>
</Tabs>

Expected output:

```plaintext
['中文', 'zhong', 'wen', '测试', 'ce', 'shi']
```

### Match Chinese terms with joined Pinyin\{#match-chinese-terms-with-joined-pinyin}

Enable `keep_joined_full_pinyin` when you need a Chinese term to match its full joined Pinyin form.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": True,
            "keep_separate_first_letter": False,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
Map<String, Object> pinyinFilter = new HashMap<>();
pinyinFilter.put("type", "pinyin");
pinyinFilter.put("keep_original", true);
pinyinFilter.put("keep_full_pinyin", false);
pinyinFilter.put("keep_joined_full_pinyin", true);
pinyinFilter.put("keep_separate_first_letter", false);
analyzerParams.put("filter", Collections.singletonList(pinyinFilter));

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter": []map[string]any{
        {
            "type":                       "pinyin",
            "keep_original":              true,
            "keep_full_pinyin":           false,
            "keep_joined_full_pinyin":    true,
            "keep_separate_first_letter": false,
        },
    },
}

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
</Tabs>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": true,
            "keep_full_pinyin": false,
            "keep_joined_full_pinyin": true,
            "keep_separate_first_letter": false
        }
    ]
});

let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec![sample_text])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {
        {
            {"type", "pinyin"},
            {"keep_original", true},
            {"keep_full_pinyin", false},
            {"keep_joined_full_pinyin", true},
            {"keep_separate_first_letter", false}
        }
    }}
};

auto request = milvus::RunAnalyzerRequest()
                       .AddText(sample_text)
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
const analyzer_params = {
    tokenizer: "jieba",
    filter: [
        {
            type: "pinyin",
            keep_original: true,
            keep_full_pinyin: false,
            keep_joined_full_pinyin: true,
            keep_separate_first_letter: false,
        },
    ],
};

const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["中文测试"],
        "analyzerParams": "{\"tokenizer\": \"jieba\", \"filter\": [{\"type\": \"pinyin\", \"keep_original\": true, \"keep_full_pinyin\": false, \"keep_joined_full_pinyin\": true, \"keep_separate_first_letter\": false}]}"
     }'
```

</TabItem>
</Tabs>

Expected output:

```plaintext
['中文', 'zhongwen', '测试', 'ceshi']
```

### Match Chinese terms with Pinyin initials\{#match-chinese-terms-with-pinyin-initials}

Enable `keep_separate_first_letter` when you need a Chinese term to match the initials of its Pinyin form.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": True,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
Map<String, Object> pinyinFilter = new HashMap<>();
pinyinFilter.put("type", "pinyin");
pinyinFilter.put("keep_original", true);
pinyinFilter.put("keep_full_pinyin", false);
pinyinFilter.put("keep_joined_full_pinyin", false);
pinyinFilter.put("keep_separate_first_letter", true);
analyzerParams.put("filter", Collections.singletonList(pinyinFilter));

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter": []map[string]any{
        {
            "type":                       "pinyin",
            "keep_original":              true,
            "keep_full_pinyin":           false,
            "keep_joined_full_pinyin":    false,
            "keep_separate_first_letter": true,
        },
    },
}

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
</Tabs>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": true,
            "keep_full_pinyin": false,
            "keep_joined_full_pinyin": false,
            "keep_separate_first_letter": true
        }
    ]
});

let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec![sample_text])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {
        {
            {"type", "pinyin"},
            {"keep_original", true},
            {"keep_full_pinyin", false},
            {"keep_joined_full_pinyin", false},
            {"keep_separate_first_letter", true}
        }
    }}
};

auto request = milvus::RunAnalyzerRequest()
                       .AddText(sample_text)
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
const analyzer_params = {
    tokenizer: "jieba",
    filter: [
        {
            type: "pinyin",
            keep_original: true,
            keep_full_pinyin: false,
            keep_joined_full_pinyin: false,
            keep_separate_first_letter: true,
        },
    ],
};

const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["中文测试"],
        "analyzerParams": "{\"tokenizer\": \"jieba\", \"filter\": [{\"type\": \"pinyin\", \"keep_original\": true, \"keep_full_pinyin\": false, \"keep_joined_full_pinyin\": false, \"keep_separate_first_letter\": true}]}"
     }'
```

</TabItem>
</Tabs>

Expected output:

```plaintext
['中文', 'zw', '测试', 'cs']
```
