---
title: "通知チャネルの管理 | Cloud"
slug: /manage-notification-channels
sidebar_key: manage-notification-channels
sidebar_label: "通知チャネルの管理"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のアラート通知により、クラスター内で発生するイベントについて情報を入手できます。デフォルトでは、これらの通知は指定されたユーザーのメールアドレスに送信されますが、Webhook を使用してカスタム通知チャネルを設定し、より統合されたイベント駆動型の通知を実現することも可能です。本ガイドでは、アラート通知チャネルの設定手順について説明します。 | Cloud"
type: origin
token: ARpTwYXlIi7ZLtkEHx5ciUK6nuc
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 通知
  - チャネル

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 通知チャネルの管理

Zilliz Cloud のアラート通知は、クラスター内で発生するイベントについてユーザーに情報を提供します。デフォルトでは、これらの通知は指定されたユーザーの E メールアドレスに送信されます。ただし、Webhook を使用してカスタム通知チャネルを設定し、より統合されたイベント駆動型の通知を実現することもできます。このガイドでは、アラート通知チャネルを設定する手順について説明します。

## 始める前に\{#before-you-start}

通知チャネルを管理するには、[組織オーナー](./organization-users) または [プロジェクト管理者](./project-users) である必要があります。

## 通知チャネルの設定\{#set-up-notification-channels}

Zilliz Cloud コンソールの **Edit Alert** または **Create Alert** ダイアログボックスから、通知チャネルの管理ページにアクセスできます。

![manage-alert-channel](https://zdoc-images.s3.us-west-2.amazonaws.com/manage-alert-channel.png "manage-alert-channel")

### Eメール\{#email}

E メール通知を設定するには、

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) で、組織またはプロジェクトのアラートページにある **アラート設定** タブに移動します。

1. 既存のアラートを変更するには、目的のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上隅の **+ Alert** をクリックします。

    <Admonition type="info" icon="📘" title="Notes">

    <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新しいターゲットの作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">Manage 組織アラート</a> を参照してください。</p>

    </Admonition>

1. ダイアログボックスの **送信先** フィールドで、アラート通知を受信するユーザーロールまたは個々のユーザーの E メールアドレスを選択します。

1. **アラート解決通知** および **Enable Alert** で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

詳細については、[Manage 組織アラート](./manage-organization-alerts) または [Manage プロジェクトアラート](./manage-project-alerts) を参照してください。

### PagerDuty\{#pagerduty}

PagerDuty サービスと統合するには、

<Procedures>

1. PagerDuty UI で [サービスを作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-service) します。

1. 統合キーを取得するために [Events API v2 統合を作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration) します。統合キーの形式は次のようになります：`c55ec4de243e440bd0e921750bdfxxxx`。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) で、PagerDuty 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上隅の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新しいターゲットの作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">Manage 組織アラート</a> を参照してください。</p>

        </Admonition>

    1. 表示されたダイアログボックスで、**送信先** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **PagerDuty** を選択します。

    1. 取得した PagerDuty 統合キーを入力し、PagerDuty アカウントをホストしているサービスリージョンを選択します。PagerDuty サービスリージョンの詳細については、[Service Regions](https://support.pagerduty.com/docs/service-regions) を参照してください。

    1. **アラート解決通知** および **Enable Alert** で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

### Slack\{#slack}

Slack 統合を設定するには、

<Procedures>

1. Slack UI で [Webhook を作成](https://api.slack.com/messaging/webhooks#getting_started) します。

1. **Webhook URL** セクションで Webhook URL を取得します。URL の形式は次のようになります：`https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx`。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) で、Slack 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上隅の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新しいターゲットの作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">Manage 組織アラート</a> を参照してください。</p>

        </Admonition>

    1. 表示されたダイアログボックスで、**送信先** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Slack** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **アラート解決通知** および **Enable Alert** で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

### Opsgenie\{#opsgenie}

Opsgenie 統合を設定するには、

<Procedures>

1. Opsgenie で API キーを取得します。詳細については、[API 統合の作成](https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/) を参照してください。

    1. **Settings** > **Integrations** を選択して Opsgenie 統合ページに移動し、**Add integration** をクリックします。

    1. **API** を検索して選択します。この API 統合の名前を入力し、**Continue** をクリックします。

    1. API 設定ページで **Edit** をクリックします。デフォルトではすべての権限が選択されていますが、**Allow Read Access**、**Allow Create and Update Access**、および **Allow 設定 Access** が選択されていることを確認してください。

    1. 生成された API キーをコピーし、**Save** を押します。**受信ルール** を確認し、**統合を有効にする** を押して API のセットアップを完了します。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) で、Opsgenie 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上隅の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新しいターゲットの作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">Manage 組織アラート</a> を参照してください。</p>

        </Admonition>

    1. 表示されたダイアログボックスで、**送信先** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Opsgenie** を選択します。

    1. Opsgenie で取得した API キーを入力します。

    1. **アラート解決通知** および **Enable Alert** で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

### Lark\{#lark}

Lark 統合を設定するには、

<Procedures>

1. 対象の Lark グループに入り、カスタムボットをグループに招待してから、そのボットに対応する Webhook URL を取得します。詳細な手順については、[カスタムボットの使用ガイド](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) で、Lark 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上隅の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新しいターゲットの作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">Manage 組織アラート</a> を参照してください。</p>

        </Admonition>

    1. 表示されたダイアログボックスで、**送信先** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Lark** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **アラート解決通知** および **Enable Alert** で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

### Webhook\{#webhook}

Zilliz Cloud が提供する **Webhook** オプションを使用すると、カスタム通知チャネルを設定できます。

<Procedures>

1. サービスの Webhook URL を取得します。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) で、Webhook 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上隅の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新しいターゲットの作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">Manage 組織アラート</a> を参照してください。</p>

        </Admonition>

    1. 表示されたダイアログボックスで、**送信先** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Webhook** を選択します。

    1. サービスの Webhook URL を入力します。

    1. **アラート解決通知** および **Enable Alert** で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

Webhook 通知の例：

```python
{
  "orgId": "org-elqqyqjnsdfvcxmpjugfmj",
  "projectId": "proj-a641f9272ca1c5005760e4",
  "summary": "New Zilliz Cloud Alert for your cluster Cluster-01 (in01-ffbab4a57bdd0bb). CU Computation >= 0 % for 10 minutes.",
  "level": "WARNING",
  "timestamp": "2024-03-22T07:11:00Z"
}
```

### WeCom\{#wecom}

WeCom アラート通知を設定するには、次の手順に従います。

<Procedures>

1. WeCom グループ内にグループボットを作成します。詳細な手順については、[グループボットの作成](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchデータ=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3) を参照してください。

    <Admonition type="info" icon="📘" title="Notes">

    <p>WeCom の設定により、一部のグループではグループボットを追加できない場合があります。</p>

    </Admonition>

1. 作成したボット情報を確認し、対応するボットの Webhook URL を取得します。詳細な手順については、[グループボットの Webhook アドレスの取得](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchデータ=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) にログインして、WeCom アラートチャンネルを設定します。

    1. 組織またはプロジェクトのアラートページで、**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の **+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートの管理</a> を参照してください。</p>

        </Admonition>

    1. 表示されたダイアログボックスで、**送信先**フィールドの **+ チャンネル**をクリックし、ドロップダウンリストから **WeCom** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **アラート解決通知**および**アラートの有効化**で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

### DingTalk\{#dingtalk}

DingTalk アラート通知を設定するには、次の手順に従います。

<Procedures>

1. DingTalk グループ内にカスタムボットを作成します。詳細な手順については、[カスタムボットの統合](https://open.dingtalk.com/document/robots/custom-robot-access) を参照してください。

    <Admonition type="info" icon="📘" title="Notes">

    <p>カスタムボットを設定する際は、<strong>セキュリティ設定</strong> で <strong>カスタムキーワード</strong> を指定してください：</p>
    <ul>
    <li><p><strong>テスト</strong>：接続性テスト用のアラート通知を受信します。</p></li>
    <li><p><strong>アラート</strong>：実際のイベント用のアラート通知を受信します。</p></li>
    </ul>

    </Admonition>

1. 作成したボット情報を確認し、対応するボットの Webhook URL を取得します。詳細な手順については、[カスタムボットの Webhook アドレスの取得](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) にログインして、DingTalk アラートチャンネルを設定します。

    1. 組織またはプロジェクトのアラートページで、**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の **+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集でき、新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートの管理</a> を参照してください。</p>

        </Admonition>

    1. 表示されたダイアログボックスで、**送信先**フィールドの **+ チャンネル**をクリックし、ドロップダウンリストから **DingTalk** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **アラート解決通知**および**アラートの有効化**で、アラートが解決された場合またはトリガーされた場合に実行する適切なアクションを設定します。

</Procedures>

## 接続性のテスト\{#test-connectivity}

通知チャンネルを設定した後、テストメッセージ送信アイコンをクリックして、正しく設定されていることを確認します。

![test-connectivity](https://zdoc-images.s3.us-west-2.amazonaws.com/test-connectivity.png "test-connectivity")

