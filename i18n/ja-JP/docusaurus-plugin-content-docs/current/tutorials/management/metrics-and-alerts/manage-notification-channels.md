---
title: "通知チャネルの管理 | Cloud"
slug: /manage-notification-channels
sidebar_label: "通知チャネルの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のアラート通知により、クラスター内で発生するイベントを把握できます。デフォルトでは、これらの通知は指定したユーザーのメールアドレスに送信されます。ただし、より統合されたイベント駆動型の通知のために、Webhook を使用してカスタム通知チャネルを設定することもできます。このガイドでは、アラート通知チャネルを設定する手順を説明します。 | Cloud"
type: origin
token: ARpTwYXlIi7ZLtkEHx5ciUK6nuc
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 通知チャネルの管理

Zilliz Cloud のアラート通知により、クラスター内で発生するイベントを把握できます。デフォルトでは、これらの通知は指定したユーザーのメールアドレスに送信されます。ただし、より統合されたイベント駆動型の通知のために、Webhook を使用してカスタム通知チャネルを設定することもできます。このガイドでは、アラート通知チャネルを設定する手順を説明します。

## 始める前に\{#before-you-start}

通知チャネルを管理するには、[組織所有者](./organization-users)または[プロジェクト管理者](./project-users)であることを確認してください。

## 通知チャネルを設定する\{#set-up-notification-channels}

Zilliz Cloud コンソールの **Edit Alert** または **Create Alert** ダイアログボックスで、通知チャネルの管理ページにアクセスできます。

![manage-alert-channel](https://zdoc-images.s3.us-west-2.amazonaws.com/manage-alert-channel.png "manage-alert-channel")

### メール\{#email}

メール通知を設定するには、

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)で、組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

    <Admonition type="info" icon="📘" title="📘 Notes">

    組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

    </Admonition>

1. ダイアログボックスの **Send to** フィールドで、アラート通知の送信先となるユーザーロール、または個々のユーザーのメールアドレスを選択します。

1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

</Procedures>

詳細については、[Manage Organization Alerts](./manage-organization-alerts) または [Manage Project Alerts](./manage-project-alerts) を参照してください。

### PagerDuty\{#pagerduty}

PagerDuty サービスと統合するには、

<Procedures>

1. PagerDuty UI で[サービスを作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-service)します。

1. [Events API v2 インテグレーションを作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration)してインテグレーションキーを取得します。インテグレーションキーは次の形式になります: `c55ec4de243e440bd0e921750bdfxxxx`。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)で、PagerDuty 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスで、**Send to** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **PagerDuty** を選択します。

    1. 取得した PagerDuty インテグレーションキーを入力し、PagerDuty アカウントがホストされているサービスリージョンを選択します。PagerDuty のサービスリージョンの詳細については、[Service Regions](https://support.pagerduty.com/docs/service-regions) を参照してください。

    1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

</Procedures>

### Slack\{#slack}

Slack 統合を設定するには、

<Procedures>

1. Slack UI で [Webhook を作成](https://api.slack.com/messaging/webhooks#getting_started)します。

1. **Webhook URL** セクションで、Webhook URL を取得します。URL は次の形式になります: `https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx`。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)で、Slack 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスで、**Send to** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Slack** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

</Procedures>

### Opsgenie\{#opsgenie}

Opsgenie 統合を設定するには、

<Procedures>

1. Opsgenie で API キーを取得します。詳細は、[Create an API integration](https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/) を参照してください。

    1. **Settings** > **Integrations** を選択して Opsgenie Integrations ページに移動し、**Add integration** をクリックします。

    1. **API** を検索して選択します。この API インテグレーションの名前を指定し、**Continue** をクリックします。

    1. API settings ページで **Edit** をクリックします。デフォルトではすべての権限が選択されているため、**Allow Read Access**、**Allow Create and Update Access**、**Allow Configuration Access** が選択されていることを確認してください。

    1. 生成された API キーをコピーして **Save** を押します。**Incoming Rules** を確認し、**Turn on integration** を押して API セットアップを完了します。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)で、Opsgenie 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスで、**Send to** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Opsgenie** を選択します。

    1. Opsgenie で取得した API キーを入力します。

    1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

</Procedures>

### Lark\{#lark}

Lark 統合を設定するには、

<Procedures>

1. 対象の Lark グループに入り、カスタムボットをグループに招待してから、そのボットに対応する Webhook URL を取得します。詳細な手順については、[Custom bot usage guide](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)で、Lark 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスで、**Send to** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Lark** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

</Procedures>

### Webhook\{#webhook}

Zilliz Cloud が提供する **Webhook** オプションを使用すると、カスタム通知チャネルを設定できます。

<Procedures>

1. ご利用のサービスの Webhook URL を取得します。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)で、Webhook 通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスで、**Send to** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **Webhook** を選択します。

    1. ご利用のサービスの Webhook URL を入力します。

    1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

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

WeCom アラート通知を設定するには、次の手順に従います。

<Procedures>

1. WeCom グループでグループボットを作成します。詳細な手順については、[Group bot creation](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3) を参照してください。 

    <Admonition type="info" icon="📘" title="📘 Notes">

    WeCom の設定により、一部のグループではグループボットを追加できない場合があります。

    </Admonition>

1. 作成したボットの情報を表示して、対応するボットの Webhook URL を取得します。詳細な手順については、[Obtain the group bot's webhook address](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)にログインして、WeCom アラートチャネルを設定します。 

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスで、**Send to** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **WeCom** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

</Procedures>

### DingTalk\{#dingtalk}

DingTalk アラート通知を設定するには、次の手順に従います。

<Procedures>

1. DingTalk グループでカスタムボットを作成します。詳細な手順については、[Custom bot integration](https://open.dingtalk.com/document/robots/custom-robot-access) を参照してください。

    <Admonition type="info" icon="📘" title="Notes">

    カスタムボットを設定するときは、**Security Setting** で **Custom Keywords** を指定してください:
    
    - **Test**: 接続テスト用のアラート通知を受信します。
    
    - **Alert**: 実際のイベント用のアラート通知を受信します。

    </Admonition>

1. 作成したボットの情報を表示して、対応するボットの Webhook URL を取得します。詳細な手順については、[Obtain custom bot's webhook address](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot) を参照してください。

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)にログインして、DingTalk アラートチャネルを設定します。 

    1. 組織またはプロジェクトのアラートページにある **Alert Settings** タブに移動します。

    1. 既存のアラートを変更するには、対象のアラートターゲットの横にある **Actions** 列から **Edit** を選択します。新しいアラートを作成するには、右上の **+ Alert** をクリックします。

        <Admonition type="info" icon="📘" title="📘 Notes">

        組織アラートでは、既存のアラートターゲットの編集のみ可能で、新規作成はサポートされていません。詳細については、[Manage Organization Alerts](./manage-organization-alerts) を参照してください。

        </Admonition>

    1. 表示されるダイアログボックスで、**Send to** フィールドの **+ Channel** をクリックし、ドロップダウンリストから **DingTalk** を選択します。

    1. 取得した Webhook URL を入力します。

    1. **Alert Resolution Notification** と **Enable Alert** で、アラートが解決されたとき、またはトリガーされたときに実行する適切なアクションを設定します。

</Procedures>

## 接続をテストする\{#test-connectivity}

通知チャネルを設定した後、Send Test Message アイコンをクリックして、正しく設定されていることを確認します。

![test-connectivity](https://zdoc-images.s3.us-west-2.amazonaws.com/test-connectivity.png "test-connectivity")

