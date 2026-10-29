---
title: "Lindera | Cloud"
slug: /lindera-tokenizer
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The lindera tokenizer performs dictionary-based morphological analysis. It is designed for Japanese and Korean—languages where words are not separated by spaces and grammatical markers (particles) attach directly to words. | Cloud"
type: origin
displayed_sidebar: default
token: shared-lindera-tokenizer
sidebar_label: "Lindera"
sidebar_position: 4
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/analyzer/tokenizer/lindera-tokenizer.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lindera

The `lindera` tokenizer performs dictionary-based morphological analysis. It is designed for Japanese and Korean—languages where words are not separated by spaces and grammatical markers (particles) attach directly to words.

<Admonition type="info" icon="📘" title="Notes">

**For Chinese text**: While `lindera` supports Chinese via the `cc-cedict` dictionary, we recommend using the [`jieba`](./jieba-tokenizer) tokenizer instead. Jieba is specifically designed for Chinese word segmentation and provides better results.

</Admonition>

## Overview\{#overview}

Japanese and Korean are agglutinative languages: grammatical markers called particles attach directly to nouns, forming numerous combinations. For example:

<table>
   <tr>
     <th><p>Language</p></th>
     <th><p>Root word</p></th>
     <th><p>+ Particle</p></th>
     <th><p>= Combined form</p></th>
     <th><p>Meaning</p></th>
   </tr>
   <tr>
     <td><p>Korean</p></td>
     <td><p>서울 (Seoul)</p></td>
     <td><p>에서</p></td>
     <td><p>서울에서</p></td>
     <td><p>in Seoul</p></td>
   </tr>
   <tr>
     <td><p>Japanese</p></td>
     <td><p>東京 (Tokyo)</p></td>
     <td><p>に</p></td>
     <td><p>東京に</p></td>
     <td><p>to Tokyo</p></td>
   </tr>
</table>

The `lindera` tokenizer:

1. **Segments text** into individual morphemes (words and particles)

1. **Tags each token** with part-of-speech (POS) information from the dictionary

1. **Applies filters** to remove unwanted tokens (e.g., particles, punctuation)

This two-stage process—segmentation followed by POS-based filtering—enables precise control over which tokens are indexed for search.

## Configuration\{#configuration}

To configure an analyzer using the `lindera` tokenizer, set `tokenizer.type` to `lindera`, choose a dictionary with `dict_kind`, and optionally apply filters.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
  analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
      put("type", "lindera");
      put("dict_kind", "ko-dic");
      put("filter", Arrays.asList(
          new HashMap<String, Object>() {{
              put("kind", "korean_stop_tags");
              put("tags", Arrays.asList(
                  "SP", "SSC", "SSO", "SC", "SE", "SF",
                  "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                  "JX", "JC", "UNK", "EP", "ETM"
              ));
          }}
      ));
  }});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]interface{}{
      "tokenizer": map[string]interface{}{
          "type":      "lindera",
          "dict_kind": "ko-dic",
          "filter": []interface{}{
              map[string]interface{}{
                  "kind": "korean_stop_tags",
                  "tags": []string{
                      "SP", "SSC", "SSO", "SC", "SE", "SF",
                      "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                      "JX", "JC", "UNK", "EP", "ETM",
                  },
              },
          },
      },
  }
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "lindera"},
        {"dict_kind", "ko-dic"},
        {"filter", {{
            {"kind", "korean_stop_tags"},
            {"tags", {"SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"}}
        }}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "lindera",
        ["dict_kind"] = "ko-dic",
        ["filter"] = new List<object>
        {
            new Dictionary<string, object>
            {
                ["kind"] = "korean_stop_tags",
                ["tags"] = new List<object> { "SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM" }
            }
        }
    }
};
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
-d '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"lindera\",\"dict_kind\":\"ko-dic\",\"filter\":[{\"kind\":\"korean_stop_tags\",\"tags\":[\"SP\",\"SSC\",\"SSO\",\"SC\",\"SE\",\"SF\",\"JKS\",\"JKC\",\"JKG\",\"JKO\",\"JKB\",\"JKV\",\"JKQ\",\"JX\",\"JC\",\"UNK\",\"EP\",\"ETM\"]}]}}",
    "text": ["서울에서 맛있는 음식을 먹었습니다"]
}'
```

</TabItem>

</Tabs>

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>The type of tokenizer. This is fixed to <code>"lindera"</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>dict_kind</code></p></td>
     <td><p>A dictionary used to define vocabulary. Possible values:</p><ul><li><p><code>ko-dic</code>: Korean - Korean morphological dictionary (<a href="https://bitbucket.org/eunjeon/mecab-ko-dic">MeCab Ko-dic</a>)</p></li><li><p><code>ipadic</code>: Japanese - Standard morphological dictionary (<a href="https://taku910.github.io/mecab/">MeCab IPADIC</a>)</p></li><li><p><code>ipadic-neologd</code>: Japanese with neologism dictionary (extended) - Includes new words and proper nouns (<a href="https://github.com/neologd/mecab-ipadic-neologd">IPADIC NEologd</a>)</p></li><li><p><code>unidic</code>: Japanese UniDic (extended) - Academic standard dictionary with detailed linguistic information (<a href="https://clrd.ninjal.ac.jp/unidic/">UniDic</a>)</p></li><li><p><code>cc-cedict</code>: Mandarin Chinese (traditional/simplified) - Community-maintained Chinese-English dictionary (<a href="https://cc-cedict.org/wiki/">CC-CEDICT</a>)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>filter</code></p></td>
     <td><p>A list of tokenizer-level filters to apply after segmentation. Each filter is an object with:</p><ul><li><p><code>kind</code>: The filter type. Supported values:</p><ul><li><p><code>korean_stop_tags</code>: Remove tokens matching specified Korean POS tags.</p></li><li><p><code>japanese_stop_tags</code>: Remove tokens matching specified Japanese POS tags.</p></li></ul></li><li><p><code>tags</code>: A list of POS tags to filter out. The available tags depend on the <code>kind</code>:</p><ul><li><p>For <code>korean_stop_tags</code>: Use exact tag codes (e.g., <code>JKS</code>, <code>JKO</code>, <code>SF</code>). Korean tags require exact matching. For the complete list based on the Sejong tagset, see the <a href="https://docs.rs/lindera/latest/src/lindera/token_filter/korean_stop_tags.rs.html">Lindera Korean stop tags source</a>.</p></li><li><p>For <code>japanese_stop_tags</code>: Use exact tag codes (e.g., <code>助詞,格助詞</code>, <code>助詞,係助詞</code>, <code>助動詞</code>). Japanese tags require exact matching. For the complete list (IPADIC), see <a href="https://github.com/taku910/mecab/blob/master/mecab-ipadic/pos-id.def">Japanese POS tags reference</a>.</p></li></ul></li></ul></td>
   </tr>
</table>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Korean example\{#korean-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
}

# Sample Korean text: "서울에서 맛있는 음식을 먹었습니다" (I ate delicious food in Seoul)
sample_text = "서울에서 맛있는 음식을 먹었습니다"

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
import java.util.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "lindera");
  put("dict_kind", "ko-dic");
  put("filter", Arrays.asList(
      new HashMap<String, Object>() {{
          put("kind", "korean_stop_tags");
          put("tags", Arrays.asList(
              "SP", "SSC", "SSO", "SC", "SE", "SF",
              "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
              "JX", "JC", "UNK", "EP", "ETM"
          ));
      }}
  ));
}});

List<String> texts = new ArrayList<>();
texts.add("서울에서 맛있는 음식을 먹었습니다");

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

analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type":      "lindera",
      "dict_kind": "ko-dic",
      "filter": []interface{}{
          map[string]interface{}{
              "kind": "korean_stop_tags",
              "tags": []string{
                  "SP", "SSC", "SSO", "SC", "SE", "SF",
                  "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                  "JX", "JC", "UNK", "EP", "ETM",
              },
          },
      },
  },
}

texts := []string{"서울에서 맛있는 음식을 먹었습니다"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

_, err = client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let analyzer_params = json!({
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
});

let run_analyzer_req = RunAnalyzerRequest::builder()
    .texts(vec!["서울에서 맛있는 음식을 먹었습니다"])
    .analyzer_params(analyzer_params)
    .build()?;

let res = client.run_analyzer(run_analyzer_req).await?;
println!("{:?}", res.results());
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

nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "lindera"},
        {"dict_kind", "ko-dic"},
        {"filter", {{
            {"kind", "korean_stop_tags"},
            {"tags", {"SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"}}
        }}}
    }}
};

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                 .WithTexts({"서울에서 맛있는 음식을 먹었습니다"})
                                 .WithAnalyzerParams(analyzer_params),
                             response);
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

const analyzer_params = {
  tokenizer: {
    type: "lindera",
    dict_kind: "ko-dic",
    filter: [
      {
        kind: "korean_stop_tags",
        tags: [
          "SP",
          "SSC",
          "SSO",
          "SC",
          "SE",
          "SF",
          "JKS",
          "JKC",
          "JKG",
          "JKO",
          "JKB",
          "JKV",
          "JKQ",
          "JX",
          "JC",
          "UNK",
          "EP",
          "ETM",
        ],
      },
    ],
  },
};

const sample_text = "서울에서 맛있는 음식을 먹었습니다";

const result = await client.runAnalyzer({
  analyzer_params: analyzer_params,
  text: sample_text,
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

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "lindera",
        ["dict_kind"] = "ko-dic",
        ["filter"] = new List<object>
        {
            new Dictionary<string, object>
            {
                ["kind"] = "korean_stop_tags",
                ["tags"] = new List<object> { "SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM" }
            }
        }
    }
};

// Sample Korean text: "서울에서 맛있는 음식을 먹었습니다" (I ate delicious food in Seoul)
string sampleText = "서울에서 맛있는 음식을 먹었습니다";

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
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"lindera\",\"dict_kind\":\"ko-dic\",\"filter\":[{\"kind\":\"korean_stop_tags\",\"tags\":[\"SP\",\"SSC\",\"SSO\",\"SC\",\"SE\",\"SF\",\"JKS\",\"JKC\",\"JKG\",\"JKO\",\"JKB\",\"JKV\",\"JKQ\",\"JX\",\"JC\",\"UNK\",\"EP\",\"ETM\"]}]}}",
    "text": ["서울에서 맛있는 음식을 먹었습니다"]
}'
```

</TabItem>

</Tabs>

**Expected output**:

```plaintext
['서울', '맛있', '음식', '먹', '습니다']
```

Without `korean_stop_tags`, the output would include particles like `에서` (in), `는` (topic marker), and `을` (object marker), which are typically not useful for search.

### Japanese example\{#japanese-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic",
        "filter": [
            {
                "kind": "japanese_stop_tags",
                "tags": ["接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"]
            }
        ]
    }
}

# Sample Japanese text: "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"
sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"

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
import java.util.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "lindera");
  put("dict_kind", "ipadic");
  put("filter", Arrays.asList(
      new HashMap<String, Object>() {{
          put("kind", "japanese_stop_tags");
          put("tags", Arrays.asList(
              "接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"
          ));
      }}
  ));
}});

List<String> texts = new ArrayList<>();
texts.add("東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です");

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

analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type":      "lindera",
      "dict_kind": "ipadic",
      "filter": []interface{}{
          map[string]interface{}{
              "kind": "japanese_stop_tags",
              "tags": []string{
                  "接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音",
              },
          },
      },
  },
}

texts := []string{"東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

_, err = client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let analyzer_params = json!({
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic",
        "filter": [
            {
                "kind": "japanese_stop_tags",
                "tags": ["接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"]
            }
        ]
    }
});

let run_analyzer_req = RunAnalyzerRequest::builder()
    .texts(vec!["東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"])
    .analyzer_params(analyzer_params)
    .build()?;

let res = client.run_analyzer(run_analyzer_req).await?;
println!("{:?}", res.results());
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

nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "lindera"},
        {"dict_kind", "ipadic"},
        {"filter", {{
            {"kind", "japanese_stop_tags"},
            {"tags", {"接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"}}
        }}}
    }}
};

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                 .WithTexts({"東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"})
                                 .WithAnalyzerParams(analyzer_params),
                             response);
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

const analyzer_params = {
  tokenizer: {
    type: "lindera",
    dict_kind: "ipadic",
    filter: [
      {
        kind: "japanese_stop_tags",
        tags: ["接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"],
      },
    ],
  },
};

const sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です";

const result = await client.runAnalyzer({
  analyzer_params: analyzer_params,
  text: sample_text,
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

Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "lindera",
        ["dict_kind"] = "ipadic",
        ["filter"] = new List<object>
        {
            new Dictionary<string, object>
            {
                ["kind"] = "japanese_stop_tags",
                ["tags"] = new List<object> { "接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音" }
            }
        }
    }
};

// Sample Japanese text: "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"
string sampleText = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です";

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
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"lindera\",\"dict_kind\":\"ipadic\",\"filter\":[{\"kind\":\"japanese_stop_tags\",\"tags\":[\"接続詞\",\"助詞,格助詞\",\"助詞,格助詞,一般\",\"助詞,格助詞,引用\",\"助詞,格助詞,連語\",\"助詞,係助詞\",\"助詞,終助詞\",\"助詞,接続助詞\",\"助詞,特殊\",\"助詞,副助詞\",\"助詞,副助詞／並立助詞／終助詞\",\"助詞,連体化\",\"助詞,副詞化\",\"助詞,並立助詞\",\"助動詞\",\"記号,一般\",\"記号,読点\",\"記号,句点\",\"記号,空白\",\"記号,括弧閉\",\"記号,括弧開\",\"その他,間投\",\"フィラー\",\"非言語音\"]}]}}",
    "text": ["東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"]
}'
```

</TabItem>

</Tabs>

**Expected output:**

```plaintext
['東京', 'スカイ', 'ツリー', '最寄り駅', 'とう', 'きょう', 'スカイ', 'ツリー', '駅']
```

Without `japanese_stop_tags`, the output would include particles like `の` (possessive), `は` (topic marker), and `です` (copula).
