---
title: "通知チャネルを管理 | Cloud"
slug: /manage-notification-channels
sidebar_label: "通知チャネルを管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのアラート通知は、クラスター内で発生するイベントについて通知し続けます。デフォルトでは、これらの通知は指定されたユーザーメイルアドレスに送信されます。ただし、ウェブフックを使用してカスタム通知チャネルを設定して、より統合されたイベント駆動型の通知を利用することもできます。このガイドでは、アラート通知チャネルを構成するプロセスを説明します。 | Cloud"
type: origin
token: ARpTwYXlIi7ZLtkEHx5ciUK6nuc
sidebar_position: 5
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - 通知
  - チネル
  - ベクターデータベースはどのように機能するか
  - ベクターデータベース比較
  - openaiベクターデータベース
  - 自然言語処理データベース

---

import Admonition from '@theme/Admonition';


# 通知チャネルを管理

Zilliz Cloudのアラート通知は、クラスター内で発生するイベントについて通知し続けます。デフォルトでは、これらの通知は指定されたユーザーメイルアドレスに送信されます。ただし、ウェブフックを使用してカスタム通知チャネルを設定して、より統合されたイベント駆動型の通知を利用することもできます。このガイドでは、アラート通知チャネルを構成するプロセスを説明します。

## 事前準備\{#before-you-start}

通知チャネルを管理するには、[組織オーナー](./organization-users)または[プロジェクト管理者](./project-users)であることを確認してください。

## 通知チャネルを設定\{#set-up-notification-channels}

Zilliz Cloudコンソールの**アラート編集**または**アラート作成**ダイアログボックスで、通知チャネルの管理ページにアクセスできます。

![manage-alert-channel](/img/manage-alert-channel.png)

### メイル\{#email}

メール通知を設定するには、

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)で、組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

    <Admonition type="info" icon="📘" title="注意">

    <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

    </Admonition>

1. ダアログボックスの**送信先**フィールドで、アラート通知を受け取るユーザーロールまたは個別ユーザーのメールアドレスを選択します。

1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

詳細については、[組織アラートを管理](./manage-organization-alerts)または[プロジェクトアラートを管理](./manage-project-alerts)を参照してください。

### PagerDuty\{#pagerduty}

PagerDutyサービスとの統合を行うには、

1. PagerDuty UIで[サービスを作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-service)します。

1. [Events API v2統合を作成](https://support.pagerduty.com/docs/services-and-integrations#create-a-generic-events-api-integration)して統合キーを取得します。統合キーは以下の形式になります：`c55ec4de243e440bd0e921750bdfxxxx`。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)で、PagerDuty通知チャネルを構成します。

    1. 組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="注意">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先**フィールドの**+ チネル**をクリックし、ドロップダウンリストから**PagerDuty**を選択します。

    1. 取得したPagerDuty統合キーを入力し、PagerDutyアカウントをホストしているサービスリージョンを選択します。PagerDutyサービスリージョンの詳細については、[サービスリージョン](https://support.pagerduty.com/docs/service-regions)を参照してください。

    1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

### Slack\{#slack}

Slack統合を設定するには、

1. Slack UIで[ウェブフックを作成](https://api.slack.com/messaging/webhooks#getting_started)します。

1. **ウェブフックURL**セクションで、ウェブフックURLを取得します。URLは以下の形式になります：`https://hooks.slack.com/services/xxxxxxxxxxxx/xxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx`。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)で、Slack通知チャネルを構成します。

    1. 組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="注意">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先**フィールドの**+ チネル**をクリックし、ドロップダウンリストから**Slack**を選択します。

    1. 取得したウェブフックURLを入力します。

    1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

### Opsgenie\{#opsgenie}

Opsgenie統合を設定するには、

1. OpsgenieでAPIキーを取得します。詳細については、[API統合を作成](https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/)を参照してください。

    1. **設定** > **統合**を選択してOpsgenie統合ページに移動し、**統合を追加**をクリックします。

    1. 検索して**API**を選択します。このAPI統合に名前を付け、**続行**をクリックします。

    1. API設定ページで**編集**をクリックします。デフォルトですべての権限が選択されており、**読取りアクセスを許可**、**作成および更新アクセスを許可**、および**構成アクセスを許可**が選択されていることを確認します。

    1. 生成されたAPIキーをコピーし、**保存**を押します。**着信ルール**を確認し、**統合をオンにする**を押してAPI設定を完了します。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)で、Opsgenie通知チャネルを構成します。

    1. 組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="注意">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先**フィールドの**+ チネル**をクリックし、ドロップダウンリストから**Opsgenie**を選択します。

    1. Opsgenieで取得したAPIキーを入力します。

    1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

### Lark\{#lark}

Lark統合を設定するには、

1. ターゲットLarkグループに入り、カスタムボットをグループに招待し、そのボットに対応するウェブフックURLを取得します。詳細な手順については、[カスタムボット使用ガイド](https://open.larksuite.com/document/client-docs/bot-v3/add-custom-bot)を参照してください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)で、Lark通知チャネルを構成します。

    1. 組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="注意">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先**フィールドの**+ チネル**をクリックし、ドロップダウンリストから**Lark**を選択します。

    1. 取得したウェブフックURLを入力します。

    1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

### ウェブフック\{#webhook}

Zilliz Cloudが提供する**ウェブフック**オプションを使用すると、カスタム通知チャネルを設定できます。

1. サービスのウェブフックURLを取得します。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)で、ウェブフック通知チャネルを構成します。

    1. 組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="注意">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先**フィールドの**+ チネル**をクリックし、ドロップダウンリストから**ウェブフック**を選択します。

    1. サービスのウェブフックURLを入力します。

    1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

ウェブフック通知の例：

```python
{
  "orgId": "org-elqqyqjnsdfvcxmpjugfmj",
  "projectId": "proj-a641f9272ca1c5005760e4",
  "summary": "クラスターCluster-01（in01-ffbab4a57bdd0bb）に関する新しいZilliz Cloudアラート。CU計算が10分間で>= 0％。",
  "level": "WARNING",
  "timestamp": "2024-03-22T07:11:00Z"
}
```

### WeCom\{#wecom}

WeComアラート通知を設定するには、以下の手順に従います：

1. WeComグループでグループボットを作成します。詳細な指示については、[グループボット作成](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%8C%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%B7%BB%E5%8A%A0%E5%85%A5%E5%8F%A3)を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    <p>WeComの設定により、一部のグループではグループボットを追加できない場合があります。</p>

    </Admonition>

1. 作成されたボット情報を表示して、対応するボットのウェブフックURLを取得します。詳細な指示については、[グループボットのウェブフックアドレスを取得](https://open.work.weixin.qq.com/help2/pc/14931?person_id=1&searchData=#%E4%BA%94%E3%80%81%E7%BE%A4%E6%9C%BA%E5%99%A8%E4%BA%BAWebhook%E5%9C%B0%E5%9D%80)を参照してください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)にログインして、WeComアラートチャネルを構成します。

    1. 組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="注意">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先**フィールドの**+ チネル**をクリックし、ドロップダウンリストから**WeCom**を選択します。

    1. 取得したウェブフックURLを入力します。

    1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

### DingTalk\{#dingtalk}

DingTalkアラート通知を設定するには、以下の手順に従います：

1. DingTalkグループでカスタムボットを作成します。詳細な指示については、[カスタムボット統合](https://open.dingtalk.com/document/robots/custom-robot-access)を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    <p>カスタムボットを構成する際、<strong>セキュリティ設定</strong>で<strong>カスタムキーワード</strong>を指定してください：</p>
    <ul>
    <li><p><strong>テスト</strong>：接続性テストのアラート通知を受信します。</p></li>
    <li><p><strong>アラート</strong>：実際のイベントのアラート通知を受信します。</p></li>
    </ul>

    </Admonition>

1. 作成されたボット情報を表示して、対応するボットのウェブフックURLを取得します。詳細な指示については、[カスタムボットのウェブフックアドレスを取得](https://open.dingtalk.com/document/orgapp/obtain-the-webhook-address-of-a-custom-robot)を参照してください。

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)にログインして、DingTalkアラートチャネルを構成します。

    1. 組織またはプロジェクトアラートページの**アラート設定**タブに移動します。

    1. 既存のアラートを変更するには、目的のアラートターゲットの隣にある**操作**列から**編集**を選択します。新しいアラートを作成するには、右上隅の**+ アラート**をクリックします。

        <Admonition type="info" icon="📘" title="注意">

        <p>組織アラートの場合、既存のアラートターゲットのみを編集できます。新規作成はサポートされていません。詳細については、<a href="./manage-organization-alerts">組織アラートを管理</a>を参照してください。</p>

        </Admonition>

    1. 表示されるダイアログボックスで、**送信先**フィールドの**+ チネル**をクリックし、ドロップダウンリストから**DingTalk**を選択します。

    1. 取得したウェブフックURLを入力します。

    1. **アラート解決通知**および**アラート有効化**で、アラートが解決またはトリガーされたときに取るべき適切なアクションを構成します。

## 接続をテスト\{#test-connectivity}

通知チャネルを設定した後、テストメッセージ送信アイコンをクリックして、正しく構成されていることを確認します。

![test-connectivity](/img/test-connectivity.png)
