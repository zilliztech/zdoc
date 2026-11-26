---
title: "アクセスログを設定する | BYOC"
slug: /configure-access-logs
sidebar_label: "アクセスログを設定する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アクセスログを使用すると、アプリケーションによるデータの検索およびクエリの実行方法を把握できます。記録する操作とフィールドを選択し、ログをオブジェクトストレージまたは HTTPS サービスに転送して分析します。 | BYOC"
type: origin
token: E2X9wUPLpi3pQxkJzBpcpZ4snHg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# アクセスログを設定する

アクセスログを使用すると、アプリケーションによるデータの検索およびクエリの実行方法を把握できます。記録する操作とフィールドを選択し、ログをオブジェクトストレージまたは HTTPS サービスに転送して分析します。

## 事前準備\{#before-you-start}

- Enterprise プラン以上で、稼働中の Dedicated クラスターを使用していること。

- クラスターへのアクセス権を持つ **Organization Owner**、**Project Admin**、または **クラスター Admin** としてサインインしていること。

- クラスターで監査ログが有効になっていないこと。監査ログとアクセスログは同時に有効にできません。スローログは別途設定します。

- **クラスターと同じプロジェクト内**で、転送先の統合を準備していること：

    | 実現したいこと | 準備するもの |
    | --- | --- |
    | ログをバケットまたはコンテナに保存する | [Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) との統合。 |
    | ログをログ管理システムに送信する | HTTPS 経由でログを受け付けるサービス、および URL と認証設定を構成した [HTTPS エンドポイント統合](./integrate-with-https-endpoint)。 |

## アクセスログ転送を有効にする\{#enable-access-log-forwarding}

<Supademo id="cmwa4b8mn06pzqmfq90sv710t" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でプロジェクトを開き、対象のクラスターを選択します。

1. **Logs** タブを開きます。**Access Logs** カードで **Configure** をクリックします。

1. **Access Logs Settings** でログの送信先を選択します：

    - **Send To:** このプロジェクトで準備した統合を選択します。

    - **Format:** 使用可能なオプションの中から、受信側システムで処理できる形式（**JSON**、**ECS**、**OTel**（OpenTelemetry））を選択します。

    - **オブジェクトストレージの場合:** 転送先ディレクトリを設定し、パスのプレビューを確認します。HTTPS の転送先ではディレクトリを使用しません。

1. 記録するリクエストを選択します：

    - **Operations:** 分析するトラフィックに応じて、**Search**、**HybridSearch**、**Query** のいずれかまたは複数（and/or）を選択します。

    - **Sample Rate:** **0 から 1** の値を入力します。値を小さくするとログ量が減り、値を大きくすると、選択した操作をより多く記録できます。

1. **Output Fields** で、分析に必要な情報を選択します。たとえば、リクエストの実行時間を確認するには `execution_time` を、頻繁に返されるエンティティを特定するには `result_pks` を、検索スコアを分析するには `result_scores` を含めます。フィールド `cluster_id`、`log_type`、`user` は常に含まれます。フィールドの定義と操作ごとの可用性については、[Access Log Reference](./access-log-reference) を参照してください。

1. 選択内容を確認し、**Start Forwarding** をクリックします。Access Logs カードでステータスを確認し、ログが転送先に届くことを確認します。

</Procedures>

## ログが届くことを確認する\{#verify-that-logs-arrive}

<Procedures>

1. 転送を有効にした後、このクラスター内のコレクションに対して、**Operations** で選択した操作を実行します。操作時刻を記録します。サンプルレートが低い場合、1 回のリクエストがログに記録されないことがあります。

1. 転送先で一致するレコードを検索します：

    - **オブジェクトストレージ:** 設定したバケットまたはコンテナとディレクトリを開き、新しく配信されたログオブジェクトを検査します。

    - **HTTPS エンドポイント:** 受信サービスの取り込み記録または保存済みログで、該当する操作を確認します。

</Procedures>

統合テストが成功すると、テストイベントが受け入れられたことを確認できます。クラスターの転送設定を検証するには、実際のアクセスログレコードを確認してください。

## よくある質問\{#faq}

- **Configure が使用できないのはなぜですか？**

    クラスターが稼働中で、使用しているロールとプランがアクセスログをサポートしていることを確認してください。監査ログが有効かどうかを確認してください。監査ログとアクセスログは、クラスターで同時に有効にできません。

- **転送先の統合が見つからないのはなぜですか？**

    統合は、クラスターと同じプロジェクトに属している必要があります。プロジェクトの Integrations ページを確認し、必要に応じてそこから統合を作成してください。

- **アクセスログが届かないのはなぜですか？**

    コンソールで転送ステータスとエラーの有無を確認し、以下を確認してください：

    - リクエストが転送開始後に発生し、その操作が **Operations** で選択されていることを確認してください。サンプルレートが低い場合、1 回のリクエストが記録されないことがあります。

    - オブジェクトストレージの場合は、書き込み権限を確認し、設定したディレクトリを確認してください。

    - HTTPS の場合は、受信側の可用性、認証設定、取り込みエラーを確認してください。

