---
title: "Analyzer 概述 | BYOC"
slug: /analyzer-overview
sidebar_label: "Analyzer 概述"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在文本处理中，Analyzer 是一个关键组件，用于将原始文本转换为结构化、可搜索的格式。每个 Analyzer 通常由两个核心元素组成：分词器（tokenizer）和过滤器（filter）。它们共同将输入文本转换为词元（token），并对这些词元进行优化，以便为高效的索引和检索做好准备。 | BYOC"
type: origin
token: XDNVwL0r1iSJgqk0XkkcVQK9nvh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# Analyzer 概述

在文本处理中，Analyzer 是一个关键组件，用于将原始文本转换为结构化、可搜索的格式。每个 Analyzer 通常由两个核心元素组成：分词器（tokenizer）和过滤器（filter）。它们共同将输入文本转换为词元（token），并对这些词元进行优化，以便为高效的索引和检索做好准备。  

在Zilliz Cloud中， Analyzer 在创建 Collection 时为 Collection Schema 中的 `VARCHAR` 字段进行配置。 Analyzer 生成的词元可用于构建关键字匹配的索引，或转换为稀疏向量以支持全文搜索。更多信息，请参阅[精确文本匹配](./text-match)或[全文搜索](./full-text-search)。  

<Admonition type="info" icon="📘" title="说明">

使用 Analyzer 可能会影响性能：  

- **全文搜索**：对于全文搜索，DataNode 和 QueryNode 通道的数据消耗速度较慢，因为它们必须等待分词完成。因此，新摄入的数据需要更长时间才能被搜索到。

- **关键字匹配**：对于关键字匹配，索引创建速度也较慢，因为需要先完成分词才能构建索引。  

</Admonition>

## Analyzer 的组成\{#anatomy-of-an-analyzer}

Zilliz Cloud中的 Analyzer 由一个分词器和零个或多个过滤器组成。  

- **分词器**：分词器将输入文本拆分为离散的词元。这些词元可以是单词或短语，具体取决于分词器的类型。

- **过滤器**：过滤器可应用于词元以进一步优化它们，例如将其转换为小写或移除常见词汇。

<Admonition type="info" icon="📘" title="说明">

分词器仅支持 UTF-8 格式。未来版本将增加对其他格式的支持。  

</Admonition>

以下工作流程展示了 Analyzer 如何处理文本。  

![FH9LwjBuphOJeRbwNWEcCS9Qn1c](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/FH9LwjBuphOJeRbwNWEcCS9Qn1c.png)

## Analyzer 类型\{#analyzer-types}

Zilliz Cloud提供两种类型的 Analyzer，以满足不同的文本处理需求：  

- **内置 Analyzer** ：这些是预定义的配置，覆盖常见的文本处理任务，设置简单。内置 Analyzer 非常适合通用搜索，因为它们不需要复杂的配置。

- **自定义 Analyzer** ：对于更高级的需求，自定义 Analyzer 允许您通过指定分词器和零个或多个过滤器来定义自己的配置。这种自定义级别特别适用于需要精确控制文本处理的专业场景。

<Admonition type="info" icon="📘" title="说明">

- 如果在创建 Collection 时省略 Analyzer 设置，Zilliz Cloud 会默认使用 `standard` Analyzer 来进行文本处理。更多详情，可以参考  [Standard](./standard-analyzer)。

- 为了更好地提升查询和搜索性能，根据您的文本语言选择一个合适的 Analyzer 是十分必要的。虽然 `standard` Analyzer 适用于大多数西方语言，但对于中文、日语和韩语这样有着特殊语法结构的语言来说却不是最佳选择。在这种情况下，建议您选择使用 `chinese` 或自定义使用指定分词器（如 lindera 或 icu）和过滤器的 Analyzer ，准确分词可以极大保障搜索结果的可靠性。

</Admonition>

### 内置 Analyzer \{#built-in-analyzer}

Zilliz Cloud 集群中的内置 Analyzer 预配置了特定的分词器和过滤器，您可以直接使用它们，而无需自行定义这些组件。每个内置 Analyzer 都作为一个模板，包含预设的分词器和过滤器，并提供可选的参数以供自定义。  

例如，要使用标准内置 Analyzer ，只需将其名称 `standard` 指定为类型，并可选择包含特定于此 Analyzer 类型的额外配置，例如 `stop_words`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] # Defines a list of common words (stop words) to exclude from tokenization
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Arrays.asList("a", "an", "for"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Uses the standard built-in analyzer
    "stop_words": ["a", "an", "for"] // Defines a list of common words (stop words) to exclude from tokenization
};
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
       "type": "standard",
       "stop_words": ["a", "an", "for"]
    }'
```

</TabItem>
</Tabs>

您可以使用 `run_analyzer` 方法来检查 Analyzer 的执行效果。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample text to analyze
text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

# Run analyzer
result = client.run_analyzer(
    text,
    analyzer_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

List<String> texts = new ArrayList<>();
texts.add("An efficient system relies on a robust analyzer to correctly process text for various applications.");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascrip# Sample text to analyze
const text = "An efficient system relies on a robust analyzer to correctly process text for various applications."

// Run analyzer
const result = await client.run_analyzer({
    text,
    analyzer_params
});
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

bs, _ := json.Marshal(analyzerParams)
texts := []string{"An efficient system relies on a robust analyzer to correctly process text for various applications."}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

输出结果如下：

```sql
['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```

结果显示了当前 Analyzer 将输入文本进行了处理，丢弃了诸如 `"a"`、`"an"` 和 `"for"` 这样的停用词，仅返回了有明确含义的词元。

上述 `standard` 内置 Analyzer 的配置相当于通过以下参数设置自定义 Analyzer ，其中明确定义了分词器和过滤器选项，以实现类似的功能：  

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stop",
            "stop_words": ["a", "an", "for"]
        }
    ]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Arrays.asList("lowercase",
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Arrays.asList("a", "an", "for"));
                }}));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": [
        "lowercase",
        {
            "type": "stop",
            "stop_words": ["a", "an", "for"]
        }
    ]
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{"lowercase", map[string]any{
        "type":       "stop",
        "stop_words": []string{"a", "an", "for"},
    }}}
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
       "type": "standard",
       "filter":  [
       "lowercase",
       {
            "type": "stop",
            "stop_words": ["a", "an", "for"]
       }
   ]
}'
```

</TabItem>
</Tabs>

Zilliz Cloud 提供了以下内置 Analyzer ，每个 Analyzer 都针对特定的文本处理需求设计：  

- `standard`：适用于通用文本处理，应用标准分词和小写过滤。

- `english`：针对英文文本优化，支持英文停用词。

- `chinese`：专为中文文本处理设计，包括适应中文语言结构的分词。

有关内置 Analyzer 及其可自定义设置的列表，请参阅[内置 Analyzer](./undefined)。  

### 自定义 Analyzer \{#custom-analyzer}

对于更高级的文本处理，Zilliz Cloud 中的自定义 Analyzer 允许您通过指定分词器和过滤器来构建定制的文本处理管道。这种设置非常适合需要精确控制的专业场景。  

#### 分词器\{#tokenizer}

分词器是自定义 Analyzer 的必备组件，它通过将输入文本拆分为离散的词元来启动 Analyzer 管道。分词遵循特定规则，例如根据空格或标点符号进行拆分，具体取决于分词器类型。此过程允许对每个单词或短语进行更精确和独立的处理。  

例如，分词器会将文本 `"Vector Database Built for Scale"` 转换为以下单独的词元：  

```plaintext
["Vector", "Database", "Built", "for", "Scale"]
```

**指定分词器的示例：**  

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace",
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "whitespace"}
```

</TabItem>

<TabItem value='bash'>

```bash
export analyzerParams='{
       "type": "whitespace"
    }'
```

</TabItem>
</Tabs>

#### 过滤器\{#filter}

过滤器是**可选**组件，用于对分词器生成的词元进行转换或优化。例如，对分词后的词元 `["Vector", "Database", "Built", "for", "Scale"]` 应用小写过滤器后，结果可能为：  

```sql
["vector", "database", "built", "for", "scale"]
```

自定义 Analyzer 中的过滤器可以是内置的，也可以是自定义的，具体取决于配置需求。  

- **内置过滤器**：由 Zilliz Cloud 预配置，设置简单。您可以通过指定名称直接使用这些过滤器。以下是可直接使用的内置过滤器：  

    - `lowercase`：将文本转换为小写，确保大小写不敏感匹配。更多详情，请参考 [Lowercase](./lowercase-filter)。

    - `asciifolding`：将非 ASCII 字符转换为 ASCII 等效字符，简化多语言文本处理。更多详情，请参考 [ASCII folding](./ascii-folding-filter)。

    - `alphanumonly`：仅保留字母数字字符，移除其他字符。更多详情，请参考 [Alphanumonly](./alphanumonly-filter)。

    - `cnalphanumonly`：移除包含中文字符、英文字母或数字以外的字符的词元。更多详情，请参考 [Cnalphanumonly](./cnalphanumonly-filter)。

    - `cncharonly`：移除包含非中文字符的词元。 更多详情，请参考 [Cncharonly](./cncharonly-filter)。

      **使用内置过滤器的示例：**  

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    analyzer_params = {
        "tokenizer": "standard", # Mandatory: Specifies tokenizer
        "filter": ["lowercase"], # Optional: Built-in filter that converts text to lowercase
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    Map<String, Object> analyzerParams = new HashMap<>();
    analyzerParams.put("tokenizer", "standard");
    analyzerParams.put("filter", Collections.singletonList("lowercase"));
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // Mandatory: Specifies tokenizer
        "filter": ["lowercase"], // Optional: Built-in filter that converts text to lowercase
    }
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
            "filter": []any{"lowercase"}}
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export analyzerParams='{
           "type": "standard",
           "filter":  ["lowercase"]
        }'
    ```

    </TabItem>
    </Tabs>

- **自定义过滤器**：自定义过滤器允许进行专门的配置。您可以通过选择有效的过滤器类型（`filter.type`）并为每种过滤器类型添加特定设置来定义自定义过滤器。支持自定义的过滤器类型示例：  

    - `stop`：通过设置停用词列表移除指定的常见词（例如 `"stop_words": ["of", "to"]`）。更多详情，请参考 [Stop](./stop-filter)。

    - `length`：根据长度标准排除词元，例如设置最大词元长度。更多详情，请参考 [Length](./length-filter)。

    - `stemmer`：将单词还原为其词根形式，以实现更灵活的匹配。更多详情，请参考 [Stemmer](./stemmer-filter)。

      **配置自定义过滤器的示例：**  

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    analyzer_params = {
        "tokenizer": "standard", # Mandatory: Specifies tokenizer
        "filter": [
            {
                "type": "stop", # Specifies 'stop' as the filter type
                "stop_words": ["of", "to"], # Customizes stop words for this filter type
            }
        ]
    }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    Map<String, Object> analyzerParams = new HashMap<>();
    analyzerParams.put("tokenizer", "standard");
    analyzerParams.put("filter",
            Collections.singletonList(new HashMap<String, Object>() {{
                put("type", "stop");
                put("stop_words", Arrays.asList("a", "an", "for"));
            }}));
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    const analyzer_params = {
        "tokenizer": "standard", // Mandatory: Specifies tokenizer
        "filter": [
            {
                "type": "stop", // Specifies 'stop' as the filter type
                "stop_words": ["of", "to"], // Customizes stop words for this filter type
            }
        ]
    };
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
        "filter": []any{map[string]any{
            "type":       "stop",
            "stop_words": []string{"of", "to"},
        }}}
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export analyzerParams='{
           "type": "standard",
           "filter":  [
           {
                "type": "stop",
                "stop_words": ["a", "an", "for"]
           }
        ]
    }'
    ```

    </TabItem>
    </Tabs>

## 使用示例\{#example-use}

在本示例中，我们定义了一个集合模式，其中包含

- 一个用于嵌入向量的向量字段和

- 两个用于文本处理功能的 VARCHAR 字段。其中，

    - 一个 VARCHAR 字段使用了内置的 Analyzer，

    - 另一个 VARCHAR 字段使用了自定义的 Analyzer

### 步骤 1： 初始化 Milvus Client 并创建 Schema\{#step-1-initialize-milvusclient-and-create-schema}

首先，参考如下代码创建 MilvusClient 并创建 Schema。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Set up a Milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT"，
    token="YOUR_CLUSTER_TOKEN"
)

# Create a new schema
schema = client.create_schema(auto_id=True, enable_dynamic_field=False)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// Set up a Milvus client
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

// Create schema
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(false)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

// Set up a Milvus client
const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)  

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
})
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
defer client.Close(ctx)

schema := entity.NewSchema().WithAutoID(true).WithDynamicFieldEnabled(false)
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### 步骤 2：定义并验证 Analyzer 配置\{#define-and-verify-analyzer-configurations}

1. **配置并验证内置 Analyzer 配置**（`chinese`）:

    - **配置**：确定内置 Chinese Analyzer 的参数设置。

    - **验证**：使用 `run_analyzer` 检查当前配置的输出是否符合预期。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Built-in analyzer configuration for English text processing
    analyzer_params_built_in = {
        "type": "chinese"
    }
    
    # Verify built-in analyzer configuration
    sample_text = "Milvus simplifies text analysis for search."
    result = client.run_analyzer(sample_text, analyzer_params_built_in)
    print("Built-in analyzer output:", result)
    
    # Expected output:
    # Built-in analyzer output: ['milvus', 'simplifi', 'text', 'analysi', 'search']
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    Map<String, Object> analyzerParamsBuiltin = new HashMap<>();
    analyzerParamsBuiltin.put("type", "chinese");
    
    List<String> texts = new ArrayList<>();
    texts.add("Milvus simplifies text ana
    
    lysis for search.");
    
    RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
            .texts(texts)
            .analyzerParams(analyzerParams)
            .build());
    List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Use a built-in analyzer for VARCHAR field `title_en`
    const analyzerParamsBuiltIn = {
      type: "chinese",
    };
    
    const sample_text = "Milvus simplifies text analysis for search.";
    const result = await client.run_analyzer({
        text: sample_text, 
        analyzer_params: analyzer_params_built_in
    });
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams := map[string]any{"type": "chinese"}
    
    bs, _ := json.Marshal(analyzerParams)
    texts := []string{"Milvus simplifies text analysis for search."}
    option := milvusclient.NewRunAnalyzerOption(texts).
        WithAnalyzerParams(string(bs))
    
    result, err := client.RunAnalyzer(ctx, option)
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # restful
    ```

    </TabItem>
    </Tabs>

1. 配置并验证自定义分词器：

    - **配置**：创建一个自定义 Analyzer。其中，分词器为 `standard`，过滤器为内置的 `lowercase` 和按词元长度和停用词表过滤的自定义过滤器。

    - **验证**：使用 `run_analyzer` 检查当前配置的输出是否符合预期。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Custom analyzer configuration with a standard tokenizer and custom filters
    analyzer_params_custom = {
        "tokenizer": "standard",
        "filter": [
            "lowercase",  # Built-in filter: convert tokens to lowercase
            {
                "type": "length",  # Custom filter: restrict token length
                "max": 40
            },
            {
                "type": "stop",  # Custom filter: remove specified stop words
                "stop_words": ["of", "for"]
            }
        ]
    }
    
    # Verify custom analyzer configuration
    sample_text = "Milvus provides flexible, customizable analyzers for robust text processing."
    result = client.run_analyzer(sample_text, analyzer_params_custom)
    print("Custom analyzer output:", result)
    
    # Expected output:
    # Custom analyzer output: ['milvus', 'provides', 'flexible', 'customizable', 'analyzers', 'robust', 'text', 'processing']
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Configure a custom analyzer
    Map<String, Object> analyzerParams = new HashMap<>();
    analyzerParams.put("tokenizer", "standard");
    analyzerParams.put("filter",
            Arrays.asList("lowercase",
                    new HashMap<String, Object>() {{
                        put("type", "length");
                        put("max", 40);
                    }},
                    new HashMap<String, Object>() {{
                        put("type", "stop");
                        put("stop_words", Arrays.asList("of", "for"));
                    }}
            )
    );
    
    List<String> texts = new ArrayList<>();
    texts.add("Milvus provides flexible, customizable analyzers for robust text processing.");
    
    RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
            .texts(texts)
            .analyzerParams(analyzerParams)
            .build());
    List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // Configure a custom analyzer for VARCHAR field `title`
    const analyzerParamsCustom = {
      tokenizer: "standard",
      filter: [
        "lowercase",
        {
          type: "length",
          max: 40,
        },
        {
          type: "stop",
          stop_words: ["of", "to"],
        },
      ],
    };
    const sample_text = "Milvus provides flexible, customizable analyzers for robust text processing.";
    const result = await client.run_analyzer({
        text: sample_text, 
        analyzer_params: analyzer_params_built_in
    });
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    analyzerParams = map[string]any{"tokenizer": "standard",
        "filter": []any{"lowercase", 
        map[string]any{
            "type": "length",
            "max":  40,
        map[string]any{
            "type": "stop",
            "stop_words": []string{"of", "to"},
        }}}
        
    bs, _ := json.Marshal(analyzerParams)
    texts := []string{"Milvus provides flexible, customizable analyzers for robust text processing."}
    option := milvusclient.NewRunAnalyzerOption(texts).
        WithAnalyzerParams(string(bs))
    
    result, err := client.RunAnalyzer(ctx, option)
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # curl
    ```

    </TabItem>
    </Tabs>

### 步骤 3：将 Analyzer 添加到字段中\{#add-analyzer-to-schema-field}

在验证了 Analayzer 的配置后，您就可以参考如下示例将 Analyzer 添加到目标字段中。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add VARCHAR field 'title_en' using the built-in analyzer configuration
schema.add_field(
    field_name='title_en',
    datatype=DataType.VARCHAR,
    max_length=1000,
    enable_analyzer=True,
    analyzer_params=analyzer_params_built_in,
    enable_match=True,
)

# Add VARCHAR field 'title' using the custom analyzer configuration
schema.add_field(
    field_name='title',
    datatype=DataType.VARCHAR,
    max_length=1000,
    enable_analyzer=True,
    analyzer_params=analyzer_params_custom,
    enable_match=True,
)

# Add a vector field for embeddings
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=3)

# Add a primary key field
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
```

</TabItem>

<TabItem value='java'>

```java
schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .analyzerParams(analyzerParams)
        .enableMatch(true) // must enable this if you use TextMatch
        .build());

// Add vector field
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(3)
        .build());
// Add primary field
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Create schema
const schema = {
  auto_id: true,
  fields: [
    {
      name: "id",
      type: DataType.INT64,
      is_primary: true,
    },
    {
      name: "title_en",
      data_type: DataType.VARCHAR,
      max_length: 1000,
      enable_analyzer: true,
      analyzer_params: analyzerParamsBuiltIn,
      enable_match: true,
    },
    {
      name: "title",
      data_type: DataType.VARCHAR,
      max_length: 1000,
      enable_analyzer: true,
      analyzer_params: analyzerParamsCustom,
      enable_match: true,
    },
    {
      name: "embedding",
      data_type: DataType.FLOAT_VECTOR,
      dim: 4,
    },
  ],
};
```

</TabItem>

<TabItem value='go'>

```go
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(3),
).WithField(entity.NewField().
    WithName("title").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(1000).
    WithEnableAnalyzer(true).
    WithAnalyzerParams(analyzerParams).
    WithEnableMatch(true),
)
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### 步骤 4：准备索引参数并创建 Collection\{#prepare-index-parameters-and-create-the-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set up index parameters for the vector field
index_params = client.prepare_index_params()
index_params.add_index(field_name="embedding", metric_type="COSINE", index_type="AUTOINDEX")

# Create the collection with the defined schema and index parameters
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
// Set up index params for vector field
List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());

// Create collection with defined schema
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Set up index params for vector field
const indexParams = [
  {
    name: "embedding",
    metric_type: "COSINE",
    index_type: "AUTOINDEX",
  },
];

// Create collection with defined schema
await client.createCollection({
  collection_name: "my_collection",
  schema: schema,
  index_params: indexParams,
});

console.log("Collection created successfully!");
```

</TabItem>

<TabItem value='go'>

```go
idx := index.NewAutoIndex(index.MetricType(entity.COSINE))
indexOption := milvusclient.NewCreateIndexOption("my_collection", "embedding", idx)

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## 使用示例：通过控制台配置\{#example-use-on-the-zilliz-cloud-console}

您也可以使用 Zilliz Cloud 控制台完成上述配置。具体可参考如下演示。

<Supademo id="cmfxiu7c342st10k8ql0xi1av" title=""  />

<Admonition type="info" icon="📘" title="**说明**">

Analyzer 配置在 Collection 创建后不可修改。如需更改 Analyzer 配置，请创建新的 Collection 并[迁移](./migrate-between-clusters)数据。

</Admonition>

## 更进一步\{#whats-next}

在配置 Analayzer 时，建议您参考如下文章了解如何针对您的数据集选择合适的 Analayzer 配置。

-  [最佳实践](./choose-the-right-analyzer-for-your-use-case)

在配置了 Analyzer 后，您就可以使用 Zilliz Cloud 提供的文本检索能力。更多内容，可参阅

- [Full Text Search](./full-text-search)

- [Text Match](./text-match)

