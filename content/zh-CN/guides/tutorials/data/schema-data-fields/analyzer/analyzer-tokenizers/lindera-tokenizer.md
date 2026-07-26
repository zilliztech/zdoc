---
title: "Lindera | Cloud"
slug: /lindera-tokenizer
sidebar_key: lindera-tokenizer
sidebar_label: "Lindera"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "`lindera` 分词器执行基于词典的形态素分析，专为日语和韩语设计——这两种语言的词汇之间没有空格分隔，且语法标记（助词）直接附着在词汇上。 | Cloud"
type: origin
token: IWMVwdnisijLNGkLUlAcCZCmnWc
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 标量字段
  - 分析器
  - analyzer
  - tokenizer
  - filter
  - lindera

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lindera

`lindera` 分词器执行基于词典的形态素分析，专为日语和韩语设计——这两种语言的词汇之间没有空格分隔，且语法标记（助词）直接附着在词汇上。

<Admonition type="info" icon="📘" title="说明">

**中文用户**：虽然 `lindera` 通过 `cc-cedict` 词典支持中文，但我们推荐使用 `[jieba](jieba-tokenizer.md)` 分词器。[Jieba](./jieba-tokenizer) 专为中文分词设计，能提供更好的效果。

</Admonition>

## 概述\{#overview}

日语和韩语都是**黏着语**：语法标记（助词）直接附着在名词上，形成大量组合。例如：

<table>
   <tr>
     <th><p>语言</p></th>
     <th><p>词根</p></th>
     <th><ul><li>助词</li></ul></th>
     <th><p>= 组合形式</p></th>
     <th><p>含义</p></th>
   </tr>
   <tr>
     <td><p>Korean</p></td>
     <td><p>서울 (Seoul)</p></td>
     <td><p>에서</p></td>
     <td><p>서울에서</p></td>
     <td><p>在首尔</p></td>
   </tr>
   <tr>
     <td><p>Japanese</p></td>
     <td><p>東京 (Tokyo)</p></td>
     <td><p>に</p></td>
     <td><p>東京に</p></td>
     <td><p>向东京</p></td>
   </tr>
</table>

`lindera` 分词器的处理流程：

1. **分词**：将文本拆分为独立的词素（词汇和助词）

1. **词性标注**：为每个 token 标注词典中的词性（POS）信息

1. **过滤**：移除不需要的 token（如助词、标点）

这种"先分词，再按词性过滤"的两阶段处理流程，使用户能够精确控制哪些 token 被索引用于搜索。

## 配置\{#configuration}

要配置使用 `lindera` 分词器的分析器，将 `tokenizer.type` 设置为 `lindera`，通过 `dict_kind` 选择词典，并可选地应用过滤器。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>参数名称</p></th>
     <th><p>参数描述</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>分词器类型，在使用 Lindera 分词器时，该值为 <code>lindera</code>。</p></td>
   </tr>
   <tr>
     <td><p><code>dict_kind</code></p></td>
     <td><p>作为参考词表的字典。取值范围如下：</p><ul><li><p><code>ko-dic</code>：韩语 - 韩语词形学字典 (<a href="https://bitbucket.org/eunjeon/mecab-ko-dic">MeCab Ko-dic</a>)</p></li><li><p><code>ipadic</code>：日语 - 标准词形学字典 (<a href="https://taku910.github.io/mecab/">MeCab IPADIC</a>)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>filter</code></p></td>
     <td><p>分词后应用的分词器级别过滤器列表。每个过滤器是一个包含以下字段的对象：</p><ul><li><p><code>kind</code>：过滤器类型。支持的值：</p><ul><li><p><code>korean_stop_tags</code>：移除匹配指定韩语词性标签的 token。</p></li><li><p><code>japanese_stop_tags</code>：移除匹配指定日语词性标签的 token。</p></li></ul></li><li><p><code>tags</code>：要过滤的词性标签列表。可用的标签取决于 <code>kind</code> 的值：</p><ul><li><p>对于 <code>korean_stop_tags</code>：使用准确的标签代码（如 <code>JKS</code>、<code>JKO</code>、<code>SF</code>）。韩语标签需要精确匹配。基于世宗标注体系的完整标签列表请参见 <a href="https://docs.rs/lindera/latest/src/lindera/token_filter/korean_stop_tags.rs.html">Lindera 韩语 stop tags 源码</a>。</p></li><li><p>对于 <code>japanese_stop_tags</code>：对于 <code>japanese_stop_tags</code>：使用准确的标签代码（如 <code>助詞,格助詞</code>、<code>助詞,係助詞</code>、<code>助動詞</code>）。日语标签需要精确匹配。完整的标签列表（IPADIC）请参见<a href="https://github.com/taku910/mecab/blob/master/mecab-ipadic/pos-id.def">日语词性标签参考</a>。</p></li></ul></li></ul></td>
   </tr>
</table>

在定义了 `analyzer_params` 后，您可以在定义 Collection Schema 时将其应用到 VARCHAR 类型的字段上。Zilliz Cloud 将会根据 Analyzer 的设置对该字段的内容进行分词和过滤。更多详情，可参考[使用示例](./analyzer-overview#example-use)。

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### 韩语示例\{#korean-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
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
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

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

bs, _ := json.Marshal(analyzerParams)
texts := []string{"서울에서 맛있는 음식을 먹었습니다"}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  uri: "YOUR_CLUSTER_ENDPOINT",
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

const result = await client.run_analyzer(sample_text, analyzer_params);
console.log("Analyzer output:", result);

```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

**预期输出**：

```plaintext
['서울', '맛있', '음식', '먹', '습니다']
```

如果不使用 `korean_stop_tags`，输出将包含助词，如 `에서`（在）、`는`（主题标记）和 `을`（宾语标记），这些通常对搜索没有帮助。

### 日语示例\{#japanese-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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
// java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript

import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  uri: "YOUR_CLUSTER_ENDPOINT",
});

const analyzer_params = {
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

// Sample Japanese text: "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"
const sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"

const result = await client.run_analyzer(sample_text, analyzer_params);
console.log("Analyzer output:", result);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

**预期输出**：

```plaintext
['東京', 'スカイ', 'ツリー', '最寄り駅', 'とう', 'きょう', 'スカイ', 'ツリー', '駅']
```
