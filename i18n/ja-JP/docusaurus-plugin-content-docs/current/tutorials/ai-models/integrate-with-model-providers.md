---
title: "モデルプロバイダーとの統合 | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "モデルプロバイダー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部プロバイダーでホストされるテキスト埋め込みモデルまたは reranking モデルは、プロバイダーがプロジェクトからのリクエストを認証できるようになるまで、Zilliz Cloud から呼び出すことはできません。モデルプロバイダー統合は、プロバイダー発行の認証情報をプロジェクトレベルで保存し、テキスト埋め込み機能や reranking 機能が参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function や Ranker の構成に認証情報を配置する必要がなくなります。 | Cloud"
type: origin
token: B1cSwfWcri4VJLkCR20cHIs6nCf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# モデルプロバイダーとの統合

外部プロバイダーでホストされるテキスト埋め込みモデルまたは reranking モデルは、プロバイダーがプロジェクトからのリクエストを認証できるようになるまで、Zilliz Cloud から呼び出すことはできません。**モデルプロバイダー統合**は、プロバイダー発行の認証情報をプロジェクトレベルで保存し、テキスト埋め込み機能や reranking 機能が参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function や Ranker の構成に認証情報を配置する必要がなくなります。

<Admonition type="info" icon="📘" title="注意">

モデルプロバイダー統合の作成自体に料金は発生しません。外部プロバイダーはモデル推論に対して課金する場合があり、プロバイダーへのデータ送信には[データ転送コスト](./data-transfer-cost)が発生する場合があります。

モデルの可用性、タスクサポート、安定性、レイテンシー、および出力品質は、外部プロバイダーと選択したモデルに依存します。Zilliz Cloud は統合と認証情報処理の経路を提供しますが、これらの特性を制御するものではありません。本番環境で使用する前に、プロバイダーが現在そのモデルを必要なタスク向けに提供していることを確認し、ワークロードに対する信頼性、パフォーマンス、および出力品質を評価してください。

</Admonition>

## サポートされているモデルプロバイダー\{#supported-model-providers}

以下のモデルプロバイダーを Zilliz Cloud と統合できます。

| モデルプロバイダー | Zilliz Cloud でサポートされる機能 | 必要な認証情報 |
| --- | --- | --- |
| **OpenAI** | Text Embedding Function | API key。取得方法については、[OpenAI API quickstart](https://developers.openai.com/api/docs/quickstart#create-and-export-an-api-key)を参照してください。 |
| **Cohere** | Text Embedding Function およびモデルベースの Ranker | API key。取得方法については、[API Keys and Rate Limits](https://docs.cohere.com/docs/rate-limits)を参照してください。 |
| **Voyage AI** | Text Embedding Function およびモデルベースの Ranker | API key。取得方法については、[API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation)を参照してください。 |
| **Hugging Face** | Text Embedding Function および Hugging Face Ranker | **Make calls to Inference Providers** 権限を持つ User Access Token。取得方法については、[User Access Tokens](https://huggingface.co/docs/hub/en/security-tokens)を参照してください。 |

## 始める前に\{#before-you-start}

モデルプロバイダー統合を作成する前に、以下を確認してください。

- 対象の Zilliz Cloud プロジェクトに対する **Organization Owner** または **Project Admin** 権限を持っていること。十分な権限がない場合は、Zilliz Cloud の Organization Owner にお問い合わせください。

- 選択したモデルプロバイダーに必要な認証情報を持っていること。[サポートされているモデルプロバイダー](./integrate-with-model-providers)を参照してください。

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

    - **Integration Description***(任意)*: この統合の説明です（例: `for model provider`）。

    - **Provider** *(Hugging Face のみ)*: デフォルト値 `hf-inference` のままにします。Hugging Face Text Embedding と Hugging Face Ranker は現在、この Inference Provider のみをサポートしています。

1. **Next** をクリックします。**Credential Information** ステップに移動します。

    1. 選択したモデルプロバイダーに必要な認証情報を入力します。Hugging Face の場合は、**Hugging Face Access Token** フィールドに User Access Token を入力します。

    1. **Validate Integration** をクリックして接続を確認します。ステータスが Successful に変わったら、次のステップに進みます。

1. **Add** をクリックします。

</Procedures>

作成後、この統合はモデルベースの function および ranker で使用できるようになります。

Hugging Face の場合、**Validate Integration** は、Zilliz Cloud が提供された User Access Token で認証できることを検証します。機能固有の互換性は、Function または Ranker を設定または実行するときに検証されます。Text Embedding Function には、feature-extraction タスク向けに `hf-inference` により提供されるモデルが必要です。Hugging Face Ranker には、sentence-similarity タスク向けに `hf-inference` により提供されるモデルが必要です。統合の作成後、Zilliz Cloud は User Access Token をマスクします。

## 統合を管理する\{#manage-integrations}

統合を作成した後は、**Integrations** ページから管理できます。

- 統合 ID を取得する

    Text Embedding Function またはモデルベースの Ranker がこの統合を使用する場合、統合 ID が必要です。

- 統合の詳細を表示する

- 統合名または説明を編集する

- 不要になった統合を削除する

<Admonition type="info" icon="📘" title="注意">

統合が削除されたり無効になったりすると、それを参照している collections または rankers は、統合が更新または置き換えられるまで、insert または search 操作中に失敗する可能性があります。

</Admonition>

<Supademo id="cmjcjqyk3017cw10i8dbm2ret" title="" isShowcase />

## 次のステップ\{#next-steps}

モデルプロバイダー統合を作成した後、次のことができます。

- **Text Embedding Function** で使用して、テキストを dense vector に変換する。

- Cohere または Voyage AI の統合をモデルベースの Ranker とともに使用して、検索結果を rerank する。

- Hugging Face の統合を Hugging Face Ranker とともに使用して、sentence-similarity タスクから返されるスコアを使って検索結果を rerank する。

詳細な手順については、以下を参照してください。

- [Function の概要](./function-and-model-inference-overview)

- [OpenAI](./openai)

- [Cohere](./cohere)

- [Voyage AI](./voyage-ai)

- Hugging Face

- Hugging Face Ranker

- [Cohere Ranker](./cohere-model-ranker)

- [Voyage AI Ranker](./voyage-ai-model-ranker)

