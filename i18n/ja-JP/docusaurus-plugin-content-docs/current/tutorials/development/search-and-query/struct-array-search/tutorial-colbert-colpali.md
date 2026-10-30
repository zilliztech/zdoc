---
title: "EmbeddingLists を使った検索: ColBERT と ColPali | Cloud"
slug: /tutorial-colbert-colpali
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このチュートリアルでは、Zilliz Cloud で StructArray のベクトルサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を説明します。クエリと保存データの両方がベクトルのリストとして表現され、MAX_SIM* メトリクスを使用したエンティティレベルの late interaction 検索を行いたい場合に適しています。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-tutorial-colbert-colpali
sidebar_label: "ColBERT と ColPali"
sidebar_position: 6
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/search-with-embedding-lists.md"

---

import Admonition from '@theme/Admonition';

# EmbeddingLists を使った検索: ColBERT と ColPali

このチュートリアルでは、Zilliz Cloud で StructArray のベクトルサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を説明します。クエリと保存データの両方がベクトルのリストとして表現されており、`MAX_SIM*` メトリクスによるエンティティレベルの late interaction 検索を行いたい場合に適しています。

このチュートリアルの背景となる StructArray の基本については、[StructArray フィールドを作成する](./create-struct-array)、[StructArray フィールドにインデックスを作成する](./index-struct-array)、および [StructArray を使用した基本的なベクトル検索](./search-with-struct-array) を参照してください。このチュートリアルでは、一般的な StructArray の構文ではなく、ColBERT と ColPali のワークフローに焦点を当てます。

## 概要\{#overview}

テキスト検索システムを構築するには、精度と正確性を確保するために、ドキュメントをチャンクに分割し、各チャンクをその埋め込みとともにエンティティとしてベクトルデータベースに保存する必要がある場合があります。これは、特に長いドキュメントでは、全文埋め込みによって意味の特異性が薄まったり、モデルの入力制限を超えたりする可能性があるためです。

ただし、データをチャンク単位で保存すると、検索結果もチャンク単位になります。つまり、検索では最初に、まとまりのある *ドキュメント* ではなく関連する *セグメント* が特定されます。これに対処するには、検索後の追加処理を行う必要があります。

ColBERT (arXiv: [2004.12832](https://arxiv.org/abs/2004.12832)) は、BERT 上での文脈化された late interaction を通じて、効率的かつ効果的なパッセージ検索を実現する text-text 検索システムです。クエリとドキュメントをトークン単位で独立してエンコードし、それらの類似度を計算できます。

### トークン単位のエンコーディング\{#token-wise-encoding}

ColBERT におけるデータ取り込み時には、各ドキュメントはトークンに分割され、それらはベクトル化されて embedding list として保存されます。これは $d \rightarrow E_d = [e_{d1}, e_{d2}, \dots, e_{dn}] ∈ \R^{n×d}$ のように表されます。クエリが到着すると、クエリもトークン化されてベクトル化され、$q \rightarrow E_q = [e_{q1}, e_{q2}, \dots, e_{qm}] ∈ \R^{m×d}$ のように embedding list として保存されます。

上記の式で使用される記号は次のとおりです。

- $d$: ドキュメント

- $q$: クエリ

- $E_d$: ドキュメントを表す embedding list。

- $E_q$: クエリを表す embedding list。

- $[e_{d1}, e_{d2}, \dots, e_{dn}] ∈ \R^{n×d}$: ドキュメントを表す embedding list 内のベクトル埋め込みの数は $\R^{n×d}$ の範囲内です。

- $[e_{q1}, e_{q2}, \dots, e_{qm}] ∈ \R^{m×d}$: クエリを表す embedding list 内のベクトル埋め込みの数は $\R^{m×d}$ の範囲内です。

### Late interaction\{#late-interaction}

ベクトル化が完了すると、最終的な類似度スコアを決定するために、クエリの embedding list が各ドキュメントの embedding list とトークンごとに比較されます。

![Late interaction は、各クエリトークンをドキュメントのトークンと比較してスコアを計算します。](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/7f1b7ae9c3e5e36d7cfa7c3eae0ebf1aa39d8d17192c3056611534917609fd8c.png)

上図に示すように、クエリには `machine` と `learning` の 2つのトークンが含まれ、ウィンドウ内のドキュメントには `neural`、`network`、`python`、`tutorial` の 4つのトークンが含まれています。これらのトークンがベクトル化されると、各クエリトークンのベクトル埋め込みがドキュメント内のベクトル埋め込みと比較され、類似度スコアのリストが得られます。次に、各スコアリストの最高スコアが合計され、最終スコアが生成されます。ドキュメントの最終スコアを決定するこのプロセスは、最大類似度（**MAX_SIM**）と呼ばれます。

最大類似度の詳細については、[Maximum similarity](https://docs.zilliz.com/docs/search-metrics-explained#maximum-similarity) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud で ColBERT のようなテキスト検索システムを実装する場合、ドキュメントをトークンに分割する方法に限定されません。

代わりに、ドキュメントを任意の適切なサイズのセグメントに分割し、各セグメントを埋め込んで embedding list を作成し、その埋め込み済みのセグメントとともにドキュメントを 1 つのエンティティに保存できます。

</Admonition>

### ColPali の拡張\{#colpali-extension}

ColBERT をベースにした ColPali (arXiv: [2407.01449](https://arxiv.org/abs/2407.01449?spm=a2ty_o01.29997173.0.0.31c4c9217HFv28&file=2407.01449)) は、Vision-Language Models（VLMs）を活用した、視覚情報の豊富なドキュメント検索のための新しいアプローチを提案しています。データ取り込み時には、各ドキュメントページはトークン化されるのではなく、高解像度の画像としてレンダリングされてからパッチに分割されます。たとえば、448 x 448 ピクセルのドキュメントページ画像からは、14 x 14 ピクセルのパッチを 1,024 個生成できます。

この方法では、テキストのみの検索システムでは失われてしまう、ドキュメントのレイアウト、画像、テーブル構造などの非テキスト情報を保持できます。

![ColPali は、クエリトークンの埋め込みをドキュメントページのパッチ埋め込みと比較します。](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/c89769a1373bffb01fe9381ecf67cdd9b223ab1db5271dd3d230594c695c3b85.png)

この図は検索ワークフローを示しています。中間の次元は模式的に示したものです。実装では、モデル構成と埋め込みテンソルの形状を使用してください。視覚パッチには、モデル入力に追加のテキストや特殊トークンは含まれません。

ColPali で使用される VLM は PaliGemma (arXiv: [2407.07726](https://arxiv.org/html/2407.07726v2#S1)) と呼ばれ、画像エンコーダー（**SigLIP-400M**）、デコーダーのみの言語モデル（**Gemma-2B**）、および画像エンコーダーの出力を言語モデルのベクトル空間に射影する線形層で構成されています。これは上図に示すとおりです。

データ取り込み時には、生画像として表されるドキュメントページが複数の視覚パッチに分割され、各パッチが埋め込まれてベクトル埋め込みのリストが生成されます。次に、最終的な embedding list を得るために、それらが言語モデルのベクトル空間に射影されます。これは $d \rightarrow E_d = [e_{d1}, e_{d2}, \dots, e_{dn}] ∈ \R^{n×d}$ のように表されます。クエリが到着すると、クエリはトークン化され、各トークンが埋め込まれてベクトル埋め込みのリストが生成されます。これは $q \rightarrow E_q = [e_{q1}, e_{q2}, \dots, e_{qm}] ∈ \R^{m×d}$ のように表されます。次に、2つの embedding list を比較し、クエリとドキュメントページの間の最終スコアを得るために **MAX_SIM** が適用されます。

## ColBERT テキスト検索システム\{#colbert-text-retrieval-system}

StructArray のベクトルサブフィールド、`MAX_SIM_COSINE` インデックス、および EmbeddingList 検索をサポートする Zilliz Cloud クラスターを使用してください。要件については、[StructArray Limits](./struct-array-limits) を参照してください。データベースの例では PyMilvus 3.0.2 を使用します。また、Cohere のアクセストークンも必要です。

### ステップ 1: 依存関係をインストールする\{#step-1-install-the-dependencies}

次のコマンドを実行して依存関係をインストールします。

```bash
pip install --upgrade huggingface-hub transformers datasets pymilvus cohere
```

### ステップ 2: Cohere データセットを読み込む\{#step-2-load-the-cohere-dataset}

この例では、Cohere の Wikipedia データセットを使用し、最初の 10,000 件のレコードを取得します。このデータセットに関する情報は [このページ](https://huggingface.co/datasets/Cohere/wikipedia-2023-11-embed-multilingual-v3) で確認できます。

```python
from datasets import load_dataset

lang = "simple"
docs = load_dataset(
    "Cohere/wikipedia-2023-11-embed-multilingual-v3",
    lang,
    split="train[:10000]"
)
```

上記のスクリプトを実行すると、データセットがローカルに存在しない場合はダウンロードされます。データセット内の各レコードは、Wikipedia ページの 1 つの段落です。次の表は、このデータセットの構造を示しています。

| 列名 | 説明 |
| --- | --- |
| `_id` | レコード ID |
| `url` | 現在のレコードの URL。 |
| `title` | ソースドキュメントのタイトル。 |
| `text` | ソースドキュメントの 1 つの段落。 |
| `emb` | ソースドキュメントのテキストの埋め込み。 |

### ステップ 3: タイトルごとに段落をグループ化する\{#step-3-group-paragraphs-by-title}

段落ではなくドキュメントを検索するには、タイトルごとに段落をグループ化する必要があります。

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

このコードでは、グループ化した段落をドキュメントとして保存し、それらを `data` リストに含めます。各ドキュメントには `paragraphs` キーがあり、これは段落のリストです。各段落オブジェクトには `text` キーと `emb` キーが含まれます。

### ステップ 4: Cohere データセット用のコレクションを作成する\{#step-4-create-a-collection-for-the-cohere-dataset}

データの準備ができたら、コレクションを作成します。このコレクションでは、`paragraphs` は StructArray フィールドです。StructArray スキーマの一般的な説明については、[StructArray フィールドを作成する](./create-struct-array) を参照してください。

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
struct_schema.add_field('emb', DataType.FLOAT_VECTOR, dim=1024)

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

### ステップ 5: Cohere データセットをコレクションに挿入する\{#step-5-insert-cohere-dataset-into-the-collection}

これで、準備したデータを上で作成したコレクションに挿入できます。

```python
client.insert(
    collection_name='wiki_documents',
    data=data
)
```

### ステップ 6: Cohere データセット内を検索する\{#step-6-search-within-the-cohere-dataset}

この例では、クエリの用語と保存済みの段落の間の late interaction を示します。これは、ColBERT の文脈化トークンエンコーダーではなく、1,024 次元の埋め込みを生成する Cohere の `embed-multilingual-v3.0` モデルを使用します。検索のユースケースに合わせて、`search_query` でクエリの用語を埋め込んでください。

```python
import cohere

co = cohere.ClientV2("COHERE_API_KEY")

query_inputs = ["Adobe", "software"]

embeddings = co.embed(
    texts=query_inputs,
    model='embed-multilingual-v3.0',
    input_type="search_query",
    embedding_types=["float"],
)
```

このコードでは、クエリの用語は `query_inputs` に格納され、float ベクトルのリストに埋め込まれます。次に、次のように `EmbeddingList` API を使用して類似検索を実行できます。

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

次の概略出力は、形式を示しています。ドキュメントのタイトル、順序、およびスコアは、データセットとクエリの埋め込みによって異なります。

```python
# Document <title>: <score>
# Document <another title>: <score>
```

ペアごとのコサイン類似度スコアは `-1` から `1` の範囲です。最終的な `MAX_SIM_COSINE` スコアは、複数のトークンレベルの最大類似度スコアを集計するため、`1` より大きくなる場合があります。

## ColPali ドキュメント検索システム\{#colpali-document-retrieval-system}

StructArray のベクトルサブフィールド、`MAX_SIM_COSINE` インデックス、および EmbeddingList 検索をサポートする Zilliz Cloud クラスターを使用してください。要件については、[StructArray Limits](./struct-array-limits) を参照してください。データベースの例では PyMilvus 3.0.2 を使用します。

### ステップ 1: 依存関係をインストールする\{#step-1-install-the-dependencies-1}

```bash
pip install --upgrade huggingface-hub transformers datasets pymilvus 'colpali-engine>=0.3.0,<0.4.0'
```

### ステップ 2: Vidore データセットを読み込む\{#step-2-load-the-vidore-dataset}

このセクションでは、**vidore_v3_finance_en** という名前の Vidore データセットを使用します。このデータセットは、銀行業界の年次報告書からなるコーパスであり、長いドキュメントの理解タスクを目的としています。ViDoRe v3 Benchmark を構成する 10 個のコーパスの 1つです。このデータセットの詳細は [このページ](https://huggingface.co/datasets/vidore/vidore_v3_finance_en) で確認できます。

```python
from datasets import load_dataset

ds = load_dataset("vidore/vidore_v3_finance_en", "corpus")
df = ds['test'].to_pandas()
```

上記のスクリプトを実行すると、データセットがローカルに存在しない場合はダウンロードされます。データセット内の各レコードは、財務報告書の 1 ページです。次の表は、このデータセットの構造を示しています。

| 列名 | 説明 |
| --- | --- |
| `corpus_id` | コーパス内のレコード |
| `image` | バイト形式のページ画像。 |
| `doc_id` | 説明的なドキュメント ID。 |
| `page_number_in_doc` | ドキュメント内の現在のページのページ番号。 |

### ステップ 3: ページ画像の埋め込みを生成する\{#step-3-generate-embeddings-for-the-page-images}

[ColPali の拡張](./tutorial-colbert-colpali#colpali-extension) セクションで示されているように、ColPali モデルは画像をテキストモデルのベクトル空間に射影する VLM です。このステップでは、ColPali モデル **vidore/colpali-v1.3**. を使用します。このモデルの詳細は [このページ](https://huggingface.co/vidore/colpali-v1.3) で確認できます。

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

モデルの準備ができたら、次のように特定の画像のパッチを生成してみてください。

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

上記のコードでは、ColPali モデルは画像を 448 x 448 ピクセルにリサイズしてから、それぞれ 14 x 14 ピクセルのパッチに分割します。出力例には、追加の非画像トークンの埋め込みを含め、それぞれ 128 次元の 1,031 個の埋め込みが含まれています。出力の長さはモデルとプロセッサによって異なります。挿入前にテンソルの形状を調べ、StructArray の容量に収まることを確認してください。

次のようにループを使用して、すべての画像の埋め込みを生成できます。

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

このステップは、埋め込む必要があるデータ量が多いため、比較的時間がかかります。

</Admonition>

### ステップ 4: 財務報告書データセット用のコレクションを作成する\{#step-4-create-a-collection-for-the-financial-reports-dataset}

データの準備ができたら、コレクションを作成します。このコレクションでは、`patches` は StructArray フィールドです。各 Struct 要素には 1 つのパッチ埋め込みが保存されます。StructArray のベクトルサブフィールドのインデックス要件については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
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

### ステップ 5: 財務報告書をコレクションに挿入する\{#step-5-insert-the-financial-reports-into-the-collection}

これで、準備した財務報告書をコレクションに挿入できます。

```python
client.insert(
    collection_name="financial_reports",
    data=data
)
```

<Admonition type="info" icon="📘" title="Notes">

財務報告書の挿入には長い時間がかかる場合があります。各ページには 1,000 個を超えるパッチベクトルが含まれることがあり、各ベクトルは `patches` StructArray フィールド内に保存されます。データセットが大きい場合は、`data` をより小さなバッチに分割し、一度に 1 つのバッチを挿入してください。

</Admonition>

挿入応答を確認し、挿入されたページ数を確かめてください。

### ステップ 6: 財務報告書内を検索する\{#step-6-search-within-the-financial-reports}

データの準備ができたら、次のようにコレクション内のデータに対して検索を実行できます。

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
