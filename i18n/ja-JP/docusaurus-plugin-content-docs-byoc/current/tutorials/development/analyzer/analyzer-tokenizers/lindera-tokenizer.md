---
title: "Lindera | BYOC"
slug: /lindera-tokenizer
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "lindera トークナイザーは辞書ベースの形態素解析を行います。日本語と韓国語向けに設計されています。これらの言語では単語がスペースで区切られず、文法標識（助詞）が単語に直接付加されます。 | BYOC"
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

`lindera` トークナイザーは辞書ベースの形態素解析を行います。日本語と韓国語向けに設計されています。これらの言語では単語がスペースで区切られず、文法標識（助詞）が単語に直接付加されます。

<Admonition type="info" icon="📘" title="Notes">

**中国語テキストの場合**：`lindera` は `cc-cedict` 辞書を通じて中国語をサポートしていますが、代わりに [`jieba`](./jieba-tokenizer) トークナイザーの使用をお勧めします。Jieba は中国語の単語分割用に特別に設計されており、より優れた結果を提供します。

</Admonition>

## 概要\{#overview}

日本語と韓国語は膠着語です。助詞と呼ばれる文法標識が名詞に直接付加され、多数の組み合わせを形成します。例：

<table>
   <tr>
     <th><p>言語</p></th>
     <th><p>語根</p></th>
     <th><p>+ 助詞</p></th>
     <th><p>= 結合形</p></th>
     <th><p>意味</p></th>
   </tr>
   <tr>
     <td><p>韓国語</p></td>
     <td><p>서울（ソウル）</p></td>
     <td><p>에서</p></td>
     <td><p>서울에서</p></td>
     <td><p>ソウルで</p></td>
   </tr>
   <tr>
     <td><p>日本語</p></td>
     <td><p>東京（Tokyo）</p></td>
     <td><p>に</p></td>
     <td><p>東京に</p></td>
     <td><p>東京へ</p></td>
   </tr>
</table>

`lindera` トークナイザーは次の処理を行います：

1. **テキストを分割**し、個々の形態素（単語と助詞）にします。

1. **各トークンにタグを付け**、辞書から品詞（POS）情報を付与します。

1. **フィルターを適用**し、不要なトークン（助詞や句読点など）を削除します。

この 2 段階のプロセス（分割後、品詞に基づくフィルタリング）により、検索用にインデックスするトークンを正確に制御できます。


## 設定\{#configuration}

`lindera` トークナイザーを使用してアナライザーを設定するには、`tokenizer.type` を `lindera` に設定し、`dict_kind` で辞書を選択し、必要に応じてフィルターを適用します。

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
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>トークナイザーの種類です。この値は <code>"lindera"</code> に固定されています。</p></td>
   </tr>
   <tr>
     <td><p><code>dict_kind</code></p></td>
     <td><p>語彙を定義するために使用する辞書です。使用可能な値は次のとおりです：</p><ul><li><p><code>ko-dic</code>: 韓国語 - 韓国語の形態素辞書（<a href="https://bitbucket.org/eunjeon/mecab-ko-dic">MeCab Ko-dic</a>）</p></li><li><p><code>ipadic</code>: 日本語 - 標準形態素辞書（<a href="https://taku910.github.io/mecab/">MeCab IPADIC</a>）</p></li><li><p><code>ipadic-neologd</code>: 新語辞書付きの日本語（拡張） - 新語と固有名詞を含みます（<a href="https://github.com/neologd/mecab-ipadic-neologd">IPADIC NEologd</a>）</p></li><li><p><code>unidic</code>: 日本語 UniDic（拡張） - 詳細な言語情報を含む学術標準辞書（<a href="https://clrd.ninjal.ac.jp/unidic/">UniDic</a>）</p></li><li><p><code>cc-cedict</code>: 標準中国語 (traditional/simplified) - コミュニティによって維持されている中英辞書（<a href="https://cc-cedict.org/wiki/">CC-CEDICT</a>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>filter</code></p></td>
     <td><p>セグメンテーション後に適用するトークナイザーレベルのフィルターのリストです。各フィルターは次のオブジェクトです：</p><ul><li><p><code>kind</code>: フィルターのタイプです。サポートされる値：</p><ul><li><p><code>korean_stop_tags</code>: 指定した韓国語の品詞タグに一致するトークンを削除します。</p></li><li><p><code>japanese_stop_tags</code>: 指定した日本語の品詞タグに一致するトークンを削除します。</p></li></ul></li><li><p><code>tags</code>: 除外する品詞タグのリストです。使用可能なタグは <code>kind</code> によって異なります：</p><ul><li><p><code>korean_stop_tags</code> の場合：完全なタグコードを使用します（例：<code>JKS</code>、<code>JKO</code>、<code>SF</code>）。韓国語のタグは完全一致が必要です。Sejong タグセットに基づく完全なリストについては、<a href="https://docs.rs/lindera/latest/src/lindera/token_filter/korean_stop_tags.rs.html">Lindera 韓国語ストップタグのソース</a>を参照してください。</p></li><li><p><code>japanese_stop_tags</code> の場合：完全なタグコードを使用します（例：<code>助詞,格助詞</code>、<code>助詞,係助詞</code>、<code>助動詞</code>）。日本語のタグは完全一致が必要です。IPADIC の完全なリストについては、<a href="https://github.com/taku910/mecab/blob/master/mecab-ipadic/pos-id.def">日本語の品詞タグリファレンス</a>を参照してください。</p></li></ul></li></ul></td>
   </tr>
</table>

`analyzer_params` を定義したら、コレクションスキーマを定義する際に、それらを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細は、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### 韓国語の例\{#korean-example}

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

**期待される出力**：

```plaintext
['서울', '맛있', '음식', '먹', '습니다']
```

`korean_stop_tags` がない場合、出力には `에서`（〜で）、`는`（主題標識）、`을`（目的語標識）などの助詞が含まれます。これらは通常、検索には役立ちません。

### 日本語の例\{#japanese-example}

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

**期待される出力：**

```plaintext
['東京', 'スカイ', 'ツリー', '最寄り駅', 'とう', 'きょう', 'スカイ', 'ツリー', '駅']
```

`japanese_stop_tags` がない場合、出力には `の`（所有）、`は`（主題標識）、`です`（コピュラ）などの助詞が含まれます。
