---
title: "プロジェクトアラートの管理 | BYOC"
slug: /manage-project-alerts
sidebar_key: manage-project-alerts
sidebar_label: "プロジェクトアラートの管理"
beta: FALSE
notebook: FALSE
description: "プロジェクトアラートは、指定された条件が満たされたときに通知を送信することで、Zilliz Cloud クラスターのプロアクティブな監視を可能にします。CU 容量やクエリパフォーマンスなどのクラスターメトリクスを監視するようにプロジェクトアラートを構成でき、注意が必要な潜在的な問題を即座に通知されます。| BYOC"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - project
  - alerts

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# プロジェクトアラートの管理

プロジェクトアラートを使用すると、指定された条件が満たされたときに通知を送信することで、Zilliz Cloud クラスターをプロアクティブに監視できます。CU 容量やクエリパフォーマンスなどのクラスターメトリクスを監視するようにプロジェクトアラートを構成し、注意が必要な潜在的な問題が発生した際に即座に通知を受け取ることができます。

## 始める前に\{#before-you-start}

プロジェクトアラートを作成または管理する前に、以下が必要です。

- **組織オーナー** または **プロジェクト管理者** ロールへのアクセス

## プロジェクトアラートの表示\{#view-project-alerts}

左側のサイドバーにある **プロジェクトアラート** に移動して、プロジェクトアラートダッシュボードにアクセスします。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View プロジェクトアラート Demo" />

### アラート履歴\{#alert-history}

過去のイベントを調査したり、アラートパターンを理解したり、システムの信頼性を実証したりする必要がある場合は、**履歴** タブを使用します。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**設定** タブを使用して、構成されたすべてのアラートとその現在のステータスを確認します。これにより、監視カバレッジを一元的に把握できます。

アラートを表示する際、以下の構成項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>アラートの説明的な識別子（例："High CU Usage - Dedicated Clusters"、"P99 Query Latency"）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態を示すトグルスイッチ：有効（アクティブな監視）または無効（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>対象クラスター</p></td>
     <td><p>監視対象のクラスター - 特定のクラスター（例："Dedicated-02, Dedicated-01"）またはすべての専用クラスター（後で作成されるものを含む）</p></td>
   </tr>
   <tr>
     <td><p>メトリクスと条件</p></td>
     <td><p>監視パラメーターとトリガー設定の組み合わせ表示（例："CU 容量 &gt; 80%、期間 &gt;= 10 分"、"クエリレイテンシ (P99) &gt; 1000 ms、期間 &gt;= 10 分"）</p></td>
   </tr>
   <tr>
     <td><p>重要度レベル</p></td>
     <td><p>影響度の分類</p><ul><li><p><strong>警告:</strong> 制限に近づいています</p></li><li><p><strong>重大:</strong> 即時の対応が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>構成されたメールアドレスと通知チャンネルを含む通知受信者。</p><p>利用可能な通知チャンネルの一覧については、<a href="./manage-notification-channels">通知チャンネルの管理</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>アラート間隔</p></td>
     <td><p>各アラート送信後、設定された時間だけ重複通知を抑制します。</p><ul><li><p>アラートが継続している場合、その間隔中は通知が再送されません。次の間隔に入る前に通知が再送されます。</p></li><li><p>アラートが解決された場合、アラート間隔はリセットされ、アラート評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>利用可能な管理オプション：編集、クローン、削除</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定のプロジェクト用に作成されたアラートリストを表示できます。パラメーターの詳細については、[アラートルールの一覧](/reference/restful/list-alert-rules-v2) を参照してください。

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

クラスターのパフォーマンスとヘルスをさまざまな側面から監視するための新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create プロジェクトアラート Demo" />

</TabItem>
<TabItem value="Bash">

特定の Dedicated クラスターまたはすべての Dedicated クラスターに対してアラートを作成できます。パラメーターの詳細については、[アラートルールの作成](/reference/restful/create-alert-rule-v2) を参照してください。

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
       "targetClusterIds": ["in01-fbc09dde0a4bfc5"],
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

## Manage project alerts\{#manage-project-alerts}

既存のアラートを変更、整理、および維持して、モニタリングを関連性が高く効果的な状態に保ちます。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage プロジェクトアラート" isShowcase="true" />

<Admonition type="info" icon="📘" title="Notes">

<p>RESTful API を使用してプロジェクトアラートを管理することもできます。詳細については、<a href="/reference/restful/update-alert-rule-v2">Update Alert Rule</a> および <a href="/reference/restful/delete-alert-rule-v2">Delete Alert Rule</a> を参照してください。</p>

</Admonition>

### Disable or enable an alert\{#disable-or-enable-an-alert}

設定を失うことなく、アクティブなモニタリングを制御します。

- **無効化されたアラート:** 通知の送信を停止しますが、すべての設定は保持されます

- **有効化されたアラート:** クラスターを積極的にモニタリングし、しきい値を超えた場合に通知を送信します

### Edit an alert\{#edit-an-alert}

モニタリング要件が変更された場合に、アラート設定を更新します。

以下のいずれのアラートパラメータも変更可能です。

- しきい値と比較演算子

- 対象クラスターとメトリックタイプ

- 通知チャネル、受信者、およびアラート間隔

- 重要度レベルと期間設定

### クローン an alert\{#clone-an-alert}

最小限の設定作業で類似のアラートを作成します。クローン機能は既存の設定をすべてコピーするため、以下のことが可能になります。

- 異なるクラスター環境用のバリエーションを作成する

- 他のパラメータを維持したまましきい値を調整する

- 複数のプロジェクトにわたってモニタリングをスケールする

### Delete an alert\{#delete-an-alert}

不要または冗長なモニタリングルールを削除します。

<Admonition type="danger" icon="🚧" title="Warning">

<p>アラートの削除は永久的であり、元に戻すことはできません。続行する前に、そのアラートが不要であることを確認してください。</p>

</Admonition>

## Configure alert receiver settings\{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を設定し、チーム全体で一貫したモニタリング慣行を確保します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo" />

設定を構成する際、以下の概念に出会います。

- **送信先**: 新しいアラートに対して自動的に選択されるデフォルトの通知チャネル（メール、Slack、Webhook）。最も頻繁に使用するチャネルを設定して、アラート作成を効率化します。

- **アラート解決通知**: 有効にすると、アラートが解決された際に通知を受け取ります。

- **既存のアラートに設定を適用**: 新しいデフォルト設定ですべての既存のアラートを更新するかどうかを選択します。

## FAQ\{#faq}

### How often will I receive alert notifications when an alert is triggered?\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います。

- **最初の通知**: アラートしきい値を超えた直ちに送信されます

- **2 番目の通知**: 条件が持続する場合、1 時間後に送信されます

- **以降の通知**: アラート条件がアクティブである間、毎日 1 回送信されます

通知が頻繁すぎると思われる場合は、以下の対応が可能です。

- [アラートの編集](./manage-project-alerts#edit-an-alert) で条件のしきい値や期間要件を調整する

- [アラートの無効化](./manage-project-alerts#disable-or-enable-an-alert) を一時的に行い、設定を保持したまますべての通知を停止する

