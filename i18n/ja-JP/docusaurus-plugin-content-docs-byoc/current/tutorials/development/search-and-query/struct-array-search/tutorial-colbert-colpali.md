---
title: "EmbeddingLists で検索する: ColBERT と ColPali | BYOC"
slug: /tutorial-colbert-colpali
sidebar_label: "ColBERT と ColPali"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このチュートリアルでは、Zilliz Cloud の StructArray ベクトルサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を説明します。クエリと保存データの両方がベクトルのリストとして表現されており、`MAXSIM` メトリクスを使用したエンティティレベルの late-interaction 検索が必要な場合に使用してください。 | BYOC"
type: origin
token: Mf7GwGwgQiLCcykOi69cvaD8ncz
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# EmbeddingLists で検索する: ColBERT と ColPali

このチュートリアルでは、Zilliz Cloud の StructArray ベクトルサブフィールドに対する EmbeddingList 検索を使用して、ColBERT スタイルおよび ColPali スタイルの検索システムを構築する方法を説明します。クエリと保存データの両方がベクトルのリストとして表現されており、`MAX_SIM*` メトリクスを使用したエンティティレベルの late-interaction 検索が必要な場合に使用してください。

このチュートリアルの背景となる StructArray の基本については、[StructArray フィールドを作成する](./create-struct-array)、[StructArray フィールドにインデックスを作成する](./index-struct-array)、および [StructArray を使用した基本的なベクトル検索](./search-with-struct-array) を参照してください。このチュートリアルでは、一般的な StructArray の構文ではなく、ColBERT と ColPali のワークフローに焦点を当てます。

## 概要\{#overview}

テキスト検索システムを構築するには、精度と正確性を確保するために、ドキュメントをチャンクに分割し、各チャンクをその embedding とともにベクトルデータベース内のエンティティとして保存する必要がある場合があります。特に長いドキュメントでは、全文の embedding が意味的な特異性を薄めたり、モデルの入力制限を超えたりする可能性があるためです。

ただし、データをチャンク単位で保存すると、検索結果もチャンク単位になります。つまり、検索で最初に特定されるのは、まとまりのある *ドキュメント* ではなく、関連する *セグメント* です。これに対処するには、検索後の追加処理を実行してください。

ColBERT（arXiv: [2004.12832](https://arxiv.org/abs/2004.12832)）は、BERT 上での文脈を考慮した late interaction により、効率的で効果的な passage 検索を実現する text-text 検索システムです。クエリとドキュメントを独立して token 単位でエンコードし、それらの類似度を計算できます。

### token 単位のエンコーディング\{#token-wise-encoding}

ColBERT におけるデータ取り込み時には、各ドキュメントが token に分割され、それらはベクトル化されて embedding list として保存されます。つまり、$d \rightarrow E_d = [e_{d1}, e_{d2}, \dots, e_{dn}] ∈ \R^{n×d}$ です。クエリが到着すると、それも token 化され、ベクトル化されて embedding list として保存されます。つまり、$q \rightarrow E_q = [e_{q1}, e_{q2}, \dots, e_{qm}] ∈ \R^{m×d}$ です。

上記の式では、

- $d$: ドキュメント

- $q$: クエリ

- $E_d$: ドキュメントを表す embedding list。

- $E_q$: クエリを表す embedding list。

- $[e_{d1}, e_{d2}, \dots, e_{dn}] ∈ \R^{n×d}$: ドキュメントを表す embedding list 内のベクトル embedding の数は $\R^{n×d}$ の範囲内です。

- $[e_{q1}, e_{q2}, \dots, e_{qm}] ∈ \R^{m×d}$: クエリを表す embedding list 内のベクトル embedding の数は $\R^{m×d}$ の範囲内です。

### Late interaction\{#late-interaction}

ベクトル化が完了すると、最終的な類似度スコアを決定するために、クエリの embedding list が各ドキュメントの embedding list と token ごとに比較されます。

![BqBlwM4OOh6hM9bmNwbc2xUUnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/BqBlwM4OOh6hM9bmNwbc2xUUnxc.png)

上の図に示すように、クエリには `machine` と `learning` の 2つの token が含まれ、ウィンドウ内のドキュメントには `neural`、`network`、`python`、`tutorial` の 4つの token が含まれています。これらの token がベクトル化されると、各クエリ token のベクトル embedding がドキュメント内のベクトル embedding と比較され、類似度スコアのリストが得られます。次に、各スコアリストから最も高いスコアが合計され、最終スコアが生成されます。ドキュメントの最終スコアを決定するこのプロセスは、maximum similarity（**MAX_SIM**）として知られています。maximum similarity の詳細については、[Maximum similarity](./search-metrics-explained#maximum-similarity) を参照してください。

<Admonition type="info" title="Notes">

Milvus で ColBERT のようなテキスト検索システムを実装する場合、ドキュメントを token に分割することに限定されません。

代わりに、ドキュメントを任意の適切なサイズのセグメントに分割し、各セグメントを embedding 化して embedding list を作成し、ドキュメントをそのセグメントの embedding とともにエンティティに保存できます。

</Admonition>

### ColPali の拡張\{#colpali-extension}

ColBERT をベースに、ColPali（arXiv: [2407.01449](https://arxiv.org/abs/2407.01449?spm=a2ty_o01.29997173.0.0.31c4c9217HFv28&file=2407.01449)）は、Vision-Language Models（VLMs）を活用した、視覚情報の豊富なドキュメント検索に対する新しいアプローチを提案しています。データ取り込み時には、各ドキュメントページは token 化されるのではなく、高解像度の画像としてレンダリングされてから patch に分割されます。たとえば、448 x 448 ピクセルのドキュメントページ画像からは、それぞれ 14 x 14 ピクセルの 1,024 個の patch を生成できます。

この方法では、テキストのみの検索システムを使用した場合には失われる、ドキュメントのレイアウト、画像、表構造などの非テキスト情報が保持されます。

![SuHjwmWiDhLs79buw22cw9aAnqf](https://zdoc-images.s3.us-west-2.amazonaws.com/SuHjwmWiDhLs79buw22cw9aAnqf.png)

ColPali で使用される VLM は PaliGemma（arXiv: [2407.07726](https://arxiv.org/html/2407.07726v2#S1)）と呼ばれ、画像エンコーダー（**SigLIP-400M**）、decoder-only の言語モデル（**Gemma2-2B**）、および画像エンコーダーの出力を言語モデルのベクトル空間に投影する線形層で構成されています。これは上の図に示すとおりです。

データ取り込み時には、生の画像として表現されたドキュメントページが複数の visual patch に分割され、それぞれが embedding されてベクトル embedding のリストが生成されます。次に、それらは言語モデルのベクトル空間に投影され、最終的な embedding list が得られます。つまり、$d \rightarrow E_d = [e_{d1}, e_{d2}, \dots, e_{dn}] ∈ \R^{n×d}$ です。クエリが到着すると、それは token 化され、各 token が embedding されてベクトル embedding のリストが生成されます。つまり、$q \rightarrow E_q = [e_{q1}, e_{q2}, \dots, e_{qm}] ∈ \R^{m×d}$ です。その後、**MAX_SIM** が適用されて 2つの embedding list が比較され、クエリとドキュメントページの間の最終スコアが得られます。

## ColBERT のテキスト検索システム\{#colbert-text-retrieval-system}

このセクションでは、StructArray を使用して ColBERT のテキスト検索システムをセットアップします。その前に、Milvus v2.6.x と互換性のある Zilliz Cloud クラスターをセットアップし、Cohere のアクセストークンを取得してください。

### ステップ 1: 依存関係をインストールする\{#step-1-install-the-dependencies}

以下のコマンドを実行して、依存関係をインストールします。

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus cohere
```

### ステップ 2: Cohere データセットをロードする\{#step-2-load-the-cohere-dataset}

この例では、Cohere の Wikipedia データセットを使用し、先頭の 10,000 件のレコードを取得します。このデータセットの情報は [このページ](https://huggingface.co/datasets/Cohere/wikipedia-2023-11-embed-multilingual-v3) で確認できます。

```python
from datasets import load_dataset

lang = "simple"
docs = load_dataset(
    "Cohere/wikipedia-2023-11-embed-multilingual-v3", 
    lang, 
    split="train[:10000]"
)
```

上記のスクリプトを実行すると、データセットがローカルに存在しない場合はダウンロードされます。データセット内の各レコードは、Wikipedia ページの 1つの段落です。次の表に、このデータセットの構造を示します。

| カラム名 | 説明 |
| --- | --- |
| `_id` | レコード ID |
| `url` | 現在のレコードの URL。 |
| `title` | ソースドキュメントのタイトル。 |
| `text` | ソースドキュメントの 1つの段落。 |
| `emb` | ソースドキュメントのテキストの embedding。 |

### ステップ 3: 段落をタイトルごとにグループ化する\{#step-3-group-paragraphs-by-title}

段落ではなくドキュメントを検索するには、段落をタイトルごとにグループ化する必要があります。

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

このコードでは、グループ化された段落をドキュメントとして保存し、それらを `data` リストに含めています。各ドキュメントには `paragraphs` キーがあり、これは段落のリストです。各段落オブジェクトには `text` キーと `emb` キーが含まれます。

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

### ステップ 5: Cohere データセットをコレクションに挿入する\{#step-5-insert-cohere-dataset-into-the-collection}

これで、上記で作成したコレクションに、準備したデータを挿入できます。

```python
client.insert(
    collection_name='wiki_documents', 
    data=data
)
```

### ステップ 6: Cohere データセット内を検索する\{#step-6-search-within-the-cohere-dataset}

ColBERT の設計では、クエリテキストは token 化してから EmbeddingList に埋め込む必要があります。このステップでは、Wikipedia データセット内の段落の embedding を生成するために Cohere が使用したのと同じモデルを使用します。

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

このコードでは、クエリテキストは `query_inputs` 内で token として整理され、float ベクトルのリストに埋め込まれます。その後、次のように Milvus の EmbeddingList を使用して類似度検索を実行できます。

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

上記のコードの出力は、次のとおりです。

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

各ペアごとの cosine similarity スコアは `-1` から `1` の範囲です。最終的な `MAX_SIM_COSINE` スコアは、複数の token レベルの maximum similarity スコアを集約するため、`1` より大きくなる場合があります。

## ColPali のドキュメント検索システム\{#colpali-document-retrieval-system}

このセクションでは、StructArray を使用して ColPali ベースのドキュメント検索システムをセットアップします。その前に、Milvus v2.6.x と互換性のある Zilliz Cloud クラスターをセットアップしてください。

### ステップ 1: 依存関係をインストールする\{#step-1-install-the-dependencies}

```shell
pip install --upgrade huggingface-hub transformers datasets pymilvus 'colpali-engine>=0.3.0,<0.4.0'
```

### ステップ 2: Vidore データセットをロードする\{#step-2-load-the-vidore-dataset}

このセクションでは、**vidore_v2_finance_en** という名前の Vidore データセットを使用します。このデータセットは、長文ドキュメント理解タスクを目的とした、銀行セクターの年次報告書のコーパスです。これは、ViDoRe v3 Benchmark を構成する 10 個のコーパスの 1つです。このデータセットの詳細は [このページ](https://huggingface.co/datasets/vidore/vidore_v3_finance_en) で確認できます。

```python
from datasets import load_dataset

ds = load_dataset("vidore/vidore_v3_finance_en", "corpus")
df = ds['test'].to_pandas()
```

上記のスクリプトを実行すると、データセットがローカルに存在しない場合はダウンロードされます。データセット内の各レコードは、財務報告書の 1 ページです。次の表に、このデータセットの構造を示します。

| カラム名 | 説明 |
| --- | --- |
| `corpus_id` | コーパス内のレコード |
| `image` | バイト形式のページ画像。 |
| `doc_id` | 説明的なドキュメント ID。 |
| `page_number_in_doc` | ドキュメント内の現在のページのページ番号。 |

### ステップ 3: ページ画像の embedding を生成する\{#step-3-generate-embeddings-for-the-page-images}

[Overview](./tutorial-colbert-colpali#colpali-extension) セクションで説明したように、ColPali モデルは画像をテキストモデルのベクトル空間に投影する VLM です。このステップでは、最新の ColPali モデル **vidore/colpali-v1.3**. を使用します。このモデルの詳細は [このページ](https://huggingface.co/vidore/colpali-v1.3) で確認できます。

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

モデルの準備ができたら、次のように特定の画像の patch を生成してみることができます。

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

上記のコードでは、ColPali モデルは画像を 448 x 448 ピクセルにリサイズしてから、それぞれ 14 x 14 ピクセルの patch に分割します。最後に、これらの patch は、それぞれ 128 次元を持つ 1,031 個の embedding に埋め込まれます。

次のようにループを使用して、すべての画像の embedding を生成できます。

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

<Admonition type="info" title="Notes">

このステップは、embedding する必要があるデータ量が多いため、比較的時間がかかります。

</Admonition>

### ステップ 4: 財務レポートデータセット用のコレクションを作成する\{#step-4-create-a-collection-for-the-financial-reports-dataset}

データの準備ができたら、コレクションを作成します。このコレクションでは、`patches` は StructArray フィールドです。各 Struct 要素には 1つの patch の embedding が格納されます。StructArray のベクトルサブフィールドに対するインデックスの要件については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

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

### ステップ 5: 財務レポートをコレクションに挿入する\{#step-5-insert-the-financial-reports-into-the-collection}

これで、準備した財務レポートをコレクションに挿入できます。

```python
client.insert(
    collection_name="financial_reports",
    data=data
)
```

<Admonition type="info" title="Notes">

財務レポートの挿入には長い時間がかかる場合があります。各ページには 1,000 を超える patch ベクトルが含まれることがあり、各ベクトルは `patches` StructArray フィールド内に保存されます。データセットが大きい場合は、`data` を小さなバッチに分割し、1 回に 1 バッチずつ挿入してください。

</Admonition>

出力から、Vidore データセットのすべてのページが挿入されたことを確認できます。

### ステップ 6: 財務レポート内を検索する\{#step-6-search-within-the-financial-reports}

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
