---
title: "通知チャンネルの管理 | BYOC"
slug: /manage-notification-channels
sidebar_label: "通知チャンネルの管理"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのアラート通知は、クラスター内で発生したイベントに関する情報を提供します。デフォルトでは、これらの通知は指定されたユーザーのメールアドレスに送信されます。ただし、Webhookを使用してカスタム通知チャンネルを設定し、より統合されたイベント駆動型の通知を行うこともできます。このガイドでは、アラート通知チャンネルの設定過程を説明します。 | BYOC"
type: origin
token: QRiFwsGhJiRHBAkTY2TcnfJbnze
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - notification
  - channels
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db

---

import Admonition from '@theme/Admonition';


# 通知チャンネルの管理

Zilliz Cloudのアラート通知は、クラスター内で発生したイベントに関する情報を提供します。デフォルトでは、これらの通知は指定されたユーザーのメールアドレスに送信されます。ただし、Webhookを使用してカスタム通知チャンネルを設定し、より統合されたイベント駆動型の通知を行うこともできます。このガイドでは、アラート通知チャンネルの設定過程を説明します。

## 始める前に{#before-you-start}

通知チャンネルを管理するには、[Organizationオーナー](./organization-users)または[プロジェクト管理者](./project-users)であることを確認してください。

## 通知チャンネルを設定する{#set-up-notification-channels}

Zilliz Cloudコンソールの**アラート編集**または**アラート作成**ダイアログボックスで、通知チャンネルの管理ページにアクセスできます。

![manage-alert-channel](/byoc/ja-JP/manage-alert-channel.png)

### メール{#email}

メール通知を設定するには、

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/signup)で、組織またはプロジェクトのアラートページの**アラート設定**タブに移動します。

1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

    </Admonition>

1. ダイアログボックスの[**送信先**]フィールドで、アラート通知を受け取るユーザロールまたは個々のユーザのメールアドレスを選択します。

1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

詳細については、「[組織のアラートを管理する](./manage-organization-alerts)」または「[プロジェクトのアラートを管理する](./manage-project-alerts)」を参照してください。

### PagerDutyの設定{#pagerduty}

PagerDutyサービスと統合するには、

1. [PagerDuty UIでサービスを作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-service)します。

1. [Events API v 2インテグレーションを作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration)し、インテグレーションキーを取得します。インテグレーションキーの形式は`c55ec4de243e440bd0e921750bdfxxxx`です。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/signup)で、PagerDuty通知チャンネルを設定します。

    1. 組織またはプロジェクトのアラートページの[**アラート設定**]タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、「**+チャンネル**」をクリックし、「**送信先**」フィールドでドロップダウンリストから「**PagerDuty**」を選択します。

    1. 取得したPagerDuty連携キーを入力し、PagerDutyアカウントをホストするサービスリージョンを選択します。PagerDutyサービスリージョンの詳細については、[サービスリージョン](https://support.pagerduty.com/docs/service-regions)を参照してください。

    1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

### スラック{#slack}

Slackとの連携を設定するには、

1. [Slack UIでWebhookを作成](https://api.slack.com/messaging/webhooks#getting_started)します。

1. [**Webhook URL**]セクションで、Webhook URLを取得します。URLの形式は`https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx`です。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/signup)で、Slackの通知チャンネルを設定します。

    1. 組織またはプロジェクトのアラートページの[**アラート設定**]タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログ・ボックスで、「**+チャンネル**」をクリックし、「**送信先**」フィールドからドロップダウン・リストから「**Slack**」を選択します。

    1. 取得したWebhook URLを入力します。

    1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

### オプスゲニー{#opsgenie}

Opsgenieの統合を設定するには、

1. OpsgenieでAPIキーを取得してください。詳細については、「[APIインテグレーションを作成する](https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/)」を参照してください。

    1. Opsgenieの統合ページに移動し、**設定**>**統合**を選択して、**統合を追加**をクリックしてください。

    1. APIを検索して選択します。この**API**統合の名前を入力し、**続行**をクリックしてください。

    1. API設定ページで、[**編集**]をクリックします。デフォルトでは、すべてのアクセス許可が選択されています。**読み取りアクセス許可**、**作成および更新アクセス許可**、および**構成アクセス許可**が選択されていることを確認してください。

    1. 生成されたAPIキーをコピーし、**保存**を押します。**受信ルール**を確認し、**統合をオン**にしてAPI設定を完了します。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/signup)で、Opsgenie通知チャンネルを設定します。

    1. 組織またはプロジェクトのアラートページの[**アラート設定**]タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログ・ボックスで、[**+チャンネル**]をクリックし、[**送信先**]フィールドでドロップダウン・リストから[**Opsgenie**]を選択します。

    1. Opsgenieで取得したAPIキーを入力してください。

    1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

### ラーク{#lark}

ラークの統合を設定するには、

1. 対象のラークグループを入力し、カスタムボットをグループに招待し、ロボットに対応するWebhook URLを取得します。詳細な手順については、「[カスタムボット使用ガイド](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot)」を参照してください。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/signup)で、ラーク通知チャンネルを設定します。

    1. 組織またはプロジェクトのアラートページの[**アラート設定**]タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、[**+チャンネル**]をクリックします。**送信先**フィールドで、ドロップダウンリストから[**ラーク**]を選択します。

    1. 取得したWebhook URLを入力します。

    1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

### Webhook{#webhook}

Zilliz Cloudが提供する**Webhook**オプションを使用すると、カスタム通知チャンネルを設定できます。

1. サービスのWebhook URLを取得します。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/signup)で、Webhook通知チャンネルを設定します。

    1. 組織またはプロジェクトのアラートページの[**アラート設定**]タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログ・ボックスで、[**+チャンネル**]をクリックし、[**送信先**]フィールドでドロップダウン・リストから[**Webhook**]を選択します。

    1. サービスのWebhook URLを入力します。

    1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

Webhookの通知の例:

```python
{
  "orgId": "org-elqqyqjnsdfvcxmpjugfmj",
  "projectId": "proj-a641f9272ca1c5005760e4",
  "summary": "New Zilliz Cloud Alert for your cluster Cluster-01 (in01-ffbab4a57bdd0bb). CU Computation >= 0 % for 10 minutes.",
  "level": "WARNING",
  "timestamp": "2024-03-22T07:11:00Z"
}
```

### WeCom{#wecom}

WeComのアラート通知を設定するには、次の手順に従ってください:

1. We Comグループにグループボットを作成してください。詳しい手順については、[グループボット作成](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3)を参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>WeComの設定により、一部のグループはグループボットを追加できない場合があります。</p>

    </Admonition>

1. 作成したボット情報を見て、対応するボットのWebhook URLを取得します。詳しい手順については、「[グループボットのWebhookアドレスの取得](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80)」を参照してください。

1. WeComアラートチャンネルを設定するには、[Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)にログインしてください。

    1. 組織またはプロジェクトのアラートページの[**アラート設定**]タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、[**+Channel**]をクリックし、[**送信先**]フィールドでドロップダウンリストから[**We Com**]を選択します。

    1. 取得したWebhook URLを入力します。

    1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

### DingTalk{#dingtalk}

DingTalkのアラート通知を設定するには、次の手順に従ってください:

1. DingTalkグループにカスタムボットを作成してください。詳しい手順については、「[カスタムボット統合](https://open.dingtalk.com/document/robots/custom-robot-access)」を参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>カスタムボットを構成するときは、<strong>カスタムキーワード</strong>を<strong>セキュリティ設定</strong>で指定します。</p>
    <ul>
    <li><p><strong>テスト</strong>:接続テストのアラート通知を受信します。</p></li>
    <li><p><strong>アラート</strong>:実際のイベントのアラート通知を受信します。</p></li>
    </ul>

    </Admonition>

1. 作成したボットの情報を表示して、対応するボットのWebhook URLを取得します。詳細な手順については、「[カスタムボットのWebhookアドレスを取得](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot)する」を参照してください。

1. DingTalkアラートチャンネルを設定するには、[Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)にログインしてください。

    1. 組織またはプロジェクトのアラートページの[**アラート設定**]タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの横にある[**編集**]を[**アクション**]列から選択します。新しいアラートを作成するには、右上隅の[**+アラート**]をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織のアラートについては、既存のアラートターゲットのみを編集できます。新しいアラートの作成はサポートされていません。詳細については、「<a href="./manage-organization-alerts">組織のアラートを管理する</a>」を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、[**+チャンネル**]をクリックし、[**送信先**]フィールドでドロップダウンリストから[**DingTalk**]を選択します。

    1. 取得したWebhook URLを入力します。

    1. [**Alert Resolution Notification**]および[**Enable Alert**]で、アラートが解決またはトリガーされたときに実行する適切なアクションを構成します。

## テスト接続{#test-connectivity}

通知チャンネルを設定した後、テストメッセージの送信アイコンをクリックして、正しく設定されていることを確認してください。

![test-connectivity](/byoc/ja-JP/test-connectivity.png)

