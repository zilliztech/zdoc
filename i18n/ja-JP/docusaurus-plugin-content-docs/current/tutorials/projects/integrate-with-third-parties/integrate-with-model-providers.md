---
title: "モデルプロバイダーとの連携 | Cloud"
slug: /integrate-with-model-providers
sidebar_key: integrate-with-model-providers
sidebar_label: "モデルプロバイダー"
beta: FALSE
notebook: FALSE
description: "外部プロバイダーでホストされているテキスト埋め込みモデルやリランキングモデルを Zilliz Cloud から呼び出すには、プロバイダーがプロジェクトからのリクエストを認証できるようにする必要があります。モデルプロバイダー連携は、プロバイダーが発行した認証情報をプロジェクトレベルで保存し、テキスト埋め込み機能やリランキング機能から参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function や Ranker の設定に認証情報を含める必要がなくなります。 | Cloud"
type: origin
token: B1cSwfWcri4VJLkCR20cHIs6nCf
sidebar_position: 0
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - サードパーティー
  - サービス
  - モデル
  - プロバイダー

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# モデルプロバイダーとの連携

外部プロバイダーでホストされているテキスト埋め込みモデルやリランキングモデルを Zilliz Cloud から呼び出すには、プロバイダーがプロジェクトからのリクエストを認証できるようにする必要があります。**モデルプロバイダー連携**は、プロバイダーが発行した認証情報をプロジェクトレベルで保存し、テキスト埋め込み機能やリランキング機能から参照できる統合 ID を Zilliz Cloud に提供します。これにより、個々の Function や Ranker の設定に認証情報を含める必要がなくなります。

<Admonition type="info" icon="📘" title="Notes">

モデルプロバイダー連携の作成自体には料金は発生しません。外部プロバイダーではモデル推論の料金が発生する場合があり、プロバイダーへのデータ送信には[データ転送費用](./data-transfer-cost)が発生する場合があります。

</Admonition>

## サポートされているモデルプロバイダー\{#supported-model-providers}

Zilliz Cloud と連携できるモデルプロバイダーは以下のとおりです。

<table>
   <tr>
     <th><p>モデルプロバイダー</p></th>
     <th><p>サポートされている Zilliz Cloud 機能</p></th>
     <th><p>必要な認証情報</p></th>
   </tr>
   <tr>
     <td><p><strong>OpenAI</strong></p></td>
     <td><p>テキスト埋め込み Function</p></td>
     <td><p>API キー。取得方法については、<a href="https://developers.openai.com/api/docs/quickstart#create-and-export-an-api-key">OpenAI API クイックスタート</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>Cohere</strong></p></td>
     <td><p>テキスト埋め込み Function およびモデルベースの Ranker</p></td>
     <td><p>API キー。取得方法については、<a href="https://docs.cohere.com/docs/rate-limits">API Keys and Rate Limits</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>Voyage AI</strong></p></td>
     <td><p>テキスト埋め込み Function およびモデルベースの Ranker</p></td>
     <td><p>API キー。取得方法については、<a href="https://docs.voyageai.com/docs/api-key-and-installation">API Key and Python Client</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>Hugging Face</strong></p></td>
     <td><p><a href="./hugging-face">テキスト埋め込み Function</a>および<a href="./hugging-face-ranker">Hugging Face Ranker</a></p></td>
     <td><p><strong>Make calls to Inference Providers</strong> 権限を持つ User Access Token。取得方法については、<a href="https://huggingface.co/docs/hub/en/security-tokens">User Access Tokens</a>を参照してください。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

外部プロバイダーからモデルを選択する際は、必要なタスク用にそのモデルが現在提供されていることを確認してください。モデルの可用性、タスクのサポート、安定性、レイテンシー、出力品質は、プロバイダーと選択したモデルによって異なります。本番環境で使用する前に、ワークロードに対してこれらの特性を評価してください。

</Admonition>

## 開始前の準備\{#before-you-start}

モデルプロバイダー連携を作成する前に、以下を確認してください。

- 対象のZilliz Cloudプロジェクトで、**組織オーナー**または**プロジェクト管理者**の権限を持っていること。十分な権限がない場合は、Zilliz Cloudの組織オーナーに問い合わせてください。

- 選択したモデルプロバイダーで必要な認証情報を持っていること。[サポートされているモデルプロバイダー](./integrate-with-model-providers)を参照してください。

## Zilliz Cloud コンソールで連携を作成する\{#create-an-integration-in-the-zilliz-cloud-console}

<Supademo id="cmj9f3j6u0johf6zpk5kdyx3u" title=""  />

モデルプロバイダー連携を作成するには：

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **モデルプロバイダー** セクションで、**+ Integration** をクリックします。

1. 表示されたダイアログボックスで、**基本設定** を構成します。

    - **モデルプロバイダー**: 連携するモデルプロバイダーを選択します。

    - **統合名**: この連携の一意の名前（例：`test`）。

    - **統合の説明** *(オプション)*: この連携の説明（例：`for model provider`）。

    - **Provider** *(Hugging Face のみ)*: デフォルト値の `hf-inference` を使用します。Hugging Face Text Embedding と Hugging Face Ranker は現在、この Inference Provider のみをサポートしています。

1. **Next** をクリックします。**認証情報** ステップにリダイレクトされます。

    1. 選択したモデルプロバイダーで必要な認証情報を入力します。Hugging Face の場合は、**Hugging Face Access Token** フィールドに User Access Token を入力します。

    1. **統合の検証** をクリックして接続を確認します。ステータスが「成功」に変わったら、次のステップに進みます。

1. **Add** をクリックします。

</Procedures>

作成後、連携はモデルベースの関数およびランカーで使用できるようになります。

## 連携の管理\{#manage-integrations}

連携が作成された後、**Integrations** ページから管理できます。

- 統合IDの取得

    テキスト埋め込み Function またはモデルベースの Ranker で連携を使用する際に、統合 ID が必要になります。

- 連携詳細の表示

- 連携名または説明の編集

- 不要になった連携の削除

<Admonition type="info" icon="📘" title="Notes">

連携が削除されたり無効になったりすると、それを参照しているコレクションやランカーは、連携が更新または置き換えられるまで、挿入や検索操作で失敗する可能性があります。

</Admonition>

<Supademo id="cmjcjqyk3017cw10i8dbm2ret" title="" isShowcase />

## 次のステップ\{#next-steps}

モデルプロバイダー連携を作成した後、以下が可能です。

- **テキスト埋め込み Function** とともに使用して、テキストを密ベクトルに変換する。

- モデルベースの Ranker を使用して、検索結果をリランキングする。

詳細な手順については、以下を参照してください。

- [Function の概要](./function-and-model-inference-overview)

- [OpenAI](./openai)

- [Cohere](./cohere)

- [Voyage AI](./voyage-ai)

- [Hugging Face](./hugging-face)

- [Hugging Face Ranker](./hugging-face-ranker)

- [Cohere Ranker](./cohere-model-ranker)

- [Voyage AI Ranker](./voyage-ai-model-ranker)
