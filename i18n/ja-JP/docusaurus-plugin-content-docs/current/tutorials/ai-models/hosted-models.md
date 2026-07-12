---
title: "ホステッドモデル | Cloud"
slug: /hosted-models
sidebar_label: "ホステッドモデル"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Zilliz が管理するインフラストラクチャ上で embedding および reranking モデルをホストできます。専用のフルマネージドモデルインスタンスをデプロイし、安定した高性能な推論のために Zilliz Cloud から直接使用できます。 | Cloud"
type: origin
token: DMrCwn4LXi1uKBkbHGfcpGnsnyh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ホステッドモデル

Zilliz Cloud は、Zilliz が管理するインフラストラクチャ上で **embedding** および **reranking** モデルをホストできます。専用のフルマネージドモデルインスタンスをデプロイし、安定した高性能な推論のために Zilliz Cloud から直接使用できます。 

マネージドモデルインスタンスを使用すると、生データを collection に挿入できます。Zilliz Cloud は取り込み時に、デプロイ済みモデルを使って vector embedding を自動生成します。セマンティック検索では、生のクエリテキストを指定するだけです。Zilliz Cloud は同じモデルを使用してクエリ vector を作成し、保存済み vector と比較して、最も関連性の高い結果を返します。

次の図は、ホステッドモデルを使用する手順を示しています。

![NkgEwmrJDhyXiubY6HpcssaynHg](https://zdoc-images.s3.us-west-2.amazonaws.com/NkgEwmrJDhyXiubY6HpcssaynHg.png)

## モデルをデプロイする\{#deploy-a-model}

現在、Zilliz Cloud は次のリージョン、インスタンスタイプ、モデルをサポートしています。

<Admonition type="info" icon="📘" title="注記">

ホステッドモデルに関する特定の要件がある場合は、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

### サポートされているリージョン\{#supported-regions}

モデルのデプロイリージョンは、cluster のリージョンと一致している必要があります。利用可能なオプションは次のとおりです。

| **リージョン** | **場所** |
| --- | --- |
| aws-us-west-2 | 米国オレゴン州 |

### サポートされているインスタンスタイプ\{#supported-instance-type}

インスタンスタイプは、利用可能なコンピューティングリソースを決定します。利用可能なオプションは次のとおりです。

<table>
   <tr>
     <th><p><strong>インスタンスタイプ</strong></p></th>
     <th><p><strong>リソース</strong></p></th>
   </tr>
   <tr>
     <td><p>g6.xlarge</p></td>
     <td><ul><li><p>1 Nvidia L4 GPU</p></li><li><p>8 vCPU</p></li><li><p>32 GB RAM</p></li></ul></td>
   </tr>
</table>

### サポートされているモデル\{#supported-models}

利用可能なオプションは次のとおりです。

<table>
   <tr>
     <th><p><strong>タイプ</strong></p></th>
     <th><p><strong>モデル</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td rowspan="9"><p>Embedding</p></td>
     <td><p><code>Qwen/Qwen3-Embedding-0.6B</code></p></td>
     <td><p>効率的なセマンティック検索、コード検索、分類、クラスタリング向けの軽量な多言語 embedding モデルです。100 以上の言語、32K コンテキスト、最大 1024 次元の embedding をサポートします。</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Embedding-4B</code></p></td>
     <td><p>8B モデルよりもデプロイコストを抑えながら、より強力な多言語およびクロスリンガル検索品質を実現するバランス型の Qwen3 embedding モデルです。32K コンテキストと最大 2560 次元の embedding をサポートします。</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Embedding-8B</code></p></td>
     <td><p>精度重視の多言語、長文、コード検索ワークロード向けの最大容量の Qwen3 embedding モデルです。32K コンテキストと最大 4096 次元の embedding をサポートします。</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-small-en-v1.5</code></p></td>
     <td><p>低コスト、低レイテンシのセマンティック検索および検索向けのコンパクトな英語 BGE embedding モデルです。384 次元の embedding を使用します。</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-small-zh-v1.5</code></p></td>
     <td><p>効率的な中国語セマンティック検索および検索向けのコンパクトな中国語 BGE embedding モデルです。512 次元の embedding を使用します。</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-base-en-v1.5</code></p></td>
     <td><p>検索品質と効率のバランスを取る中規模の英語 BGE embedding モデルです。768 次元の embedding を使用します。</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-base-zh-v1.5</code></p></td>
     <td><p>中国語検索ワークロード向けに品質と効率のバランスを取る中規模の中国語 BGE embedding モデルです。768 次元の embedding を使用します。</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-large-en-v1.5</code></p></td>
     <td><p>精度が重要なセマンティック検索、RAG、検索ワークロード向けの高品質な英語 BGE embedding モデルです。1024 次元の embedding を使用します。</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-large-zh-v1.5</code></p></td>
     <td><p>精度が重要な中国語セマンティック検索および検索向けの高品質な中国語 BGE embedding モデルです。1024 次元の embedding を使用します。</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>Reranking</p></td>
     <td><p><code>BAAI/bge-reranker-base</code></p></td>
     <td><p>高速な推論と容易なデプロイにより、取得済み候補を並べ替えるための軽量な英語および中国語クロスエンコーダー reranker です。</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-reranker-large</code></p></td>
     <td><p>推論コストよりも精度が重要な場合に、より高品質な reranking を行うための、より大きな英語および中国語クロスエンコーダー reranker です。</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Reranker-0.6B</code></p></td>
     <td><p>効率的な多言語およびコード関連の検索ワークフロー向けの軽量な Qwen3 テキスト reranking モデルです。100 以上の言語、32K コンテキスト、instruction-aware reranking をサポートします。</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Reranker-4B</code></p></td>
     <td><p>8B モデルよりもデプロイコストを抑えながら、より強力な多言語、クロスリンガル、長文、コード検索品質を実現するバランス型の Qwen3 reranking モデルです。</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Reranker-8B</code></p></td>
     <td><p>強力な多言語、長いコンテキスト、instruction-aware なランキング性能を必要とする精度重視の検索シナリオ向けの最大容量の Qwen3 reranking モデルです。</p></td>
   </tr>
   <tr>
     <td><p>Semantic Highlighter</p></td>
     <td><p><code>zilliz/semantic-highlight-bilingual-v1</code></p></td>
     <td><p>RAG および検索ワークフロー向けの軽量なバイリンガルセマンティックハイライトモデルです。クエリに意味的に関連する英語または中国語のテキストセグメントを特定し、ユーザーが有用なコンテキストをハイライトして、生成前に不要なトークンを削減できるようにします。</p></td>
   </tr>
</table>

## デプロイメント ID を取得する\{#obtain-a-deployment-id}

提供された情報を使用して、Zilliz がモデルをデプロイします。これには約 15 分かかります。デプロイの準備が完了すると、Zilliz Cloud Support が **deployment ID** を返します。これは、embedding または reranking 関数を作成する際に使用します。

```bash
"deploymentId": "68f8889be4b01215a275972a"
```

## デプロイ済みモデルを関数で使用する\{#use-the-deployed-model-in-a-function}

**deployment ID** を取得したら、embedding または reranking 関数を通じて、デプロイ済みモデルを使用する collection を作成できます。

### embedding 関数を使用する\{#use-an-embedding-function}

1. embedding 関数を持つ collection を作成します。

    - 生テキスト用に少なくとも 1 つの `VARCHAR` フィールドを定義します。

    - モデルによって生成された embedding vector 用に少なくとも 1 つの vector フィールドを定義します。

    - vector フィールドの次元を、モデルの出力次元に一致するように設定します。

    ```python
    schema = milvus_client.create_schema()
    schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
    schema.add_field("document", DataType.VARCHAR, max_length=9000)
    schema.add_field("dense", DataType.FLOAT_VECTOR, dim=384) # important, the dimension must be supported by the deployed model.
    
    # define embedding function
    text_embedding_function = Function(
        name="zilliz-bge-small-en-v1.5",
        function_type=FunctionType.TEXTEMBEDDING,
        input_field_names=["document"], # Scalar field(s) containing text data to embed
        output_field_names="dense", # Vector field(s) for storing embeddings
     # highlight-start
        params={
            "provider": "zilliz",
            "model_deployment_id": "...", # Use the model deployment ID we provide you
            "truncation": True, # Optional: if true, inputs greater than the max supported input length of the model will be truncated
            "dimension": "384",                # Optional: Shorten the output vector dimension, only if supported by the model
        }
    # highlight-end
    )
    
    schema.add_function(text_embedding_function)
    
    index_params = milvus_client.prepare_index_params()
    index_params.add_index(
        field_name="dense",
        index_name="dense_index",
        index_type="AUTOINDEX",
        metric_type="IP",
    )
    
    ret = milvus_client.create_collection(collection_name, schema=schema, index_params=index_params, consistency_level="Strong")
    ```

1. 生テキストデータを挿入します。

    生テキストのみを collection に挿入します。Zilliz Cloud は embedding 関数を自動的に呼び出し、vector フィールドに値を設定します。

    ```python
    rows = [
            {"id": 1, "document": "Artificial intelligence was founded as an academic discipline in 1956."},
            {"id": 2, "document": "Alan Turing was the first person to conduct substantial research in AI."},
            {"id": 3, "document": "Born in Maida Vale, London, Turing was raised in southern England."},
    ]
    
    insert_result = milvus_client.insert(collection_name, rows, progress_bar=True)
    ```

1. 生テキストデータで類似性検索を実行します。

    クエリを生テキストとして指定します。Zilliz Cloud は同じモデルを使用してクエリ vector を生成し、類似性検索を実行します。

    ```python
    search_params = {
        "params": {"nprobe": 10},
    }
    queries = ["When was artificial intelligence founded", 
               "Where was Alan Turing born?"]
    
    result = milvus_client.search(collection_name, data=queries, anns_field="dense", search_params=search_params, limit=3, output_fields=["document"], consistency_level="Strong")
    ```

### reranking 関数を使用する\{#use-a-reranking-function}

デプロイ済みモデルを使用して検索結果を rerank する reranking 関数を構成することもできます。

```python
import numpy as np
rng = np.random.default_rng(seed=19530)
vectors_to_search = rng.random((1, dim))

# define reranking function
ranker = Function(
    name="model_rerank_fn",
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model", 
        "provider": "zilliz",
        "model_deployment_id": "...", # Use the model deployment ID we provide you,
        "queries": ["machine learning for time series"] * len(vectors_to_search),  # Query text, the number of query strings must match exactly the number of queries in your search operation
    }
)

# Use it during search
result = milvus_client.search(collection_name, vectors_to_search, limit=3, output_fields=["*"], ranker=ranker)
```

### semantic highlighter 関数を使用する\{#use-a-semantic-highlighter-function}

検索中に、ホステッド highlighter モデルを使用して、ユーザーのクエリに意味的に関連するテキストセグメントをハイライトすることで検索結果を後処理できます。  

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
    limit=3,
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

## 請求\{#billing}

ホステッドモデルを使用すると、関数およびモデルサービスの料金のみが発生します。推論は Zilliz Cloud 内で実行されるため、データが公共インターネットを通過することはありません。そのため、データ転送料金は発生しません。

リージョン別のモデル単価については、[営業担当にお問い合わせください](http://zilliz.com/contact-sales)。

### コスト計算\{#cost-calculation}

```plaintext
Function and Model Services Cost = Model Unit Price x Usage Time
```

- **モデル単価**: 詳細については、[営業担当にお問い合わせください](http://zilliz.com/contact-sales)。

- **使用時間**: モデルが実際に使用されているかどうかにかかわらず、モデルデプロイメントが稼働している合計時間で、時間単位で測定されます。
