---
title: "プロジェクトアラートの管理 | Cloud"
slug: /manage-project-alerts
sidebar_label: "プロジェクトアラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プロジェクトアラートを使用すると、指定した条件を満たしたときに通知が送信され、Zilliz Cloud クラスターをプロアクティブに監視できます。CU 容量やクエリパフォーマンスなどのクラスターメトリクスを監視するようにプロジェクトアラートを構成することで、対応が必要な潜在的な問題をすぐに把握できます。 | Cloud"
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

プロジェクトアラートを使用すると、指定した条件を満たしたときに通知が送信され、Zilliz Cloud クラスターをプロアクティブに監視できます。CU 容量やクエリパフォーマンスなどのクラスターメトリクスを監視するようにプロジェクトアラートを構成することで、対応が必要な潜在的な問題をすぐに把握できます。

<Admonition type="info" title="Notes">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 事前準備\{#before-you-start}

プロジェクトアラートを作成または管理する前に、以下の条件を満たしていることを確認してください。

- **Organization Owner** または **Project Admin** ロールの権限を持っていること

## プロジェクトアラートの表示\{#view-project-alerts}

左サイドバーの **Project Alerts** に移動すると、プロジェクトアラートのダッシュボードにアクセスできます。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View Project Alerts Demo" />

### アラート履歴\{#alert-history}

過去のイベントを調査したり、アラートのパターンを把握したり、システムの信頼性を示したりする必要がある場合は、**History** タブを使用します。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**Settings** タブでは、設定済みのすべてのアラートとその現在のステータスを確認できます。これにより、監視範囲を一元的に把握できます。

アラートを表示すると、以下の設定項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>アラートを識別するための説明的な名前（例：&quot;High CU Usage - Dedicated Clusters&quot;、&quot;P99 Query Latency&quot;）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>アラートの現在の状態を示すトグルスイッチ：Enabled（アクティブな監視）または Disabled（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>対象クラスター</p></td>
     <td><p>監視対象のクラスター。特定のクラスター（例：&quot;Dedicated-02, Dedicated-01&quot;）またはすべての Dedicated クラスター（今後作成されるクラスターを含む）です。</p></td>
   </tr>
   <tr>
     <td><p>メトリクスと条件</p></td>
     <td><p>監視対象のパラメーターとトリガー設定を組み合わせて表示します（例：&quot;CU Capacity &gt; 80%, Duration &gt;= 10 min&quot;、&quot;Query Latency (P99) &gt; 1000 ms, Duration &gt;= 10 min&quot;）。</p></td>
   </tr>
   <tr>
     <td><p>重大度レベル</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>Warning:</strong> 制限に近づいています</p></li><li><p><strong>Critical:</strong> 即時対応が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>設定済みのメールアドレスや通知チャネルを含む、通知の受信者です。</p><p>利用可能な通知チャネルの一覧については、<a href="./manage-notification-channels">通知チャネルの管理</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>アラート間隔</p></td>
     <td><p>各アラートの送信後、設定された時間だけ繰り返し通知を抑制します。</p><ul><li><p>アラートが継続している場合、その間隔の間は通知が再送されません。次の間隔に入る前に通知が再送されます。</p></li><li><p>アラートが解決されると、アラート間隔がリセットされ、アラートの評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>操作</p></td>
     <td><p>利用可能な管理操作：Edit、Clone、Delete</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定のプロジェクトに作成されたアラートの一覧を表示できます。パラメーターの詳細については、[List Alert Rules](/reference/restful/list-alert-rules-v2) を参照してください。

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

クラスターのパフォーマンスと健全性をさまざまな観点から監視するための新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create Project Alerts Demo" />

</TabItem>
<TabItem value="Bash">

特定の Dedicated クラスターまたはすべての Dedicated クラスターに対してアラートを作成できます。パラメーターの詳細については、[Create Alert Rule](/reference/restful/create-alert-rule-v2) を参照してください。

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

既存のアラートを変更、整理、保守して、監視を適切かつ効果的に維持します。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage Project Alerts" isShowcase="true" />

<Admonition type="info" title="Notes">

プロジェクトアラートは RESTful API からも管理できます。詳細については、[Update Alert Rule](/reference/restful/update-alert-rule-v2) および [Delete Alert Rule](/reference/restful/delete-alert-rule-v2) を参照してください。

</Admonition>

### アラートの無効化または有効化\{#disable-or-enable-an-alert}

設定を失わずに、アクティブな監視を制御します。

- **無効化されたアラート：** 通知の送信は停止しますが、すべての設定は保持されます

- **有効化されたアラート：** クラスターをアクティブに監視し、しきい値を超えたときに通知を送信します

### アラートの編集\{#edit-an-alert}

監視要件が変更されたら、アラート設定を更新します。

以下を含む、任意のアラートパラメーターを変更できます。

- しきい値と比較演算子

- 対象クラスターとメトリクスの種類

- 通知チャネル、受信者、アラート間隔

- 重大度レベルと期間の設定

### アラートの複製\{#clone-an-alert}

最小限の設定作業で類似のアラートを作成できます。複製では既存の設定がすべてコピーされるため、次のことが可能です。

- 異なるクラスター環境向けのバリエーションを作成する

- 他のパラメーターを維持したまましきい値を調整する

- 複数のプロジェクトにわたって監視を拡張する

### アラートの削除\{#delete-an-alert}

不要になった監視ルールや重複した監視ルールを削除します。

<Admonition type="danger" title="Danger">

アラートの削除は永続的で、元に戻すことはできません。先に進む前に、そのアラートが不要であることを確認してください。

</Admonition>

## アラート受信者設定の構成\{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を行い、チーム全体で一貫した監視運用を確保します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo" />

設定を構成する際には、以下の項目を確認します。

- **Send to**: 新しいアラートに自動的に選択されるデフォルトの通知チャネル（メール、Slack、Webhook）です。よく使用するチャネルを設定しておくと、アラートの作成を効率化できます。

- **Alert Resolution Notification**: 有効にすると、アラートが解決したときに通知を受け取ります。

- **Apply Settings to Existing Alerts**: 新しいデフォルト設定で既存のすべてのアラートを更新するかどうかを選択します。

## FAQ\{#faq}

### アラートがトリガーされたとき、アラート通知はどのくらいの頻度で届きますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は、以下の自動的な頻度パターンに従います。

- **最初の通知**: アラートのしきい値を超えた時点で即座に送信されます

- **2 回目の通知**: 条件が継続している場合は、1 時間後に送信されます

- **以降の通知**: アラート条件が有効な間、1 日 1 回送信されます

通知が頻繁すぎると感じる場合は、次の対応が可能です。

- [アラートを編集](./manage-project-alerts#edit-an-alert)して、条件のしきい値や期間の要件を調整する

- [アラートを無効化](./manage-project-alerts#disable-or-enable-an-alert)して、設定を保持したまま、一時的にすべての通知を停止する

