---
title: "Project Alerts の管理 | Cloud"
slug: /manage-project-alerts
sidebar_label: "Project Alerts の管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Project alerts を使用すると、指定した条件が満たされたときに通知を送信して、Zilliz Cloud cluster をプロアクティブに監視できます。CU capacity や query performance などの cluster metrics を監視するように project alerts を設定できるため、注意が必要な潜在的な問題を即座に把握できます。 | Cloud"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# Project Alerts の管理

Project alerts を使用すると、指定した条件が満たされたときに通知を送信して、Zilliz Cloud clusters をプロアクティブに監視できます。CU capacity や query performance などの cluster metrics を監視するように project alerts を設定できるため、注意が必要な潜在的な問題を即座に把握できます。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** clusters でのみ利用できます。

</Admonition>

## 始める前に\{#before-you-start}

project alerts を作成または管理する前に、以下を確認してください。

- **Organization Owner** または **Project Admin** ロールのアクセス権

## project alerts を表示する\{#view-project-alerts}

左側のサイドバーで **Project Alerts** に移動すると、project alert ダッシュボードにアクセスできます。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View Project Alerts Demo" />

### アラート履歴\{#alert-history}

過去のイベントを調査したい場合、アラートの傾向を把握したい場合、またはシステムの信頼性を示したい場合は、**History** タブを使用します。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**Settings** タブを使用すると、設定済みのすべてのアラートと現在のステータスを確認できます。これにより、監視範囲を一元的に把握できます。

アラートを表示すると、次の設定項目が表示されます。

<table>
   <tr>
     <th><p>項目</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>Name</p></td>
     <td><p>アラートの説明的な識別子（例: "High CU Usage - Dedicated Clusters"、"P99 Query Latency"）</p></td>
   </tr>
   <tr>
     <td><p>Status</p></td>
     <td><p>現在のアラート状態を示すトグルスイッチ: Enabled（監視が有効）または Disabled（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>Target Cluster</p></td>
     <td><p>監視対象の clusters - 特定の clusters（例: "Dedicated-02, Dedicated-01"）またはすべての Dedicated clusters（今後作成されるものを含む）</p></td>
   </tr>
   <tr>
     <td><p>Metric & Condition</p></td>
     <td><p>監視対象パラメータとトリガー設定の組み合わせ表示（例: "CU Capacity &gt; 80%, Duration &gt;= 10 min"、"Query Latency (P99) &gt; 1000 ms, Duration &gt;= 10 min"）</p></td>
   </tr>
   <tr>
     <td><p>Severity Level</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>Warning:</strong> 制限に近づいている状態</p></li><li><p><strong>Critical:</strong> すぐに対応が必要</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Receiver</p></td>
     <td><p>設定済みのメールアドレスおよび通知チャネルを含む通知受信者。</p><p>利用可能な通知チャネルの一覧については、<a href="./manage-notification-channels">通知チャネルの管理</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Alert Interval</p></td>
     <td><p>各アラート送信後、一定時間、繰り返し通知を抑制します。</p><ul><li><p>アラートが継続している場合、その間隔内では通知は再送されません。次の間隔に入る前に通知が再送されます。</p></li><li><p>アラートが解消された場合、alert interval はリセットされ、アラート評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Actions</p></td>
     <td><p>利用可能な管理オプション: Edit、Clone、Delete</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定の project に対して作成されたアラート一覧を表示できます。パラメータの詳細については、[List Alert Rules](/reference/restful/list-alert-rules-v2) を参照してください。

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

## project alert を作成する\{#create-a-project-alert}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

さまざまな観点から cluster のパフォーマンスと健全性を監視するために、新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create Project Alerts Demo" />

</TabItem>
<TabItem value="Bash">

特定の Dedicated clusters またはすべての Dedicated clusters に対してアラートを作成できます。パラメータの詳細については、[Create Alert Rule](/reference/restful/create-alert-rule-v2) を参照してください。

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

## project alerts を管理する\{#manage-project-alerts}

既存のアラートを変更、整理、保守して、監視を適切かつ効果的に保ちます。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage Project Alerts" isShowcase="true" />

<Admonition type="info" icon="📘" title="注意">

RESTful APIs を使用して project alerts を管理することもできます。詳細については、[Update Alert Rule](/reference/restful/update-alert-rule-v2) および [Delete Alert Rule](/reference/restful/delete-alert-rule-v2) を参照してください。

</Admonition>

### アラートを無効化または有効化する\{#disable-or-enable-an-alert}

設定を失うことなく、アクティブな監視を制御します。

- **Disabled alerts:** 通知の送信を停止しますが、すべての設定は保持されます

- **Enabled alerts:** clusters をアクティブに監視し、しきい値を超えた場合に通知を送信します

### アラートを編集する\{#edit-an-alert}

監視要件が変更された場合に、アラート設定を更新します。

次を含む任意のアラートパラメータを変更できます。

- しきい値と比較演算子

- 対象 clusters と metric の種類

- 通知チャネル、受信者、alert interval

- 重要度レベルと期間設定

### アラートを複製する\{#clone-an-alert}

最小限の設定作業で類似したアラートを作成します。複製では既存のすべての設定がコピーされるため、次のことが可能です。

- 異なる cluster 環境向けのバリエーションを作成する

- 他のパラメータを維持したまましきい値を調整する

- 複数の project に監視を拡張する

### アラートを削除する\{#delete-an-alert}

古くなった、または冗長な監視ルールを削除します。

<Admonition type="danger" icon="🚧" title="危険">

アラートの削除は永続的で、元に戻すことはできません。実行前に、そのアラートが本当に不要であることを確認してください。

</Admonition>

## アラート受信者設定を構成する\{#configure-alert-receiver-settings}

project 全体のデフォルト通知設定を行い、チーム全体で一貫した監視運用を実現します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo" />

設定時には、次の概念が表示されます。

- **Send to**: 新しいアラートに対して自動的に選択されるデフォルトの通知チャネル（email、Slack、webhooks）。最もよく使うチャネルを設定して、アラート作成を効率化できます。

- **Alert Resolution Notification**: 有効にすると、アラートが解消されたときに通知を受け取ります。

- **Apply Settings to Existing Alerts**: 新しいデフォルト設定で既存のすべてのアラートを更新するかどうかを選択します。

## FAQ\{#faq}

### アラートがトリガーされたとき、通知はどのくらいの頻度で届きますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的に次の頻度パターンに従います。

- **最初の通知**: アラートのしきい値を超えた時点ですぐに送信されます

- **2回目の通知**: 条件が継続している場合、1時間後に送信されます

- **以降の通知**: アラート条件が有効なままである間、1日1回送信されます

通知頻度が高すぎると感じる場合は、次の対応が可能です。

- [アラートを編集](./manage-project-alerts#edit-an-alert) して、条件のしきい値または継続時間の要件を調整する

- [アラートを無効化](./manage-project-alerts#disable-or-enable-an-alert) して、設定を保持したまま一時的にすべての通知を停止する

