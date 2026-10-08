---
title: "Language Identifier | BYOC"
slug: /language-identifier-tokenizer
sidebar_label: "Language Identifier"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `languageidentifier` is a specialized tokenizer designed to enhance the text search capabilities of Zilliz Cloud by automating the language analysis process. Its primary function is to detect the language of a text field and then dynamically apply a pre-configured analyzer that is most suitable for that language. This is particularly valuable for applications that handle a variety of languages, as it eliminates the need for manual language assignment on a per-input basis. | BYOC"
type: origin
token: X6wiwFkuFiF8nekse05cnBIPnic
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Language Identifier

The `language_identifier` is a specialized tokenizer designed to enhance the text search capabilities of Zilliz Cloud by automating the language analysis process. Its primary function is to detect the language of a text field and then dynamically apply a pre-configured analyzer that is most suitable for that language. This is particularly valuable for applications that handle a variety of languages, as it eliminates the need for manual language assignment on a per-input basis.

By intelligently routing text data to the appropriate processing pipeline, the `language_identifier` streamlines multilingual data ingestion and ensures accurate tokenization for subsequent search and retrieval operations.

## Language detection workflow\{#language-detection-workflow}

The `language_identifier` performs a series of steps to process a text string, a workflow that is critical for users to understand how to configure it correctly.

![NZcFw5PuxhQcl1bUG60cS54QnMu](https://zdoc-images.s3.us-west-2.amazonaws.com/NZcFw5PuxhQcl1bUG60cS54QnMu.png)

1. **Input:** The workflow begins with a text string as input.

1. **Language detection:** This string is first passed to a language detection engine, which attempts to identify the language. Zilliz Cloud supports two engines: **`whatlang`** and **`lingua`**.

1. **Analyzer selection:**

    - **Success:** If the language is successfully detected, the system checks if the detected language name has a corresponding analyzer configured in your `analyzers` dictionary. If a match is found, the system applies the specified analyzer to the input text. For example, a detected "Mandarin" text would be routed to a `jieba` tokenizer.

    - **Fallback:** If detection fails, or if a language is successfully detected but you have not provided a specific analyzer for it, the system defaults to a pre-configured **`default` analyzer**. This is a crucial point of clarification; the `default` analyzer is a fallback for both detection failure and an absence of a matching analyzer.

After the appropriate analyzer is chosen, the text is tokenized and processed, completing the workflow.

## Available language detection engines\{#available-language-detection-engines}

Zilliz Cloud offers a choice between two language detection engines:

- [whatlang](https://github.com/greyblake/whatlang-rs)

- [lingua](https://github.com/pemistahl/lingua)

The selection depends on the specific performance and accuracy requirements of your application.

| Engine | Speed | Accuracy | Output Format | Best For |
| --- | --- | --- | --- | --- |
| `whatlang` | Fast | Good for most languages | Language names (e.g., `"English"`,  `"Mandarin"`, `"Japanese"`)<br/>**Reference:** [Language column in supported languages table](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md) | Real-time applications where speed is critical |
| `lingua` | Slower | Higher precision, especially for short texts | English language names (e.g., `"English"`, `"Chinese"`, `"Japanese"`)<br/>**Reference:** [Supported languages list](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported) | Applications where accuracy is more important than speed |

A critical consideration is the engine's naming convention. While both engines return language names in English, they use different terms for some languages (e.g., `whatlang` returns `Mandarin`, while `lingua` returns `Chinese`). The analyzer's key must be an exact match to the name returned by the chosen detection engine.

## Configuration\{#configuration}

To correctly use the `language_identifier` tokenizer, the following steps must be taken to define and apply its configuration.

### Step 1: Choose your languages and analyzers\{#step-1-choose-your-languages-and-analyzers}

The core of setting up the `language_identifier` is tailoring your analyzers to the specific languages you plan to support. The system works by matching the detected language with the correct analyzer, so this step is crucial for accurate text processing.

Below is a recommended mapping of languages to suitable Zilliz Cloud analyzers. This table serves as a bridge between the output of the language detection engine and the best tool for the job.

| Language (Detector Output) | Recommended Analyzer | Description |
| --- | --- | --- |
| `English` | `type: english` | Standard English tokenization with stemming and stop-word filtering. |
| `Mandarin` (via whatlang) or `Chinese` (via lingua) | `tokenizer: jieba` | Chinese word segmentation for non-space-delimited text. |
| `Japanese` | `tokenizer: icu` | A robust tokenizer for complex scripts, including Japanese. |
| `French` | `type: standard`, `filter: ["lowercase", "asciifolding"]` | A custom configuration that handles French accents and characters. |

<Admonition type="info" title="Notes">

- **Matching is Key:** The name of your analyzer **must exactly match** the language output of the detection engine. For instance, if you're using `whatlang`, the key for Chinese text must be `Mandarin`.

- **Best practices:** The table above provides recommended configurations for a few common languages, but it is not an exhaustive list. For a more comprehensive guide on choosing analyzers, refer to [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case).

- **Detector output**: For a complete list of language names returned by the detection engines, refer to [Whatlang supported languages table](https://github.com/greyblake/whatlang-rs) and the [Lingua supported languages list](https://github.com/pemistahl/lingua-rs).

</Admonition>

### Step 2: Define analyzer_params\{#step-2-define-analyzerparams}

To use the `language_identifier` tokenizer in Zilliz Cloud, create a dictionary containing these key components:

**Required components:**

- `analyzers` config set – A dictionary containing all analyzer configurations, which must include:

    - `default` – The fallback analyzer used when language detection fails or no matching analyzer is found

    - **Language-specific analyzers** – Each defined as `<analyzer_name>: <analyzer_config>`, where:

        - `analyzer_name` matches your chosen detection engine's output (e.g., `"English"`, `"Japanese"`)

        - `analyzer_config` follows standard analyzer parameter format (see [Analyzer Overview](./analyzer-overview#analyzer-types))

**Optional components:**

- `identifier` – Specifies which language detection engine to use (`whatlang` or `lingua`). Defaults to `whatlang` if not specified

- `mapping` – Creates custom aliases for your analyzers, allowing you to use descriptive names instead of the detection engine's exact output format

The tokenizer works by first detecting the language of input text, then selecting the appropriate analyzer from your configuration. If detection fails or no matching analyzer exists, it automatically falls back to your `default` analyzer.

#### Recommended: Direct name matching\{#recommended-direct-name-matching}

Your analyzer names should exactly match the output of your chosen language detection engine. This approach is simpler and avoids potential confusion.

For both `whatlang` and `lingua`, use the language names as shown in their respective documentation:

- [whatlang supported languages](https://github.com/greyblake/whatlang-rs/blob/master/SUPPORTED_LANGUAGES.md) (use the "**Language**" column)

- [lingua supported languages](https://github.com/pemistahl/lingua?tab=readme-ov-file#3-which-languages-are-supported)

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",  # Must be `language_identifier`
        "identifier": "whatlang",  # or `lingua`
        "analyzers": {  # A set of analyzer configs
            "default": {
                "tokenizer": "standard"  # fallback if language detection fails
            },
            "English": {  # Analyzer name that matches whatlang output
                "type": "english"
            },
            "Mandarin": {  # Analyzer name that matches whatlang output
                "tokenizer": "jieba"
            }
        }
    }
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

Map<String, Object> defaultAnalyzer = new HashMap<>();
defaultAnalyzer.put("tokenizer", "standard");

Map<String, Object> englishAnalyzer = new HashMap<>();
englishAnalyzer.put("type", "english");

Map<String, Object> mandarinAnalyzer = new HashMap<>();
mandarinAnalyzer.put("tokenizer", "jieba");

Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", defaultAnalyzer);
analyzers.put("English", englishAnalyzer);
analyzers.put("Mandarin", mandarinAnalyzer);

Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "whatlang");
tokenizer.put("analyzers", analyzers);

analyzerParams.put("tokenizer", tokenizer);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "whatlang",
        "analyzers": map[string]any{
            "default":  map[string]any{"tokenizer": "standard"},
            "English":  map[string]any{"type": "english"},
            "Mandarin": map[string]any{"tokenizer": "jieba"},
        },
    },
}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "whatlang"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"English", {{"type", "english"}}},
            {"Mandarin", {{"tokenizer", "jieba"}}}
        }}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "language_identifier",
    "identifier": "whatlang",
    "analyzers": {
      "default": {
        "tokenizer": "standard"
      },
      "English": {
        "type": "english"
      },
      "Mandarin": {
        "tokenizer": "jieba"
      }
    }
  }
}'
```

</TabItem>
</Tabs>

#### Alternative approach: Custom names with mapping\{#alternative-approach-custom-names-with-mapping}

If you prefer to use custom analyzer names or need to maintain compatibility with existing configurations, you can use the `mapping` parameter. This creates aliases for your analyzers—both the original detection engine names and your custom names will work.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {
                "tokenizer": "standard"
            },
            "english_analyzer": {  # Custom analyzer name
                "type": "english"
            },
            "chinese_analyzer": {  # Custom analyzer name
                "tokenizer": "jieba"
            }
        },
        "mapping": {
            "English": "english_analyzer",   # Maps detection output to custom name
            "Chinese": "chinese_analyzer"
        }
    }
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

Map<String, Object> defaultAnalyzer = new HashMap<>();
defaultAnalyzer.put("tokenizer", "standard");

Map<String, Object> englishAnalyzer = new HashMap<>();
englishAnalyzer.put("type", "english");

Map<String, Object> chineseAnalyzer = new HashMap<>();
chineseAnalyzer.put("tokenizer", "jieba");

Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", defaultAnalyzer);
analyzers.put("english_analyzer", englishAnalyzer);
analyzers.put("chinese_analyzer", chineseAnalyzer);

Map<String, Object> mapping = new HashMap<>();
mapping.put("English", "english_analyzer");
mapping.put("Chinese", "chinese_analyzer");

Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "lingua");
tokenizer.put("analyzers", analyzers);
tokenizer.put("mapping", mapping);

analyzerParams.put("tokenizer", tokenizer);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "lingua",
        "analyzers": map[string]any{
            "default":           map[string]any{"tokenizer": "standard"},
            "english_analyzer":  map[string]any{"type": "english"},
            "chinese_analyzer":  map[string]any{"tokenizer": "jieba"},
        },
        "mapping": map[string]any{
            "English": "english_analyzer",
            "Chinese": "chinese_analyzer",
        },
    },
}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "english_analyzer": {"type": "english"},
            "chinese_analyzer": {"tokenizer": "jieba"}
        },
        "mapping": {
            "English": "english_analyzer",
            "Chinese": "chinese_analyzer"
        }
    }
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "lingua"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"english_analyzer", {{"type", "english"}}},
            {"chinese_analyzer", {{"tokenizer", "jieba"}}}
        }},
        {"mapping", {
            {"English", "english_analyzer"},
            {"Chinese", "chinese_analyzer"}
        }}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "english_analyzer": {"type": "english"},
            "chinese_analyzer": {"tokenizer": "jieba"}
        },
        "mapping": {
            "English": "english_analyzer",
            "Chinese": "chinese_analyzer"
        }
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": {
    "type": "language_identifier",
    "identifier": "lingua",
    "analyzers": {
      "default": {
        "tokenizer": "standard"
      },
      "english_analyzer": {
        "type": "english"
      },
      "chinese_analyzer": {
        "tokenizer": "jieba"
      }
    },
    "mapping": {
      "English": "english_analyzer",
      "Chinese": "chinese_analyzer"
    }
  }
}'
```

</TabItem>
</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Here are some ready-to-use configurations for common scenarios. Each example includes both the configuration and verification code so you can test the setup immediately.

### English and Chinese detection\{#english-and-chinese-detection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Configuration
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
}

# Test the configuration
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# English text
result_en = client.run_analyzer("The Milvus vector database is built for scale!", analyzer_params)
print("English:", result_en)
# Output: 
# English: ['The', 'Milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']

# Chinese text  
result_cn = client.run_analyzer("Milvus向量数据库专为大规模应用而设计", analyzer_params)
print("Chinese:", result_cn)
# Output: 
# Chinese: ['Milvus', '向量', '数据', '据库', '数据库', '专', '为', '大规', '规模', '大规模', '应用', '而', '设计']
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Configuration
Map<String, Object> analyzerParams = new HashMap<>();
Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", Collections.singletonMap("tokenizer", "standard"));
analyzers.put("English", Collections.singletonMap("type", "english"));
analyzers.put("Mandarin", Collections.singletonMap("tokenizer", "jieba"));
Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "whatlang");
tokenizer.put("analyzers", analyzers);
analyzerParams.put("tokenizer", tokenizer);

// Test the configuration
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

// English text
RunAnalyzerResp resultEn = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(Collections.singletonList("The Milvus vector database is built for scale!"))
        .analyzerParams(analyzerParams)
        .build());
System.out.println("English: " + resultEn.getResults());

// Chinese text
RunAnalyzerResp resultCn = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(Collections.singletonList("Milvus向量数据库专为大规模应用而设计"))
        .analyzerParams(analyzerParams)
        .build());
System.out.println("Chinese: " + resultCn.getResults());
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

// Configuration
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "whatlang",
        "analyzers": map[string]any{
            "default":  map[string]any{"tokenizer": "standard"},
            "English":  map[string]any{"type": "english"},
            "Mandarin": map[string]any{"tokenizer": "jieba"},
        },
    },
}

// Test the configuration
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)

// English text
resultEn, err := client.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption(
    "The Milvus vector database is built for scale!").WithAnalyzerParamsStr(string(bs)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("English:", resultEn)

// Chinese text
resultCn, err := client.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption(
    "Milvus向量数据库专为大规模应用而设计").WithAnalyzerParamsStr(string(bs)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("Chinese:", resultCn)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    // Configuration
    let analyzer_params = json!({
        "tokenizer": {
            "type": "language_identifier",
            "identifier": "whatlang",
            "analyzers": {
                "default": {"tokenizer": "standard"},
                "English": {"type": "english"},
                "Mandarin": {"tokenizer": "jieba"}
            }
        }
    });

    // English text
    let result_en = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["The Milvus vector database is built for scale!".to_string()])
            .analyzer_params(analyzer_params.clone())
            .build()?,
    ).await?;
    println!("English: {:?}", result_en.results());

    // Chinese text
    let result_cn = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["Milvus向量数据库专为大规模应用而设计".to_string()])
            .analyzer_params(analyzer_params)
            .build()?,
    ).await?;
    println!("Chinese: {:?}", result_cn.results());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

// Configuration
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "whatlang"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"English", {{"type", "english"}}},
            {"Mandarin", {{"tokenizer", "jieba"}}}
        }}
    }}
};

// Test the configuration
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// English text
milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                .AddText("The Milvus vector database is built for scale!")
                                .WithAnalyzerParams(analyzer_params),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}

// Chinese text
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                .AddText("Milvus向量数据库专为大规模应用而设计")
                                .WithAnalyzerParams(analyzer_params),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// Configuration
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "whatlang",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "Mandarin": {"tokenizer": "jieba"}
        }
    }
};

// Test the configuration
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

// English text
const resultEn = await client.runAnalyzer({
  text: 'The Milvus vector database is built for scale!',
  analyzer_params: analyzer_params
});
console.log('English:', resultEn);

// Chinese text
const resultCn = await client.runAnalyzer({
  text: 'Milvus向量数据库专为大规模应用而设计',
  analyzer_params: analyzer_params
});
console.log('Chinese:', resultCn);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"language_identifier\",\"identifier\":\"whatlang\",\"analyzers\":{\"default\":{\"tokenizer\":\"standard\"},\"English\":{\"type\":\"english\"},\"Mandarin\":{\"tokenizer\":\"jieba\"}}}}",
    "text": ["The Milvus vector database is built for scale!"]
  }'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"language_identifier\",\"identifier\":\"whatlang\",\"analyzers\":{\"default\":{\"tokenizer\":\"standard\"},\"English\":{\"type\":\"english\"},\"Mandarin\":{\"tokenizer\":\"jieba\"}}}}",
    "text": ["Milvus向量数据库专为大规模应用而设计"]
  }'
```

</TabItem>
</Tabs>

### European languages with accent normalization\{#european-languages-with-accent-normalization}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Configuration for French, German, Spanish, etc.
analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "French": {
                "tokenizer": "standard",
                "filter": ["lowercase", "asciifolding"]
            }
        }
    }
}

# Test with accented text
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

result_fr = client.run_analyzer("Café français très délicieux", analyzer_params)
print("French:", result_fr)
# Output: 
# French: ['cafe', 'francais', 'tres', 'delicieux']
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

// Configuration for French, German, Spanish, etc.
Map<String, Object> analyzerParams = new HashMap<>();
Map<String, Object> frenchAnalyzer = new HashMap<>();
frenchAnalyzer.put("tokenizer", "standard");
frenchAnalyzer.put("filter", Arrays.asList("lowercase", "asciifolding"));
Map<String, Object> analyzers = new HashMap<>();
analyzers.put("default", Collections.singletonMap("tokenizer", "standard"));
analyzers.put("English", Collections.singletonMap("type", "english"));
analyzers.put("French", frenchAnalyzer);
Map<String, Object> tokenizer = new HashMap<>();
tokenizer.put("type", "language_identifier");
tokenizer.put("identifier", "lingua");
tokenizer.put("analyzers", analyzers);
analyzerParams.put("tokenizer", tokenizer);

// Test with accented text
ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

RunAnalyzerResp resultFr = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(Collections.singletonList("Café français très délicieux"))
        .analyzerParams(analyzerParams)
        .build());
System.out.println("French: " + resultFr.getResults());
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

// Configuration for French, German, Spanish, etc.
analyzerParams := map[string]any{
    "tokenizer": map[string]any{
        "type":       "language_identifier",
        "identifier": "lingua",
        "analyzers": map[string]any{
            "default": map[string]any{"tokenizer": "standard"},
            "English": map[string]any{"type": "english"},
            "French": map[string]any{
                "tokenizer": "standard",
                "filter":    []any{"lowercase", "asciifolding"},
            },
        },
    },
}

// Test with accented text
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)

resultFr, err := client.RunAnalyzer(ctx, milvusclient.NewRunAnalyzerOption(
    "Café français très délicieux").WithAnalyzerParamsStr(string(bs)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("French:", resultFr)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    // Configuration for French, German, Spanish, etc.
    let analyzer_params = json!({
        "tokenizer": {
            "type": "language_identifier",
            "identifier": "lingua",
            "analyzers": {
                "default": {"tokenizer": "standard"},
                "English": {"type": "english"},
                "French": {
                    "tokenizer": "standard",
                    "filter": ["lowercase", "asciifolding"]
                }
            }
        }
    });

    // Test with accented text
    let result_fr = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["Café français très délicieux".to_string()])
            .analyzer_params(analyzer_params)
            .build()?,
    ).await?;
    println!("French: {:?}", result_fr.results());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

// Configuration for French, German, Spanish, etc.
nlohmann::json analyzer_params = {
    {"tokenizer", {
        {"type", "language_identifier"},
        {"identifier", "lingua"},
        {"analyzers", {
            {"default", {{"tokenizer", "standard"}}},
            {"English", {{"type", "english"}}},
            {"French", {
                {"tokenizer", "standard"},
                {"filter", {"lowercase", "asciifolding"}}
            }}
        }}
    }}
};

// Test with accented text
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(milvus::RunAnalyzerRequest()
                                .AddText("Café français très délicieux")
                                .WithAnalyzerParams(analyzer_params),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// Configuration for French, German, Spanish, etc.
const analyzer_params = {
    "tokenizer": {
        "type": "language_identifier",
        "identifier": "lingua",
        "analyzers": {
            "default": {"tokenizer": "standard"},
            "English": {"type": "english"},
            "French": {
                "tokenizer": "standard",
                "filter": ["lowercase", "asciifolding"]
            }
        }
    }
};

// Test with accented text
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

const resultFr = await client.runAnalyzer({
  text: 'Café français très délicieux',
  analyzer_params: analyzer_params
});
console.log('French:', resultFr);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":{\"type\":\"language_identifier\",\"identifier\":\"lingua\",\"analyzers\":{\"default\":{\"tokenizer\":\"standard\"},\"English\":{\"type\":\"english\"},\"French\":{\"tokenizer\":\"standard\",\"filter\":[\"lowercase\",\"asciifolding\"]}}}}",
    "text": ["Café français très délicieux"]
  }'
```

</TabItem>
</Tabs>

## Usage notes\{#usage-notes}

- **Single-language per field:** It operates on a field as a single, homogenous unit of text. It is designed to handle different languages across different data records, such as one record containing an English sentence and the next containing a French sentence.

- **No mixed-language strings:** It is **not** designed to handle a single string that contains text from multiple languages. For example, a single `VARCHAR` field containing both an English sentence and a quoted Japanese phrase will be processed as a single language.

- **Dominant language processing:** In mixed-language scenarios, the detection engine will likely identify the dominant language, and the corresponding analyzer will be applied to the entire text. This will result in poor or no tokenization for the embedded foreign text.

