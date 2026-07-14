---
title: "Semantic Highlighter | Cloud"
slug: /semantic-highlighter
sidebar_label: "Semantic Highlighter"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Semantic Highlighter は、検索結果の中で意味的に最も関連性の高い部分を**文レベル**で特定してハイライトし、取得した上位 K 件のドキュメントから本当に必要な情報だけを抽出できるようにします。 | Cloud"
type: origin
token: GLG4wi6zhisaxYkBkmacXqItnbJ
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Semantic Highlighter

Semantic Highlighter は、検索結果の中で意味的に最も関連性の高い部分を**文レベル**で特定してハイライトし、取得した上位 K 件のドキュメントから本当に必要な情報だけを抽出できるようにします。

たとえば、AI の歴史について数百語にわたる長いドキュメント（約 75 語）があるとします。

```plaintext
Artificial intelligence was founded as an academic discipline in 1956 at the Dartmouth Conference. The field experienced several cycles of optimism and disappointment throughout its history. AI research started after World War II with the development of electronic computers. Early researchers explored symbolic methods and problem-solving approaches. The term 'artificial intelligence' was coined by John McCarthy, one of the founders of the discipline. Modern AI has achieved remarkable success in areas such as computer vision, natural language processing, and game playing.
```

**"When was artificial intelligence founded?"** を検索すると、Semantic Highlighter は意味的に関連する文だけを特定して返します。

```plaintext
<mark>Artificial intelligence was founded as an academic discipline in 1956 at the Dartmouth Conference.</mark>
Confidence score: 0.999
```

LLM に 75 語すべてのドキュメントを送る代わりに、16 語の答えだけを取得でき、さらにそのクエリとの関連性を示す信頼スコアも得られます。

<Admonition type="info" icon="📘" title="注意">

この機能は、Zilliz Cloud 上でホストされた highlight model に依存しています。詳細については、[Hosted Models](./hosted-models#supported-models) を参照してください。

</Admonition>

## なぜ semantic highlighting なのか？\{#why-semantic-highlighting}

RAG（Retrieval-Augmented Generation）アプリケーションでは、従来のアプローチでは通常、取得したドキュメント全体を処理のために LLM に送信します。これにより、主に 2 つの問題が発生します。

- **高いトークンコスト**: ドキュメントのごく一部だけがクエリに関連している場合でも、ドキュメント全体を LLM に送る必要があり、不要なトークン消費とコストが発生します。

- **ノイズの干渉**: ドキュメント内の無関係な情報が LLM の理解を妨げ、回答の品質を低下させる可能性があります。

Semantic Highlighter により、次のことが可能になります。

- **コスト削減**: ドキュメント全体ではなく、関連する断片だけを LLM に送信する

- **品質向上**: ノイズを減らし、LLM が最も関連性の高い内容に集中できるようにする

- **ユーザー体験の向上**: 検索インターフェースで重要な一致情報を視覚的にハイライトする

## 仕組み\{#how-it-works}

Semantic Highlighter は semantic search の後に実行され、上位 K 件の結果に対してのみ動作します。ワークフロー全体では、ドキュメント取得のための semantic search と、関連するテキストセグメントを特定するためのホスト型 highlight model が組み合わされます。

以下の図は、Semantic Highlighter のワークフローを示しています。

![U9E0bdlHRoAb9OxwBr6cl1Xhn0q](https://zdoc-images.s3.us-west-2.amazonaws.com/u9e0bdlhroab9oxwbr6cl1xhn0q.png "U9E0bdlHRoAb9OxwBr6cl1Xhn0q")

### ステージ 1: Semantic search\{#stage-1-semantic-search}

Semantic search は、vector 類似度に基づいて最も関連性の高い上位 K 件のドキュメントを取得します。embedding の生成には 2 つの方法があります。

**オプション 1: モデルベースの embedding function（推奨）**

Zilliz Cloud のモデルベース embedding function を使用すると、vector への変換が自動的に処理されます。生のドキュメントを挿入してクエリテキストを指定するだけでよく、embedding を手動で管理する必要はありません。

- **挿入時**: embedding function がドキュメントテキストを dense vector に変換し、vector field に保存します

- **検索時**: 同じ embedding function がクエリテキストを vector に変換し、vector index に対して検索を実行して、vector 類似度に基づく上位 K 件のドキュメントを返します

このアプローチは、このドキュメント全体のすべての例で使用されています。詳細については、[Function Overview](./function-and-model-inference-overview) を参照してください。

**オプション 2: 外部 embedding model**

独自の外部 embedding サービスを使用して embedding を生成し、その vector を collection に直接挿入して semantic search を実行することもできます。これにより embedding model を完全に制御できますが、embedding パイプラインを自分で管理する必要があります。

### ステージ 2: Semantic highlighting\{#stage-2-semantic-highlighting}

highlighting ステージは、Zilliz Cloud 上にデプロイされたホスト型の [highlight model](./hosted-models#supported-models) によって実行されます。このモデルは取得されたドキュメントを処理し、クエリに意味的に関連するテキストセグメントを特定します。

- **テキストセグメントのスコアリング**: highlight model は各ドキュメントのテキスト内容を分析し、各セグメントに対して信頼スコア（0.0‒1.0）を計算します。スコアが高いほど、クエリに対する意味的関連性が強いことを示します。

- **しきい値によるフィルタリング**: セグメントは設定された threshold 値に基づいてフィルタリングされます。しきい値以上のスコアを持つ断片のみが含まれます。

- **ハイライトされた断片の返却**: 出力には、設定されたタグ（例: `<mark>` と `</mark>`）で囲まれたテキスト断片と、その信頼スコアが含まれます。

highlight model は embedding model とは独立しているため、ドキュメントの取得方法とハイライト方法をそれぞれ別々に制御できます。

## 機能概要\{#capability-overview}

Semantic Highlighter は、各検索ヒットに専用の `highlight` field を追加し、そこに semantic match をハイライトされた断片と信頼スコアとして返します。

### 基本的なハイライト\{#basic-highlighting}

semantic highlighting を有効にするための最小構成は次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
highlighter = SemanticHighlighter(
    queries,                    # Your query text
    ["document"],              # Field to highlight
    pre_tags=["<mark>"],       # Tag to mark the start of highlighted text
    post_tags=["</mark>"],     # Tag to mark the end of highlighted text
    model_deployment_id="YOUR_MODEL_ID",  # Deployment ID of the highlight model
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter;

SemanticHighlighter highlighter = SemanticHighlighter.builder()
        .queries(queries)
        .inputFields(Collections.singletonList("document"))
        .preTags(Collections.singletonList("<mark>"))
        .postTags(Collections.singletonList("</mark>"))
        .modelDeploymentID("YOUR_MODEL_ID")
        .build();
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

この基本構成では、各検索結果に専用の `highlight` field が含まれます。返却例は次のとおりです。

```json
{
    "id": 1,
    "distance": 0.7665,
    "entity": {
        "document": "Artificial intelligence was founded as an academic discipline in 1956."
    },
    // highlight-start
    "highlight": {
        "document": {
            "fragments": [
                "<mark>Artificial intelligence was founded as an academic discipline in 1956.</mark>"
            ],
            "scores": [0.9985]
        }
    }
    // highlight-end
}
```

専用の `highlight` field には、次の内容が含まれます。

- `highlight.<field>.fragments`: クエリテキストに意味的に関連するテキストセグメント。設定された `pre_tags` と `post_tags` で囲まれます。デフォルトでは、意味的に関連するスニペットのみが fragments として返されます。

- `highlight.<field>.scores`: 各 fragment に対する信頼スコア（0.0-1.0）で、そのテキストセグメントがクエリに対してどれだけ意味的に関連しているかを示します。スコアが高いほど関連性が強いことを意味します。これらのスコアは、デプロイされた highlight model によって計算されます。

### しきい値フィルタリング\{#threshold-filtering}

`threshold` パラメータを使用すると、テキストスパンが有効な semantic highlight と見なされる条件を制御できます。

- **`threshold` が設定されていない場合**

    デフォルトのしきい値 0.5 が使用されます。highlighting model が返した semantic match のうち、スコアが 0.5 未満のものは除外されます。この場合、`fragments` と `scores` field には、スコアが 0.5 以上の一致結果のみが含まれます。

- **`threshold` が設定されている場合**
設定された `threshold` **以上** の semantic score を持つスパンのみが返されます。これ未満のスコアのスパンは破棄されるため、一部の entity では `fragments` / `scores` 配列が空になる場合があります。

構成例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
highlighter = SemanticHighlighter(
    queries,
    ["document"],
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    # highlight-next-line
    threshold=0.8,              # Only return fragments with score >= 0.8
    model_deployment_id="YOUR_MODEL_ID",
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```java
SemanticHighlighter highlighter = SemanticHighlighter.builder()
        .queries(queries)
        .inputFields(Collections.singletonList("document"))
        .preTags(Collections.singletonList("<mark>"))
        .postTags(Collections.singletonList("</mark>"))
        .modelDeploymentID("YOUR_MODEL_ID")
        .threshold(0.8)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

fragment のスコアが threshold を下回ると、その field の fragments と scores はどちらも空になります。

```json
{
    "id": 2,
    "distance": 0.7043,
    "entity": {
        "document": "The history of artificial intelligence began in the mid-20th century."
    },
    "highlight": {
        "document": {
            "fragments": [],    // Empty because score (0.7206) < threshold (0.8)
            "scores": []
        }
    }
}
```

しきい値のガイドライン:

| **Threshold** | **Behavior** | **Use case** |
| --- | --- | --- |
| 未設定 | デフォルトのしきい値 0.5 が使用されます。中程度および高い信頼度。 | 適度な精度でより広いカバレッジ |
| 0.8 | 高い信頼度 | 精度重視のアプリケーション |

## 開始前の準備\{#before-you-start}

Semantic Highlighter を使用する前に、以下が設定されていることを確認してください。

- **Highlight model deployment**

    semantic highlighting のために、Zilliz Cloud 上でホスト型 highlight model をデプロイします。

    - Zilliz Cloud を通じて highlight model（例: `zilliz/semantic-highlight-bilingual-v1`）をデプロイします。

    - `SemanticHighlighter` の構成で使用するために `model_deployment_id` を取得します。

    利用可能な highlight model とデプロイ手順については、[Hosted Models](./hosted-models) を参照してください。

- **Semantic search 用の embedding model**

    Semantic Highlighter は任意の semantic search 構成で動作します。次のいずれかを選択してください。

    **オプション 1: モデルベースの embedding function（推奨）**

    embedding を自動処理するモデルベースの embedding function と統合します。

    - **サードパーティの model provider**: OpenAI、VoyageAI、Cohere などのサードパーティ model service provider と統合し、Zilliz Cloud コンソールからその `integration_id` を取得します。セットアップ手順については、[Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

    - **Hosted embedding model**: Zilliz Cloud を通じてホスト型 embedding model をデプロイし、その `model_deployment_id` を取得します。利用可能な model とデプロイ手順については、[Hosted Models](./hosted-models) を参照してください。

    **オプション 2: 外部 embedding model**

    独自の外部 embedding サービスを使用して embedding を生成し、vector を collection に挿入します。collection には次が必要です。

    - 適切な次元数を持つ vector field

    - 検索用に設定された vector index

    - すべてのドキュメントに対して生成・挿入された embedding

    <Admonition type="info" icon="📘" title="注意">

    このドキュメント内のすべてのコード例では、簡潔さのためにモデルベース embedding function アプローチ（**オプション 1**）を使用しています。

    </Admonition>

## はじめに\{#get-started}

### 準備\{#preparation}

例を実行する前に、semantic search 機能を備えた collection をセットアップしてください。

<details>

<summary><strong>collection を準備する</strong></summary>

次の例では、embedding model としてサードパーティの model provider（OpenAI）を使用しています。代わりに Zilliz Cloud のホスト型 embedding model を使用する場合は、`Function` params 内の `integration_id` を `model_deployment_id` に置き換えてください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
    Function, DataType, FunctionType, SemanticHighlighter,
)

# Connect to Zilliz Cloud
milvus_client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_API_KEY"
)

collection_name = "semantic_highlight_demo"

# Drop existing collection if it exists
if milvus_client.has_collection(collection_name):
    milvus_client.drop_collection(collection_name)

# Define schema with text field and dense vector field
schema = milvus_client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=9000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1536)

# Add text embedding function (using OpenAI integration)
text_embedding_function = Function(
    name="openai",
    function_type=FunctionType.TEXTEMBEDDING,
    input_field_names=["document"],
    output_field_names="dense",
    params={
        "provider": "openai",
        "model_name": "text-embedding-3-small",
        "integration_id": "YOUR_INTEGRATION_ID"  # Integration ID from Zilliz Cloud console
    }
)
schema.add_function(text_embedding_function)

# Create index
index_params = milvus_client.prepare_index_params()
index_params.add_index(
    field_name="dense",
    index_name="dense_index",
    index_type="AUTOINDEX",
    metric_type="IP",
)

# Create collection
milvus_client.create_collection(
    collection_name,
    schema=schema,
    index_params=index_params,
    consistency_level="Strong"
)

# Insert sample documents
docs = [
    {"id": 1, "document": "Artificial intelligence was founded as an academic discipline in 1956."},
    {"id": 2, "document": "The history of artificial intelligence began in the mid-20th century."},
    {"id": 3, "document": "AI research started after World War II with the development of electronic computers."},
    {"id": 4, "document": "Artificial intelligence is widely used in modern technology applications."},
    {"id": 5, "document": "Alan Turing proposed the idea of machine intelligence in 1950."},
    {"id": 6, "document": "Computer science has evolved significantly since its early days."},
]

milvus_client.insert(collection_name, docs)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.service.vector.request.InsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_API_KEY")
        .build());
        
final String COLLECTION_NAME = "semantic_highlight_demo";
client.dropCollection(DropCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .build());
        
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(false)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("document")
        .dataType(DataType.VarChar)
        .maxLength(9000)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("dense")
        .dataType(DataType.FloatVector)
        .dimension(1536)
        .build());
        
schema.addFunction(Function.builder()
        .functionType(FunctionType.TEXTEMBEDDING)
        .name("openai")
        .inputFieldNames(Collections.singletonList("document"))
        .outputFieldNames(Collections.singletonList("dense"))
        .param("provider", "openai")
        .param("model_name", "text-embedding-3-small")
        .param("integration_id", "YOUR_INTEGRATION_ID")
        .build());
        
List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("dense")
        .indexName("dense_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build());
        
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .collectionSchema(schema)
        .indexParams(indexes)
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build();
client.createCollection(requestCreate);

Gson gson = new Gson();
List<JsonObject> rows = Arrays.asList(
        gson.fromJson("{\"id\": 1, \"document\": \"Artificial intelligence was founded as an academic discipline in 1956.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"document\": \"The history of artificial intelligence began in the mid-20th century.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 3, \"document\": \"AI research started after World War II with the development of electronic computers.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 4, \"document\": \"Artificial intelligence is widely used in modern technology applications.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 5, \"document\": \"Alan Turing proposed the idea of machine intelligence in 1950.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 6, \"document\": \"Computer science has evolved significantly since its early days.\"}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

</details>

### 例 1: 基本的な semantic highlighting\{#example-1-basic-semantic-highlighting}

この例では、検索クエリに semantic highlighting を追加する方法を示します。highlighter は、クエリに意味的に関連するテキストセグメントを特定し、指定されたタグで囲みます。

<Admonition type="info" icon="📘" title="注意">

以下のコード内の `YOUR_MODEL_ID` は、ホスト型 highlight model の deployment ID に置き換えてください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import SemanticHighlighter

# Define the search query
queries = ["When was artificial intelligence founded"]

# Configure semantic highlighter
# highlight-start
highlighter = SemanticHighlighter(
    queries,
    ["document"],                           # Fields to highlight
    pre_tags=["<mark>"],                    # Tag before highlighted text
    post_tags=["</mark>"],                  # Tag after highlighted text
    model_deployment_id="YOUR_MODEL_ID",    # Deployed highlight model ID
)
# highlight-end

# Perform search with highlighting
results = milvus_client.search(
    collection_name,
    data=queries,
    anns_field="dense",
    search_params={"params": {"nprobe": 10}},
    limit=2,
    output_fields=["document"],
    highlighter=highlighter
)

# Process results
for hits in results:
    for hit in hits:
        highlight = hit.get("highlight", {}).get("document", {})
        print(f"ID: {hit['id']}")
        print(f"Search Score: {hit['distance']:.4f}")      # Vector similarity score
        print(f"Fragments: {highlight.get('fragments', [])}")
        print(f"Highlight Confidence: {highlight.get('scores', [])}")  # Semantic relevance score
        print()
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

List<String> queries = Collections.singletonList("When was artificial intelligence founded");
SemanticHighlighter h = SemanticHighlighter.builder()
        .queries(queries)
        .inputFields(Collections.singletonList("document"))
        .preTags(Collections.singletonList("<mark>"))
        .postTags(Collections.singletonList("</mark>"))
        .modelDeploymentID("YOUR_MODEL_ID")
        .build();
        
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText(queries.get(0))))
        .annsField("dense")
        .limit(2)
        .outputFields(Collections.singletonList("document"))
        .highlighter(highlighter)
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("ID: %d%n", (long)result.getId());
        System.out.printf("Search Score: %.4f%n", result.getScore());
        SearchResp.HighlightResult hresult = result.getHighlightResults().get("document");
        System.out.printf("Fragments: %s%n", hresult.getFragments());
        System.out.printf("Highlight Confidence: %s%n", hresult.getScores());
    }
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<details>

<summary><strong>期待される出力</strong></summary>

```plaintext
ID: 1
Search Score: 0.7672
Fragments: ['<mark>Artificial intelligence was founded as an academic discipline in 1956.</mark>']
Highlight Confidence: [0.9985]

ID: 2
Search Score: 0.7043
Fragments: ['<mark>The history of artificial intelligence began in the mid-20th century.</mark>']
Highlight Confidence: [0.7206]
```

**結果の見方:**

- **ドキュメント 1（ID: 1）** は、AI がいつ創設されたかというクエリに直接答えているため、高いハイライト信頼スコア（0.9985）を受け取ります。

- **ドキュメント 2（ID: 2）** は、AI の歴史について述べていますが、特に "founded" には言及していないため、中程度のハイライト信頼スコア（0.7206）になります。

- **ドキュメント 3（ID: 5）** は、Alan Turing が machine intelligence を提案した内容であり、"founded" というクエリとは意味的に一致しないため、検索結果で 3 位にランクされていても空の fragments を返します。

<Admonition type="info" icon="📘" title="注意">

Search Score（`distance`）は semantic search における vector 類似度を表し、Highlight Confidence（`scores`）はテキストが特定のクエリにどの程度適切に答えているかを表します。

</Admonition>

</details>

### 例 2: しきい値フィルタリング\{#example-2-threshold-filtering}

`threshold` パラメータを使用して、信頼スコアに基づいてハイライトをフィルタリングします。これにより、クエリに対して意味的関連性が強いセグメントのみが返されます。

<Admonition type="info" icon="📘" title="注意">

以下のコード内の `YOUR_MODEL_ID` は、ホスト型 highlight model の deployment ID に置き換えてください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# High threshold - only highly relevant highlights
highlighter = SemanticHighlighter(
    queries,
    ["document"],
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    # highlight-next-line
    threshold=0.8,                          # Only scores >= 0.8
    model_deployment_id="YOUR_MODEL_ID",
)

results = milvus_client.search(
    collection_name,
    data=queries,
    anns_field="dense",
    search_params={"params": {"nprobe": 10}},
    limit=2,
    output_fields=["document"],
    # highlight-next-line
    highlighter=highlighter
)

for hits in results:
    for hit in hits:
        highlight = hit.get("highlight", {}).get("document", {})
        print(f"ID: {hit['id']}")
        print(f"Search Score: {hit['distance']:.4f}")      # Vector similarity score
        print(f"Fragments: {highlight.get('fragments', [])}")
        print(f"Highlight Confidence: {highlight.get('scores', [])}")  # Semantic relevance score
        print()
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```java
SemanticHighlighter h = SemanticHighlighter.builder()
        .queries(queries)
        .inputFields(Collections.singletonList("document"))
        .preTags(Collections.singletonList("<mark>"))
        .postTags(Collections.singletonList("</mark>"))
        .modelDeploymentID("YOUR_MODEL_ID")
        .threshold(0.8)
        .build();
        
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText(queries.get(0))))
        .annsField("dense")
        .limit(2)
        .outputFields(Collections.singletonList("document"))
        .highlighter(highlighter)
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("ID: %d%n", (long)result.getId());
        System.out.printf("Search Score: %.4f%n", result.getScore());
        SearchResp.HighlightResult hresult = result.getHighlightResults().get("document");
        System.out.printf("Fragments: %s%n", hresult.getFragments());
        System.out.printf("Highlight Confidence: %s%n", hresult.getScores());
    }
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<details>

<summary><strong>期待される出力</strong></summary>

`threshold=0.8` の場合、semantic relevance が最も高いドキュメントだけがハイライトを返します。

```plaintext
ID: 1
Search Score: 0.7672
Fragments: ['<mark>Artificial intelligence was founded as an academic discipline in 1956.</mark>']
Highlight Confidence: [0.9985]

ID: 2
Search Score: 0.7043
Fragments: []
Highlight Confidence: []
```

前の例でハイライト信頼スコア 0.7206 を持っていたドキュメント 2 は、スコアが 0.8 の threshold を下回るため、もはやハイライトを返しません。

</details>

### 例 3: マルチクエリ highlighting\{#example-3-multi-query-highlighting}

複数のクエリで検索する場合、各クエリの結果はそのクエリ自体に基づいて独立してハイライトされます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
queries = [
    "When was artificial intelligence founded",
    "Where was Alan Turing born"
]

highlighter = SemanticHighlighter(
    queries,
    ["document"],
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    model_deployment_id="YOUR_MODEL_ID",    # Deployed highlight model ID
)

results = milvus_client.search(
    collection_name,
    data=queries,
    anns_field="dense",
    search_params={"params": {"nprobe": 10}},
    limit=2,
    output_fields=["document"],
    highlighter=highlighter
)

for query, hits in zip(queries, results):
    print(f"Query: {query}")
    for hit in hits:
        highlight = hit.get("highlight", {}).get("document", {})
        print(f"  Fragments: {highlight.get('fragments', [])}")
    print()
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```java
List<String> queries = Arrays.asList(
        "When was artificial intelligence founded",
        "Where was Alan Turing born"
);
SemanticHighlighter h = SemanticHighlighter.builder()
        .queries(queries)
        .inputFields(Collections.singletonList("document"))
        .preTags(Collections.singletonList("<mark>"))
        .postTags(Collections.singletonList("</mark>"))
        .modelDeploymentID("YOUR_MODEL_ID")
        .build();
        
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText(queries.get(0))))
        .annsField("dense")
        .limit(2)
        .outputFields(Collections.singletonList("document"))
        .highlighter(highlighter)
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (int i = 0; i < queries.size(); i++) {
    System.out.println("\nQuery: " + queries.get(i));
    for (SearchResp.SearchResult result : searchResults.get(i)) {
        SearchResp.HighlightResult hresult = result.getHighlightResults().get("document");
        System.out.printf("Fragments: %s%n", hresult.getFragments());
    }
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<details>

<summary><strong>期待される出力</strong></summary>

```plaintext
Query: When was artificial intelligence founded
  Fragments: ['<mark>Artificial intelligence was founded as an academic discipline in 1956.</mark>']
  Fragments: ['<mark>The history of artificial intelligence began in the mid-20th century.</mark>']

Query: Where was Alan Turing born
  Fragments: []
  Fragments: []
```

このサンプルデータセットには Alan Turing の出生地を説明するテキストが存在しないため、そのクエリに対して空の fragments が表示されるのは想定どおりです。

各クエリは、それぞれの結果セット内でどのテキストセグメントがハイライトされるかを独立して決定します。

</details>
