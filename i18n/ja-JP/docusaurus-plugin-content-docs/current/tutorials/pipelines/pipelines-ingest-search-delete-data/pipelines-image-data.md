---
title: "画像データ | Cloud"
slug: /pipelines-image-data
sidebar_label: "画像データ"
beta: FALSE
notebook: FALSE
description: "Zilliz CloudのWeb UIは、パイプラインを作成、実行、管理するためのシンプルで直感的な方法を提供し、RESTful APIはWeb UIに比べてより柔軟性とカスタマイズ性を提供します。 | Cloud"
type: origin
token: JUOuwYrwtih4omkraU3cNc45nyb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - image data
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 画像データ

Zilliz CloudのWeb UIは、パイプラインを作成、実行、管理するためのシンプルで直感的な方法を提供し、RESTful APIはWeb UIに比べてより柔軟性とカスタマイズ性を提供します。

このガイドでは、画像パイプラインの作成、埋め込み画像データの逆画像検索の実行、パイプラインが不要になった場合の削除に必要な手順を説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloud Pipelinesは、2025年第2四半期の終わりまでに廃止され、「Data In, Data Out」という新しい機能に置き換えられます。これにより、MilvusとZilliz Cloudの両方で埋め込み生成が効率化されます。2024年12月24日現在、新規ユーザー登録は受け付けられていません。現在のユーザーは、日没日まで月額20ドルの無料手当内でサービスを継続して利用できますが、SLAは提供されていません。モデルプロバイダーまたはオープンソースモデルの埋め込みAPIを使用してベクトル埋め込みを生成することを検討してください。</p>

</Admonition>

## 前提条件と制限{#prerequisites-and-limitations}

- Google Cloud Platform(GCP)上のus-west 1にデプロイされたクラスタを作成していることを確認してください。

- 一つのプロジェクトでは、同じタイプのパイプラインを最大100個まで作成できます。詳細については、[Zillizクラウドの制限](./limits)を参照してください。

## イメージデータを取り込む{#ingest-image-data}

データを取り込むには、まず取り込みパイプラインを作成してから実行する必要があります。

### イメージ取り込みパイプラインを作成する{#create-image-ingestion-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. プロジェクトに移動します。

1. ナビゲーションパネルから**パイプライン**をクリックします。次に、**概要**タブに切り替えて、**パイプライン**をクリックします。パイプラインを作成するには、**+パイプライン**をクリックしてください。

    ![create-pipeline](/img/ja-JP/create-pipeline.png)

1. 作成するパイプラインの種類を選択します。[**+パイプライン**]ボタンをクリックします。**Ingestion Pipeline**列。

    ![choose-pipeline](/img/ja-JP/choose-pipeline.png)

1. 作成するIngestionパイプラインを構成します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p>ターゲットクラスタ</p></td>
         <td><p>このIngestionパイプラインを使用して新しいコレクションが自動的に作成されるクラスタです。現時点では、GCP us-west 1にデプロイされたクラスタのみとなります。</p></td>
       </tr>
       <tr>
         <td><p>コレクション名</p></td>
         <td><p>自動作成されたコレクションの名前。</p></td>
       </tr>
       <tr>
         <td><p>パイプライン名</p></td>
         <td><p>新しいIngestionパイプラインの名前です。小文字、数字、アンダースコアのみを含める必要があります。</p></td>
       </tr>
       <tr>
         <td><p>説明（オプション）</p></td>
         <td><p>新しいIngestionパイプラインの説明。</p></td>
       </tr>
    </table>

    ![configure-ingestion-pipeline](/img/ja-JP/configure-ingestion-pipeline.png)

1. Ingestionパイプラインに**INDEX**関数を追加するには、**+Function**をクリックします。各Ingestionパイプラインに対して、正確に1つの**INDEX**関数を追加できます。

    1. 関数名を入力します。

    1. 関数タイプとして**INDEX_IMAGE**を選択してください。**INDEX_IMAGE**関数は、提供されたURL内の画像のベクトル埋め込みを生成できます。

    1. ベクトル埋め込みを生成するために使用する埋め込みモデルを選択してください。現在、利用可能なモデルは2つあります:**zilliz/vit-base-patch16-224**と**zilliz/clip-vit-base-patch32**。以下のチャートは、各埋め込みモデルを簡単に紹介しています。

        <table>
           <tr>
             <th><p><strong>埋め込みモデル</strong></p></th>
             <th><p><strong>説明する</strong></p></th>
           </tr>
           <tr>
             <td><p>ジリズ/<a href="https://huggingface.co/google/vit-base-patch16-224">vit-base-patch16-224</a></p></td>
             <td><p>Vision Transformer(ViT)は、Googleによってオープンソース化されたトランスエンコーダーモデル(BERTのようなもの)です。このモデルは、画像コンテンツの意味をベクトル空間に埋め込むために、大量の画像コレクションで事前にトレーニングされています。このモデルは、最適なレイテンシを提供するためにZilliz Cloudにホストされています。</p></td>
           </tr>
           <tr>
             <td><p>ジリズ/<a href="https://huggingface.co/openai/clip-vit-base-patch32">clip-vit-base-patch32</a></p></td>
             <td><p>Open AIによってリリースされたマルチモーダルモデル。このビジョンモデルとそのペアリングテキストモデルは、画像とテキストを同じベクトル空間に埋め込むことができ、視覚情報とテキスト情報の間の意味検索を可能にします。モデルはZilliz Cloudにホストされ、最高のレイテンシを提供します。</p></td>
           </tr>
        </table>

        ![add-index-image-function](/img/ja-JP/add-index-image-function.png)

    1. [**追加**]をクリックして関数を保存します。

1. （オプション）テキストのメタデータを保持する必要がある場合は、別の**PRE**SERVE関数を追加してください。**PRE SERVE**関数は、データ取り込みとともにコレクションにスカラーフィールドを追加します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>各Ingestionパイプラインについて、最大50個の<strong>PRESERVE</strong>関数を追加できます。</p>

    </Admonition>

    1. [**+Function**]をクリックします。

    1. 関数名を入力します。

    1. 入力フィールドの名前と種類を設定します。サポートされている入力フィールドの種類は、**Bool**、**Int 8**、**Int 16**、**Int 32**、**Int 64**、**Float**、**Double**、**VarChar**です。

        <Admonition type="info" icon="📘" title="ノート">

        <ul>
        <li><p>現在、出力フィールド名は入力フィールド名と同じでなければなりません。入力フィールド名は、Ingestionパイプラインを実行する際に使用されるフィールド名を定義します。出力フィールド名は、保存された値が保持されるベクトルコレクションスキーマ内のフィールド名を定義します。</p></li>
        <li><p>VarCharフィールド<strong>の</strong>場合、値は最大<strong>4,000</strong>文字の英数字の文字列である必要があります。</p></li>
        <li><p>スカラーフィールドに日時を格納する場合は、年データには<strong>Int 16</strong>データ型、タイムスタンプには<strong>Int 32</strong>データ型を使用することをお勧めします。</p></li>
        </ul>

        </Admonition>

    ![add-preserve-function](/img/ja-JP/add-preserve-function.png)

    1. [**追加**]をクリックして関数を保存します。

1. [**Ingestion Pipelineを作成**]をクリックします。

1. 作成したばかりのIngestionパイプラインと互換性があるように自動構成された検索パイプラインと削除パイプラインの作成を続けます。

    ![auto-create-image-search-and-delete-pipelines](/img/ja-JP/auto-create-image-search-and-delete-pipelines.png)

</TabItem>

<TabItem value="Bash">

次の例では、という名前のIngestionパイプラインを作成します`my_image_ingestion_パイプライン`、**INDEX_IMAGE**関数と**PRESERVE**関数が追加されました。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "name": "my_image_ingestion_pipeline",
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "projectId": "proj-xxxx",
        "collectionName": "my_collection",
        "description": "A pipeline that converts an image into vector embeddings and store in efficient index for search.",
        "type": "INGESTION",  
        "functions": [
            { 
                "name": "index_my_image",
                "action": "INDEX_IMAGE", 
                "embedding": "zilliz/vit-base-patch16-224"
            },
            {
                "name": "keep_image_tag",
                "action": "PRESERVE", 
                "inputField": "image_title", 
                "outputField": "image_title",
                "fieldType": "VarChar" 
            }
        ]   
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `lusterId`:パイプラインを作成するクラスタのIDです。現在、GCP上のus-west 1にデプロイされたクラスタのみを選択できます。CLUSTER_IDの確認方法については、[How can I find my CLUSTER_ID?を参照してください。](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

- `projectId`:パイプラインを作成するプロジェクトのID。詳しくは[プロジェクトIDの取得方法をご覧ください。](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `lectionName:`作成するインジェストパイプラインで自動的に生成されるコレクションの名前です。また、既存のコレクションを指定することもできます。

- `name`:作成するパイプラインの名前。パイプライン名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

- `description`(オプション):作成するパイプラインの説明。

- `type`:作成するパイプラインの種類。現在利用可能なパイプラインの種類には、`INGESTION`、`SEARCH`、`DELETION`があります。

- `functions`:パイプラインに追加する関数。**Ingestionパイプラインには、1つのINDEX関数と最大50個のPRESERVE関数しか持てません。**

    - `name`:関数の名前です。関数名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

    - `action`:追加する関数の種類。現在利用可能なオプションには、`INDEX_DOC`、`INDEX_TEXT`、`INDEX_IMAGE`、`PRE`SERVEがあります。

    - `埋め込み`:画像のベクトル埋め込みを生成するために使用される埋め込みモデルです。利用可能なオプションは以下の通りです。*（このパラメータは`INDEX`関数でのみ使用されます。）*

        <table>
           <tr>
             <th><p><strong>埋め込みモデル</strong></p></th>
             <th><p><strong>説明する</strong></p></th>
           </tr>
           <tr>
             <td><p>ジリズ/vit-base-patch16-224</p></td>
             <td><p>Vision Transformer(ViT)は、Googleによってオープンソース化されたトランスエンコーダーモデル(BERTのようなもの)です。このモデルは、画像コンテンツの意味をベクトル空間に埋め込むために、大量の画像コレクションで事前にトレーニングされています。このモデルは、最適なレイテンシを提供するためにZilliz Cloudにホストされています。</p></td>
           </tr>
           <tr>
             <td><p>ジリズ/clip-vit-base-patch32</p></td>
             <td><p>Open AIによってリリースされたマルチモーダルモデル。このビジョンモデルとそのペアリングテキストモデルは、画像とテキストを同じベクトル空間に埋め込むことができ、視覚情報とテキスト情報の間の意味検索を可能にします。モデルはZilliz Cloudにホストされ、最高のレイテンシを提供します。</p></td>
           </tr>
        </table>

- `input tField`:`input`フィールドの名前です。値はカスタマイズできますが、output tFieldと同じにしてくださ`い`。*（このパラメータは`PRESERVE`関数でのみ使用されます。）*

- `output`Field:コレクションスキーマで使用される出力フィールドの名前。現在、出力フィールドの名前は入力フィールドの名前と同じでなければなりません。*（このパラメータは`PRESERVE`関数でのみ使用されます。）*

- `fieldType`:入力フィールドと出力フィールドのデータ型です。使用可能な値は、`Bool`、`Int 8`、`Int 16`、`Int 32`、`Int 64`、`Float`、`Double`、および`VarCharです`。*(このパラメータは`PRESERVE`関数でのみ使用されます。)*

    <Admonition type="info" icon="📘" title="ノート">

    <p>スカラーフィールドに日時を格納する場合は、年データには<strong>Int 16</strong>データ型、タイムスタンプには<strong>Int 32</strong>データ型を使用することをお勧めします。</p>
    <p>VarCharフィールド<code>型</code>の場合、このフィールドのデータの<code>max_length</code>は4,000を超えることはできません。</p>

    </Admonition>

以下は出力例です。

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_image_ingestion_pipeline",
    "type": "INGESTION",
    "createTimestamp": 1721187300000,
    "clusterId": "in03-***************",
    "collectionName": "my_collection"
    "description": "A pipeline that converts an image into vector embeddings and store in efficient index for search.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": [
      {
        "action": "INDEX_IMAGE",
        "name": "index_my_image",
        "inputFields": ["image_url", "image_id"],
        "embedding": "zilliz/vit-base-patch16-224"
      },
      {
        "action": "PRESERVE",
        "name": "keep_image_tag",
        "inputField": "image_title",
        "outputField": "image_title",
        "fieldType": "VarChar"
      }
    ]
  }
}
```

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

</Admonition>

Ingestionパイプラインが作成されると、`my_collection`という名前のコレクションが自動的に作成されます。

このコレクションには、**INDEX_IMAGE**関数の2つの出力フィールドと、**PRE**SERVE関数ごとに1つの出力フィールドが含まれています。コレクションのスキーマは以下の通りです。

<table>
   <tr>
     <th><p>イメージID (データ型: Int 64)</p></th>
     <th><p>埋め込み (データ型: FLOAT_VECTOR)</p></th>
     <th><p>画像タイトル (データ型: VarChar)</p></th>
   </tr>
</table>

</TabItem>

</Tabs>

### イメージ取り込みパイプラインを実行する{#run-image-ingestion-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. インジェスチョンパイプラインの横にある「▶︎」ボタンをクリックしてください。または、**プレイグラウンド**タブをクリックすることもできます。

    ![run-pipeline](/img/ja-JP/run-pipeline.png)

1. 画像IDとURLを`image_id`と`image_url`フィールドに入力してください。PRESERVE関数を追加した場合は、定義済みの保存フィールドにも値を入力してください。**実行**をクリックしてください。

1. 結果を確認してください。

1. 再度実行する他のテキストを入力します。

</TabItem>

<TabItem value="Bash">

次の例では、Ingestionパイプライン`my_image_ingestion_Pipeline`を実行します。

```python
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "image_id": "my-img-123456",
            "image_url": "xxx",
            "image_title": "A cute yellow cat"
        }
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `image_id`:オブジェクトストレージに保存されている画像のID。

- `image_url`:オブジェクトストレージに保存されている画像のURLです。エンコードされていないか、UTF-8でエンコードされたURLを使用してください。URLが少なくとも1時間有効であることを確認してください。

- `image_title:`保存する必要のあるメタデータフィールド。

以下は回答例です。

```bash
{
  "code": 200,
  "data": {
    "num_entities": 1,
    "usage": {
      "embedding": 1
    }
  }
}
```

</TabItem>

</Tabs>

## 画像データを検索する{#search-image-data}

任意のデータを検索するには、まず検索パイプラインを作成してから実行する必要があります。IngestionおよびDeletionパイプラインとは異なり、検索パイプラインを作成する場合、クラスタとコレクションはパイプラインレベルではなく関数レベルで定義されます。これは、Zilliz Cloudが複数のコレクションから同時に検索できるためです。

画像データを検索するには2つの方法があります。[逆画像検索を行う](./pipelines-image-data#conduct-a-reverse-image-search)か、[テキストによる画像検索](./pipelines-image-data#search-image-by-text)を行います。

### 逆画像検索を行う{#conduct-a-reverse-image-search}

#### 画像検索パイプラインの作成{#create-image-search-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. プロジェクトに移動します。

1. ナビゲーションパネルから**パイプライン**をクリックします。次に、**概要**タブに切り替えて、**パイプライン**をクリックします。パイプラインを作成するには、**+パイプライン**をクリックしてください。

1. 作成するパイプラインの種類を選択してください。「**+パイプライン**」ボタンを**検索パイプライン**欄でクリックしてください。

    ![create-search-pipeline](/img/ja-JP/create-search-pipeline.png)

1. 作成したい検索パイプラインを構成します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p>パイプライン名</p></td>
         <td><p>新しい検索パイプラインの名前です。小文字、数字、アンダースコアのみを含める必要があります。</p></td>
       </tr>
       <tr>
         <td><p>説明（オプション）</p></td>
         <td><p>新しい検索パイプラインの説明。</p></td>
       </tr>
    </table>

    ![configure-search-pipeline](/img/ja-JP/configure-search-pipeline.png)

1. 「**+Function**」をクリックして、検索パイプラインに関数を追加します。正確に1つの関数を追加できます。

    1. 関数名を入力します。

    1. 「**Target Cluster**」と「**Target collection**」を選択します。**Target Cluster**は、**us-west 1 on Google Cloud Platform(GCP)**にデプロイされたクラスタである必要があります。また、**Target Collection**はIngestionパイプラインによって作成されている必要があります。そうでない場合、Searchパイプラインは互換性がありません。

    1. Function Typeとして**SEARCH_IMAGE_BY_IMAGE**を選択してください。**Function Type**として**SEARCH_IMAGE_BY_IMAGE**関数を使用すると、クエリ画像をベクトル埋め込みに変換し、最も類似した画像を取得できます。

        ![add-search-image-function](/img/ja-JP/add-search-image-function.png)

    1. [**追加**]をクリックして関数を保存します。

1. [**検索パイプラインを作成**]をクリックします。

</TabItem>

<TabItem value="Bash">

次の例では、`my_image_search_Pipeline`という名前の検索パイプラインを作成し、**SEARCH_IMAGE_BY_IMAGE**関数を追加します。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",       
        "name": "my_image_search_pipeline",
        "description": "A pipeline that searches image by image.",
        "type": "SEARCH",
        "functions": [
            {
                "name": "search_image_by_image",
                "action": "SEARCH_IMAGE_BY_IMAGE",
                "embedding": "zilliz/vit-base-patch16-224",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection"
            }
        ]
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `projectId`:パイプラインを作成するプロジェクトのID。詳しくは[プロジェクトIDの取得方法をご覧ください。](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`:作成するパイプラインの名前。パイプライン名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

- `description`(オプション):作成するパイプラインの説明。

- `type`:作成するパイプラインの種類。現在利用可能なパイプラインの種類には、`INGESTION`、`SEARCH`、`DELETION`があります。

- `functions`:パイプラインに追加する関数。**Searchパイプラインには1つの関数しか持てません。**

    - `name`:関数の名前です。関数名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

    - `action`:追加する関数の種類。現在利用可能なオプションは、`SEARCH_DOC_CHUNK`、`SEARCH_TEXT`、`SEARCH_IMAGE_BY_IMAGE`、`SEARCH_IMAGE_BY_TEXT`です。

    - `lusterId`:パイプラインを作成するクラスタのIDです。現在、GCP上のus-west 1にデプロイされたクラスタのみを選択できます。CLUSTER_IDの確認方法については、[How can I find my CLUSTER_ID?を参照してください。](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

    - `collection`Name:パイプラインを作成するコレクションの名前。

    - `埋め込み`:ベクトル検索中に使用される埋め込みモデル。モデルは、互換性のあるコレクションで選択されたものと一致する必要があります。

以下は出力例です。

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_image_search_pipeline",
    "type": "SEARCH",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that searches image by image.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": 
      {
        "action": "SEARCH_IMAGE_BY_IMAGE",
        "name": "search_image_by_image",
        "inputFields": ["query_image_url"],
        "clusterId": "in03-***************",
        "collectionName": "my_collection",
        "embedding": "zilliz/vit-base-patch16-224"
      }
  }
}
```

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

</Admonition>

</TabItem>

</Tabs>

#### 画像検索パイプラインの実行{#search-image-by-text}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. 検索パイプラインの横にある「▶︎」ボタンをクリックしてください。または、**プレイグラウンド**タブをクリックすることもできます。

    ![run-pipeline](/img/ja-JP/run-pipeline.png)

1. クエリ画像のURLを入力し、**実行**をクリックします。

1. 結果を確認してください。

1. パイプラインを再実行するための新しいクエリイメージURLを入力してください。

</TabItem>

<TabItem value="Bash">

次の例では、`my_image_search_パイプライン`という名前の検索パイプラインを実行します。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
      "data": {
        "query_image_url": "xxx"
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": ["image_id", "image_title"],
          "filter": "id >= 0"
      }
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `query_image_url`:類似検索を実行するために使用されるクエリ画像のURL。

- `params`:設定する検索パラメータ。

    - `limit`:返すエンティティの最大数。値は**1**から**500**までの整数である必要があります。この値と`offset`の値の合計は**1024**になる必要があります。

    - `オフセット`:検索結果でスキップするエンティティの数。

        この値と`limit`の合計は大なり**1024**ではありません。最大値は**1024**です。

    - `output`Fields:検索結果とともに返されるフィールドの配列です。デフォルトでは、検索結果に`id`（エンティティID）、`distance`が返されます。返される結果に他の出力フィールドが必要な場合は、このパラメータを設定できます。

    - `フィルター`:検索に一致するものを見つけるために使用されるブール式の[フィルター](./filtering)

以下は回答例です。

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": "my-img-123456",
        "distance": 0.40448662638664246,
        "image_id": "my-img-123456",
        "image_title": "A cute yellow cat"
      }
    ],
    "usage": {
      "embedding": 1
    }
  }
}
```

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、使用データが数時間遅れる可能性があります。</p>

</Admonition>

</TabItem>

</Tabs>

### テキストで画像を検索する{#search-image-by-text}

#### 画像検索パイプラインの作成{#create-image-search-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. プロジェクトに移動します。

1. ナビゲーションパネルから**パイプライン**をクリックします。次に、**概要**タブに切り替えて、**パイプライン**をクリックします。パイプラインを作成するには、**+パイプライン**をクリックしてください。

1. 作成するパイプラインの種類を選択してください。「**+パイプライン**」ボタンを**検索パイプライン**欄でクリックしてください。

    ![create-search-pipeline](/img/ja-JP/create-search-pipeline.png)

1. 作成したい検索パイプラインを構成します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p>パイプライン名</p></td>
         <td><p>新しい検索パイプラインの名前です。小文字、数字、アンダースコアのみを含める必要があります。</p></td>
       </tr>
       <tr>
         <td><p>説明（オプション）</p></td>
         <td><p>新しい検索パイプラインの説明。</p></td>
       </tr>
    </table>

    ![configure-search-pipeline](/img/ja-JP/configure-search-pipeline.png)

1. 「**+Function**」をクリックして、検索パイプラインに関数を追加します。正確に1つの関数を追加できます。

    1. 関数名を入力します。

    1. 「**Target Cluster**」と「**Target collection**」を選択します。**Target Cluster**は、**us-west 1 on Google Cloud Platform(GCP)**にデプロイされたクラスタである必要があります。また、**Target Collection**はIngestionパイプラインによって作成されている必要があります。そうでない場合、Searchパイプラインは互換性がありません。

        <Admonition type="info" icon="📘" title="ノート">

        <p>SEARCH<em>IMAGE</em>BY_TEXT関数は、マルチモーダル画像モデルサービス<code>zilliz/clip-vit-base-patch32</code>を使用して互換性のある画像取り込みパイプラインがある場合にのみ使用できます。</p>

        </Admonition>

    1. Function Typeとして**SEARCH_IMAGE_BY_TEXT**を選択してください。**Function Type**として**SEARCH_IMAGE_BY_TEXT関数**を使用すると、クエリテキストをベクトル埋め込みに変換し、最も類似した画像を取得できます。

        関数**SEARCH_IMAGE_BY_TEXT**を選択した場合、マルチモーダルテキスト埋め込みサービス`zilliz/clip-vit-base-patch32-multilingual-v1`がデフォルトで使用され、対応する取り込みパイプラインとターゲットコレクションに一致します。

        ![add-search-image-by-text-function](/img/ja-JP/add-search-image-by-text-function.png)

    1. [**追加**]をクリックして関数を保存します。

1. [**検索パイプラインを作成**]をクリックします。

</TabItem>

<TabItem value="Bash">

次の例では、`my_image_search_Pipeline`という名前の検索パイプラインを作成し、**SEARCH_IMAGE_BY_TEXT**関数を追加します。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",       
        "name": "my_image_search_pipeline",
        "description": "A pipeline that searches image by text.",
        "type": "SEARCH",
        "functions": [
            {
                "name": "search_image_by_text",
                "action": "SEARCH_IMAGE_BY_TEXT",
                "embedding": "zilliz/clip-vit-base-patch32-multilingual-v1",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection"
            }
        ]
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `projectId`:パイプラインを作成するプロジェクトのID。詳しくは[プロジェクトIDの取得方法をご覧ください。](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`:作成するパイプラインの名前。パイプライン名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

- `description`(オプション):作成するパイプラインの説明。

- `type`:作成するパイプラインの種類。現在利用可能なパイプラインの種類には、`INGESTION`、`SEARCH`、`DELETION`があります。

- `functions`:パイプラインに追加する関数。**Searchパイプラインには1つの関数しか持てません。**

    - `name`:関数の名前です。関数名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

    - `action`:追加する関数の種類。現在利用可能なオプションは、`SEARCH_DOC_CHUNK`、`SEARCH_TEXT`、`SEARCH_IMAGE_BY_IMAGE`、`SEARCH_IMAGE_BY_TEXT`です。

    - `lusterId`:パイプラインを作成するクラスタのIDです。現在、GCP上のus-west 1にデプロイされたクラスタのみを選択できます。CLUSTER_IDの確認方法については、[How can I find my CLUSTER_ID?を参照してください。](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

    - `collection`Name:パイプラインを作成するコレクションの名前。

    - `埋め込み`:ベクトル検索中に使用される埋め込みモデルです。ここでは、埋め込みモデル`zilliz/clip-vit-base-patch32-multilingual-v1`を使用する必要があります。このモデルは、Open AIの[CLIP-ViT-B 32](https://huggingface.co/openai/clip-vit-base-patch32)モデルの多言語バリアントです。`zilliz/clip-vit-base-patch32`ビジョンモデルと一緒に動作するように設計されており、50以上の言語でテキストを処理できます。

以下は出力例です。

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_image_search_pipeline",
    "type": "SEARCH",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that searches image by image.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": 
      {
        "action": "SEARCH_IMAGE_BY_TEXT",
        "name": "search_image_by_text",
        "inputFields": ["query_text"],
        "clusterId": "in03-***************",
        "collectionName": "my_collection",
        "embedding": "zilliz/clip-vit-base-patch32-multilingual-v1"
      }
  }
}
```

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

</Admonition>

</TabItem>

</Tabs>

#### 画像検索パイプラインの実行{#run-image-search-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. 検索パイプラインの横にある「▶︎」ボタンをクリックしてください。または、**プレイグラウンド**タブをクリックすることもできます。

    ![run-pipeline](/img/ja-JP/run-pipeline.png)

1. クエリテキストを入力します。[**実行**]をクリックします。

1. 結果を確認してください。

1. パイプラインを再実行する新しいクエリテキストを入力してください。

</TabItem>

<TabItem value="Bash">

次の例では、`my_image_search_パイプライン`という名前の検索パイプラインを実行します。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
      "data": {
        "query_text": "Can you show me the image of a cat?",
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": ["image_id", "image_title"],
          "filter": "id >= 0"
      }
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `query_text`:類似検索を実行するために使用されるクエリテキスト。

- `params`:設定する検索パラメータ。

    - `limit`:返すエンティティの最大数。値は**1**から**100**までの整数である必要があります。この値と`offset`の値の合計は**1024**になる必要があります。

    - `オフセット`:検索結果でスキップするエンティティの数。

        この値と`limit`の合計は大なり**1024**ではありません。最大値は**1024**です。

    - `output`Fields:検索結果とともに返されるフィールドの配列です。デフォルトでは、検索結果に`id`（エンティティID）、`distance`が返されます。返される結果に他の出力フィールドが必要な場合は、このパラメータを設定できます。

    - `フィルター`:検索に一致するものを見つけるために使用されるブール式の[フィルター](./filtering)

以下は回答例です。

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": "my-img-123456",
        "distance": 0.40448662638664246,
        "image_id": "my-img-123456",
        "image_title": "A cute yellow cat"
      }
    ],
    "usage": {
      "embedding": 1
    }
  }
}
```

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、使用データが数時間遅れる可能性があります。</p>

</Admonition>

</TabItem>

</Tabs>

## 画像データの削除{#delete-image-data}

データを削除するには、まず削除パイプラインを作成してから実行する必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>まず<a href="./pipelines-image-data#create-image-ingestion-pipeline">、</a><a href="./pipelines-image-data#create-image-ingestion-pipeline">Ingestionパイプライン</a>を作成する必要があります。Ingestionパイプラインの作成に成功したら、検索パイプラインと削除パイプラインを作成して、新しく作成したIngestionパイプラインを操作できます。</p>

</Admonition>

### イメージ削除パイプラインの作成{#create-image-deletion-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. プロジェクトに移動します。

1. ナビゲーションパネルから**パイプライン**をクリックします。次に、**概要**タブに切り替えて、**パイプライン**をクリックします。パイプラインを作成するには、**+パイプライン**をクリックしてください。

1. 作成するパイプラインの種類を選択してください。「**+パイプライン**」ボタンを**削除パイプライン**欄でクリックしてください。

    ![create-deletion-pipeline](/img/ja-JP/create-deletion-pipeline.png)

1. 作成する削除パイプラインを構成します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>説明する</strong></p></th>
       </tr>
       <tr>
         <td><p>パイプライン名</p></td>
         <td><p>新しい削除パイプラインの名前です。小文字、数字、アンダースコアのみを含める必要があります。</p></td>
       </tr>
       <tr>
         <td><p>説明（オプション）</p></td>
         <td><p>新しいDeletionパイプラインの説明。</p></td>
       </tr>
    </table>

    ![configure-deletion-pipeline](/img/ja-JP/configure-deletion-pipeline.png)

1. 「**+Function**」をクリックして、削除パイプラインに関数を追加します。1つの関数だけを追加できます。

    1. 関数名を入力します。

    1. 「**PURGE_IMAGE_INDEX**」または「**PURGE_BY_EXPRESSION**」を**関数タイプ**として選択します。**PURGE_IMAGE_INDEX**関数は指定されたimage_idを持つすべての画像を削除できますが、**PURGE_BY_EXPRESSION**関数は指定されたフィルタ式に一致するすべてのテキストエンティティを削除できます。

    1. [**追加**]をクリックして関数を保存します。

1. [**削除パイプラインを作成**]をクリックします。

</TabItem>

<TabItem value="Bash">

以下の例では、`my_image_delete_Pipeline`という名前のDeletionパイプラインを作成し、**PURGE_IMAGE_INDEX**関数を追加しています。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zilliz.cloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",
        "name": "my_image_deletion_pipeline",
        "description": "A pipeline that deletes image by id",
        "type": "DELETION",
        "functions": [
            {
                "name": "purge_image_by_id",
                "action": "PURGE_IMAGE_INDEX"
            }
        ], 
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "my_collection"
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `projectId`:パイプラインを作成するプロジェクトのID。詳しくは[プロジェクトIDの取得方法をご覧ください。](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`:作成するパイプラインの名前。パイプライン名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

- `description`(オプション):作成するパイプラインの説明。

- `type`:作成するパイプラインの種類。現在利用可能なパイプラインの種類には、`INGESTION`、`SEARCH`、`DELETION`があります。

- `functions`:パイプラインに追加する関数。**Deletionパイプラインには1つの関数しか持てません。**

    - `name`:関数の名前です。関数名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

    - `アクション`:追加する関数の種類。利用可能なオプションには、`PURGE_DOC_INDEX`、`PURGE_TEXT_INDEX`、`PURGE_BY_EXPRESSION`、`PURGE_IMAGE_INDEX`があります。

- `lusterId`:パイプラインを作成するクラスタのIDです。現在、GCP us-west 1にデプロイされたクラスタのみを選択できます。詳しくは[How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

- `collection`Name:パイプラインを作成するコレクションの名前。

以下は出力例です。

```bash
{
    "code": 200,
    "data": {
        "id": 0,
        "name": "my_image_deletion_pipeline",
        "type": "DELETION",
        "createTimestamp": 1721187655000,
        "description": "A pipeline that deletes image by id",
        "status": "SERVING",
        "functions": [
            {
                "name": "purge_image_by_id",
                "action": "PURGE_IMAGE_INDEX",
                "inputFields": ["image_id"]
            }
        ],
        "clusterId": "in03-xxxx",
        "collectionName":" my_collection"
    }
}
```

</TabItem>

</Tabs>

### イメージ削除パイプラインの実行{#run-image-deletion-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. 削除パイプラインの横にある「▶︎」ボタンをクリックしてください。または、**プレイグラウンド**タブをクリックすることもできます。

    ![run-pipeline](/img/ja-JP/run-pipeline.png)

1. フィルタ式を入力します。[**実行**]をクリックします。

1. 結果を確認してください。

</TabItem>

<TabItem value="Bash">

次の例では、Deletionパイプライン`my_image_deletion_Pipelineを`実行します。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "image_id": "my-img-123456"
        }
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーの表示](./manage-api-keys#view-api-keys)方法については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west 1`のみがサポートされています。

- `image_id`:削除する画像のID。

以下は回答例です。

```bash
{
  "code": 200,
  "data": {
    "num_deleted_entities": 1
  }
}
```

</TabItem>

</Tabs>

## パイプラインの管理{#manage-pipeline}

以下は、前述の手順で作成されたパイプラインを管理する関連する操作です。

### ビューパイプライン{#view-pipeline}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

左ナビゲーションの**パイプライン**をクリックします。**パイプライン**タブを選択します。利用可能なすべてのパイプラインが表示されます。

![view-pipelines-on-web-ui](/img/ja-JP/view-pipelines-on-web-ui.png)

特定のパイプラインをクリックすると、基本情報、合計使用量、機能、関連コネクタなどの詳細情報が表示されます。

![view-pipeline-details](/img/ja-JP/view-pipeline-details.png)

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

</Admonition>

Web UIでパイプラインのアクティビティを確認することもできます。

![view-pipelines-activities-on-web-ui](/img/ja-JP/view-pipelines-activities-on-web-ui.png)

</TabItem>

<TabItem value="Bash">

APIを呼び出して、既存のすべてのパイプラインを一覧表示したり、特定のパイプラインの詳細を表示したりできます。

- **既存のパイプラインをすべて表示する**

    以下の例に従い、projectIdを指定してくださ`い`。[プロジェクトIDの取得方法に](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID-)ついては、こちらをご覧ください。

    ```bash
    curl --request GET \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines?projectId=proj-xxxx"
    ```

    以下は出力例です。

    ```bash
    {
      "code": 200,
      "data": [
        {
          "pipelineId": "pipe-xxxx",
          "name": "my_text_ingestion_pipeline",
          "type": "INGESTION",
          "createTimestamp": 1721187655000,
          "clusterId": "in03-***************",
          "collectionName": "my_collection"
          "description": "A pipeline that generates text embeddings and stores additional fields.",
          "status": "SERVING",
          "totalUsage": {
            "embedding": 0
            },
          "functions": [
            {
              "action": "INDEX_TEXT",
              "name": "index_my_text",
              "inputFields": ["text_list"],
              "language": "ENGLISH",
              "embedding": "zilliz/bge-base-en-v1.5"
            },
            {
              "action": "PRESERVE",
              "name": "keep_text_info",
              "inputField": "source",
              "outputField": "source",
              "fieldType": "VarChar"
            }
          ]
        },
        {
          "pipelineId": "pipe-xxxx",
          "name": "my_text_search_pipeline",
          "type": "SEARCH",
          "createTimestamp": 1721187655000,
          "description": "A pipeline that receives text and search for semantically similar texts",
          "status": "SERVING",
          "totalUsage": {
            "embedding": 0,
            "rerank": 0
            },
          "functions": 
            {
              "action": "SEARCH_TEXT",
              "name": "search_text",
              "inputFields": "query_text",
              "clusterId": "in03-***************",
              "collectionName": "my_collection",
              "embedding": "zilliz/bge-base-en-v1.5",
              "reranker": "zilliz/bge-reranker-base"
            }
        },
        {
          "pipelineId": "pipe-xxxx",
          "name": "my_text_deletion_pipeline",
          "type": "DELETION",
          "createTimestamp": 1721187655000,
          "description": "A pipeline that deletes entities by expression",
          "status": "SERVING",
          "functions": 
            {
            "action": "PURGE_BY_EXPRESSION",
            "name": "purge_data_by_expression",
            "inputFields": ["expression"]
            },
        "clusterId": "in03-***************",
        "collectionName": "my_collection"
        }
      ]
    }
    ```

    <Admonition type="info" icon="📘" title="ノート">

    <p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

    </Admonition>

- **特定のパイプラインの詳細を表示する**

    パイプラインの詳細を表示するには、以下の例に従ってください。

    ```bash
    curl --request GET \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}"
    ```

    以下は出力例です。

    ```bash
    {
      "code": 200,
      "data": {
        "pipelineId": "pipe-xxx",
        "name": "my_text_ingestion_pipeline",
        "type": "INGESTION",
        "createTimestamp": 1721187300000,
        "description": "A pipeline that generates text embeddings and stores additional fields.",
        "status": "SERVING",
        "totalUsage": {
          "embedding": 0
        },
        "functions": [
          {
            "name": "index_my_text",
            "action": "INDEX_TEXT",
            "inputFields": ["text_list"],
            "language": "ENGLISH",
            "embedding": "zilliz/bge-base-en-v1.5"
          },
          {
            "name": "keep_text_info",
            "action": "PRESERVE",
            "inputField": "source",
            "outputField": "source",
            "fieldType": "VarChar"
          }
        ],
        "clusterId": "inxx-xxxx",
        "collectionName": "my_collection"
      }
    }
    ```

    <Admonition type="info" icon="📘" title="ノート">

    <p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

    </Admonition>

</TabItem>

</Tabs>

### パイプラインを削除{#delete-pipeline}

パイプラインが不要になった場合は、削除できます。パイプラインを削除しても、データを取り込んだ自動作成コレクションは削除されません。

<Admonition type="caution" icon="🚧" title="警告">

<ul>
<li><p>ドロップしたパイプラインは回復できません。行動には注意してください。</p></li>
<li><p>データ取り込みパイプラインを削除しても、パイプラインと一緒に作成されたコレクションには影響しません。データは安全です。</p></li>
</ul>

</Admonition>

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

Web UIにパイプラインをドロップするには、をクリックします**。。。**「**アクション**」列の下にあるボタンをクリックします。次に、「**ドロップ**」をクリックします。

![delete-pipeline](/img/ja-JP/delete-pipeline.png)

</TabItem>

<TabItem value="Bash">

以下の例に従って、パイプラインを削除してください。

```bash
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}"
```

以下は出力例です。

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxx",
    "name": "my_text_ingestion_pipeline",
    "type": "INGESTION",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that generates text embeddings and stores additional fields.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": [
      {
        "name": "index_my_text",
        "action": "INDEX_TEXT",
        "inputFields": ["text_list"],
        "language": "ENGLISH",
        "embedding": "zilliz/bge-base-en-v1.5"
      },
      {
        "name": "keep_text_info",
        "action": "PRESERVE",
        "inputField": "source",
        "outputField": "source",
        "fieldType": "VarChar"
      }
    ],
    "clusterId": "inxx-xxxx",
    "collectionName": "my_collection"
  }
}
```

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

</Admonition>

</TabItem>

</Tabs>