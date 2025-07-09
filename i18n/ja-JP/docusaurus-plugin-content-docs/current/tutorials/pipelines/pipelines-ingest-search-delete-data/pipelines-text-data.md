---
title: "テキストデータ | Cloud"
slug: /pipelines-text-data
sidebar_label: "テキストデータ"
beta: NEAR DEPRECATE
notebook: FALSE
description: "Zilliz CloudのWeb UIは、パイプラインを作成、実行、管理するためのシンプルで直感的な方法を提供し、RESTful APIはWeb UIに比べてより柔軟性とカスタマイズ性を提供します。 | Cloud"
type: origin
token: ISAjwB6VLiAdS5kGoXYcdPBJnbf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - text data
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';


# テキストデータ

Zilliz CloudのWeb UIは、パイプラインを作成、実行、管理するためのシンプルで直感的な方法を提供し、RESTful APIはWeb UIに比べてより柔軟性とカスタマイズ性を提供します。

このガイドでは、テキストパイプラインの作成、埋め込みテキストデータの意味検索の実行、パイプラインが不要になった場合の削除に必要な手順を説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloud Pipelinesは、2025年第2四半期の終わりまでに廃止され、「Data In, Data Out」という新しい機能に置き換えられます。これにより、MilvusとZilliz Cloudの両方で埋め込み生成が効率化されます。2024年12月24日現在、新規ユーザー登録は受け付けられていません。現在のユーザーは、日没日まで月額20ドルの無料手当内でサービスを継続して利用できますが、SLAは提供されていません。モデルプロバイダーまたはオープンソースモデルの埋め込みAPIを使用してベクトル埋め込みを生成することを検討してください。</p>

</Admonition>

## 前提条件と制限{#prerequisites-and-limitations}

- Google Cloud Platform(GCP)上のus-west 1にデプロイされたクラスタを作成していることを確認してください。

- 一つのプロジェクトでは、同じタイプのパイプラインを最大100個まで作成できます。詳細については、[Zillizクラウドの制限](./limits)を参照してください。

## テキストデータを取り込む{#ingest-text-data}

データを取り込むには、まず取り込みパイプラインを作成してから実行する必要があります。

### テキスト取り込みパイプラインの作成{#create-text-ingestion-pipeline}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. プロジェクトに移動します。

1. ナビゲーションパネルから「パイプライン」をクリックしてください。その後、「概要」タブに切り替えて、「パイプライン」をクリックしてください。パイプラインを作成するには、「+パイプライン」をクリックしてください。

    ![create-pipeline](/img/create-pipeline.png)

1. 作成するパイプラインの種類を選択してください。**Ingestion Pipeline**列の**+Pipeline**ボタンをクリックしてください。

    ![choose-pipeline](/img/choose-pipeline.png)

1. 作成するIngestionパイプラインを構成します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>の説明</strong></p></th>
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

    ![configure-ingestion-pipeline](/img/configure-ingestion-pipeline.png)

1. インジェスチョンパイプラインに**INDEX**関数を追加するには、**+Function**をクリックします。各インジェスチョンパイプラインに対して、**INDEX**関数を1つだけ追加できます。

    1. 関数名を入力します。

    1. 関数タイプとして**INDEX_TEXT**を選択してください。**INDEX_TEXT**関数は、提供されたすべてのテキスト入力に対してベクトル埋め込みを生成できます。

    1. ベクトル埋め込みを生成するために使用される埋め込みモデルを選択してください。異なるテキスト言語には異なる埋め込みモデルがあります。現在、英語には5つの利用可能なモデルがあります:**zilliz/bge-base-en-v 1.5**、**voyageai/voyage-2**、**voyageai/voyage-code-2**、**openai/vtext-embedding-3-small**、および**openai/v 1.text-embedding-3-large**。中国語には、**zilliz/bge-base-zh-v 1.5**のみが利用可能です。以下の表は、各埋め込みモデルを簡単に紹介しています。

        <table>
           <tr>
             <th><p><strong>埋め込みモデル</strong></p></th>
             <th><p><strong>の説明</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/bge-based-en-v 1.5-ダウンロード</p></td>
             <td><p>BAAIによってリリースされたこの最先端のオープンソースモデルは、Zilliz Cloudにホストされ、ベクトルデータベースと共有されており、高品質で最高のネットワークレイテンシを提供しています。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">タイトル: voyageai/voyage-2</a></p></td>
             <td><p>Voyage AIによってホストされています。この汎用モデルは、説明テキストとコードを含む技術文書の取得に優れています。その軽量版voyage-lite-02-instructはMTEBリーダーボードでトップにランクされています。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/航海コード-2</a></p></td>
             <td><p>Voyage AIがホストしています。このモデルはソフトウェアコードに最適化されており、ソフトウェアドキュメントやソースコードを取得するための優れた品質を提供します。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/ヴォヤージュラージ2</a></p></td>
             <td><p>Voyage AIによってホストされています。これはVoyage AIからの最も強力な汎用埋め込みモデルです。16 kのコンテキスト長(voyage-2の4倍)をサポートし、技術的および長いコンテキスト文書を含むさまざまなタイプのテキストで優れています。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">OPENAI/text-embedding-3-small </a></p></td>
             <td><p>Open AIによってホストされています。この非常に効率的な埋め込みモデルは、前身のtext-embedding-ada-002よりも強力なパフォーマンスを持ち、推論コストと品質のバランスが取れています。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">OPENAI/text-embedding-3-large</a></p></td>
             <td><p>Open AIによってホストされています。これはOpen AIの最高のパフォーマンスモデルです。text-embedding-ada-002と比較して、MTEBスコアは61.0%から64.6%に増加しました。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p>zilliz/bge-base-zh-v 1.5-ダウンロード</p></td>
             <td><p>BAAIによってリリースされたこの最先端のオープンソースモデルは、Zilliz Cloudでホストされ、ベクトルデータベースと共有されており、高品質で最高のネットワークレイテンシを提供します。これは、<code>language</code>が<code>CHINESE</code>の場合のデフォルトの埋め込みモデルです。</p></td>
           </tr>
        </table>

        ![add-index-text-function](/img/add-index-text-function.png)

    1. 関数を保存するには、**追加**をクリックしてください。

1. (オプション)テキストのメタデータを保存する必要がある場合は、別の**PRESERVE**関数を追加してください。**PRESERVE**関数は、データ取り込みとともにコレクションに追加のスカラーフィールドを追加します。

    <Admonition type="info" icon="📘" title="ノート">

    <p>各Ingestionパイプラインについて、最大50個の<strong>PRESERVE</strong>関数を追加できます。</p>

    </Admonition>

    1. **+Function**をクリックしてください。

    1. 関数名を入力します。

    1. 入力フィールドの名前とタイプを設定します。サポートされている入力フィールドタイプには、Bool、Int 8、Int 16、Int 32、Int 64、Float、Double、VarCharが含まれます。

        <Admonition type="info" icon="📘" title="ノート">

        <ul>
        <li><p>現在、出力フィールド名は入力フィールド名と同じでなければなりません。入力フィールド名は、Ingestionパイプラインを実行する際に使用されるフィールド名を定義します。出力フィールド名は、保存された値が保持されるベクトルコレクションスキーマ内のフィールド名を定義します。</p></li>
        <li><p><strong>VarChar</strong>フィールドの場合、値は最大4,000文字の英数字文字列である必要があります。</p></li>
        <li><p>スカラーフィールドに日付と時刻を格納する場合、年データには<strong>Int 16</strong>データ型を使用し、タイムスタンプには<strong>Int 32</strong>を使用することをお勧めします。</p></li>
        </ul>

        </Admonition>

        ![add-preserve-function](/img/add-preserve-function.png)

    1. 関数を保存するには、**追加**をクリックしてください。

1. 「摂取パイプラインの作成」をクリックしてください。

1. 作成したばかりのIngestionパイプラインと互換性があるように自動構成された検索パイプラインと削除パイプラインを作成し続けます。 

    ![ingestion-pipeline-created-successfully](/img/ingestion-pipeline-created-successfully.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p>デフォルトでは、自動設定された検索パイプラインでは再ランク機能は無効になっています。再ランクを有効にする必要がある場合は、手動で<a href="./pipelines-text-data#search-text-data">新しい検索パイプラインを作成する</a>を設定してください。</p>

    </Admonition>

</TabItem>

<tabitem value="Bash"></tabitem>

次の例では、`my_text_ingestion_pipeline`という名前のIngestionパイプラインを作成し、INDEX_TEXT関数とPRESERVE関数を追加しています。 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "name": "my_text_ingestion_pipeline",
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "projectId": "proj-xxxx"，
        "collectionName": "my_collection",
        "description": "A pipeline that generates text embeddings and stores additional fields.",
        "type": "INGESTION",  
        "functions": [
            { 
                "name": "index_my_text",
                "action": "INDEX_TEXT", 
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
        ]   
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーを表示する](/docs/manage-api-keys#view-api-keys)の詳細については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west1`のみがサポートされています。

- `clusterId`:パイプラインを作成するクラスタのIDです。現在、GCP上のus-west 1にデプロイされたクラスタのみを選択できます。[CLUSTER_IDをどのように見つけることができますか?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)について詳しくはこちらをご覧ください。

- `projectId`:パイプラインを作成するプロジェクトのIDです。[プロジェクトIDはどのように取得できますか?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)について詳しく学びましょう。

- `collectionName`:インジェストパイプラインで自動的に生成されたコレクションの名前です。また、既存のコレクションを指定することもできます。

- `name`:作成するパイプラインの名前です。パイプライン名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

- `description`(オプション):作成するパイプラインの説明。

- `type`:作成するパイプラインの種類。現在利用可能なパイプラインの種類には、`INGESTION`、`SEARCH`、`DELETION`があります。

- `functions`:パイプラインに追加する関数。**Ingestionパイプラインには、1つのINDEX関数と最大50個のPRESERVE関数しか持てません。**

    - `name`:関数の名前。関数名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

    - `action`:追加する関数のタイプです。現在利用可能なオプションには、`INDEX_DOC`、`INDEX_TEXT`、`INDEX_IMAGE`、`PRESERVE`があります。

    - `language`:インジェストするテキストの言語です。`ENGLISH`と`CHINESE`を指定できます。*(このパラメータは`INDEX_TEXT`と`INDEX_DOC_CHUNK`関数でのみ使用されます。)*

    - `embedding`:テキストのベクトル埋め込みを生成するために使用される埋め込みモデルです。利用可能なオプションは以下の通りです。*（このパラメータは`Index`関数でのみ使用されます。）*

        <table>
           <tr>
             <th><p><strong>埋め込みモデル</strong></p></th>
             <th><p><strong>の説明</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/bge-based-en-v 1.5-ダウンロード</p></td>
             <td><p>BAAIによってリリースされたこの最先端のオープンソースモデルは、Zilliz Cloudにホストされ、ベクトルデータベースと共有されており、高品質で最高のネットワークレイテンシを提供しています。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">タイトル: voyageai/voyage-2</a></p></td>
             <td><p>Voyage AIによってホストされています。この汎用モデルは、説明テキストとコードを含む技術文書の取得に優れています。その軽量版voyage-lite-02-instructはMTEBリーダーボードでトップにランクされています。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/航海コード-2</a></p></td>
             <td><p>Voyage AIがホストしています。このモデルはプログラミングコードに最適化されており、検索コードブロックに優れた品質を提供します。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/ヴォヤージュラージ2</a></p></td>
             <td><p>Voyage AIによってホストされています。これはVoyage AIからの最も強力な汎用埋め込みモデルです。16 kのコンテキスト長(voyage-2の4倍)をサポートし、技術的および長いコンテキスト文書を含むさまざまなタイプのテキストで優れています。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">OPENAI/text-embedding-3-small </a></p></td>
             <td><p>Open AIによってホストされています。この非常に効率的な埋め込みモデルは、前身のtext-embedding-ada-002よりも強力なパフォーマンスを持ち、推論コストと品質のバランスが取れています。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">OPENAI/text-embedding-3-large</a></p></td>
             <td><p>Open AIによってホストされています。これはOpen AIの最高のパフォーマンスモデルです。text-embedding-ada-002と比較して、MTEBスコアは61.0%から64.6%に増加しました。このモデルは、<code>language</code>が<code>ENGLISH</code>の場合にのみ利用可能です。</p></td>
           </tr>
           <tr>
             <td><p>zilliz/bge-base-zh-v 1.5-ダウンロード</p></td>
             <td><p>BAAIによってリリースされたこの最先端のオープンソースモデルは、Zilliz Cloudでホストされ、ベクトルデータベースと共有されており、高品質で最高のネットワークレイテンシを提供します。これは、<code>language</code>が<code>CHINESE</code>の場合のデフォルトの埋め込みモデルです。</p></td>
           </tr>
        </table>

- `inputField`: `inputField`の名前です。値はカスタマイズできますが、`outputField`と同じである必要があります。*(このパラメータは`PRESERVE`関数でのみ使用されます。)*

- `outputField`:コレクションスキーマで使用される出力フィールドの名前です。現在、出力フィールド名は入力フィールド名と同じでなければなりません。*(このパラメータは`PRESERVE`関数でのみ使用されます。)*

- `fieldType`:入力フィールドと出力フィールドのデータ型です。使用可能な値には、`Bool`、`Int8`、`Int16`、`Int32`、`Int64`、`Float`、`Double`、`VarChar`があります。*(このパラメータは`PRESERVE`関数でのみ使用されます。)*

    <Admonition type="info" icon="📘" title="ノート">

    <p>スカラーフィールドに日付と時刻を格納する場合、年データには<strong>Int 16</strong>データ型を使用し、タイムスタンプには<strong>Int 32</strong>を使用することをお勧めします。</p>
    <p><code>VarChar</code>フィールドタイプの場合、このフィールドのデータの<code>max_length</code>は4,000を超えることはできません。</p>

    </Admonition>

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

クラスタに`my_collection`という名前のコレクションが存在しない場合、自動的に存在します。しかし、存在する場合、Zililz Cloud Pipelinesはコレクションスキーマがパイプラインで定義されたスキーマと一致しているかどうかをチェックします。 

このコレクションには、**INDEX_TEXT**関数の3つの出力フィールドと、**PRESERVE**関数ごとに1つの出力フィールドが含まれています。コレクションのスキーマは以下の通りです。

<table>
   <tr>
     <th><p>id</p><p>(データ型: Int 64)</p></th>
     <th><p>テキスト</p><p>(データ型: VarChar)</p></th>
     <th><p>埋め込み</p><p>(データ型: FLOAT_VECTOR)</p></th>
     <th><p>ソース</p><p>(データ型: VarChar)</p></th>
   </tr>
</table>

</TabItem>

</Tabs>

### テキスト取り込みパイプラインを実行する{#run-text-ingestion-pipeline}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. Ingestionパイプラインの横にある「▶︎」ボタンをクリックしてください。 

    ![run-pipeline](/img/run-pipeline.png)

1. `text_list`フィールドに取り込む必要があるテキストまたはテキストリストを入力してください。PRESERVE関数を追加した場合は、定義された保存フィールドに値を入力してください。**実行**をクリックしてください。

1. 結果を確認してください。

1. 再度実行する他のテキストを入力します。

</TabItem>

<tabitem value="Bash"></tabitem>

次の例では、Ingestionパイプライン`my_text_ingestion_pipeline`を実行します。`source`は、保持する必要があるメタデータフィールドです。 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
        "text_list": [
          "Zilliz Cloud is a fully managed vector database and data services, empowering you to unlock the full potential of unstructured data for your AI applications.",
          "It can store, index, and manage massive embedding vectors generated by deep neural networks and other machine learning (ML) models."
        ],
        "source": "Zilliz official website"
      }
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーを表示する](/docs/manage-api-keys#view-api-keys)の詳細については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west1`のみがサポートされています。

- `text_list`:取り込むテキストまたはテキストリスト。

- `source`(オプション):保持するメタデータフィールド。入力フィールド名は、Ingestionパイプラインを作成し、**PRESERVE**関数を追加する際に定義したものと一致する必要があります。このフィールドの値は、事前定義されたフィールドタイプに従う必要があります。

以下は回答例です。

```bash
{
  "code": 200,
  "data": {
    "num_entities": 2,
    "usage": {
      "embedding": 63
    },
    "ids": [
      450524927755105948,
      450524927755105949
    ]
  }
}
```

</TabItem>

</Tabs>

## テキストデータを検索する{#search-text-data}

任意のデータを検索するには、まず検索パイプラインを作成してから実行する必要があります。IngestionおよびDeletionパイプラインとは異なり、検索パイプラインを作成する場合、クラスタとコレクションはパイプラインレベルではなく関数レベルで定義されます。これは、Zilliz Cloudが複数のコレクションから同時に検索できるためです。

### テキスト検索パイプラインの作成{#create-text-search-pipeline}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. プロジェクトに移動します。

1. ナビゲーションパネルから「パイプライン」をクリックしてください。その後、「概要」タブに切り替えて、「パイプライン」をクリックしてください。パイプラインを作成するには、「+パイプライン」をクリックしてください。

1. 作成するパイプラインの種類を選択してください。**Search Pipeline**列の**+Pipeline**ボタンをクリックしてください。

    ![create-search-pipeline](/img/create-search-pipeline.png)

1. 作成したい検索パイプラインを構成します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>の説明</strong></p></th>
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

    ![configure-search-pipeline](/img/configure-search-pipeline.png)

1. **+Function**をクリックして、検索パイプラインに関数を追加します。正確に1つの関数を追加できます。

    1. 関数名を入力します。

    1. 「ターゲットクラスター」と「ターゲットコレクション」を選択してください。「ターゲットクラスター」は、Google Cloud Platform(GCP)上の「us-west 1」に展開されたクラスターである必要があります。「ターゲットコレクション」は、Ingestionパイプラインによって作成される必要があります。そうでない場合、Searchパイプラインは互換性がありません。

    1. 「関数タイプ」として「SEARCH_TEXT」を選択してください。「SEARCH_TEXT」関数は、クエリテキストをベクトル埋め込みに変換し、最も関連性の高いテキストエンティティを取得できます。

    1. (オプション)クエリとの関連性に基づいて検索結果をランク付けして検索品質を向上させたい場合は、[reranker](./reranker)を有効にしてください。ただし、rerankerを有効にすると、コストと検索レイテンシが高くなることに注意してください。デフォルトでは、この機能は無効になっています。有効にすると、再ランキングに使用されるモデルサービスを選択できます。現在、**zilliz/bge-reranker-base**のみが利用可能です。

        <table>
           <tr>
             <th><p><strong>リランカーモデルサービス</strong></p></th>
             <th><p><strong>の説明</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/bge-reranker-base-ダウンロード</p></td>
             <td><p>オープンソースのクロスエンコーダアーキテクチャの再ランクモデルはBAAIによって公開されています。このモデルはZilliz Cloudにホストされています。</p></td>
           </tr>
        </table>

        ![add-search-text-function](/img/add-search-text-function.png)

    1. 関数を保存するには、**追加**をクリックしてください。

1. 「検索パイプラインの作成」をクリックしてください。

</TabItem>

<tabitem value="Bash"></tabitem>

次の例では、`my_text_search_pipeline`という名前の検索パイプラインを作成し、**SEARCH_TEXT**関数を追加しています。 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",       
        "name": "my_text_search_pipeline",
        "description": "A pipeline that receives text and search for semantically similar texts",
        "type": "SEARCH",
        "functions": [
            {
                "name": "search_text",
                "action": "SEARCH_TEXT",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection",
                "embedding": "zilliz/bge-base-en-v1.5",
                "reranker": "zilliz/bge-reranker-base"
            }
        ]
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーを表示する](/docs/manage-api-keys#view-api-keys)の詳細については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west1`のみがサポートされています。

- `projectId`:パイプラインを作成するプロジェクトのIDです。[プロジェクトIDはどのように取得できますか?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)について詳しく学びましょう。

- `name`:作成するパイプラインの名前です。パイプライン名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

- `description`(オプション):作成するパイプラインの説明。

- `type`:作成するパイプラインの種類。現在利用可能なパイプラインの種類には、`INGESTION`、`SEARCH`、`DELETION`があります。

- `functions`:パイプラインに追加する関数。**検索パイプラインには1つの関数しか持てません。**

    - `name`:関数の名前。関数名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

    - `action`:追加する関数のタイプです。現在利用可能なオプションには、`SEARCH_DOC_CHUNK`、`SEARCH_TEXT`、`SEARCH_IMAGE_BY_IMAGE`、`SEARCH_IMAGE_BY_TEXT`があります。

    - `clusterId`:パイプラインを作成するクラスタのIDです。現在、GCP上のus-west 1にデプロイされたクラスタのみを選択できます。[CLUSTER_IDをどのように見つけることができますか?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)について詳しくはこちらをご覧ください。

    - `collectionName`:パイプラインを作成するコレクションの名前。

    - `embedding`:ベクトル検索中に使用される埋め込みモデル。モデルは、互換性のあるコレクションで選択されたものと一致する必要があります。

    - `reranker`（オプション）:これは、検索結果の品質を向上させるために一連の候補出力を並べ替えたりランク付けしたりする場合のオプションパラメータです。[reranker](./reranker)が必要ない場合は、このパラメータを省略できます。現在、パラメータ値として使用できるのは`zilliz/bge-reranker-base`のみです。

以下は出力例です。

```bash
{
  "code": 200,
  "data": {
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
    "functions": [
      {
        "name": "search_text",
        "action": "SEARCH_TEXT",
        "inputFields": [
          "query_text"
        ],
        "clusterId": "inxx-xxxx",
        "collectionName": "my_collection",
        "reranker": "zilliz/bge-reranker-base",
        "embedding": "zilliz/bge-base-en-v1.5"
      }
    ]
  }
}
```

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

</Admonition>

</TabItem>

</Tabs>

### テキスト検索パイプラインの実行{#run-text-search-pipeline}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. 検索パイプラインの横にある「▶︎」ボタンをクリックしてください。または、「プレイグラウンド」タブをクリックすることもできます。

    ![run-pipeline](/img/run-pipeline.png)

1. クエリテキストを入力してください。**実行**をクリックしてください。

1. 結果を確認してください。

1. パイプラインを再実行する新しいクエリテキストを入力します。

</TabItem>

<tabitem value="Bash"></tabitem>

次の例では、`my_text_search_pipeline`という名前の検索パイプラインを実行しています。クエリテキストは「Zilliz Cloudとは何ですか?」です。

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
      "data": {
        "query_text": "What is Zilliz Cloud?"
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": [],
          "filter": "id >= 0" 
      }
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーを表示する](/docs/manage-api-keys#view-api-keys)の詳細については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west1`のみがサポートされています。

- `query_text`:セマンティック検索を実行するために使用されるクエリテキスト。

- `params`:設定する検索パラメータ。

    - `limit`:返すエンティティの最大数。値は**1**から**500**までの整数である必要があります。この値と`offset`の値の合計は**1024**小なりになる必要があります。

    - `offset`:検索結果でスキップするエンティティの数。

        この値と`limit`の値の合計は大なり**1024**ではありません。最大値は**1024**です。

    - `outputFields`:検索結果とともに返されるフィールドの配列です。`id`（エンティティID）、`distance`、および`text`は、デフォルトで検索結果に返されます。返された結果に他の出力フィールドが必要な場合は、このパラメータを設定できます。

    - `filter`:検索に一致するものを見つけるために使用されるブール式の[フィルタ](./filtering)

以下は回答例です。

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": 450524927755105948,
        "distance": 0.9997715353965759,
        "text": "Zilliz Cloud is a fully managed vector database and data services, empowering you to unlock the full potential of unstructured data for your AI applications."
      }
    ],
    "usage": {
      "embedding": 17,
      "rerank": 43
    }
  }
}
```

</TabItem>

</Tabs>

## テキストデータを削除{#delete-text-data}

データを削除するには、まず削除パイプラインを作成してから実行する必要があります。

### テキスト削除パイプラインの作成{#create-text-deletion-pipeline}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. プロジェクトに移動します。

1. ナビゲーションパネルから「パイプライン」をクリックしてください。その後、「概要」タブに切り替えて、「パイプライン」をクリックしてください。パイプラインを作成するには、「+パイプライン」をクリックしてください。

1. 作成するパイプラインの種類を選択してください。**Deletion Pipeline**列の**+Pipeline**ボタンをクリックしてください。

    ![create-deletion-pipeline](/img/create-deletion-pipeline.png)

1. 作成する削除パイプラインを構成します。

    <table>
       <tr>
         <th><p><strong>パラメータ</strong></p></th>
         <th><p><strong>の説明</strong></p></th>
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

    ![configure-deletion-pipeline](/img/configure-deletion-pipeline.png)

1. **+Function**をクリックして、削除パイプラインに関数を追加します。正確に1つの関数を追加できます。

    1. 関数名を入力します。

    1. **関数タイプ**として、**PURGE_TEXT_INDEX**または**PURGE_BY_EXPRESSION**のいずれかを選択してください。**PURGE_TEXT_INDEX**関数は指定されたidを持つすべてのテキストエンティティを削除できますが、**PURGE_BY_EXPRESSION**関数は指定されたフィルタ式に一致するすべてのテキストエンティティを削除できます。

    1. 関数を保存するには、**追加**をクリックしてください。

1. 「削除パイプラインの作成」をクリックしてください。

</TabItem>

<tabitem value="Bash"></tabitem>

以下の例では、`my_text_deletion_pipeline`という名前のDeletionパイプラインを作成し、**PURGE_BY_EXPRESSION**関数を追加しています。 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",
        "name": "my_text_deletion_pipeline",
        "description": "A pipeline that deletes entities by expression",
        "type": "DELETION",
        "functions": [
            {
                "name": "purge_data_by_expression",
                "action": "PURGE_BY_EXPRESSION"
            }
        ], 
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "my_collection"
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーを表示する](/docs/manage-api-keys#view-api-keys)の詳細については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west1`のみがサポートされています。

- `projectId`:パイプラインを作成するプロジェクトのIDです。[プロジェクトIDはどのように取得できますか?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)について詳しく学びましょう。

- `name`:作成するパイプラインの名前です。パイプライン名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

- `description`(オプション):作成するパイプラインの説明。

- `type`:作成するパイプラインの種類。現在利用可能なパイプラインの種類には、`INGESTION`、`SEARCH`、`DELETION`があります。

- `functions`:パイプラインに追加する関数。**Deletionパイプラインには1つの関数しか持てません。**

    - `name`:関数の名前。関数名は3～64文字の文字列で、英数字とアンダースコアのみを含めることができます。

    - `action`:追加する関数の種類。利用可能なオプションには、`PURGE_DOC_INDEX`、`PURGE_TEXT_INDEX`、`PURGE_BY_EXPRESSION`、および`PURGE_IMAGE_INDEX`があります。

- `clusterId`:パイプラインを作成するクラスタのIDです。現在、GCP us-west 1にデプロイされたクラスタのみを選択できます。[CLUSTER_IDをどのように見つけることができますか?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)について詳しくはこちらをご覧ください。

- `collectionName`:パイプラインを作成するコレクションの名前。

以下は出力例です。

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_text_deletion_pipeline",
    "type": "DELETION",
    "createTimestamp": 1721187655000,
    "description": "A pipeline that deletes entities by expression",
    "status": "SERVING",
    "functions": [
      {
        "action": "PURGE_BY_EXPRESSION",
        "name": "purge_data_by_expression",
        "inputFields": ["expression"]
      }
    ],
    "clusterId": "in03-***************",
    "collectionName": "my_collection"
  }
}
```

</TabItem>

</Tabs>

### テキスト削除パイプラインを実行{#run-text-deletion-pipeline}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

1. 削除パイプラインの横にある「▶︎」ボタンをクリックしてください。または、「プレイグラウンド」タブをクリックすることもできます。

    ![run-pipeline](/img/run-pipeline.png)

1. フィルタ式を入力します。**実行**をクリックします。

1. 結果を確認してください。

</TabItem>

<tabitem value="Bash"></tabitem>

次の例では、`my_text_deletion_pipeline`という名前のDeletionパイプラインを実行します。 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "expression": "id in [1, 2, 3]"
        }
    }'
```

上記のコードのパラメータは次のように説明されています

- `YOUR_API_KEY`: APIリクエストの認証に使用される資格情報。[APIキーを表示する](/docs/manage-api-keys#view-api-keys)の詳細については、こちらをご覧ください。

- `cloud-region`:クラスターが存在するクラウドリージョンのID。現在、`gcp-us-west1`のみがサポートされています。

- `expression`:削除が必要なエンティティをフィルタリングするために使用されるブール式です。ブール式の書き方の詳細については、[フィルタリング](./filtering)を参照してください。

以下は回答例です。

```bash
{
  "code": 200,
  "data": {
    "num_deleted_entities": 3
  }
}
```

</TabItem>

</Tabs>

## パイプラインの管理{#manage-pipeline}

以下は、前述の手順で作成されたパイプラインを管理する関連する操作です。

### ビューパイプライン{#view-pipeline}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

左ナビゲーションの**パイプライン**をクリックします。**パイプライン**タブを選択します。利用可能なすべてのパイプラインが表示されます。 

![view-pipelines-on-web-ui](/img/view-pipelines-on-web-ui.png)

特定のパイプラインをクリックすると、基本情報、合計使用量、機能、関連コネクタなどの詳細情報が表示されます。

![view-pipeline-details](/img/view-pipeline-details.png)

<Admonition type="info" icon="📘" title="ノート">

<p>技術的な制限により、総使用データが数時間遅れる可能性があります。</p>

</Admonition>

Web UIでパイプラインのアクティビティを確認することもできます。

![view-pipelines-activities-on-web-ui](/img/view-pipelines-activities-on-web-ui.png)

</TabItem>

<tabitem value="Bash"></tabitem>

APIを呼び出して、既存のすべてのパイプラインを一覧表示したり、特定のパイプラインの詳細を表示したりできます。

- **すべての既存のパイプラインを表示**

    以下の例に従って、`projectId`を指定してください。[プロジェクトIDの取得方法](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID-)の詳細については、こちらをご覧ください。

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

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

Web UIにパイプラインをドロップするには、**をクリックします。。。「アクション」列の下にあるボタンをクリックして、「ドロップ」をクリックしてください。

![delete-pipeline](/img/delete-pipeline.png)

</TabItem>

<tabitem value="Bash"></tabitem>

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