---
title: "Model Providers と統合する | Cloud"
slug: /integrate-with-model-providers
sidebar_label: "Model Providers"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "モデルプロバイダー統合は、Zilliz Cloud をサードパーティのモデルサービスに接続し、プロバイダーの機能をプロジェクトで利用できるようにします。 | Cloud"
type: origin
token: B1cSwfWcri4VJLkCR20cHIs6nCf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Model Providers と統合する

**モデルプロバイダー統合**は、Zilliz Cloud をサードパーティのモデルサービスに接続し、プロバイダーの機能をプロジェクトで利用できるようにします。

統合では、次のことを行います。

- モデルプロバイダーにアクセスするために必要な認証情報を保存する

- モデルプロバイダーがサポートする機能（たとえば、テキスト埋め込みや再ランキング）を調べる

## モデルプロバイダー統合が必要な場合\{#when-you-need-a-model-provider-integration}

Zilliz Cloud で**モデルベースの機能**を使用する場合にのみ、モデルプロバイダー統合を作成する必要があります。

- **Text Embedding Functions**: 外部モデルを使用して生テキストを密ベクトルに変換します。詳細については、[Function の概要](./function-and-model-inference-overview)を参照してください。

- **Model-based Rankers**: 外部の再ランキングモデルを使用して検索結果を再ランキングします。詳細については、[Cohere Ranker](./cohere-model-ranker) と関連ページを参照してください。

BM25、ハイブリッドランカー、ルールベースのランカーなどのローカル機能では、モデルプロバイダー統合は**不要**です。

## 課金に関する考慮事項\{#billing-considerations}

モデルプロバイダー統合の作成自体には料金は発生しません。ただし、外部モデルプロバイダーを使用すると、次のような追加コストが発生する場合があります。

- モデルプロバイダーからの料金。

- 埋め込みまたは再ランキングのためにデータが送信される際のデータ転送コスト。詳細については、[データ転送コスト](./data-transfer-cost)を参照してください。

課金は、モデルベースの関数またはランカーが実行された場合にのみ適用されます。

## 始める前に\{#before-you-start}

モデルプロバイダー統合を作成する前に、次を確認してください。

- 対象の Zilliz Cloud プロジェクトに対する **Organization Owner** または **Project Admin** 権限を持っていること。十分な権限がない場合は、Zilliz Cloud Organization Owner に連絡してください。

- 統合したいモデルプロバイダーの有効な **API キー** を持っていること。

## モデルプロバイダー統合を作成する\{#create-a-model-provider-integration}

<Supademo id="cmj9f3j6u0johf6zpk5kdyx3u" title=""  />

モデルプロバイダー統合を作成するには、次の手順を実行します。

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Model Providers** セクションで、**+ Integration** をクリックします。

1. 表示されるダイアログボックスで、**Basic Settings** を構成します。

    - **Model Provider**: 統合するモデルプロバイダーを選択します。

    - **Integration Name**: この統合の一意の名前（例: `test`）。

    - **Integration Description** *(任意)*: この統合の説明（例: `for model provider`）。

1. **Next** をクリックします。**Credential Information** ステップにリダイレクトされます。

    1. **API Key** フィールドに、モデルプロバイダーアクセス用の API キーを入力します。

    1. **Validate Integration** をクリックして接続を確認します。ステータスが Successful に変わったら、次のステップに進みます。

1. **Add** をクリックします。

</Procedures>

作成後、この統合はモデルベースの関数およびランカーで使用できるようになります。

## 統合を管理する\{#manage-integrations}

統合を作成した後は、**Integrations** ページから管理できます。

- 統合 ID を取得する

    統合 ID は、テキスト埋め込み関数または再ランキング関数を使用するときに必要になります。

- 統合の詳細を表示する

- 統合名または説明を編集する

- 不要になった統合を削除する

<Admonition type="info" icon="📘" title="注記">

統合が削除されたり無効になったりした場合、それを参照しているコレクションまたはランカーは、統合が更新または置換されるまで、挿入または検索操作中に失敗する可能性があります。

</Admonition>

<Supademo id="cmjcjqyk3017cw10i8dbm2ret" title="" isShowcase />

## 次のステップ\{#next-steps}

モデルプロバイダー統合を作成した後、次のことができます。

- **Text Embedding Function** とともに使用して、テキストを密ベクトルに変換する

- **Model-based Rankers** とともに使用して、検索結果を再ランキングする

詳細な手順については、次を参照してください。

- [Function の概要](./function-and-model-inference-overview)

- [Weighted Ranker](./reranking-weighted-reranker)

- [RRF Ranker](./reranking-rrf)

- [Boost Ranker](./boost-ranker)

- [Decay Ranker の概要](./decay-ranker-oveview)

- [Cohere Ranker](./cohere-model-ranker)

- [Voyage AI Ranker](./voyage-ai-model-ranker)
