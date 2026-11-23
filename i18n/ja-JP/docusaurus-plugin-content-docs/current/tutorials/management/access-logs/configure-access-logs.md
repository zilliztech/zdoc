---
title: "アクセスログの構成 | Cloud"
slug: /configure-access-logs
sidebar_label: "アクセスログの構成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "アクセスログを使用すると、アプリケーションがデータをどのように検索し、クエリしているかを把握できます。記録する操作とフィールドを選択し、ログをオブジェクトストレージまたは HTTPS サービスに転送して分析できます。 | Cloud"
type: origin
token: E2X9wUPLpi3pQxkJzBpcpZ4snHg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# アクセスログの構成

アクセスログを使用すると、アプリケーションがデータをどのように検索し、クエリしているかを把握できます。記録する操作とフィールドを選択し、ログをオブジェクトストレージまたは HTTPS サービスに転送して分析できます。

## 事前準備\{#before-you-start}

- Enterprise プラン以上の稼働中の Dedicated クラスターを使用していること。

- クラスターへのアクセス権を持つ **Organization Owner**、**Project Admin**、または **クラスター Admin** としてサインインしていること。

- クラスターで監査ログが有効になっていないこと。監査ログとアクセスログは同時に有効にできません。スローログは別途構成します。

- **クラスターと同じプロジェクト**で、転送先の統合を準備すること：

    | 目的 | 準備するもの |
    | --- | --- |
    | バケットまたはコンテナーへのログ保存 | [Amazon S3](./integrate-with-aws-s3)、[Google Cloud Storage](./integrate-with-gcp)、または [Azure Blob Storage](./integrate-with-azure-blob-storage) の統合 |
    | ログ管理システムへのログ送信 | HTTPS 経由でログを受け付けるサービス、および URL と認証設定を備えた [HTTPS Endpoint 統合](./integrate-with-https-endpoint) |

## アクセスログ転送を有効にする\{#enable-access-log-forwarding}

<Supademo id="cmwa4b8mn06pzqmfq90sv710t" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でプロジェクトを開き、対象のクラスターを選択します。

1. **Logs** タブを開き、**Access Logs** カードで **Configure** をクリックします。

1. **Access Logs Settings** でログの送信先を選択します：

    - **Send To:** このプロジェクトで準備した統合を選択します。

    - **Format:** 使用可能なオプションから、受信システムが処理できる形式を選択します：**JSON**、**ECS**、または **OTel**（OpenTelemetry）。

    - **For object storage:** 転送先ディレクトリを構成し、パスのプレビューを確認します。HTTPS 宛先ではディレクトリを使用しません。

1. 記録するリクエストを選択します：

    - **Operations:** 分析するトラフィックに応じて、**Search**、**HybridSearch**、and/or **Query** を選択します。

    - **Sample Rate:** **0 から 1** の値を入力します。値が小さいほどログ量が減り、大きいほど選択した操作をより多く記録できます。

1. **Output Fields** で、分析に必要な情報を選択します。たとえば、リクエストの所要時間を確認するには `execution_time`、頻繁に返されるエンティティを特定するには `result_pks`、検索スコアを分析するには `result_scores` を含めます。`cluster_id`、`log_type`、`user` の各フィールドは常に含まれます。フィールドの定義と操作ごとの可用性については、[Access Log Reference](./access-log-reference) を参照してください。

1. 選択内容を確認し、**Start Forwarding** をクリックします。**Access Logs** カードでステータスを確認し、ログが転送先に到達していることを確認します。

</Procedures>

## ログの到着を確認する\{#verify-that-logs-arrive}

<Procedures>

1. 転送が有効になったら、このクラスター内のコレクションに対して、**Operations** で選択した操作を実行します。操作時刻を控えておいてください。サンプルレートが低い場合、1 回のリクエストがログに表示されないことがあります。

1. 転送先で一致するレコードを探します：

    - **Object storage:** 構成したバケットまたはコンテナーとディレクトリを開き、新しく配信されたログオブジェクトを確認します。

    - **HTTPS endpoint:** 受信サービスの取り込み記録または保存されたログで、対象の操作を確認します。

</Procedures>

統合テストが成功すると、テストイベントが受け付けられたことを確認できます。実際のアクセスログレコードを確認し、クラスターの転送構成を検証してください。

## よくある質問\{#faq}

- **Configure を使用できないのはなぜですか？**

    クラスターが稼働していること、およびロールとプランがアクセスログをサポートしていることを確認してください。監査ログが有効になっているかどうかを確認してください。監査ログとアクセスログは、1 つのクラスターで同時に有効にできません。

- **転送先の統合が見つからないのはなぜですか？**

    統合は、クラスターと同じプロジェクトに属している必要があります。プロジェクトの Integrations ページを確認し、必要に応じてそこで統合を作成してください。

- **アクセスログが到着しないのはなぜですか？**

    コンソールで転送ステータスとエラーを確認したら、次の点を確認してください：

    - リクエストが転送の開始後に発生し、その操作が **Operations** で選択されていることを確認してください。サンプルレートが低い場合、1 件のリクエストが記録されないことがあります。

    - オブジェクトストレージの場合は、書き込み権限を確認し、構成したディレクトリを調べてください。

    - HTTPS の場合は、レシーバーの可用性、認証設定、取り込みエラーを確認してください。

