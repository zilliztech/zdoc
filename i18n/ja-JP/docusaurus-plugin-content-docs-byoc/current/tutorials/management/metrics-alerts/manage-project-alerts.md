---
title: "プロジェクトアラートの管理 | BYOC"
slug: /manage-project-alerts
sidebar_label: "プロジェクトアラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プロジェクトアラートを使用すると、指定した条件が満たされた際に通知を送信することで、Zilliz Cloud クラスターをプロアクティブに監視できます。プロジェクトアラートを設定して、CU capacity やクエリパフォーマンスなどのクラスター メトリクスを監視し、対応が必要な潜在的な問題を即座に把握できます。 | BYOC"
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

プロジェクトアラートを使用すると、指定した条件が満たされた際に通知を送信することで、Zilliz Cloud クラスターをプロアクティブに監視できます。プロジェクトアラートを設定して、CU capacity やクエリパフォーマンスなどのクラスター メトリクスを監視し、対応が必要な潜在的な問題を即座に把握できます。

## 始める前に\{#before-you-start}

プロジェクトアラートを作成または管理する前に、以下を確認してください。

- **Organization Owner** または **Project Admin** ロールのアクセス権

## プロジェクトアラートを表示する\{#view-project-alerts}

左側のサイドバーにある **Project Alerts** に移動して、プロジェクトアラートダッシュボードにアクセスします。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View Project Alerts Demo" />

### アラート履歴\{#alert-history}

過去のイベントを調査したい場合、アラートパターンを把握したい場合、またはシステムの信頼性を示したい場合は、**History** タブを使用します。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**Settings** タブを使用して、設定済みのすべてのアラートとその現在のステータスを確認します。これにより、監視範囲を一元的に把握できます。

アラートを表示すると、以下の設定項目があります。

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
     <td><p>現在のアラート状態を示すトグルスイッチ: Enabled（アクティブ監視）または Disabled（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>Target Cluster</p></td>
     <td><p>監視対象のクラスター - 特定のクラスター（例: "Dedicated-02, Dedicated-01"）またはすべての Dedicated クラスター（後で作成されるものを含む）</p></td>
   </tr>
   <tr>
     <td><p>Metric & Condition</p></td>
     <td><p>監視パラメータとトリガー設定の組み合わせ表示（例: "CU Capacity &gt; 80%, Duration &gt;= 10 min"、"Query Latency (P99) &gt; 1000 ms, Duration &gt;= 10 min"）</p></td>
   </tr>
   <tr>
     <td><p>Severity Level</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>Warning:</strong> 制限値に近づいている状態</p></li><li><p><strong>Critical:</strong> 直ちに対応が必要</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Receiver</p></td>
     <td><p>設定済みのメールアドレスや通知チャネルを含む通知受信者。</p><p>利用可能な通知チャネルの一覧については、<a href="./manage-notification-channels">通知チャネルの管理</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>Alert Interval</p></td>
     <td><p>各アラート送信後、一定時間は重複通知を抑制します。</p><ul><li><p>アラート状態が継続している場合、その間隔中は通知は再送されません。次の間隔に入る前に通知が再送されます。</p></li><li><p>アラートが解消されると、アラート間隔はリセットされ、アラート評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Actions</p></td>
     <td><p>利用可能な管理オプション: Edit、Clone、Delete</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定のプロジェクト用に作成されたアラート一覧を表示できます。パラメータの詳細については、[アラートルール一覧](/reference/restful/list-alert-rules-v2)を参照してください。

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

さまざまな観点からクラスターのパフォーマンスと健全性を監視するために、新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create Project Alerts Demo" />

</TabItem>
<TabItem value="Bash">

特定の、またはすべての Dedicated クラスターに対してアラートを作成できます。パラメータの詳細については、[アラートルールの作成](/reference/restful/create-alert-rule-v2)を参照してください。

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

既存のアラートを変更、整理、維持して、監視の関連性と有効性を維持します。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage Project Alerts" isShowcase="true" />

<Admonition type="info" icon="📘" title="注">

RESTful API を使用してプロジェクトアラートを管理することもできます。詳細については、[アラートルールの更新](/reference/restful/update-alert-rule-v2)および [アラートルールの削除](/reference/restful/delete-alert-rule-v2)を参照してください。

</Admonition>

### アラートを無効化または有効化する\{#disable-or-enable-an-alert}

設定を失うことなく、アクティブな監視を制御できます。

- **Disabled alerts:** 通知の送信を停止しますが、すべての設定は保持されます

- **Enabled alerts:** クラスターをアクティブに監視し、しきい値を超えた場合に通知を送信します

### アラートを編集する\{#edit-an-alert}

監視要件が変わった場合に、アラート設定を更新します。

以下を含む任意のアラートパラメータを変更できます。

- しきい値と比較演算子

- 対象クラスターとメトリクスタイプ

- 通知チャネル、受信者、アラート間隔

- 重大度レベルと継続時間設定

### アラートを複製する\{#clone-an-alert}

最小限の設定作業で類似したアラートを作成できます。複製では既存のすべての設定がコピーされるため、次のことが可能です。

- 異なるクラスター環境向けのバリエーションを作成する

- 他のパラメータを維持したまましきい値を調整する

- 複数のプロジェクトにわたって監視を拡張する

### アラートを削除する\{#delete-an-alert}

古くなった、または冗長な監視ルールを削除します。

<Admonition type="danger" icon="🚧" title="危険">

アラートの削除は永久的であり、元に戻すことはできません。操作を続行する前に、そのアラートが不要であることを確認してください。

</Admonition>

## アラート受信者設定を構成する\{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を行い、チーム全体で一貫した監視運用を実現します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo" />

設定時には、以下の項目があります。

- **Send to**: 新しいアラートで自動的に選択されるデフォルトの通知チャネル（email、Slack、webhooks）。アラート作成を簡素化するため、最もよく使うチャネルを設定してください。

- **Alert Resolution Notification**: 有効にすると、アラートが解消されたときに通知を受け取ります。

- **Apply Settings to Existing Alerts**: 新しいデフォルト設定を既存のすべてのアラートに適用するかどうかを選択します。

## FAQ\{#faq}

### アラートがトリガーされたとき、アラート通知はどのくらいの頻度で届きますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は、次の自動頻度パターンに従います。

- **最初の通知**: アラートしきい値を超えた時点で直ちに送信されます

- **2回目の通知**: 条件が継続している場合、1時間後に送信されます

- **以降の通知**: アラート条件が有効な間、1日1回送信されます

通知の頻度が高すぎると感じる場合は、次の対応が可能です。

- 条件のしきい値や継続時間要件を調整するには、[アラートを編集](./manage-project-alerts#edit-an-alert)してください

- 設定を保持したまま通知をすべて停止するには、一時的に[アラートを無効化](./manage-project-alerts#disable-or-enable-an-alert)してください

