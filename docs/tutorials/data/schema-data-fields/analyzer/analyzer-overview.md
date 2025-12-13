---
title: "Analyzer Overview | Cloud"
slug: /analyzer-overview
sidebar_label: "Overview"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In text processing, an analyzer is a crucial component that converts raw text into a structured, searchable format. Each analyzer typically consists of two core elements tokenizer and filter. Together, they transform input text into tokens, refine these tokens, and prepare them for efficient indexing and retrieval. | Cloud"
type: origin
token: H8MVwnjdgihp0hkRHHKcjBe9n5e
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer explained
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# Analyzer Overview

In text processing, an **analyzer** is a crucial component that converts raw text into a structured, searchable format. Each analyzer typically consists of two core elements: **tokenizer** and **filter**. Together, they transform input text into tokens, refine these tokens, and prepare them for efficient indexing and retrieval.

In Zilliz Cloud, analyzers are configured during collection creation when you add `VARCHAR` fields to the collection schema. Tokens produced by an analyzer can be used to build an index for keyword matching or converted into sparse embeddings for full text search. For more information, refer to  [Full Text Search](./full-text-search) or [Text Match](./text-match).

<Admonition type="info" icon="📘" title="Notes">

<p>The use of analyzers may impact performance:</p>
<ul>
<li><p><strong>Full text search:</strong> For full text search, <strong>DataNode</strong> and <strong>QueryNode</strong> channels consume data more slowly because they must wait for tokenization to complete. As a result, newly ingested data takes longer to become available for search.</p></li>
<li><p><strong>Keyword match:</strong> For keyword matching, index creation is also slower since tokenization needs to finish before an index can be built.</p></li>
</ul>

</Admonition>

## Anatomy of an analyzer\{#anatomy-of-an-analyzer}

An analyzer in Zilliz Cloud consists of exactly one **tokenizer** and **zero or more** filters.

- **Tokenizer**: The tokenizer breaks input text into discrete units called tokens. These tokens could be words or phrases, depending on the tokenizer type.

- **Filters**: Filters can be applied to tokens to further refine them, for example, by making them lowercase or removing common words.

<Admonition type="info" icon="📘" title="Notes">

<p>Tokenizers support only UTF-8 format. Support for other formats will be added in future releases.</p>

</Admonition>

The workflow below shows how an analyzer processes text.

![Ke6jw8437hjR8hbZCvEcQtIIn1e](https://zdoc-images.s3.us-west-2.amazonaws.com/Ke6jw8437hjR8hbZCvEcQtIIn1e.png)

## Analyzer types\{#analyzer-types}

Zilliz Cloud provides two types of analyzers to meet different text processing needs:

- **Built-in analyzer**: These are predefined configurations that cover common text processing tasks with minimal setup. Built-in analyzers are ideal for general-purpose searches, as they require no complex configuration.

- **Custom analyzer**: For more advanced requirements, custom analyzers allow you to define your own configuration by specifying both the tokenizer and zero or more filters. This level of customization is especially useful for specialized use cases where precise control over text processing is needed.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>If you omit analyzer configurations during collection creation, Zilliz Cloud uses the <code>standard</code> analyzer for all text processing by default. For details, refer to <a href="./standard-analyzer">Standard</a>.</p></li>
<li><p>For optimal search and query performance, choose an analyzer that matches the language of your text data. For instance, while the <code>standard</code> analyzer is versatile, it may not be the best choice for languages with unique grammatical structures, such as Chinese, Japanese, or Korean. In such cases, using a language-specific analyzer like <a href="./chinese-analyzer"><code>chinese</code></a> or custom analyzers with specialized tokenizers (such as <a href="./lindera-tokenizer"><code>lindera</code></a>, <a href="./icu-tokenizer"><code>icu</code></a>) and filters is highly recommended to ensure accurate tokenization and better search results.</p></li>
</ul>

</Admonition>

### Built-in analyzer\{#built-in-analyzer}

Built-in analyzers in Zilliz Cloud clusters are pre-configured with specific tokenizers and filters, allowing you to use them immediately without needing to define these components yourself. Each built-in analyzer serves as a template that includes a preset tokenizer and filters, with optional parameters for customization.

For example, to use the `standard` built-in analyzer, simply specify its name `standard` as the `type` and optionally include extra configurations specific to this analyzer type, such as `stop_words`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
analyzerParams := map[string]any{"type": "standard", "stop_words": []string{"a", "an", "for"}}
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

To check the execution result of an analyzer, use the `run_analyzer` method:

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
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export TEXT_TO_ANALYZE="An efficient system relies on a robust analyzer to correctly process text for various applications."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
  -H "Content-Type: application/json" \
  -d '{
    "text": ["'"${TEXT_TO_ANALYZE}"'"],
    "analyzerParams": "{\"type\":\"standard\",\"stop_words\":[\"a\",\"an\",\"for\"]}"
  }'
```

</TabItem>
</Tabs>

The output will be:

```plaintext
['efficient', 'system', 'relies', 'on', 'robust', 'analyzer', 'to', 'correctly', 'process', 'text', 'various', 'applications']
```

This demonstrates that the analyzer properly tokenizes the input text by filtering out the stop words `"a"`, `"an"`, and `"for"`, while returning the remaining meaningful tokens.

The configuration of the `standard` built-in analyzer above is equivalent to setting up a [custom analyzer](./analyzer-overview#custom-analyzer) with the following parameters, where `tokenizer` and `filter` options are explicitly defined to achieve similar functionality:

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

Zilliz Cloud offers the following built-in analyzers, each designed for specific text processing needs:

- `standard`: Suitable for general-purpose text processing, applying standard tokenization and lowercase filtering.

- `english`: Optimized for English-language text, with support for English stop words.

- `chinese`: Specialized for processing Chinese text, including tokenization adapted for Chinese language structures.

### Custom analyzer\{#custom-analyzer}

For more advanced text processing, custom analyzers in Zilliz Cloud allow you to build a tailored text-handling pipeline by specifying both a **tokenizer** and **filters**. This setup is ideal for specialized use cases where precise control is required.

#### Tokenizer\{#tokenizer}

The **tokenizer** is a **mandatory** component for a custom analyzer, which initiates the analyzer pipeline by breaking down input text into discrete units or **tokens**. Tokenization follows specific rules, such as splitting by whitespace or punctuation, depending on the tokenizer type. This process allows for more precise and independent handling of each word or phrase.

For example, a tokenizer would convert text `"Vector Database Built for Scale"` into separate tokens:

```plaintext
["Vector", "Database", "Built", "for", "Scale"]
```

**Example of specifying a tokenizer**:

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

#### Filter\{#filter}

**Filters** are **optional** components working on the tokens produced by the tokenizer, transforming or refining them as needed. For example, after applying a `lowercase` filter to the tokenized terms `["Vector", "Database", "Built", "for", "Scale"]`, the result might be:

```sql
["vector", "database", "built", "for", "scale"]
```

Filters in a custom analyzer can be either **built-in** or **custom**, depending on configuration needs.

- **Built-in filters**: Pre-configured by Zilliz Cloud, requiring minimal setup. You can use these filters out-of-the-box by specifying their names. The filters below are built-in for direct use:

    - `lowercase`: Converts text to lowercase, ensuring case-insensitive matching. For details, refer to [Lowercase](./lowercase-filter).

    - `asciifolding`: Converts non-ASCII characters to ASCII equivalents, simplifying multilingual text handling. For details, refer to [ASCII folding](./ascii-folding-filter).

    - `alphanumonly`: Retains only alphanumeric characters by removing others. For details, refer to [Alphanumonly](./alphanumonly-filter).

    - `cnalphanumonly`: Removes tokens that contain any characters other than Chinese characters, English letters, or digits. For details, refer to [Cnalphanumonly](./cnalphanumonly-filter).

    - `cncharonly`: Removes tokens that contain any non-Chinese characters. For details, refer to [Cncharonly](./cncharonly-filter).

    **Example of using a built-in filter:**

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

- **Custom filters**: Custom filters allow for specialized configurations. You can define a custom filter by choosing a valid filter type (`filter.type`) and adding specific settings for each filter type. Examples of filter types that support customization:

    - `stop`: Removes specified common words by setting a list of stop words (e.g., `"stop_words": ["of", "to"]`). For details, refer to [Stop](./stop-filter).

    - `length`: Excludes tokens based on length criteria, such as setting a maximum token length. For details, refer to [Length](./length-filter).

    - `stemmer`: Reduces words to their root forms for more flexible matching. For details, refer to [Stemmer](./stemmer-filter).

    **Example of configuring a custom filter:**

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

## Example use\{#example-use}

In this example, you will create a collection schema that includes:

- A vector field for embeddings.

- Two `VARCHAR` fields for text processing:

    - One field uses a built-in analyzer.

    - The other uses a custom analyzer.

Before incorporating these configurations into your collection, you'll verify each analyzer using the `run_analyzer` method.

### Step 1: Initialize MilvusClient and create schema\{#step-1-initialize-milvusclient-and-create-schema}

Begin by setting up the Milvus client and creating a new schema.

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
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export MILVUS_TOKEN="YOUR_CLUSTER_TOKEN"
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/collections/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MILVUS_TOKEN}" \
  -d '{
    "collectionName": "my_collection",
    "dimension": 768,
    "schema": {
      "autoId": true,
      "enableDynamicField": false
    }
  }'
```

</TabItem>
</Tabs>

### Step 2: Define and verify analyzer configurations\{#step-2-define-and-verify-analyzer-configurations}

1. **Configure and verify a built-in analyzer** (`english`)**:**

    - **Configuration:** Define the analyzer parameters for the built-in English analyzer.

    - **Verification:** Use `run_analyzer` to check that the configuration produces the expected tokenization.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Built-in analyzer configuration for English text processing
    analyzer_params_built_in = {
        "type": "english"
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
    analyzerParamsBuiltin.put("type", "english");
    
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
      type: "english",
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
    analyzerParams := map[string]any{"type": "english"}
    
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
    export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
    export SAMPLE_TEXT="Milvus simplifies text analysis for search."
    curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
      -H "Content-Type: application/json" \
      -d '{
        "text": ["'"${SAMPLE_TEXT}"'"],
        "analyzerParams": "{\"type\":\"english\"}"
      }'
    ```

    </TabItem>
    </Tabs>

1. **Configure and verify a custom analyzer:**

    - **Configuration:** Define a custom analyzer that uses a standard tokenizer along with a built-in lowercase filter and custom filters for token length and stop words.

    - **Verification:** Use `run_analyzer` to ensure the custom configuration processes text as intended.

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
    export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
    export SAMPLE_TEXT="Milvus provides flexible, customizable analyzers for robust text processing."
    
    # 使用自定义分析器配置
    curl -X POST "http://${MILVUS_HOST}/v2/vectordb/common/run_analyzer" \
      -H "Content-Type: application/json" \
      -d '{
        "text": ["'"${SAMPLE_TEXT}"'"],
        "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",{\"type\":\"length\",\"max\":40},{\"type\":\"stop\",\"stop_words\":[\"of\",\"for\"]}]}"
      }'
    ```

    </TabItem>
    </Tabs>

### Step 3: Add analyzer to schema field\{#step-3-add-analyzer-to-schema-field}

Now that you have verified your analyzer configurations, add them to your schema fields:

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
export SCHEMA_CONFIG='{
  "autoId": false,
  "enableDynamicField": false,
  "fields": [
    {
      "fieldName": "id",
      "dataType": "Int64",
      "isPrimary": true
    },
    {
      "fieldName": "title_en",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "1000",
        "enable_analyzer": true,
        "analyzer_params": "{\"type\":\"english\"}",
        "enable_match": true
      }
    },
    {
      "fieldName": "title",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "1000",
        "enable_analyzer": true,
        "analyzer_params": "{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",{\"type\":\"length\",\"max\":40},{\"type\":\"stop\",\"stop_words\":[\"of\",\"for\"]}]}",
        "enable_match": true
      }
    },
    {
      "fieldName": "embedding",
      "dataType": "FloatVector",
      "elementTypeParams": {
        "dim": "3"
      }
    }
  ]
}'

```

</TabItem>
</Tabs>

### Step 4: Prepare index parameters and create the collection\{#step-4-prepare-index-parameters-and-create-the-collection}

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
export INDEX_PARAMS='[{"fieldName": "embedding", "metricType": "COSINE", "indexType": "AUTOINDEX"}]'
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"collectionName\": \"my_collection\",
    \"schema\": ${SCHEMA_CONFIG},
    \"indexParams\": ${INDEX_PARAMS}
  }"
```

</TabItem>
</Tabs>

## Example use on the Zilliz Cloud console\{#example-use-on-the-zilliz-cloud-console}

You can also use the Zilliz Cloud console to perform the above operations. For details, play the demo below.

<Supademo id="cmfxfue5c41ld10k86la66x1v" title=""  />

## What's next\{#whats-next}

When configuring an analyzer, we recommend reading the following best practice article to determine the most suitable configurations for your use case:

- [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case)

After configuring an analyzer, you can integrate with text retrieval features provided by Zilliz Cloud. For details:

- [Full Text Search](./full-text-search)

- [Text Match](./text-match)

