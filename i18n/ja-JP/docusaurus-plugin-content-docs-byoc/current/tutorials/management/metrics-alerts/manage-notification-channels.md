---
title: "通知チャネルの管理 | BYOC"
slug: /manage-notification-channels
sidebar_label: "通知チャネルの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のアラート通知により、クラスター内で発生するイベントを把握できます。デフォルトでは、通知は指定されたユーザーのメールアドレスに送信されますが、Webhook を使用してカスタム通知チャネルを設定し、より連携されたイベント駆動型の通知を行うことも可能です。このガイドでは、アラート通知チャネルの設定手順について説明します。 | BYOC"
type: origin
token: ARpTwYXlIi7ZLtkEHx5ciUK6nuc
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 通知チャネルの管理

Zilliz Cloud のアラート通知により、クラスター内で発生するイベントを把握できます。デフォルトでは、通知は指定されたユーザーのメールアドレスに送信されますが、Webhook を使用してカスタム通知チャネルを設定し、より連携されたイベント駆動型の通知を行うことも可能です。このガイドでは、アラート通知チャネルの設定手順について説明します。

## 事前準備\{#before-you-start}

通知チャネルを管理するには、[organization owner](./manage-platform-roles#predefined-organization-roles) または [project admin](./manage-platform-roles#predefined-project-roles) の権限が必要です。

## 通知チャネルの設定\{#set-up-notification-channels}

通知チャネルの管理ページには、Zilliz Cloud コンソールの **Edit Alert** または **Create Alert** ダイアログからアクセスできます。

![manage-alert-channel](https://zdoc-images.s3.us-west-2.amazonaws.com/manage-alert-channel.png "manage-alert-channel")

### Email\{#email}

メール通知を設定するには、以下の手順を実行します。

<Procedures>

1. [Zilliz Cloud console](https://cloud.zilliz.com/signup) で、組織またはプロジェクトのアラートページにある **Alert Settings** タブを開きます。

1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新規にアラートを作成するには、右上の **+ Alert** をクリックします。

    <Admonition type="info" icon="📘" title="📘 Notes">

    組織アラートの場合、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

    </Admonition>

1. ダイアログの **Send to** フィールドで、アラート通知の受信者としてユーザーロールまたは個別のユーザーのメールアドレスを選択します。

1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時またはトリガー時の動作を設定します。

</Procedures>

詳細については、[Manage Organization Alerts](./manage-organization-alerts) または [Manage Project Alerts](./manage-project-alerts) を参照してください。

### PagerDuty\{#pagerduty}

PagerDuty サービスと連携するには、以下の手順を実行します。

<Procedures>

1. PagerDuty UI で [Create a service](https://support.pagerduty.com/docs/services-and-integrations#create-a-service) を実行します。

1. [Create an Events API v2 integration](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration) を実行してインテグレーションキーを取得します。インテグレーションキーの形式は `c55ec4de243e440bd0e921750bdfxxxx` です。

1. [Zilliz Cloud console](https://cloud.zilliz.com/signup) で PagerDuty 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブを開きます。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新規にアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートの場合、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログの **Send to** フィールドで **+ Channel** をクリックし、ドロップダウンリストから **PagerDuty** を選択します。

    1. 取得した PagerDuty インテグレーションキーを入力し、PagerDuty アカウントがホストされているサービスリージョンを選択します。PagerDuty のサービスリージョンの詳細については、[Service Regions](https://support.pagerduty.com/docs/service-regions) を参照してください。

    1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時またはトリガー時の動作を設定します。

</Procedures>

### Slack\{#slack}

Slack 連携を設定するには、以下の手順を実行します。

<Procedures>

1. Slack UI で [Create a webhook](https://api.slack.com/messaging/webhooks#getting_started) を実行します。

1. **Webhook URL** セクションで Webhook URL を取得します。URL の形式は `https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx` です。

1. [Zilliz Cloud console](https://cloud.zilliz.com/signup) で Slack 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブを開きます。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新規にアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートの場合、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログの **Send to** フィールドで **+ Channel** をクリックし、ドロップダウンリストから **Slack** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時またはトリガー時の動作を設定します。

</Procedures>

### Opsgenie\{#opsgenie}

Opsgenie 連携を設定するには、以下の手順を実行します。

<Procedures>

1. Opsgenie で API キーを取得します。詳細については、[Create an API integration](https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/) を参照してください。

    1. **Settings** > **Integrations** の順に選択して Opsgenie の Integrations ページに移動し、**Add integration** をクリックします。

    1. **API** を検索して選択し、この API インテグレーションの名前を入力して **Continue** をクリックします。

    1. API 設定ページで **Edit** をクリックします。デフォルトですべての権限が選択されていますが、**Allow Read Access**、**Allow Create and Update Access**、**Allow Configuration Access** が確実に選択されていることを確認してください。

    1. 生成された API キーをコピーして **Save** をクリックします。**Incoming Rules** を確認し、**Turn on integration** をクリックして API のセットアップを完了します。

1. [Zilliz Cloud console](https://cloud.zilliz.com/signup) で Opsgenie 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブを開きます。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新規にアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートの場合、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログの **Send to** フィールドで **+ Channel** をクリックし、ドロップダウンリストから **Opsgenie** を選択します。

    1. Opsgenie で取得した API キーを入力します。

    1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時またはトリガー時の動作を設定します。

</Procedures>

### Lark\{#lark}

Lark 連携を設定するには、以下の手順を実行します。

<Procedures>

1. 対象の Lark グループにカスタムボットを招待し、そのボットに対応する Webhook URL を取得します。詳細な手順については、[Custom bot usage guide](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot) を参照してください。

1. [Zilliz Cloud console](https://cloud.zilliz.com/signup) で Lark 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブを開きます。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新規にアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートの場合、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログの **Send to** フィールドで **+ Channel** をクリックし、ドロップダウンリストから **Lark** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時またはトリガー時の動作を設定します。

</Procedures>

### Webhook\{#webhook}

Zilliz Cloud が提供する **Webhook** オプションを使用すると、カスタム通知チャネルを設定できます。

<Procedures>

1. ご利用のサービスの Webhook URL を取得します。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) で、Webhook 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートの **Actions** 列から **Edit** を選択します。新規にアラートを作成する場合は、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートの編集のみ可能で、新規作成はサポートされていません。詳細については、[組織アラートの管理](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスの **Send to** フィールドで **+ Channel** をクリックし、ドロップダウンリストから **Webhook** を選択します。

    1. サービスの Webhook URL を入力します。

    1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時または発生時に実行するアクションをそれぞれ設定します。

</Procedures>

Webhook 通知の例:

```python
{
  "orgId": "org-elqqyqjnsdfvcxmpjugfmj",
  "projectId": "proj-a641f9272ca1c5005760e4",
  "summary": "New Zilliz Cloud Alert for your cluster Cluster-01 (inxx-xxxxxxxxxxxxxxx). CU Computation >= 0 % for 10 minutes.",
  "level": "WARNING",
  "timestamp": "2024-03-22T07:11:00Z"
}
```

### WeCom\{#wecom}

WeCom のアラート通知を設定するには、以下の手順に従います。

<Procedures>

1. WeCom グループでグループボットを作成します。詳しい手順については、[グループボットの作成](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3) を参照してください。

    <Admonition type="info" icon="📘" title="📘 Notes">

    WeCom の設定によっては、グループボットを追加できない場合があります。

    </Admonition>

1. 作成したボットの情報から、該当するボットの Webhook URL を取得します。詳しい手順については、[グループボットの Webhook アドレスの取得](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) にログインし、WeCom アラートチャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートの **Actions** 列から **Edit** を選択します。新規にアラートを作成する場合は、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートの編集のみ可能で、新規作成はサポートされていません。詳細については、[組織アラートの管理](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスの **Send to** フィールドで **+ Channel** をクリックし、ドロップダウンリストから **WeCom** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時または発生時に実行するアクションをそれぞれ設定します。

</Procedures>

### DingTalk\{#dingtalk}

DingTalk のアラート通知を設定するには、以下の手順に従います。

<Procedures>

1. DingTalk グループでカスタムボットを作成します。詳しい手順については、[カスタムボットの統合](https://open.dingtalk.com/document/robots/custom-robot-access) を参照してください。

    <Admonition type="info" icon="📘" title="Notes">

    カスタムボットの設定時に、**Security Setting** で **Custom Keywords** を指定します。
    
    - **Test**: 接続テスト用のアラート通知を受信します。
    
    - **Alert**: 実際のイベントに関するアラート通知を受信します。

    </Admonition>

1. 作成したボットの情報から、該当するボットの Webhook URL を取得します。詳しい手順については、[カスタムボットの Webhook アドレスの取得](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) にログインし、DingTalk アラートチャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートの **Actions** 列から **Edit** を選択します。新規にアラートを作成する場合は、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートの編集のみ可能で、新規作成はサポートされていません。詳細については、[組織アラートの管理](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスの **Send to** フィールドで **+ Channel** をクリックし、ドロップダウンリストから **DingTalk** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** および **Enable Alert** で、アラートの解決時または発生時に実行するアクションをそれぞれ設定します。

</Procedures>

## 接続テスト\{#test-connectivity}

通知チャネルの設定後、Send Test Message アイコンをクリックして、正しく設定されているかを確認します。

![test-connectivity](https://zdoc-images.s3.us-west-2.amazonaws.com/test-connectivity.png "test-connectivity")

