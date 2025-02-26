---
title: "スキーマデザインハンズオン | BYOC"
slug: /schema-design-hands-on
sidebar_label: "スキーマデザインハンズオン"
beta: FALSE
notebook: FALSE
description: "情報検索(IR)システムは、検索エンジンとしても知られており、検索拡張生成(RAG)、画像検索、製品推薦などのさまざまなAIアプリケーションに不可欠です。IRシステムを開発する最初のステップは、ビジネス要件を分析し、情報をどのように整理するかを決定し、データを意味的に検索可能にするためにインデックス化するデータモデルの設計です。 | BYOC"
type: origin
token: B2Z9whq7IigVE7kgFVJcQAeQnqd
sidebar_position: 14
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - schema design
  - hands-on
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db

---

import Admonition from '@theme/Admonition';


# スキーマデザインハンズオン

情報検索(IR)システムは、検索エンジンとしても知られており、検索拡張生成(RAG)、画像検索、製品推薦などのさまざまなAIアプリケーションに不可欠です。IRシステムを開発する最初のステップは、ビジネス要件を分析し、情報をどのように整理するかを決定し、データを意味的に検索可能にするためにインデックス化するデータモデルの設計です。

Zilliz Cloudは、コレクションスキーマを介してデータモデルを定義することをサポートしています。コレクションは、テキストや画像などの非構造化データと、セマンティック検索に使用されるさまざまな精度の密なベクトルや疎なベクトル表現を整理します。さらに、Zilliz Cloudは、「Scalar」と呼ばれる非ベクトルデータ型の格納とフィルタリングをサポートしています。Scalarタイプには、BOOL、INT 8/16/32/64、FLOAT/DOUBLE、VARCHAR、JSON、Arrayが含まれます。

![IWEWbHv43o2w4lxtAQxcuNz7nBg](/byoc/ja-JP/IWEWbHv43o2w4lxtAQxcuNz7nBg.png)

検索システムのデータモデル設計には、ビジネスニーズを分析し、情報をスキーマ表現されたデータモデルに抽象化することが含まれます。たとえば、テキストを検索するには、リテラル文字列を「埋め込み」を介してベクトルに変換して「インデックス化」する必要があります。この基本的な要件を超えて、出版タイムスタンプや著者などの他のプロパティを保存する必要がある場合があります。このメタデータにより、特定の日付以降または特定の著者によって公開されたテキストのみを返すフィルタリングを通じて意味検索を洗練することができます。また、アプリケーションで検索結果をレンダリングするために、メインテキストと一緒に取得する必要がある場合もあります。これらのテキストピースを整理するには、それぞれに整数または文字列として表される一意の識別子を割り当てる必要があります。これらの要素は、洗練された検索ロジックを実現するために不可欠です。

よく設計されたスキーマは、データモデルを抽象化し、ビジネス目標を検索によって達成できるかどうかを決定するために重要です。さらに、コレクションに挿入されるすべてのデータ行がスキーマに従う必要があるため、データの一貫性と長期的な品質を維持するのに大いに役立ちます。技術的な観点からは、よく定義されたスキーマは、整理された列データストレージとクリーンなインデックス構造につながり、検索パフォーマンスを向上させることができます。

## 例:ニュース検索{#an-example-news-search}

ニュースウェブサイトの検索を構築したいとしましょう。テキスト、サムネイル画像、その他のメタデータを含むニュースのコーパスがあります。まず、データをどのように活用して検索のビジネス要件をサポートするかを分析する必要があります。サムネイル画像とコンテンツの要約に基づいてニュースを取得し、著者情報や公開時間などのメタデータを基準に検索結果をフィルタリングする必要があると想像してください。これらの要件はさらに次のように分解できます:

- テキストを介して画像を検索するために、テキストと画像データを同じ潜在空間にマップできるマルチモーダル埋め込みモデルを介して画像をベクトルに埋め込むことができます。

- 記事の要約テキストは、テキスト埋め込みモデルを介してベクトルに埋め込まれます。

- 公開時間に基づいてフィルタリングするには、日付はスカラーフィールドとして保存され、効率的なフィルタリングのためにスカラーフィールドにインデックスが必要です。JSONなどのより複雑なデータ構造は、スカラーに保存され、その内容に対してフィルタリングされた検索が実行されます(インデックスJSONは今後の機能です)。

- 画像のサムネイルバイトを取得して検索結果ページに表示するには、画像のURLも保存されます。同様に、サマリーテキストとタイトルも保存されます（必要に応じて、生のテキストと画像ファイルデータをスカラーフィールドとして保存することもできます）。

- 要約テキストの検索結果を改善するために、ハイブリッド検索アプローチを設計します。1つの検索パスについて、Open AIの「text-embedding-3-large」やオープンソースの「bge-large-en-v 1.5」などの通常の埋め込みモデルを使用して、テキストから密なベクトルを生成します。これらのモデルは、テキストの全体的な意味を表現するのに適しています。もう1つのパスは、BM 25やSPLADEなどの疎な埋め込みモデルを使用して疎なベクトルを生成し、テキストの詳細や個々の概念を把握するのに適した全文検索に似ています。Zilliz Cloudは、マルチベクトル機能により、同じデータコレクションで両方を使用できます。複数のベクトルに対する検索は、単一の'brid_search()'操作で実行できます。

- 最後に、個々のニュースページを識別するためのIDフィールドが必要です。これは、Zilliz Cloudの用語で「エンティティ」として正式に言及されます。このフィールドは主キー(略して「pk」)として使用されます。

<table>
   <tr>
     <th><p>フィールド名</p></th>
     <th><p>article_id (主键)</p></th>
     <th><p>title</p></th>
     <th><p>author_info</p></th>
     <th><p>publish_ts</p></th>
     <th><p>image_url</p></th>
     <th><p>image_vector</p></th>
     <th><p>summary</p></th>
     <th><p>summary_dense_vector</p></th>
     <th><p>summary_sparse_vector</p></th>
   </tr>
   <tr>
     <td><p>タイプ</p></td>
     <td><p>INT64</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>JSON</p></td>
     <td><p>INT32</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
   </tr>
   <tr>
     <td><p>インデックスが必要</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N(近日サポート予定)</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>Y</p></td>
   </tr>
</table>

## サンプルスキーマの実装方法{#how-to-implement-the-example-schema}

### スキーマの作成{#create-schema}

まず、Milvusクライアントインスタンスを作成します。これを使用して、Zilliz Cloudクラスタに接続し、コレクションとデータを管理できます。

スキーマを設定するには、`create_schema()`を使用してスキーマオブジェクトを作成し、`add_field()`を使用してスキーマにフィールドを追加します。

```python
from pymilvus import MilvusClient, DataType

collection_name = "my_collection"

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="TOKEN_OR_API_KEY"
)

schema = MilvusClient.create_schema(
    auto_id=False,
)

schema.add_field(field_name="article_id", datatype=DataType.INT64, is_primary=True, description="article id")
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=200, description="article title")
schema.add_field(field_name="author_info", datatype=DataType.JSON, description="author information")
schema.add_field(field_name="publish_ts", datatype=DataType.INT32, description="publish timestamp")
schema.add_field(field_name="image_url", datatype=DataType.VARCHAR,  max_length=500, description="image URL")
schema.add_field(field_name="image_vector", datatype=DataType.FLOAT_VECTOR, dim=768, description="image vector")
schema.add_field(field_name="summary", datatype=DataType.VARCHAR, max_length=1000, description="article summary")
schema.add_field(field_name="summary_dense_vector", datatype=DataType.FLOAT_VECTOR, dim=768, description="summary dense vector")
schema.add_field(field_name="summary_sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR, description="summary sparse vector")
```

MilvusClientの引数`uri`に気づくかもしれません。`これ`はZilliz Cloudクラスタに接続するために使用されます。引数は以下のように設定できます:

Zilliz Cloudクラスターのエンドポイントに`uri`を設定し、クラスターユーザーのユーザー名とパスワードをコロンで区切るか、必要な権限を持つ有効なZilliz Cloud APIキーを`トークン`に設定してください。

MilvusClient. create_schemaの`auto_id`について、`AutoIDはプライマリフィールド`の属性であり、プライマリフィールドの自動インクリメントを有効にするかどうかを決定します。`fieldarticle_id`をプライマリキーとして設定し、記事IDを手動で追加したいため、`auto_id`をFalseに設定してこの機能を無効にします。

スキーマオブジェクトにすべてのフィールドを追加した後、スキーマオブジェクトは上の表のエントリと一致します。

### インデックスを定義{#define-index}

様々なフィールドを含むスキーマを定義した後、メタデータや画像およびサマリーデータのベクトルフィールドを含め、次のステップはインデックスパラメータを準備することです。インデックス付けは、ベクトルの検索と取得を最適化し、効率的なクエリパフォーマンスを確保するために重要です。次のセクションでは、コレクション内の指定されたベクトルフィールドとスカラーフィールドのインデックスパラメータを定義します。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="image_vector",
    index_type="AUTOINDEX",
    metric_type="IP",
)
index_params.add_index(
    field_name="summary_dense_vector",
    index_type="AUTOINDEX",
    metric_type="IP",
)
index_params.add_index(
    field_name="summary_sparse_vector",
    index_type="AUTOINDEX",
    metric_type="IP",
)
index_params.add_index(
    field_name="publish_ts",
    index_type="AUTOINDEX",
)
```

インデックスパラメータが設定され、適用されると、Zilliz Cloudクラスターはベクトルおよびスカラーデータの複雑なクエリを処理するために最適化されます。このインデックス化により、コレクション内の類似検索のパフォーマンスと精度が向上し、画像ベクトルとサマリーベクトルに基づく記事の効率的な検索が可能になります。指定されたベクトルフィールドとスカラーフィールドの両方に`AUTOINDEX`を活用することで、Zilliz Cloudは迅速に最も関連性の高い結果を特定して返すことができ、全体的なユーザーエクスペリエンスとデータ検索過程の効果が大幅に向上します。

Zilliz Cloudは唯一のインデックスタイプとしてAUTOINDEXをサポートしていますが、複数のメトリックタイプを提供しています。詳細については、「[AUTOINDEXの説明](./autoindex-explained)」と「[メトリックの種類](./search-metrics-explained)」.を参照してください。

### コレクションを作成{#create-collection}

スキーマとインデックスが定義されたら、これらのパラメータを使用して「コレクション」を作成します。Zilliz Cloudクラスタ\</include>へのコレクションは、リレーショナルDBへのテーブルのようなものです。

```python
client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params,
)
```

コレクションを説明することで、コレクションが正常に作成されたことを確認できます。

```python
collection_desc = client.describe_collection(
    collection_name=collection_name
)
print(collection_desc)
```

## その他の考慮事項{#other-considerations}

### インデックスの読み込み{#loading-index}

Zilliz Cloudクラスタでコレクションを作成する場合、インデックスをすぐにロードするか、データを一括取得するまで遅延させることができます。通常、上記の例は、インデックスがコレクション作成直後に自動的に取得されることを示しているため、明示的な選択をする必要はありません。これにより、取得されたデータをすぐに検索できます。ただし、コレクション作成後に大量の一括挿入があり、特定のポイントまでデータを検索する必要がない場合は、コレクション作成時にindex_paramsを省略してインデックスの構築を遅延させ、すべてのデータを取得した後に明示的にloadを呼び出してインデックスを構築できます。この方法は、大きなコレクションでインデックスを構築する場合にはより効率的ですが、load()を呼び出すまで検索はできません。

### マルチテナントのデータモデルを定義する方法{#how-to-define-data-model-for-multi-tenancy}

複数のテナントの概念は、単一のソフトウェアアプリケーションまたはサービスが複数の独立したユーザーまたは組織にサービスを提供する必要があるシナリオで一般的に使用されます。これは、クラウドコンピューティング、SaaS(Software as a Service)アプリケーション、およびデータベースシステムでよく見られます。たとえば、クラウドストレージサービスは、マルチテナントを利用して、異なる企業が同じ基盤を共有しながらデータを別々に保存および管理できるようにすることができます。このアプローチにより、リソースの利用率と効率が最大化され、各テナントのデータセキュリティとプライバシーが確保されます。

テナントを区別する最も簡単な方法は、データとリソースを互いに分離することです。各テナントは、特定のリソースに排他的にアクセスするか、他のテナントとリソースを共有して、データベース、コレクション、パーティションなどのZilliz Cloudエンティティを管理します。これらのエンティティに合わせた特定の方法があり、マルチテナントを実装することができます。詳細については、[Milvusマルチテナントページ](https://milvus.io/docs/multi_tenancy.md#Multi-tenancy-strategies)を参照してください。