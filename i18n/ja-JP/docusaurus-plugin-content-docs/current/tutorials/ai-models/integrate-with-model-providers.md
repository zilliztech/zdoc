---
title: "モデルプロバイダーとの統合 | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "モデルプロバイダー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部プロバイダーでホストされている text embedding または reranking モデルは、プロバイダーがプロジェクトからのリクエストを認証できるようになるまで、Zilliz Cloud から呼び出すことはできません。モデルプロバイダー統合は、プロバイダー発行の認証情報をプロジェクトレベルで保存し、text embedding と reranking 機能から参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function または Ranker の設定に認証情報を配置する必要がなくなります。 | Cloud"
type: origin
token: B1cSwfWcri4VJLkCR20cHIs6nCf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# モデルプロバイダーとの統合

外部プロバイダーでホストされている text embedding または reranking モデルは、プロバイダーがプロジェクトからのリクエストを認証できるようになるまで、Zilliz Cloud から呼び出すことはできません。**モデルプロバイダー統合**は、プロバイダー発行の認証情報をプロジェクトレベルで保存し、text embedding と reranking 機能から参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function または Ranker の設定に認証情報を配置する必要がなくなります。

<Admonition type="info" icon="📘" title="注意">

モデルプロバイダー統合の作成自体に料金は発生しません。外部プロバイダーはモデル推論に対して課金する場合があり、プロバイダーへのデータ送信には[データ転送コスト](./data-transfer-cost)が発生する場合があります。

</Admonition>

## サポートされているモデルプロバイダー\{#supported-model-providers}

以下のモデルプロバイダーを Zilliz Cloud と統合できます。

| Model provider | Supported model types | Required credential |
| --- | --- | --- |
| **OpenAI** | Text embedding モデル | API key。取得方法については、[OpenAI API quickstart](https://developers.openai.com/api/docs/quickstart#create-and-export-an-api-key)を参照してください。 |
| **Cohere** | Text embedding および reranking モデル | API key。取得方法については、[API Keys and Rate Limits](https://docs.cohere.com/docs/rate-limits)を参照してください。 |
| **Voyage AI** | Text embedding および reranking モデル | API key。取得方法については、[API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation)を参照してください。 |
| **Hugging Face** | Text embedding および Sentence Similarity モデル | **Make calls to Inference Providers** 権限を持つ User Access Token。取得方法については、[User Access Tokens](https://huggingface.co/docs/hub/en/security-tokens)を参照してください。 |

## 始める前に\{#before-you-start}

モデルプロバイダー統合を作成する前に、以下を確認してください。

- 対象の Zilliz Cloud プロジェクトに対する**Organization Owner**または**Project Admin**権限を持っていること。十分な権限がない場合は、Zilliz Cloud Organization Owner に連絡してください。

- 選択したモデルプロバイダーで必要な認証情報を持っていること。[サポートされているモデルプロバイダー](./integrate-with-model-providers)を参照してください。

- Hugging Face を使用する予定がある場合は、その機能に必要なタスクを特定しておくこと。**Text Embedding Function** は Feature Extraction を使用し、**Hugging Face Ranker** は Sentence Similarity を使用します。現在、どちらの機能でも、対応するタスクに対してモデルが `hf-inference` を通じて提供されている必要があります。モデルおよびプロバイダーの利用可否は Hugging Face によって管理されており、時間の経過とともに変更される場合があります。

## Zilliz Cloud コンソールで統合を作成する\{#create-an-integration-in-the-zilliz-cloud-console}

<Supademo id="cmj9f3j6u0johf6zpk5kdyx3u" title=""  />

モデルプロバイダー統合を作成するには、次の手順に従います。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Model Providers** セクションで、**+ Integration** をクリックします。

1. 表示されるダイアログボックスで、**Basic Settings** を設定します。

    - **Model Provider**: 統合するモデルプロバイダーを選択します。

    - **Integration Name**: この統合の一意の名前です（例: `test`）。

    - **Integration Description***(optional)*: この統合の説明です（例: `for model provider`）。

    - **Provider***(Hugging Face のみ)*: デフォルト値 `hf-inference` のままにします。Hugging Face Text Embedding と Hugging Face Ranker は現在、この Inference Provider のみをサポートしています。

1. **Next** をクリックします。**Credential Information** ステップに移動します。

    1. 選択したモデルプロバイダーで必要な認証情報を入力します。Hugging Face の場合は、**Hugging Face Access Token** フィールドに User Access Token を入力します。

    1. **Validate Integration** をクリックして接続を確認します。ステータスが Successful に変わったら、次のステップに進みます。

1. **Add** をクリックします。

</Procedures>

作成されると、この統合はモデルベースの function と ranker で利用できるようになります。

Hugging Face の場合、**Validate Integration** は、Zilliz Cloud が提供された User Access Token を使って認証できることを確認します。機能固有の互換性は、Function または Ranker を設定または実行するときに検証されます。Text Embedding Function には、Feature Extraction 用に `hf-inference` を通じて提供されるモデルが必要です。Hugging Face Ranker には、Sentence Similarity 用に `hf-inference` を通じて提供されるモデルが必要です。統合の作成後、Zilliz Cloud は User Access Token をマスクします。

## 統合の管理\{#manage-integrations}

統合を作成した後は、**Integrations** ページから管理できます。

- 統合 ID の取得

    Text Embedding Function またはモデルベースの Ranker がこの統合を使用する場合、統合 ID が必要です。

- 統合の詳細の表示

- 統合名または説明の編集

- 不要になった統合の削除

<Admonition type="info" icon="📘" title="注意">

統合が削除されたり無効になったりすると、それを参照している collection や ranker は、統合が更新または置き換えられるまで、insert または search 操作中に失敗する可能性があります。

</Admonition>

<Supademo id="cmjcjqyk3017cw10i8dbm2ret" title="" isShowcase />

## 次のステップ\{#next-steps}

モデルプロバイダー統合を作成した後、次のことができます。

- **Text Embedding Function** とともに使用して、テキストを dense vector に変換する。

- Cohere または Voyage AI の統合をモデルベースの Ranker とともに使用して、検索結果を rerank する。

- Hugging Face の統合を Hugging Face Ranker とともに使用して、Sentence Similarity スコアを用いて検索結果を rerank する。

詳細な手順については、以下を参照してください。

- [Function Overview](./function-and-model-inference-overview)

- [OpenAI](./openai)

- [Cohere](./cohere)

- [Voyage AI](./voyage-ai)

- Hugging Face

- Hugging Face Ranker

- [Cohere Ranker](./cohere-model-ranker)

- [Voyage AI Ranker](./voyage-ai-model-ranker)

