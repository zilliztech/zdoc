---
title: "EmbeddingLists を使った検索: ColBERT と ColPali | BYOC"
slug: /tutorial-colbert-colpali
sidebar_label: "ColBERT と ColPali"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このチュートリアルでは、Zilliz Cloud で StructArray ベクターサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を示します。クエリと保存データの両方がベクターのリストとして表現され、`MAXSIM` メトリクスによるエンティティレベルの late-interaction 検索を行いたい場合に利用してください。 | BYOC"
type: origin
token: Mf7GwGwgQiLCcykOi69cvaD8ncz
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# EmbeddingLists を使った検索: ColBERT と ColPali

このチュートリアルでは、Zilliz Cloud で StructArray ベクターサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を示します。クエリと保存データの両方がベクターのリストとして表現され、`MAX_SIM*` メトリクスによるエンティティレベルの late-interaction 検索を行いたい場合に利用してください。

このチュートリアルの背景となる StructArray の基本については、[StructArray フィールドを作成する](./create-struct-array)、[StructArray フィールドにインデックスを作成する](./index-struct-array)、および [StructArray を使った基本的なベクター検索](./search-with-struct-array) を参照してください。このチュートリアルでは、一般的な StructArray 構文ではなく、ColBERT および ColPali のワークフローに焦点を当てます。

## Overview\{#overview}

テキスト検索システムを構築するには、精度と正確性を確保するために、ドキュメントをチャンクに分割し、各チャンクをその埋め込みとともにベクターデータベース内の 1 つのエンティティとして保存する必要がある場合があります。これは特に、長いドキュメントでは全文埋め込みによって意味の特異性が薄れたり、モデルの入力制限を超えたりする可能性があるためです。 

しかし、データをチャンク単位で保存すると、検索結果もチャンク単位になり、検索では最初に一貫した *ドキュメント* ではなく関連する *セグメント* が特定されることになります。これに対処するには、検索後に追加の後処理を行う必要があります。

ColBERT（arXiv: [2004.12832](https://arxiv.org/abs/2004.12832)）は、BERT 上での文脈化された late interaction によって、効率的かつ効果的なパッセージ検索を提供する text-text 検索システムです。クエリとドキュメントをトークンごとに独立してエンコードし、それらの類似度を計算できます。

### Token-wise encoding\{#token-wise-encoding}

ColBERT におけるデータ取り込み時には、各ドキュメントはトークンに分割され、それらがベクトル化されて埋め込みリストとして保存されます。たとえば、$d \rightarrow E_d = [e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$ のようになります。クエリが到着すると、それもトークン化・ベクトル化され、$q \rightarrow E_q = [e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$ のように埋め込みリストとして保存されます。

上記の式では、 

- $d$: ドキュメント

- $q$: クエリ

- $E_d$: ドキュメントを表す埋め込みリスト。

- $E_q$: クエリを表す埋め込みリスト。

- $[e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$: ドキュメントを表す埋め込みリスト内のベクター埋め込み数は $\R^\{n×d\}$ の範囲内にあります。

- $[e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$: クエリを表す埋め込みリスト内のベクター埋め込み数は $\R^\{m×d\}$ の範囲内にあります。

### Late interaction\{#late-interaction}

ベクトル化が完了すると、最終的な類似度スコアを決定するために、クエリ埋め込みリストが各ドキュメント埋め込みリストとトークンごとに比較されます。

![BqBlwM4OOh6hM9bmNwbc2xUUnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/BqBlwM4OOh6hM9bmNwbc2xUUnxc.png)

上の図に示すように、クエリには `machine` と `learning` の 2 つのトークンがあり、ウィンドウ内のドキュメントには `neural`、`network`、`python`、`tutorial` の 4 つのトークンがあります。これらのトークンがベクトル化されると、各クエリトークンのベクター埋め込みがドキュメント内の埋め込みと比較され、類似度スコアのリストが得られます。その後、各スコアリストから最も高いスコアを合計して最終スコアを算出します。ドキュメントの最終スコアを決定するこの処理は、maximum similarity（**MAX_SIM**）と呼ばれます。maximum similarity の詳細については、[Maximum similarity](./search-metrics-explained#maximum-similarity) を参照してください。

<Admonition type="info" icon="📘" title="注意">

Milvus で ColBERT ライクなテキスト検索システムを実装する場合、ドキュメントをトークンに分割することに限定されません。 

代わりに、ドキュメントを適切な任意のサイズのセグメントに分割し、各セグメントを埋め込んで埋め込みリストを作成し、ドキュメントをその埋め込み済みセグメントとともに 1 つのエンティティに保存できます。

</Admonition>

### ColPali extension\{#colpali-extension}

ColBERT を基にした ColPali（arXiv: [2407.01449](https://arxiv.org/abs/2407.01449?spm=a2ty_o01.29997173.0.0.31c4c9217HFv28&file=2407.01449)）は、Vision-Language Models（VLMs）を活用した、視覚的に情報量の多いドキュメント検索の新しいアプローチを提案しています。データ取り込み時には、各ドキュメントページはテキストとしてトークン化されるのではなく、高解像度画像としてレンダリングされ、その後パッチに分割されます。たとえば、448 x 448 ピクセルのドキュメントページ画像から、それぞれ 14 x 14 ピクセルの 1,024 個のパッチを生成できます。

この方法では、テキストのみの検索システムを使用した場合に失われる、ドキュメントレイアウト、画像、表構造などの非テキスト情報を保持できます。

![SuHjwmWiDhLs79buw22cw9aAnqf](https://zdoc-images.s3.us-west-2.amazonaws.com/SuHjwmWiDhLs79buw22cw9aAnqf.png)

ColPali で使用される VLM は PaliGemma（arXiv: [2407.07726](https://arxiv.org/html/2407.07726v2#S1)）と呼ばれ、画像エンコーダー（**SigLIP-400M**）、decoder-only 言語モデル（**Gemma2-2B**）、および画像エンコーダーの出力を言語モデルのベクター空間に射影する線形層で構成されています。これは上の図に示されています。

データ取り込み時には、生画像として表現されたドキュメントページが複数の視覚パッチに分割され、それぞれが埋め込まれてベクター埋め込みのリストが生成されます。その後、それらは言語モデルのベクター空間に射影され、$d \rightarrow E_d = [e_\{d1\}, e_\{d2\}, \dots, e_\{dn\}] ∈ \R^\{n×d\}$ のように最終的な埋め込みリストが得られます。クエリが到着すると、それはトークン化され、各トークンが埋め込まれて、$q \rightarrow E_q = [e_\{q1\}, e_\{q2\}, \dots, e_\{qm\}] ∈ \R^\{m×d\}$ のようにベクター埋め込みのリストが生成されます。次に、2 つの埋め込みリストを比較してクエリとドキュメントページ間の最終スコアを取得するために、**MAX_SIM** が適用されます。 

## ColBERT text retrieval system\{#colbert-text-retrieval-system}

このセクションでは、StructArray を使用して ColBERT テキスト検索システムをセットアップします。その前に、Milvus v2.6.x と互換性のある Zilliz Cloud cluster をセットアップし、Cohere のアクセストークンを取得してください。

### Step 1: Install the dependencies\{#step-1-install-the-dependencies}

依存関係をインストールするには、次のコマンドを実行します。

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus cohere
```

### Step 2: Load the Cohere dataset\{#step-2-load-the-cohere-dataset}

この例では、Cohere の Wikipedia dataset を使用し、最初の 10,000 件のレコードを取得します。この dataset に関する情報は [このページ](https://huggingface.co/datasets/Cohere/wikipedia-2023-11-embed-multilingual-v3) で確認できます。

```python
from datasets import load_dataset

lang = "simple"
docs = load_dataset(
    "Cohere/wikipedia-2023-11-embed-multilingual-v3", 
    lang, 
    split="train[:10000]"
)
```

上記のスクリプトを実行すると、dataset がローカルで利用できない場合はダウンロードされます。dataset の各レコードは Wikipedia ページの 1 つの段落です。次の表は、この dataset の構造を示しています。

| Column Name | Description |
| --- | --- |
| `_id` | レコード ID |
| `url` | 現在のレコードの URL。 |
| `title` | ソースドキュメントのタイトル。 |
| `text` | ソースドキュメントの 1 つの段落。 |
| `emb` | ソースドキュメントのテキストの埋め込み。 |

### Step 3: Group paragraphs by title\{#step-3-group-paragraphs-by-title}

段落ではなくドキュメントを検索するために、段落を title ごとにグループ化する必要があります。

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

このコードでは、グループ化された段落をドキュメントとして保存し、`data` リストに含めています。各ドキュメントには `paragraphs` キーがあり、これは段落のリストです。各段落オブジェクトには `text` キーと `emb` キーが含まれます。

### Step 4: Create a collection for the Cohere dataset\{#step-4-create-a-collection-for-the-cohere-dataset}

データの準備ができたら、collection を作成します。この collection では、`paragraphs` は StructArray フィールドです。StructArray schema の一般的な説明については、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

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

これで、上で作成した collection に準備したデータを挿入できます。

```python
client.insert(
    collection_name='wiki_documents', 
    data=data
)
```

### Step 6: Search within the Cohere dataset\{#step-6-search-within-the-cohere-dataset}

ColBERT の設計によれば、クエリテキストはトークン化され、その後 EmbeddingList に埋め込まれる必要があります。このステップでは、Wikipedia dataset の段落埋め込みを生成するために Cohere が使用したものと同じモデルを使用します。

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

このコードでは、クエリテキストは `query_inputs` 内でトークンとして整理され、float ベクターのリストに埋め込まれます。その後、次のように Milvus の EmbeddingList を使用して類似度検索を実行できます。

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

各ペアごとのコサイン類似度スコアの範囲は `-1` から `1` です。最終的な `MAX_SIM_COSINE` スコアは、複数のトークンレベルの最大類似度スコアを集約するため、`1` を超える場合があります。

## ColPali document retrieval system\{#colpali-document-retrieval-system}

このセクションでは、StructArray を使用して ColPali ベースのドキュメント検索システムをセットアップします。その前に、Milvus v2.6.x と互換性のある Zilliz Cloud cluster をセットアップしてください。

### Step 1: Install the dependencies\{#step-1-install-the-dependencies}

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus 'colpali-engine>=0.3.0,<0.4.0'
```

### Step 2: Load the Vidore dataset\{#step-2-load-the-vidore-dataset}

このセクションでは、**vidore_v2_finance_en** という Vidore dataset を使用します。この dataset は、長文ドキュメント理解タスクを目的とした、銀行業界の年次報告書のコーパスです。これは ViDoRe v3 Benchmark を構成する 10 個のコーパスの 1 つです。この dataset の詳細は [このページ](https://huggingface.co/datasets/vidore/vidore_v3_finance_en) で確認できます。 

```python
from datasets import load_dataset

ds = load_dataset("vidore/vidore_v3_finance_en", "corpus")
df = ds['test'].to_pandas()
```

上記のスクリプトを実行すると、dataset がローカルで利用できない場合はダウンロードされます。dataset の各レコードは、財務報告書の 1 ページです。次の表は、この dataset の構造を示しています。

| Column Name | Description |
| --- | --- |
| `corpus_id` | コーパス内の 1 レコード |
| `image` | バイト形式のページ画像。 |
| `doc_id` | 説明用のドキュメント ID。 |
| `page_number_in_doc` | doc 内の現在のページのページ番号。 |

### Step 3: Generate embeddings for the page images\{#step-3-generate-embeddings-for-the-page-images}

[Overview](./tutorial-colbert-colpali#colpali-extension) セクションで示したように、ColPali モデルは画像をテキストモデルのベクター空間に射影する VLM です。このステップでは、最新の ColPali モデル **vidore/colpali-v1.3** を使用します。このモデルの詳細は [このページ](https://huggingface.co/vidore/colpali-v1.3) で確認できます。 

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

モデルの準備ができたら、次のように特定の画像に対してパッチを生成してみることができます。

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

上記のコードでは、ColPali モデルは画像を 448 x 448 ピクセルにリサイズし、その後それを 14 x 14 ピクセルのパッチに分割します。最後に、これらのパッチはそれぞれ 128 次元を持つ 1,031 個の埋め込みに変換されます。

次のようにループを使用して、すべての画像に対する埋め込みを生成できます。

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

<Admonition type="info" icon="📘" title="注意">

このステップは、埋め込む必要があるデータ量が多いため、比較的時間がかかります。

</Admonition>

### Step 4: Create a collection for the financial reports dataset\{#step-4-create-a-collection-for-the-financial-reports-dataset}

データの準備ができたら、collection を作成します。この collection では、`patches` は StructArray フィールドです。各 Struct 要素には 1 つのパッチ埋め込みが保存されます。StructArray ベクターサブフィールドのインデックス要件については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

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

### Step 5: Insert the financial reports into the collection\{#step-5-insert-the-financial-reports-into-the-collection}

これで、準備した財務報告書を collection に挿入できます。

```python
client.insert(
    collection_name="financial_reports",
    data=data
)
```

<Admonition type="info" icon="📘" title="注意">

財務報告書の挿入には長い時間がかかる場合があります。各ページには 1,000 個を超えるパッチベクターが含まれる可能性があり、各ベクターは `patches` StructArray フィールド内に保存されます。より大きな dataset の場合は、`data` をより小さなバッチに分割し、1 回に 1 バッチずつ挿入してください。

</Admonition>

出力から、Vidore dataset のすべてのページが挿入されたことを確認できます。

### Step 6: Search within the financial reports\{#step-6-search-within-the-financial-reports}

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
