---
title: "プロジェクトアラートの管理 | Cloud"
slug: /manage-project-alerts
sidebar_label: "プロジェクトアラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プロジェクトアラートを使用すると、指定した条件を満たした際に通知を送信し、Zilliz Cloud クラスターをプロアクティブに監視できます。CU 容量やクエリパフォーマンスなどのクラスターメトリクスを監視するよう設定することで、対応が必要な潜在的な問題をいち早く検知できます。 | Cloud"
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

プロジェクトアラートを使用すると、指定した条件を満たした際に通知を送信し、Zilliz Cloud クラスターをプロアクティブに監視できます。CU 容量やクエリパフォーマンスなどのクラスターメトリクスを監視するよう設定することで、対応が必要な潜在的な問題をいち早く検知できます。

<Admonition type="info" icon="📘" title="Notes">

この機能は **Dedicated** クラスターでのみ利用可能です。

</Admonition>

## 事前準備\{#before-you-start}

プロジェクトアラートを作成または管理する前に、以下の条件を満たしていることを確認してください。

- **Organization Owner** または **Project Admin** ロールの権限があること

## プロジェクトアラートの表示\{#view-project-alerts}

左サイドバーの **Project Alerts** をクリックして、プロジェクトアラートダッシュボードを開きます。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View Project Alerts Demo" />

### アラート履歴\{#alert-history}

過去のイベントの調査、アラートパターンの分析、システムの信頼性の確認などを行う場合は、**History** タブを使用します。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**Settings** タブでは、設定済みのすべてのアラートとその現在のステータスを確認できます。これにより、監視対象の範囲を一元的に把握できます。

アラート一覧には、以下の設定項目が表示されます。

<table>
   <tr>
     <th><p>Field</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Name</p></td>
     <td><p>アラートの説明的な識別子 (例: &quot;High CU Usage - Dedicated クラスター&quot;、&quot;P99 Query Latency&quot;)</p></td>
   </tr>
   <tr>
     <td><p>Status</p></td>
     <td><p>アラートの現在の状態を示すトグルスイッチ: Enabled (監視中) または Disabled (通知停止)</p></td>
   </tr>
   <tr>
     <td><p>Target Cluster</p></td>
     <td><p>監視対象のクラスター - 特定のクラスター (例: &quot;Dedicated-02, Dedicated-01&quot;) またはすべての Dedicated クラスター (今後作成されるクラスターも含む)</p></td>
   </tr>
   <tr>
     <td><p>Metric & Condition</p></td>
     <td><p>監視対象のメトリクスとトリガー条件の組み合わせ表示 (例: &quot;CU Capacity &gt; 80%, Duration &gt;= 10 min&quot;, &quot;Query Latency (P99) &gt; 1000 ms, Duration &gt;= 10 min&quot;)</p></td>
   </tr>
   <tr>
     <td><p>Severity Level</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>Warning:</strong> 制限に接近しています</p></li><li><p><strong>Critical:</strong> 即時対応が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Receiver</p></td>
     <td><p>通知の送信先です。設定済みのメールアドレスや通知チャネルが含まれます。</p><p>利用可能な通知チャネルの一覧については、<a href="./manage-notification-channels">Manage Notification Channels</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Alert Interval</p></td>
     <td><p>アラート送信後、指定された時間だけ繰り返し通知を抑制します。</p><ul><li><p>アラートが継続している場合でも、この間隔中は再送信されず、次の間隔に入る前に通知が再送されます。</p></li><li><p>アラートが解消されると、アラート間隔はリセットされ、評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Actions</p></td>
     <td><p>利用可能な操作: Edit、Clone、Delete</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定のプロジェクト用に作成されたアラートの一覧を表示できます。各パラメータの詳細については、[List Alert Rules](/reference/restful/list-alert-rules-v2) を参照してください。

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

## プロジェクトアラートの作成\{#create-a-project-alert}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

クラスターのパフォーマンスや健全性を多角的に監視するための新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create Project Alerts Demo" />

</TabItem>
<TabItem value="Bash">

特定のクラスター、またはすべての Dedicated クラスターを対象にアラートを作成できます。パラメータの詳細については、[Create Alert Rule](/reference/restful/create-alert-rule-v2) を参照してください。

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

## プロジェクトアラートの管理\{#manage-project-alerts}

既存のアラートを変更・整理・保守し、効果的な監視体制を維持します。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage Project Alerts" isShowcase="true" />

<Admonition type="info" icon="📘" title="Notes">

RESTful API を使用してプロジェクトアラートを管理することも可能です。詳細については、[Update Alert Rule](/reference/restful/update-alert-rule-v2) および [Delete Alert Rule](/reference/restful/delete-alert-rule-v2) を参照してください。

</Admonition>

### アラートの無効化と有効化\{#disable-or-enable-an-alert}

設定を保持したまま、監視の有効・無効を切り替えることができます。

- **無効化されたアラート:** 通知の送信は停止しますが、すべての設定は保持されます

- **有効化されたアラート:** クラスターを継続的に監視し、しきい値を超えた場合に通知を送信します

### アラートの編集\{#edit-an-alert}

監視要件の変更に合わせてアラート設定を更新します。

以下を含む任意のアラートパラメータを変更できます。

- しきい値と比較演算子

- 対象クラスターとメトリクスの種類

- 通知チャネル、受信者、アラート間隔

- 重大度レベルと期間の設定

### アラートの複製\{#clone-an-alert}

最小限の手間で同様のアラートを作成できます。複製すると既存の設定がすべてコピーされるため、次のような調整が可能です。

- 異なるクラスター環境向けにバリエーションを作成する

- 他のパラメータはそのままでしきい値のみを調整する

- 複数のプロジェクトにわたって監視を展開する

### アラートの削除\{#delete-an-alert}

不要になった監視ルールや重複する監視ルールを削除します。

<Admonition type="danger" icon="🚧" title="Danger">

アラートの削除は永続的であり、元に戻すことはできません。操作を実行する前に、そのアラートが不要であることを確認してください。

</Admonition>

## アラート受信設定の構成\{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を行い、チーム全体で一貫した監視運用を確保します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo" />

設定を行う際は、以下の項目を確認します。

- **送信先**: 新しいアラート作成時に自動的に選択されるデフォルトの通知チャネル（メール、Slack、Webhook）です。よく使用するチャネルを設定しておくことで、アラート作成を効率化できます。

- **アラート解決通知**: 有効にすると、アラートが解決した際に通知を受け取れます。

- **既存のアラートに設定を適用**: 新しいデフォルト設定を既存のすべてのアラートに反映するかどうかを選択します。

## FAQ\{#faq}

### アラート発生時、通知はどのくらいの頻度で届きますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は、以下の自動頻度パターンに従って送信されます。

- **最初の通知**: アラートのしきい値を超えた時点で即座に送信されます

- **2 回目の通知**: 条件が継続している場合、1 時間後に送信されます

- **以降の通知**: アラート条件が継続している間、1 日 1 回送信されます

通知が頻繁すぎると感じる場合は、以下の対応が可能です。

- [アラートを編集](./manage-project-alerts#edit-an-alert)して、条件のしきい値や継続時間の要件を調整する

- [アラートを無効化](./manage-project-alerts#disable-or-enable-an-alert)して、設定を保持したまま一時的にすべての通知を停止する

