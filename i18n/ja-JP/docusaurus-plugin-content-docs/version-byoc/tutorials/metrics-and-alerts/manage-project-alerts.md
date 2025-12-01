---
title: "プロジェクトアラートの管理 | BYOC"
slug: /manage-project-alerts
sidebar_label: "プロジェクトアラートの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プロジェクトアラートは、指定された条件が満たされたときに通知を送信することで、Zilliz Cloudクラスターのプロアクティブな監視を可能にします。CU容量やクエリパフォーマンスなどのクラスターメトリクスを監視するようにプロジェクトアラートを設定し、注意が必要な潜在的な問題をすぐに通知されるようにできます。 | BYOC"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
keywords:
  - zilliz
  - vector database
  - cloud
  - project
  - alerts
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# プロジェクトアラートの管理

プロジェクトアラートは、指定された条件が満たされたときに通知を送信することで、Zilliz Cloudクラスターのプロアクティブな監視を可能にします。CU容量やクエリパフォーマンスなどのクラスターメトリクスを監視するようにプロジェクトアラートを設定し、注意が必要な潜在的な問題をすぐに通知されるようにできます。

## 事前準備\{#before-you-start}

プロジェクトアラートを作成または管理する前に、以下の権限があることを確認してください。

- **Organization Owner** または **Project Admin** ロールアクセス

## プロジェクトアラートの表示\{#view-project-alerts}

左側のサイドバーで **プロジェクトアラート** に移動して、プロジェクトアラートダッシュボードにアクセスします。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - プロジェクトアラートの表示デモ" />

### アラート履歴\{#alert-history}

**履歴** タブを使用して、過去のイベントを調査したり、アラートパターンを理解したり、システムの信頼性を示すことができます。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**設定** タブを使用して、構成されたすべてのアラートとその現在の状態を確認します。これにより、監視カバレッジの中央集権的なビューが提供されます。

アラートを表示する際、以下の構成項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>アラートの説明的識別子（例："高CU使用率 - 専用クラスター"、"P99クエリレイテンシ"）</p></td>
   </tr>
   <tr>
     <td><p>状態</p></td>
     <td><p>現在のアラート状態を示すトグルスイッチ：有効（アクティブ監視）または無効（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>ターゲットクラスター</p></td>
     <td><p>監視対象クラスター - 特定のクラスター（例："Dedicated-02、Dedicated-01"）またはすべての専用クラスター（後で作成されるクラスターを含む）</p></td>
   </tr>
   <tr>
     <td><p>メトリクスおよび条件</p></td>
     <td><p>監視対象パラメータとトリガー設定の組み合わせ表示（例："CU容量 > 80%、期間 >= 10分"、"クエリレイテンシ（P99）> 1000ms、期間 >= 10分"）</p></td>
   </tr>
   <tr>
     <td><p>重要度レベル</p></td>
     <td><p>影響の分類</p><ul><li><p><strong>警告：</strong> 制限に接近中</p></li><li><p><strong>クリティカル：</strong> 直ちに対応が必要</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>構成されたメールアドレスおよび通知チャネルを含む通知受信者。<a href="./manage-notification-channels">通知チャネルの管理</a>を参照して利用可能な通知チャネルのリストをご確認ください。</p></td>
   </tr>
   <tr>
     <td><p>アラート間隔</p></td>
     <td><p>各アラートが送信された後の設定時間、繰り返し通知を抑制します。</p><ul><li><p>アラートが継続している場合、間隔中は通知は再送信されません。次の間隔に入る前にも通知が再送信されます。</p></li><li><p>アラートが解決された場合、アラート間隔はリセットされ、アラート評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>利用可能な管理オプション：編集、複製、削除</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定のプロジェクトに作成されたアラートリストを表示できます。パラメータの詳細については、[アラートルール一覧](/reference/restful/list-alert-rules-v2)を参照してください。

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

さまざまな側面からクラスターパフォーマンスと状態を監視するための新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - プロジェクトアラート作成デモ" />

</TabItem>
<TabItem value="Bash">

特定またはすべての専用クラスターに対してアラートを作成できます。パラメータの詳細については、[アラートルール作成](/reference/restful/create-alert-rule-v2)を参照してください。

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
       "ruleName": "高CU計算",
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

## プロジェクトアラートの管理\{#manage-project-alerts}

既存のアラートを変更、整理、維持して、監視を関連性があり効果的な状態に保ちます。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="プロジェクトアラートの管理" isShowcase="true" />

<Admonition type="info" icon="📘" title="ノート">

<p>RESTful API を介してプロジェクトアラートを管理することもできます。詳細は、<a href="/reference/restful/update-alert-rule-v2">アラートルールの更新</a>および<a href="/reference/restful/delete-alert-rule-v2">アラートルールの削除</a>を参照してください。</p>

</Admonition>

### アラートの無効化または有効化\{#disable-or-enable-an-alert}

構成を失うことなくアクティブ監視を制御できます。

- **無効化されたアラート：** 通知の送信を停止しますが、すべての設定を保持します

- **有効化されたアラート：** クラスターをアクティブに監視し、しきい値が超過されたときに通知を送信します

### アラートの編集\{#edit-an-alert}

監視要件が変更されたときにアラート構成を更新します。

以下のアラートパラメータを変更できます。

- しきい値と比較演算子

- ターゲットクラスターとメトリクスタイプ

- 通知チャネル、受信者、アラート間隔

- 重要度レベルと期間設定

### アラートの複製\{#clone-an-alert}

最小限のセットアップ作業で類似のアラートを作成します。複製ではすべての既存設定がコピーされるため、以下が可能になります。

- 異なるクラスター環境用のバリエーションを作成

- 他のパラメータを維持しながらしきい値を調整

- 複数プロジェクトにわたる監視のスケーリング

### アラートの削除\{#delete-an-alert}

古くなったまたは冗長な監視ルールを削除します。

<Admonition type="danger" icon="🚧" title="警告">

<p>アラートの削除は永続的で元に戻せません。続行する前にアラートが不要であることを確認してください。</p>

</Admonition>

## アラート受信者設定の構成\{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を設定し、チーム全体で一貫した監視運用を確保します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - アラート受信者設定の構成デモ" />

設定を構成する際、以下の概念が表示されます。

- **送信先：** 新しいアラートに自動的に選択されるデフォルト通知チャネル（メール、Slack、Webhook）。アラート作成を効率化するために、最もよく使用するチャネルを設定してください。

- **アラート解決通知：** 有効になっている場合、アラートが解決されたときに通知を受け取ります。

- **既存アラートへの設定の適用：** すべての既存アラートに新しいデフォルト設定を更新するかどうかを選択します。

## よくある質問\{#faq}

### アラートがトリガーされると、どのくらいの頻度で通知を受け取ることができますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います。

- **最初の通知：** アラートのしきい値が超過された直後に送信されます

- **2回目の通知：** 条件が継続する場合、1時間後に送信されます

- **今後の通知：** アラート条件がアクティブな限り、1日1回送信されます

通知が頻繁すぎると感じる場合は、以下を行えます。

- [アラートを編集](./manage-project-alerts#edit-an-alert)して条件のしきい値または期間の要件を調整する

- [アラートを無効化](./manage-project-alerts#disable-or-enable-an-alert)して、構成を保持しながらすべての通知を一時的に停止する