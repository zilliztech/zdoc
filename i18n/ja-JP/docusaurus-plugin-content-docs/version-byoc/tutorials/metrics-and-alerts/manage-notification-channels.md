---
title: "通知チャネルの管理 | BYOC"
slug: /manage-notification-channels
sidebar_label: "通知チャネルの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのアラート通知は、クラスター内で発生するイベントを通知します。デフォルトでは、これらの通知は指定されたユーザーのメールアドレスに送信されます。また、Webhookを使用してカスタム通知チャネルをセットアップすることも可能で、より統合されたイベント駆動型の通知を受けることができます。このガイドでは、アラート通知チャネルの設定方法を説明します。 | BYOC"
type: origin
token: ARpTwYXlIi7ZLtkEHx5ciUK6nuc
sidebar_position: 5
keywords:
  - zilliz
  - vector database
  - cloud
  - notification
  - channels
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW

---

import Admonition from '@theme/Admonition';


# 通知チャネルの管理

Zilliz Cloudのアラート通知は、クラスター内で発生するイベントを通知します。デフォルトでは、これらの通知は指定されたユーザーのメールアドレスに送信されます。また、Webhookを使用してカスタム通知チャネルをセットアップすることも可能で、より統合されたイベント駆動型の通知を受けることができます。このガイドでは、アラート通知チャネルの設定方法を説明します。

## 事前準備\{#before-you-start}

通知チャネルを管理するには、[組織オーナー](./organization-users) または [プロジェクト管理者](./project-users) であることを確認してください。

## 通知チャネルの設定\{#set-up-notification-channels}

通知チャネルの管理ページは、Zilliz Cloudコンソールの **アラート編集** または **アラート作成** ダイアログボックスでアクセスできます。

![manage-alert-channel](/img/manage-alert-channel.png)

### メール\{#email}

メール通知を設定するには、以下の手順に従ってください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup) で、組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

    </Admonition>

1. ダイアログボックスの **送信先** フィールドで、アラート通知を受け取るユーザーのロールまたはメールアドレスを選択します。

1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

詳細は、[組織アラートの管理](./manage-organization-alerts) または [プロジェクトアラートの管理](./manage-project-alerts) を参照してください。

### PagerDuty\{#pagerduty}

PagerDutyサービスと統合するには、以下の手順に従ってください。

1. PagerDuty UIで[サービスを作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-service)します。

1. [Events API v2 統合を作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration)して、統合キーを取得します。統合キーは `c55ec4de243e440bd0e921750bdfxxxx` の形式になります。

1. Zilliz Cloudコンソールで、PagerDuty通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先** フィールドの **+チャネル** をクリックし、ドロップダウンリストから **PagerDuty** を選択します。

    1. 取得したPagerDuty統合キーを入力し、PagerDutyアカウントをホストしているサービスリージョンを選択します。PagerDutyサービスリージョンの詳細については、[サービスリージョン](https://support.pagerduty.com/docs/service-regions)を参照してください。

    1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

### Slack\{#slack}

Slack統合を設定するには、以下の手順に従ってください。

1. Slack UIで[Webhookを作成](https://api.slack.com/messaging/webhooks#getting_started)します。

1. **Webhook URL** セクションで、Webhook URLを取得します。URLは `https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx` の形式になります。

1. Zilliz Cloudコンソールで、Slack通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先** フィールドの **+チャネル** をクリックし、ドロップダウンリストから **Slack** を選択します。

    1. 取得したWebhook URLを入力します。

    1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

### Opsgenie\{#opsgenie}

Opsgenie統合を設定するには、以下の手順に従ってください。

1. OpsgenieでAPIキーを取得します。詳細は、[API統合の作成](https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/)を参照してください。

    1. **設定** > **統合** を選択してOpsgenie統合ページに移動し、**統合の追加** をクリックします。

    1. **API** を検索して選択します。このAPI統合の名前を入力し、**続行** をクリックします。

    1. API設定ページで、**編集** をクリックします。デフォルトではすべての権限が選択されていますが、**読み取りアクセスを許可**、**作成と更新アクセスを許可**、および **構成アクセスを許可** が選択されていることを確認してください。

    1. あなたのために生成されたAPIキーをコピーし、**保存** を押します。**受信ルール** を確認し、**統合を有効化** を押してAPIセットアップを完了します。

1. Zilliz Cloudコンソールで、Opsgenie通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先** フィールドの **+チャネル** をクリックし、ドロップダウンリストから **Opsgenie** を選択します。

    1. Opsgenieで取得したAPIキーを入力します。

    1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

### Lark\{#lark}

Lark統合を設定するには、以下の手順に従ってください。

1. 目的のLarkグループに入力し、カスタムボットをグループに招待し、ボットに対応するWebhook URLを取得します。詳細な手順については、[カスタムボット使用ガイド](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot)を参照してください。

1. Zilliz Cloudコンソールで、Lark通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先** フィールドの **+チャネル** をクリックし、ドロップダウンリストから **Lark** を選択します。

    1. 取得したWebhook URLを入力します。

    1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

### Webhook\{#webhook}

Zilliz Cloudが提供する **Webhook** オプションを使用すると、カスタム通知チャネルを設定できます。

1. サービスのWebhook URLを取得します。

1. Zilliz Cloudコンソールで、Webhook通知チャネルを設定します。

    1. 組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先** フィールドの **+チャネル** をクリックし、ドロップダウンリストから **Webhook** を選択します。

    1. サービスのWebhook URLを入力します。

    1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

Webhook通知の例：

```python
{
  "orgId": "org-elqqyqjnsdfvcxmpjugfmj",
  "projectId": "proj-a641f9272ca1c5005760e4",
  "summary": "クラスターCluster-01 (in01-ffbab4a57bdd0bb)の新しいZilliz Cloudアラートです。CUコンピューテーションが10分間>= 0 %を記録しました。",
  "level": "WARNING",
  "timestamp": "2024-03-22T07:11:00Z"
}
```

### WeCom\{#wecom}

WeComアラート通知を設定するには、以下の手順に従ってください。

1. WeComグループにグループボットを作成します。詳細な手順については、[グループボット作成](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3)を参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>WeComの設定により、一部のグループではグループボットを追加できない場合があります。</p>

    </Admonition>

1. 作成されたボット情報を表示して、対応するボットのWebhook URLを取得します。詳細な手順については、[グループボットのWebhookアドレスの取得](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80)を参照してください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)にログインして、WeComアラートチャネルを設定します。

    1. 組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先** フィールドの **+チャネル** をクリックし、ドロップダウンリストから **WeCom** を選択します。

    1. 取得したWebhook URLを入力します。

    1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

### DingTalk\{#dingtalk}

DingTalkアラート通知を設定するには、以下の手順に従ってください。

1. DingTalkグループにカスタムボットを作成します。詳細な手順については、[カスタムボット統合](https://open.dingtalk.com/document/robots/custom-robot-access)を参照してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>カスタムボットを設定する際は、<strong>セキュリティ設定</strong>で<strong>カスタムキーワード</strong>を指定してください：</p>
    <ul>
    <li><p><strong>Test</strong>：接続テスト用のアラート通知を受け取ります。</p></li>
    <li><p><strong>Alert</strong>：実際のイベント用のアラート通知を受け取ります。</p></li>
    </ul>

    </Admonition>

1. 作成されたボット情報を表示して、対応するボットのWebhook URLを取得します。詳細な手順については、[カスタムボットのWebhookアドレスの取得](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot)を参照してください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)にログインして、DingTalkアラートチャネルを設定します。

    1. 組織またはプロジェクトのアラートページの **アラート設定** タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある **アクション** 列から **編集** を選択します。新しいアラートを作成するには、右上隅の **+アラート** をクリックします。

        <Admonition type="info" icon="📘" title="ノート">

        <p>組織アラートについては、既存のアラートターゲットのみ編集可能で、新しいアラートターゲットの作成はサポートされていません。詳細は、<a href="./manage-organization-alerts">組織アラートの管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先** フィールドの **+チャネル** をクリックし、ドロップダウンリストから **DingTalk** を選択します。

    1. 取得したWebhook URLを入力します。

    1. **アラート解決通知** および **アラート有効** で、アラートが解決またはトリガーされたときに実行する適切なアクションを設定します。

## 接続テスト\{#test-connectivity}

通知チャネルを設定した後、テストメッセージ送信アイコンをクリックして、正しく設定されていることを確認します。

![test-connectivity](/img/test-connectivity.png)