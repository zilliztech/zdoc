---
title: "プロジェクトアラートの管理 | BYOC"
slug: /manage-project-alerts
sidebar_label: "プロジェクトアラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プロジェクトアラートを使用すると、指定した条件が満たされた際に通知を送信することで、Zilliz Cloud クラスターをプロアクティブに監視できます。CU 容量やクエリ性能などのクラスターのメトリクスを監視するようにプロジェクトアラートを設定できるため、注意が必要な潜在的な問題を即座に把握できます。 | BYOC"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# プロジェクトアラートの管理

プロジェクトアラートを使用すると、指定した条件が満たされた際に通知を送信することで、Zilliz Cloud クラスターをプロアクティブに監視できます。CU 容量やクエリ性能などのクラスターのメトリクスを監視するようにプロジェクトアラートを設定できるため、注意が必要な潜在的な問題を即座に把握できます。

## 始める前に\{#before-you-start}

プロジェクトアラートを作成または管理する前に、以下を満たしていることを確認してください。

- **Organization Owner** または **Project Admin** ロールのアクセス権

## プロジェクトアラートを表示する\{#view-project-alerts}

左側のサイドバーで **Project Alerts** に移動すると、プロジェクトアラートダッシュボードにアクセスできます。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View Project Alerts Demo" />

### アラート履歴\{#alert-history}

過去のイベントを調査したい場合、アラートのパターンを把握したい場合、またはシステムの信頼性を示したい場合は、**History** タブを使用します。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**Settings** タブを使用して、設定済みのすべてのアラートとその現在のステータスを確認します。これにより、監視範囲を一元的に把握できます。

アラートを表示すると、次の設定項目があります。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>アラートを識別するための説明的な名前（例: "High CU Usage - Dedicated Clusters"、"P99 Query Latency"）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態を示すトグルスイッチ: Enabled（監視が有効）または Disabled（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>対象クラスター</p></td>
     <td><p>監視対象のクラスター - 特定のクラスター（例: "Dedicated-02, Dedicated-01"）またはすべての Dedicated クラスター（後から作成されるものも含む）</p></td>
   </tr>
   <tr>
     <td><p>メトリクスと条件</p></td>
     <td><p>監視対象のパラメータとトリガー設定を組み合わせて表示（例: "CU Capacity &gt; 80%, Duration &gt;= 10 min"、"Query Latency (P99) &gt; 1000 ms, Duration &gt;= 10 min"）</p></td>
   </tr>
   <tr>
     <td><p>重要度レベル</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>Warning:</strong> 制限に近づいている状態</p></li><li><p><strong>Critical:</strong> 即時対応が必要</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>設定済みのメールアドレスや通知チャネルを含む通知の受信者です。</p><p>利用可能な通知チャネルの一覧については、<a href="./manage-notification-channels">通知チャネルの管理</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>アラート間隔</p></td>
     <td><p>各アラート送信後、一定時間は重複通知を抑制します。</p><ul><li><p>アラートが継続している場合、その間隔中は通知は再送されません。次の間隔に入る前に通知が再送されます。</p></li><li><p>アラートが解消された場合、アラート間隔はリセットされ、アラート評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>利用可能な管理オプション: Edit、Clone、Delete</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定のプロジェクトに対して作成されたアラート一覧を表示できます。パラメータの詳細については、[List Alert Rules](/reference/restful/list-alert-rules-v2) を参照してください。

```bash
export BASE_URL=https://api.cloud.zilliz.com
export PROJECT_ID=proj-bf71ce2fd4f3785d*****
export API_KEY=c84c9a9515**********81319c2f147ffdd47ad6c36b31c126d1b790f457619c23237eba9287de73575943d2bfebcecd728bd07e

curl --request GET \
     --url "${BASE_URL}/v2/alertRules?projectId=${PROJECT_ID}" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

</TabItem>
</Tabs>

## プロジェクトアラートを作成する\{#create-a-project-alert}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

クラスターのパフォーマンスと健全性をさまざまな観点から監視するための新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create Project Alerts Demo" />

</TabItem>
<TabItem value="Bash">

特定またはすべての Dedicated クラスターに対してアラートを作成できます。パラメータの詳細については、[Create Alert Rule](/reference/restful/create-alert-rule-v2) を参照してください。

```bash
export BASE_URL=https://api.cloud.zilliz.com
export PROJECT_ID=proj-bf71ce2fd4f3785d*****
export API_KEY=c84c9a9515**********81319c2f147ffdd47ad6c36b31c126d1b790f457619c23237eba9287de73575943d2bfebcecd728bd07e

curl --request POST \
     --url "${BASE_URL}/v2/alertRules" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
       "projectId": "'"${PROJECT_ID}"'",
       "ruleName": "High CU Computation",
       "level": "CRITICAL",
       "metricName": "CU_COMPUTATION",
       "metricUnit": "percent",
       "threshold": 80,
       "windowSize": 10,
       "comparisonMethod": "GREATER_THAN",
       "targetClusterIds": ["inxx-xxxxxxxxxxxxxxx"],
       "enabled": true,
       "sendResolved": true,
       "actions": [
         {
           "type": "EMAIL",
           "config": {
             "recipients": {
               "members": ["leryn.li@zilliz.com"],
               "orgRoles": ["OWNER"],
               "projectRoles": ["OWNER"]
             }
           }
         }
       ]
     }'
```

</TabItem>
</Tabs>

## プロジェクトアラートを管理する\{#manage-project-alerts}

既存のアラートを変更、整理、保守して、監視を適切かつ効果的に保ちます。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage Project Alerts" isShowcase="true" />

<Admonition type="info" icon="📘" title="注意">

RESTful APIs を使用してプロジェクトアラートを管理することもできます。詳細については、[Update Alert Rule](/reference/restful/update-alert-rule-v2) および [Delete Alert Rule](/reference/restful/delete-alert-rule-v2) を参照してください。

</Admonition>

### アラートを無効化または有効化する\{#disable-or-enable-an-alert}

設定を失うことなく、アクティブな監視を制御できます。

- **Disabled alerts:** 通知の送信は停止しますが、すべての設定は保持されます

- **Enabled alerts:** クラスターをアクティブに監視し、しきい値を超えた場合に通知を送信します

### アラートを編集する\{#edit-an-alert}

監視要件が変更された場合に、アラート設定を更新します。

以下を含む任意のアラートパラメータを変更できます。

- しきい値と比較演算子

- 対象クラスターとメトリクスの種類

- 通知チャネル、受信者、アラート間隔

- 重要度レベルと継続時間の設定

### アラートを複製する\{#clone-an-alert}

最小限の設定作業で類似のアラートを作成できます。複製では既存のすべての設定がコピーされるため、次のことが可能です。

- 異なるクラスター環境向けのバリエーションを作成する

- 他のパラメータを維持したまましきい値を調整する

- 複数のプロジェクトにわたって監視を拡張する

### アラートを削除する\{#delete-an-alert}

不要または重複した監視ルールを削除します。

<Admonition type="danger" icon="🚧" title="危険">

アラートの削除は永続的で、元に戻すことはできません。実行する前に、そのアラートが本当に不要であることを確認してください。

</Admonition>

## アラート受信者設定を構成する\{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を行い、チーム全体で一貫した監視運用を実現します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo" />

設定時には、次の概念が登場します。

- **Send to**: 新しいアラートに対して自動的に選択されるデフォルトの通知チャネル（email、Slack、webhooks）です。最もよく使用するチャネルを設定することで、アラート作成を効率化できます。

- **Alert Resolution Notification**: 有効にすると、アラートが解消されたときに通知を受け取ります。

- **Apply Settings to Existing Alerts**: すべての既存アラートを新しいデフォルト設定で更新するかどうかを選択します。

## FAQ\{#faq}

### アラートがトリガーされたとき、アラート通知はどのくらいの頻度で届きますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的に次の頻度パターンに従います。

- **最初の通知**: アラートのしきい値を超えた時点で即座に送信されます

- **2回目の通知**: 条件が継続している場合、1時間後に送信されます

- **以降の通知**: アラート条件が有効な間、1日1回送信されます

通知頻度が高すぎると感じる場合は、次の方法があります。

- [アラートを編集](./manage-project-alerts#edit-an-alert) して、条件のしきい値または継続時間の要件を調整する

- [アラートを無効化](./manage-project-alerts#disable-or-enable-an-alert) して、一時的にすべての通知を停止しつつ設定は保持する

