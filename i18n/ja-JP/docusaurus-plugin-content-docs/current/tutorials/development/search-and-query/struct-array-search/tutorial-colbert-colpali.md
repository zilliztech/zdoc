---
title: "EmbeddingLists を使った検索: ColBERT と ColPali | Cloud"
slug: /tutorial-colbert-colpali
sidebar_label: "ColBERT と ColPali"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このチュートリアルでは、Zilliz Cloud で StructArray ベクトルサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を紹介します。クエリと保存データの両方がベクトルのリストとして表現されており、`MAXSIM` メトリクスによるエンティティレベルの late-interaction 検索を行いたい場合に使用します。 | Cloud"
type: origin
token: Mf7GwGwgQiLCcykOi69cvaD8ncz
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# EmbeddingLists を使った検索: ColBERT と ColPali

このチュートリアルでは、Zilliz Cloud で StructArray ベクトルサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を紹介します。クエリと保存データの両方がベクトルのリストとして表現されており、`MAX_SIM*` メトリクスによるエンティティレベルの late-interaction 検索を行いたい場合に使用します。

このチュートリアルの背景となる StructArray の基本については、[StructArray フィールドの作成](./create-struct-array)、[StructArray フィールドのインデックス作成](./index-struct-array)、および [StructArray を使った基本ベクトル検索](./search-with-struct-array) を参照してください。このチュートリアルでは、一般的な StructArray の構文ではなく、ColBERT と ColPali のワークフローに焦点を当てます。

## Overview\{#overview}

テキスト検索システムを構築するには、精度と正確性を確保するために、ドキュメントをチャンクに分割し、各チャンクをその embeddings とともにベクトルデータベース内のエンティティとして保存する必要がある場合があります。これは特に、長いドキュメントでは全文 embeddings が意味的な特異性を薄めたり、モデルの入力上限を超えたりする可能性があるためです。 

ただし、データをチャンク単位で保存すると、検索結果もチャンク単位になり、検索はまず一貫した *document* ではなく関連する *segment* を特定することになります。これに対処するには、検索後に追加の後処理を行う必要があります。

ColBERT (arXiv: [2004.12832](https://arxiv.org/abs/2004.12832)) は、BERT 上で文脈化された late interaction を通じて効率的かつ効果的な passage 検索を提供する text-text 検索システムです。これにより、クエリと document をトークン単位で独立にエンコードし、それらの類似性を計算できます。

### Token-wise encoding\{#token-wise-encoding}

ColBERT におけるデータ取り込み時には、各 document はトークンに分割され、それらがベクトル化されて embedding list として保存されます。これは $d \rightarrow E_d = [e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$ のように表されます。クエリが到着すると、それもトークン化され、ベクトル化され、$q \rightarrow E_q = [e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$ のように embedding list として保存されます。

上記の式において、 

- $d$: document

- $q$: クエリ

- $E_d$: document を表す embedding list。

- $E_q$: クエリを表す embedding list。

- $[e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$: document を表す embedding list 内のベクトル embeddings の数は $\R^\{n×d\}$ の範囲内です。

- $[e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$: クエリを表す embedding list 内のベクトル embeddings の数は $\R^\{m×d\}$ の範囲内です。

### Late interaction\{#late-interaction}

ベクトル化が完了すると、クエリの embedding list は各 document の embedding list とトークンごとに比較され、最終的な類似度スコアが決定されます。

![BqBlwM4OOh6hM9bmNwbc2xUUnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/BqBlwM4OOh6hM9bmNwbc2xUUnxc.png)

上図に示すように、クエリには `machine` と `learning` の 2 つのトークンが含まれ、ウィンドウ内の document には `neural`、`network`、`python`、`tutorial` の 4 つのトークンが含まれています。これらのトークンがベクトル化されると、各クエリトークンのベクトル embeddings が document 内のものと比較され、類似度スコアのリストが得られます。次に、各スコアリストの最高スコアを合計して最終スコアを生成します。document の最終スコアを決定するこのプロセスは maximum similarity (**MAX_SIM**) と呼ばれます。maximum similarity の詳細については、[Maximum similarity](./search-metrics-explained#maximum-similarity) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

Milvus で ColBERT ライクなテキスト検索システムを実装する場合、document をトークンに分割することに限定されません。 

代わりに、document を任意の適切なサイズの segment に分割し、各 segment を埋め込んで embedding list を作成し、その embedded segments とともに document をエンティティに保存できます。

</Admonition>

### ColPali extension\{#colpali-extension}

ColBERT をベースにした ColPali (arXiv: [2407.01449](https://arxiv.org/abs/2407.01449?spm=a2ty_o01.29997173.0.0.31c4c9217HFv28&file=2407.01449)) は、Vision-Language Models (VLMs) を活用した視覚的に豊かな document 検索のための新しいアプローチを提案しています。データ取り込み時には、各 document ページはトークン化されるのではなく、高解像度画像としてレンダリングされ、その後パッチに分割されます。たとえば、448 x 448 ピクセルの document ページ画像からは、14 x 14 ピクセルのパッチを 1,024 個生成できます。

この方法では、テキストのみの検索システムでは失われる document レイアウト、画像、テーブル構造などの非テキスト情報を保持できます。

![SuHjwmWiDhLs79buw22cw9aAnqf](https://zdoc-images.s3.us-west-2.amazonaws.com/SuHjwmWiDhLs79buw22cw9aAnqf.png)

ColPali で使用される VLM は PaliGemma (arXiv: [2407.07726](https://arxiv.org/html/2407.07726v2#S1)) と呼ばれ、画像エンコーダ (**SigLIP-400M**)、decoder-only 言語モデル (**Gemma2-2B**)、および上図に示すように画像エンコーダの出力を言語モデルのベクトル空間に投影する線形層で構成されています。

データ取り込み時には、生画像として表現された document ページが複数の視覚パッチに分割され、それぞれが埋め込まれてベクトル embeddings のリストを生成します。その後、それらは言語モデルのベクトル空間に投影され、$d \rightarrow E_d = [e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$ のような最終 embedding list が得られます。クエリが到着すると、それはトークン化され、各トークンが埋め込まれて、$q \rightarrow E_q = [e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$ のようなベクトル embeddings のリストが生成されます。次に、**MAX_SIM** が適用され、2 つの embedding list を比較してクエリと document ページの最終スコアを取得します。 

## ColBERT text retrieval system\{#colbert-text-retrieval-system}

このセクションでは、StructArray を使用して ColBERT テキスト検索システムをセットアップします。その前に、Milvus v2.6.x と互換性のある Zilliz Cloud cluster をセットアップし、Cohere のアクセストークンを取得してください。

### Step 1: Install the dependencies\{#step-1-install-the-dependencies}

次のコマンドを実行して依存関係をインストールします。

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus cohere
```

### Step 2: Load the Cohere dataset\{#step-2-load-the-cohere-dataset}

この例では、Cohere の Wikipedia dataset を使用し、最初の 10,000 レコードを取得します。この dataset の情報は [このページ](https://huggingface.co/datasets/Cohere/wikipedia-2023-11-embed-multilingual-v3) で確認できます。

```python
from datasets import load_dataset

lang = "simple"
docs = load_dataset(
    "Cohere/wikipedia-2023-11-embed-multilingual-v3", 
    lang, 
    split="train[:10000]"
)
```

上記のスクリプトを実行すると、dataset がローカルにない場合はダウンロードされます。dataset の各レコードは Wikipedia ページの段落です。次の表はこの dataset の構造を示しています。

| Column Name | Description |
| --- | --- |
| `_id` | レコード ID |
| `url` | 現在のレコードの URL。 |
| `title` | 元の document のタイトル。 |
| `text` | 元の document からの段落。 |
| `emb` | 元の document のテキストの embeddings。 |

### Step 3: Group paragraphs by title\{#step-3-group-paragraphs-by-title}

段落ではなく document を検索するには、タイトルごとに段落をグループ化する必要があります。

```python
df = docs.to_pandas()
groups = df.groupby('title')

data = []

for title, group in groups:
  data.append({
      "title": title,
      "paragraphs": [{
          "text": row['text'],
          'emb': row['emb']
      } for _, row in group.iterrows()]
  })
```

このコードでは、グループ化した段落を document として保存し、それらを `data` リストに含めます。各 document には `paragraphs` キーがあり、これは段落のリストです。各段落オブジェクトには `text` と `emb` キーが含まれています。

### Step 4: Create a collection for the Cohere dataset\{#step-4-create-a-collection-for-the-cohere-dataset}

データの準備ができたら、collection を作成します。この collection では、`paragraphs` は StructArray フィールドです。StructArray スキーマの一般的な説明については、[StructArray フィールドの作成](./create-struct-array) を参照してください。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create collection schema
schema = client.create_schema()

schema.add_field('id', DataType.INT64, is_primary=True, auto_id=True)
schema.add_field('title', DataType.VARCHAR, max_length=512)

# Create struct schema
struct_schema = client.create_struct_field_schema()
struct_schema.add_field('text', DataType.VARCHAR, max_length=65535)
struct_schema.add_field('emb', DataType.FLOAT_VECTOR, dim=512)

schema.add_field('paragraphs', DataType.ARRAY,
                 element_type=DataType.STRUCT,
                 struct_schema=struct_schema, max_capacity=200)

# Create index parameters
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="paragraphs[emb]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE"
)

# Create a collection
client.create_collection(
    collection_name='wiki_documents', 
    schema=schema, 
    index_params=index_params
)
```

### Step 5: Insert Cohere dataset into the collection\{#step-5-insert-cohere-dataset-into-the-collection}

これで、上で作成した collection に準備済みデータを挿入できます。

```python
client.insert(
    collection_name='wiki_documents', 
    data=data
)
```

### Step 6: Search within the Cohere dataset\{#step-6-search-within-the-cohere-dataset}

ColBERT の設計によると、クエリテキストはトークン化され、その後 EmbeddingList に埋め込まれる必要があります。このステップでは、Wikipedia dataset の段落の embeddings を生成するために Cohere が使用したのと同じモデルを使います。

```python
import cohere

co = cohere.ClientV2("COHERE_API_KEY")

query_inputs = [
    {
        'content': [
            {'type': 'text', 'text': 'Adobe'},
        ]
    },
    {
        'content': [
            {'type': 'text', 'text': 'software'}
        ]
    }
]

embeddings = co.embed(
    inputs=query_inputs,
    model='embed-multilingual-v3.0',
    input_type="classification",
    embedding_types=["float"],
)
```

このコードでは、クエリテキストは `query_inputs` でトークンとして整理され、float ベクトルのリストに埋め込まれます。その後、Milvus の EmbeddingList を使用して、次のように類似度検索を実行できます。

```python
from pymilvus.client.embedding_list import EmbeddingList

query_emb_list = EmbeddingList()

if (embeddings.embeddings.float):
  query_emb_list.add_batch(embeddings.embeddings.float)

results = client.search(
    collection_name="wiki_documents",
    data=[query_emb_list],
    anns_field="paragraphs[emb]",
    limit=10,
    output_fields=["title"]
)

for hit in results[0]:
  print(f"Document {hit['entity']['title']}: {hit['distance']:.4f}")
```

上記コードの出力は、次のようになります。

```python
# Document Software: 2.3035
# Document Application: 2.1875
# Document Adobe Illustrator: 2.1167
# Document Open source: 2.0542
# Document Computer: 1.9811
# Document Microsoft: 1.9784
# Document Web browser: 1.9655
# Document Program: 1.9627
# Document Website: 1.9594
# Document Computer science: 1.9460
```

各ペアごとのコサイン類似度スコアは `-1` から `1` の範囲です。最終的な `MAX_SIM_COSINE` スコアは、複数のトークンレベルの最大類似度スコアを集約するため、`1` を超える場合があります。

## ColPali document retrieval system\{#colpali-document-retrieval-system}

このセクションでは、StructArray を使用して ColPali ベースの document 検索システムをセットアップします。その前に、Milvus v2.6.x と互換性のある Zilliz Cloud cluster をセットアップしてください。

### Step 1: Install the dependencies\{#step-1-install-the-dependencies}

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus 'colpali-engine>=0.3.0,<0.4.0'
```

### Step 2: Load the Vidore dataset\{#step-2-load-the-vidore-dataset}

このセクションでは、**vidore_v2_finance_en** という Vidore dataset を使用します。この dataset は、銀行業界の年次レポートのコーパスであり、長文 document 理解タスクを目的としています。これは ViDoRe v3 Benchmark を構成する 10 個のコーパスの 1 つです。この dataset の詳細は [このページ](https://huggingface.co/datasets/vidore/vidore_v3_finance_en) で確認できます。 

```python
from datasets import load_dataset

ds = load_dataset("vidore/vidore_v3_finance_en", "corpus")
df = ds['test'].to_pandas()
```

上記のスクリプトを実行すると、dataset がローカルにない場合はダウンロードされます。dataset の各レコードは財務レポートのページです。次の表はこの dataset の構造を示しています。

| Column Name | Description |
| --- | --- |
| `corpus_id` | コーパス内のレコード |
| `image` | バイト形式のページ画像。 |
| `doc_id` | 説明用の document ID。 |
| `page_number_in_doc` | doc 内における現在のページのページ番号。 |

### Step 3: Generate embeddings for the page images\{#step-3-generate-embeddings-for-the-page-images}

[Overview](./tutorial-colbert-colpali#colpali-extension) セクションで説明したように、ColPali モデルは画像をテキストモデルのベクトル空間に投影する VLM です。このステップでは、最新の ColPali モデル **vidore/colpali-v1.3** を使用します。このモデルの詳細は [このページ](https://huggingface.co/vidore/colpali-v1.3) で確認できます。 

```python
import torch
from typing import cast
from colpali_engine.models import ColPali, ColPaliProcessor

model_name = "vidore/colpali-v1.3"

model = ColPali.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="cuda:0",  # or "mps" if on Apple Silicon
).eval()

processor = ColPaliProcessor.from_pretrained(model_name)
```

モデルの準備ができたら、次のように特定の画像に対してパッチを生成してみます。

```python
from PIL import Image
from io import BytesIO

# Use the iterrows() generator to get the first row.
row = next(df.iterrows())[1]

# Decode the image bytes and generate patch embeddings.
images = [Image.open(BytesIO(row["image"]["bytes"]))]
batch_images = processor.process_images(images).to(model.device)

with torch.no_grad():
    patches_embeddings = model(**batch_images)[0]

# Check the shape of the embeddings generated for the patches.
print(patches_embeddings.shape)

# [1031, 128]
```

上記のコードでは、ColPali モデルが画像を 448 x 448 ピクセルにリサイズし、その後 14 x 14 ピクセルのパッチに分割します。最後に、これらのパッチは 128 次元の 1,031 個の embeddings に埋め込まれます。

次のようなループを使用して、すべての画像に対する embeddings を生成できます。

```python
data = []

for _, row in df.iterrows():
    corpus_id = row["corpus_id"]
    images = [Image.open(BytesIO(row["image"]["bytes"]))]
    batch_images = processor.process_images(images).to(model.device)

    with torch.no_grad():
        patches = model(**batch_images)[0]

    doc_id = row["doc_id"]
    page_number_in_doc = row["page_number_in_doc"]

    data.append({
        "corpus_id": corpus_id,
        "patches": [
            {"emb": emb.float().cpu().tolist()}
            for emb in patches
        ],
        "doc_id": doc_id,
        "page_number_in_doc": page_number_in_doc,
    })
```

<Admonition type="info" icon="📘" title="Notes">

このステップは、埋め込む必要のあるデータ量が多いため、比較的時間がかかります。

</Admonition>

### ステップ 4: 財務レポートデータセット用の collection を作成する\{#step-4-create-a-collection-for-the-financial-reports-dataset}

データの準備ができたら、collection を作成します。この collection では、`patches` は StructArray フィールドです。各 Struct 要素には 1 つの patch embedding が格納されます。StructArray の vector サブフィールドに対するインデックス要件については、[StructArray フィールドへのインデックス作成](./index-struct-array)を参照してください。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri=YOUR_CLUSTER_ENDPOINT,
    token=YOUR_API_KEY
)

schema = client.create_schema()

schema.add_field(
    field_name="corpus_id",
    datatype=DataType.INT64,
    is_primary=True
)

patch_schema = client.create_struct_field_schema()

patch_schema.add_field(
    field_name="emb",
    datatype=DataType.FLOAT_VECTOR,
    dim=128
)

schema.add_field(
    field_name="patches",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=patch_schema,
    max_capacity=1031
)

schema.add_field(
    field_name="doc_id",
    datatype=DataType.VARCHAR,
    max_length=512
)

schema.add_field(
    field_name="page_number_in_doc",
    datatype=DataType.INT64
)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="patches[emb]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE"
)

client.create_collection(
    collection_name="financial_reports",
    schema=schema,
    index_params=index_params
)
```

### ステップ 5: 財務レポートを collection に挿入する\{#step-5-insert-the-financial-reports-into-the-collection}

これで、準備した財務レポートを collection に挿入できます。

```python
client.insert(
    collection_name="financial_reports",
    data=data
)
```

<Admonition type="info" icon="📘" title="注意">

財務レポートの挿入には長い時間がかかる場合があります。各ページには 1,000 個を超える patch vector が含まれることがあり、各 vector は `patches` StructArray フィールド内に保存されます。より大きなデータセットでは、`data` をより小さなバッチに分割し、一度に 1 バッチずつ挿入してください。

</Admonition>

出力を見ると、Vidore データセットのすべてのページが挿入されていることがわかります。

### ステップ 6: 財務レポート内を検索する\{#step-6-search-within-the-financial-reports}

データの準備ができたら、次のように collection 内のデータに対して検索を実行できます。

```python
from pymilvus.client.embedding_list import EmbeddingList

queries = [
    "quarterly revenue growth chart"
]

batch_queries = processor.process_queries(queries).to(model.device)

with torch.no_grad():
    query_embeddings = model(**batch_queries)

query_emb_list = EmbeddingList()
query_emb_list.add_batch(query_embeddings[0].float().cpu().tolist())

results = client.search(
    collection_name="financial_reports",
    data=[query_emb_list],
    anns_field="patches[emb]",
    limit=10,
    output_fields=["doc_id", "page_number_in_doc"]
)
```
