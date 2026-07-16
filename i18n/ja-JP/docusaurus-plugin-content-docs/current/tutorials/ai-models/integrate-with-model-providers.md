---
title: "Model Provider との統合 | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "Model Provider"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部プロバイダーでホストされるテキスト埋め込みモデルまたは reranking モデルは、プロバイダーがプロジェクトからのリクエストを認証できるようになるまで、Zilliz Cloud から呼び出すことはできません。モデルプロバイダー統合は、プロバイダーが発行した認証情報をプロジェクトレベルで保存し、テキスト埋め込みおよび reranking 機能が参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function や Ranker の設定に認証情報を配置する必要がなくなります。 | Cloud"
type: origin
token: B1cSwfWcri4VJLkCR20cHIs6nCf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Model Provider との統合

外部プロバイダーでホストされるテキスト埋め込みモデルまたは reranking モデルは、プロバイダーがプロジェクトからのリクエストを認証できるようになるまで、Zilliz Cloud から呼び出すことはできません。**モデルプロバイダー統合**は、プロバイダーが発行した認証情報をプロジェクトレベルで保存し、テキスト埋め込みおよび reranking 機能が参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function や Ranker の設定に認証情報を配置する必要がなくなります。

<Admonition type="info" icon="📘" title="注意">

モデルプロバイダー統合の作成自体に料金は発生しません。外部プロバイダーはモデル推論に対して課金する場合があり、プロバイダーへのデータ送信には[データ転送コスト](./data-transfer-cost)が発生することがあります。

</Admonition>

## サポートされている Model Provider\{#supported-model-providers}

以下の Model Provider を Zilliz Cloud と統合できます。

| Model provider | Supported model types | Required credential |
| --- | --- | --- |
| **OpenAI** | テキスト埋め込みモデル | API key。取得方法については、[OpenAI API quickstart](https://developers.openai.com/api/docs/quickstart#create-and-export-an-api-key)を参照してください。 |
| **Cohere** | テキスト埋め込みモデルおよび reranking モデル | API key。取得方法については、[API Keys and Rate Limits](https://docs.cohere.com/docs/rate-limits)を参照してください。 |
| **Voyage AI** | テキスト埋め込みモデルおよび reranking モデル | API key。取得方法については、[API Key and Python Client](https://docs.voyageai.com/docs/api-key-and-installation)を参照してください。 |
| **Hugging Face** | テキスト埋め込みモデル | **Make calls to Inference Providers** 権限を持つ User Access Token。取得方法については、[Inference Providers](https://huggingface.co/docs/inference-providers/en/index#getting-started)を参照してください。 |

## 始める前に\{#before-you-start}

モデルプロバイダー統合を作成する前に、以下を確認してください。

- 対象の Zilliz Cloud プロジェクトに対する **Organization Owner** または **Project Admin** 権限を持っていること。十分な権限がない場合は、Zilliz Cloud の Organization Owner に連絡してください。

- 選択した Model Provider に必要な認証情報を持っていること。詳細は[サポートされている Model Provider](./integrate-with-model-providers)を参照してください。

- Hugging Face の使用を予定している場合は、使用予定の埋め込みモデルでサポートされている Inference Provider を特定しておくこと。Hugging Face Serverless Inference API を使用するには `hf-inference` を選択します。パートナールーティング推論の場合は、選択したモデルでサポートされているプロバイダー名を使用します。モデルおよびプロバイダーの可用性は Hugging Face によって管理されており、時間の経過とともに変わる場合があります。

## Zilliz Cloud コンソールで統合を作成する\{#create-an-integration-in-the-zilliz-cloud-console}

<Supademo id="cmj9f3j6u0johf6zpk5kdyx3u" title=""  />

モデルプロバイダー統合を作成するには、次の手順を実行します。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Model Providers** セクションで、**+ Integration** をクリックします。

1. 表示されるダイアログボックスで、**Basic Settings** を設定します。

    - **Model Provider**: 統合する Model Provider を選択します。

    - **Integration Name**: この統合の一意の名前（例: `test`）。

    - **Integration Description** *(optional)*: この統合の説明（例: `for model provider`）。

    - **Provider** *(Hugging Face only)*: 使用予定の埋め込みモデルを提供する Hugging Face Inference Provider を選択します。Hugging Face Serverless Inference API には `hf-inference` を使用します。パートナールーティング推論の場合は、選択したモデルでサポートされているプロバイダー名を入力します。

1. **Next** をクリックします。**Credential Information** ステップに移動します。

    1. 選択した Model Provider に必要な認証情報を入力します。Hugging Face の場合は、**Hugging Face Access Token** フィールドに User Access Token を入力します。同じ Hugging Face トークンが `hf-inference` とパートナールーティング推論の両方に使用されます。

    1. **Validate Integration** をクリックして接続を確認します。ステータスが Successful に変わったら、次のステップに進みます。

1. **Add** をクリックします。

</Procedures>

作成されると、この統合はモデルベースの function および ranker で使用できるようになります。

Hugging Face の場合、**Validate Integration** は、Zilliz Cloud が指定された User Access Token で認証できることを確認します。モデルの存在、Feature Extraction のサポート、選択したモデルと Inference Provider の互換性、vector 次元は、Text Embedding Function を設定または実行する際に検証されます。統合の作成後、Zilliz Cloud は User Access Token をマスクします。

## 統合の管理\{#manage-integrations}

統合を作成した後は、**Integrations** ページから管理できます。

- 統合 ID を取得する

    Text Embedding Function またはモデルベースの Ranker でこの統合を使用する場合、統合 ID が必要です。

- 統合の詳細を表示する

- 統合名または説明を編集する

- 不要になったら統合を削除する

<Admonition type="info" icon="📘" title="注意">

統合が削除されたり無効になったりすると、それを参照する collection や ranker は、統合が更新または置き換えられるまで、insert または search 操作中に失敗する可能性があります。

</Admonition>

<Supademo id="cmjcjqyk3017cw10i8dbm2ret" title="" isShowcase />

## 次のステップ\{#next-steps}

モデルプロバイダー統合を作成した後は、次のことができます。

- **Text Embedding Function** と組み合わせて使用し、テキストを dense vector に変換する。Hugging Face 統合の使用方法については、Hugging Face を参照してください。

- Cohere または Voyage AI の統合をモデルベースの Ranker と組み合わせて使用し、検索結果を rerank する。

詳細な手順については、以下を参照してください。

- [Function Overview](./function-and-model-inference-overview)

- [OpenAI](./openai)

- [Cohere](./cohere)

- [Voyage AI](./voyage-ai)

- Hugging Face

- [Cohere Ranker](./cohere-model-ranker)

- [Voyage AI Ranker](./voyage-ai-model-ranker)

