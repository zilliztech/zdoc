---
title: "Jieba | Cloud"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`jieba` トークナイザーは、中国語のテキストを構成する単語に分割して処理します。 | Cloud"
type: origin
token: JGURwBQNOijp2DkspFFctbAGnLh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

`jieba` トークナイザーは、中国語のテキストを構成する単語に分割して処理します。

<Admonition type="info" title="Notes">

`jieba` トークナイザーは、出力内で句読点を個別のトークンとして保持します。たとえば、`"你好！世界。"` は `["你好", "！", "世界", "。"]` になります。これらの単独の句読点トークンを削除するには、[`removepunct`](./remove-punct-filter) フィルターを使用してください。

</Admonition>

## 構成\{#configuration}

Milvus では、`jieba` トークナイザーに対して、シンプル構成とカスタム構成の 2 つの構成方法をサポートしています。

### シンプル構成\{#simple-configuration}

シンプル構成では、トークナイザーを `"jieba"` に設定するだけで済みます。例：

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
use milvus::v2::prelude::*;

let analyzer_params = serde_json::json!({"tokenizer": "jieba"});
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
using System.Collections.Generic;

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

このシンプル構成は、次のカスタム構成と同等です：

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
    let analyzer_params = serde_json::json!({
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
using System.Collections.Generic;

// Custom configuration equivalent to the simple configuration above
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object> // Tokenizer configuration
    {
        ["type"] = "jieba",           // Tokenizer type, fixed as "jieba"
        ["dict"] = new[] { "_default_" }, // Use the default dictionary
        ["mode"] = "search",          // Use search mode for improved recall (see mode details below)
        ["hmm"] = true                // Enable HMM for probabilistic segmentation
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export analyzerParams='{
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

パラメーターの詳細については、[カスタム構成](./jieba-tokenizer#custom-configuration) を参照してください。

### カスタム構成\{#custom-configuration}

より細かく制御するには、カスタム構成を指定できます。カスタム構成では、カスタム辞書の指定、分割モードの選択、および隠れマルコフモデル（HMM）の有効化または無効化が可能です。例：

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
analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
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
    let analyzer_params = serde_json::json!({
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
nlohmann::json analyzerParams = {                                                                                              
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
using System.Collections.Generic;

// Custom configuration with user-defined settings
var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "jieba",           // Fixed tokenizer type
        ["dict"] = new[] { "customDictionary" }, // Custom dictionary list; replace with your own terms
        ["mode"] = "exact",           // Use exact mode (non-overlapping tokens)
        ["hmm"] = false               // Disable HMM; unmatched text will be split into individual characters
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export analyzerParams='{
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
     <td><p>トークナイザーの種類です。これは <code>&quot;jieba&quot;</code> に固定されています。</p></td>
     <td><p><code>&quot;jieba&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>アナライザーが語彙ソースとして読み込む辞書のリストです。組み込みオプション：</p><ul><li><p><code>&quot;_default_&quot;</code>：エンジン組み込みの簡体字中国語辞書を読み込みます。詳細については、<a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a> を参照してください。</p></li><li><p><code>&quot;_extend_default_&quot;</code>：<code>&quot;_default_&quot;</code> のすべてに加えて、繁体字中国語の補足辞書を読み込みます。詳細については、<a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a> を参照してください。</p></li></ul><p>組み込み辞書と任意の数のカスタム辞書を組み合わせることもできます。例：<code>[&quot;_default_&quot;, &quot;结巴分词器&quot;]</code>。</p></td>
     <td><p><code>[&quot;_default_&quot;]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>分割モードです。指定可能な値：</p><ul><li><p><code>&quot;exact&quot;</code>：文を可能な限り正確に分割しようとするため、テキスト分析に最適です。</p></li><li><p><code>&quot;search&quot;</code>：exact モードを基に、長い単語をさらに分割して再現率を向上させるため、検索エンジンのトークン化に適しています。</p></li></ul><p>詳細については、<a href="https://github.com/fxsjy/jieba">Jieba GitHub Project</a> を参照してください。</p></td>
     <td><p><code>&quot;search&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>辞書にない単語を確率的に分割するために、隠れマルコフモデル（HMM）を有効にするかどうかを示すブール値のフラグです。</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

`dict` で直接指定する代わりに、外部ファイルから大規模なカスタム語彙を読み込むには、後述の [辞書ファイルを使用したカスタム構成](./jieba-tokenizer) を参照してください。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に、それを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定したアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを実行できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

### 辞書ファイルを使用したカスタム構成 | PUBLIC\{#custom-configuration-with-a-dictionary-file-or-public}

大規模なカスタム語彙（ドメイン用語集、製品用語、固有名詞リストなど）の場合は、単語をファイルに保存し、そのファイルをリモートファイルリソースとして登録してから、`extra_dict_file` パラメーターを介してトークナイザーから参照します。アナライザーはこれらの単語を組み込み辞書に追加して語彙に読み込みます。

ファイルはプレーンテキストの UTF‑8 形式で、1 行に 1 つの用語を記述します。例：

```plaintext
结巴分词器
向量数据库
```

ファイルを、Milvus クラスターで使用するように構成されているオブジェクトストアにアップロードし、登録します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Register the uploaded file under a name you'll reference from analyzer configs.
client.add_file_resource(
    name="zh_terms",
    path="file/zh_terms.txt",    # full S3 object key, including the rootPath prefix
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.AddFileResourceReq;

client.addFileResource(AddFileResourceReq.builder()
        .name("zh_terms")
        .path("file/zh_terms.txt")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.AddFileResource(ctx, milvusclient.NewAddFileResourceOption("zh_terms", "file/zh_terms.txt"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

    client.add_file_resource(AddFileResourceRequest::builder()
        .name("zh_terms")
        .path("file/zh_terms.txt")
        .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::AddFileResourceRequest add_file_request;
add_file_request.WithName("zh_terms");
add_file_request.WithPath("file/zh_terms.txt");
status = client->AddFileResource(add_file_request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addFileResource({
  name: "zh_terms",
  path: "file/zh_terms.txt",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig { Uri = "YOUR_CLUSTER_ENDPOINT", ApiKey = "YOUR_CLUSTER_TOKEN" });
await client.ConnectAsync();

// Register the uploaded file under a name you'll reference from analyzer configs.
await client.AddFileResourceAsync(new AddFileResourceReq
{
    Name = "zh_terms",
    Path = "file/zh_terms.txt" // full S3 object key, including the rootPath prefix
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not expose the add_file_resource operation as of Milvus v3.0.x.
```

</TabItem>
</Tabs>

登録したリソースを、`extra_dict_file` を介してトークナイザーから参照します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["_default_"],             # keep the built-in dictionary
        "mode": "exact",
        "hmm": False,
        "extra_dict_file": {
            "type": "remote",
            "resource_name": "zh_terms",
            "file_name": "zh_terms.txt",
        },
    },
}

client.run_analyzer(["milvus结巴分词器中文测试"], analyzer_params)
# → [['milvus', '结巴', '分词器', '中文', '测试']]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");
  put("dict", Collections.singletonList("_default_"));
  put("mode", "exact");
  put("hmm", false);
  put("extra_dict_file", new HashMap<String, Object>() {{
    put("type", "remote");
    put("resource_name", "zh_terms");
    put("file_name", "zh_terms.txt");
  }});
}});

List<String> texts = new ArrayList<>();
texts.add("milvus结巴分词器中文测试");
client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

bs, _ := json.Marshal(analyzerParams)
texts := []string{"milvus结巴分词器中文测试"}
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
use milvus::v2::prelude::*;

    let analyzer_params = serde_json::json!({
        "tokenizer": {
            "type": "jieba",
            "dict": ["_default_"],
            "mode": "exact",
            "hmm": false,
            "extra_dict_file": {
                "type": "remote",
                "resource_name": "zh_terms",
                "file_name": "zh_terms.txt"
            }
        }
    });
    let resp = client.run_analyzer(RunAnalyzerRequest::builder()
        .texts(vec!["milvus结巴分词器中文测试"])
        .analyzer_params(analyzer_params)
        .build()?).await?;
    println!("{:?}", resp.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "jieba"},
        {"dict", {"_default_"}},
        {"mode", "exact"},
        {"hmm", false},
        {"extra_dict_file", {
            {"type", "remote"},
            {"resource_name", "zh_terms"},
            {"file_name", "zh_terms.txt"}
        }}
    }}
};

milvus::RunAnalyzerRequest request;
request.WithAnalyzerParams(analyzer_params);
request.AddText("milvus结巴分词器中文测试");

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
  tokenizer: {
    type: "jieba",
    dict: ["_default_"],
    mode: "exact",
    hmm: false,
    extra_dict_file: {
      type: "remote",
      resource_name: "zh_terms",
      file_name: "zh_terms.txt",
    },
  },
};

const result = await client.runAnalyzer({
  text: "milvus结巴分词器中文测试",
  analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig { Uri = "YOUR_CLUSTER_ENDPOINT", ApiKey = "YOUR_CLUSTER_TOKEN" });
await client.ConnectAsync();

var analyzerParams = new Dictionary<string, object>
{
    ["tokenizer"] = new Dictionary<string, object>
    {
        ["type"] = "jieba",
        ["dict"] = new[] { "_default_" }, // keep the built-in dictionary
        ["mode"] = "exact",
        ["hmm"] = false,
        ["extra_dict_file"] = new Dictionary<string, object>
        {
            ["type"] = "remote",
            ["resource_name"] = "zh_terms",
            ["file_name"] = "zh_terms.txt"
        }
    }
};

var result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { "milvus结巴分词器中文测试" }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "text": ["milvus结巴分词器中文测试"],
  "analyzerParams": "{\"tokenizer\":{\"type\":\"jieba\",\"dict\":[\"_default_\"],\"mode\":\"exact\",\"hmm\":false,\"extra_dict_file\":{\"type\":\"remote\",\"resource_name\":\"zh_terms\",\"file_name\":\"zh_terms.txt\"}}}"
}'
```

</TabItem>
</Tabs>

`extra_dict_file` パラメーターは、次のフィールドを持つオブジェクトを受け入れます：

| フィールド | 説明 |
| --- | --- |
| `type` | リソースタイプです。`add_file_resource` を介して登録されたファイルには `"remote"` を使用します。 |
| `resource_name` | `add_file_resource` でファイルを登録したときに使用した名前です。 |
| `file_name` | 登録されたリソースのオブジェクトストアパスのファイル名部分です（たとえば、リソースを `path="file/zh_terms.txt"` で登録した場合、`"zh_terms.txt"`）。 |

`extra_dict_file` を介して追加された単語は組み込み辞書とマージされるため、jieba の分割アルゴリズムは既存のエントリと同様にそれらを認識します。特定の用語が単独のトークンとして現れるかどうかは、jieba の確率加重 DAG 選択によって決まります。`向量数据库` のような長いカスタム用語でも、組み込み辞書内でそれらの短いエントリの頻度が高い場合は、`向量` + `数据库` に分割されることがあります。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー構成\{#analyzer-configuration}

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
analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
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
    let analyzer_params = serde_json::json!({
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
nlohmann::json analyzerParams = {
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
using System.Collections.Generic;

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
export analyzerParams='{
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

### `run_analyzer` を使用した確認\{#verification-using-runanalyzer}

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
texts := []string{"milvus结巴分词器中文测试"}
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
use milvus::v2::prelude::*;

    let resp = client.run_analyzer(RunAnalyzerRequest::builder()
        .texts(vec!["milvus结巴分词器中文测试"])
        .analyzer_params(analyzer_params)
        .build()?).await?;
    println!("{:?}", resp.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include "milvus/MilvusClientV2.h"

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

const result = await client.runAnalyzer({
  text: "milvus结巴分词器中文测试",
  analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Utility;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

// Sample text to analyze
var sampleText = "milvus结巴分词器中文测试";

// Run the standard analyzer with the defined configuration
var result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = new[] { sampleText }
});
Console.WriteLine("Standard analyzer output: " + string.Join(", ", result.Results.SelectMany(r => r.Tokens.Select(t => t.Token))));
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "text": ["milvus结巴分词器中文测试"],
  "analyzerParams": "{\"tokenizer\":{\"type\":\"jieba\",\"dict\":[\"结巴分词器\"],\"mode\":\"exact\",\"hmm\":false}}"
}'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['milvus', '结巴分词器', '中', '文', '测', '试']
```

