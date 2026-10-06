---
title: "Pinyin | Cloud"
slug: /pinyin-filter
sidebar_label: "Pinyin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "中文文本搜索通常要求用户输入与索引文本中完全一致的汉字。在名称查找、自动补全和边输入边搜索等工作流中，用户经常输入拼音而不是汉字。例如，用户可能输入 `zuqiu` 来搜索 `足球`。`pinyin` 过滤器会在 Analyzer 输出中添加拼音 token，使中文文本无需维护单独的拼音字段即可匹配拼音输入。 | Cloud"
type: origin
token: KMNdwKnqkibpRbk6bYDcpa12nih
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pinyin

中文文本搜索通常要求用户输入与索引文本中完全一致的汉字。在名称查找、自动补全和边输入边搜索等工作流中，用户经常输入拼音而不是汉字。例如，用户可能输入 `zuqiu` 来搜索 `足球`。`pinyin` 过滤器会在 Analyzer 输出中添加拼音 token，使中文文本无需维护单独的拼音字段即可匹配拼音输入。

`pinyin` 过滤器通常与中文文本的 [Jieba](./jieba-tokenizer) tokenizer 搭配使用。它可用于自定义 Analyzer 过滤器管道，并能为同一个中文 token 输出多种拼音 token 形式。

## 配置\{#configuration}

要使用默认选项，请在 `analyzer_params` 的 `filter` 部分指定 `"pinyin"`。

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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": ["pinyin"]
});
```

</TabItem>

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

这种简写形式会保留原始中文 token，并输出字符级拼音 token。除非显式启用相关选项，否则不会输出拼接后的完整拼音或拼音首字母。

如需完全控制，请将过滤器指定为对象，并配置 Zilliz Cloud 输出的拼音 token 形式。

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

<TabItem value='rust'>

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

</TabItem>

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

该过滤器支持以下参数。

| **参数** | **类型** | **默认值** | **描述** |
| --- | --- | --- | --- |
| `keep_original` | 布尔值 | `true` | 保留 Analyzer 输出中的原始中文 token。 |
| `keep_full_pinyin` | 布尔值 | `true` | 输出字符级拼音 token。例如，`中文` 会生成 `zhong` 和 `wen`。 |
| `keep_joined_full_pinyin` | 布尔值 | `false` | 为每个源 token 输出拼接后的拼音 token。例如，`中文` 会生成 `zhongwen`。 |
| `keep_separate_first_letter` | 布尔值 | `false` | 为每个源 token 输出拼音首字母 token。例如，`中文` 会生成 `zw`。 |

该过滤器处理 tokenizer 生成的 token。对于中文文本，请搭配 `jieba` 等 tokenizer 使用。

## 示例\{#examples}

将 Analyzer 配置应用于 Collection Schema 之前，请使用 `run_analyzer` 验证其行为。

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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let sample_text = "中文测试";
```

</TabItem>

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

### 使用字符级拼音匹配中文文本\{#match-chinese-text-with-character-level-pinyin}

默认的 `pinyin` 过滤器会保留原始中文 token，并输出字符级拼音 token。

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

<TabItem value='rust'>

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

</TabItem>

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

预期输出：

```plaintext
['中文', 'zhong', 'wen', '测试', 'ce', 'shi']
```

### 使用拼接后的完整拼音匹配中文词语\{#match-chinese-terms-with-joined-pinyin}

当需要使用完整拼接拼音形式匹配中文词语时，请启用 `keep_joined_full_pinyin`。

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

<TabItem value='rust'>

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

</TabItem>

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

预期输出：

```plaintext
['中文', 'zhongwen', '测试', 'ceshi']
```

### 使用拼音首字母匹配中文词语\{#match-chinese-terms-with-pinyin-initials}

当需要使用拼音首字母形式匹配中文词语时，请启用 `keep_separate_first_letter`。

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

<TabItem value='rust'>

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

</TabItem>

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

预期输出：

```plaintext
['中文', 'zw', '测试', 'cs']
```
