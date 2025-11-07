---
title: "プロジェクトアラートを管理 | Cloud"
slug: /manage-project-alerts
sidebar_label: "プロジェクトアラートを管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "プロジェクトアラートは、指定された条件が満たされたときに通知を送信することにより、Zilliz Cloudクラスターの能動的な監視を可能にします。プロジェクトアラートを構成して、CU容量、クエリパフォーマンスなどのクラスターメトリクスを監視し、注意が必要な潜在的な問題が発生したときに即座に通知されるようにできます。 | Cloud"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - プロジェクト
  - アラート
  - ベクター検索
  - 音相似検索
  - エラスティックベクターデータベース
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# プロジェクトアラートを管理

プロジェクトアラートは、指定された条件が満たされたときに通知を送信することにより、Zilliz Cloudクラスターの能動的な監視を可能にします。プロジェクトアラートを構成して、CU容量、クエリパフォーマンスなどのクラスターメトリクスを監視し、注意が必要な潜在的な問題が発生したときに即座に通知されるようにできます。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 事前準備\{#before-you-start}

プロジェクトアラートを作成または管理する前に、以下を持っていることを確認してください：

- **組織オーナー**または**プロジェクト管理者**ロールアクセス

## プロジェクトアラートを表示\{#view-project-alerts}

左側のサイドバーで**プロジェクトアラート**に移動して、プロジェクトアラートダッシュボードにアクセスします。

<Supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - プロジェクトアラート表示デモ" />

### アラート履歴\{#alert-history}

過去のイベントを調査したり、アラートパターンを理解したり、システムの信頼性を示す必要がある場合、**履歴**タブを使用します。

### アラート設定\{#alert-settings}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

**設定**タブを使用して、すべての構成済みアラートとその現在のステータスを確認します。これにより、監視範囲の中央集権的なビューが提供されます。

アラートを表示するとき、以下の構成項目が表示されます：

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>名前</p></td>
     <td><p>アラートの説明的な識別子（例：「高CU使用率 - 専用クラスター」、「P99クエリ待機時間」）</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態を示すトグルスイッチ：有効（アクティブ監視）または無効（通知なし）</p></td>
   </tr>
   <tr>
     <td><p>ターゲットクラスター</p></td>
     <td><p>監視対象クラスター - 特定のクラスター（例：「Dedicated-02、Dedicated-01」）またはすべての専用クラスター（後で作成されるクラスターを含む）</p></td>
   </tr>
   <tr>
     <td><p>メトリクスおよび条件</p></td>
     <td><p>監視パラメータとトリガー設定の組み合わせ表示（例：「CU容量&gt; 80%、期間&gt;= 10分」、「クエリ待機時間（P99）&gt; 1000ms、期間&gt;= 10分」）</p></td>
   </tr>
   <tr>
     <td><p>重要度レベル</p></td>
     <td><p>影響分類</p><ul><li><p><strong>警告：</strong> 制限に近づいています</p></li><li><p><strong>重要：</strong> 直ちに対応が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>受信者</p></td>
     <td><p>構成されたメールアドレスおよび通知チャネルを含む通知受信者。<p>利用可能な通知チャネルのリストについては、<a href="./manage-notification-channels">通知チャネルを管理</a>を参照してください。</p></p></td>
   </tr>
   <tr>
     <td><p>アラート間隔</p></td>
     <td><p>各アラートが送信された後の設定時間、繰り返しの通知を抑制します。</p><ul><li><p>アラートが継続している場合、間隔中は通知は再送信されません。次の間隔に入る前に通知が再送信されます。</p></li><li><p>アラートが解決された場合、アラート間隔はリセットされ、アラート評価が再開されます。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>操作</p></td>
     <td><p>利用可能な管理オプション：編集、複製、削除</p></td>
   </tr>
</table>

</TabItem>
<TabItem value="Bash">

特定のプロジェクトに作成されたアラートリストを表示できます。パラメータの詳細については、[アラートルールを一覧表示](/reference/restful/list-alert-rules-v2)を参照してください。

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

## プロジェクトアラートを作成\{#create-a-project-alert}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

クラスターパフォーマンスおよび健全性をさまざまな側面から監視するために新しいアラートを設定します。

<Supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - プロジェクトアラートを作成デモ" />

</TabItem>
<TabItem value="Bash">

特定またはすべての専用クラスター用にアラートを作成できます。パラメータの詳細については、[アラートルールを作成](/reference/restful/create-alert-rule-v2)を参照してください。

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
       "ruleName": "高CU計算量",
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

## プロジェクトアラートを管理\{#manage-project-alerts}

既存のアラートを変更、整理、および維持して、監視が関連性と効果性を保つようにします。

<Supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="プロジェクトアラートを管理" isShowcase="true" />

<Admonition type="info" icon="📘" title="注意">

<p>RESTful APIを介してプロジェクトアラートを管理することもできます。詳細については、<a href="/reference/restful/update-alert-rule-v2">アラートルールを更新</a>および<a href="/reference/restful/delete-alert-rule-v2">アラートルールを削除</a>を参照してください。</p>

</Admonition>

### アラートを無効化または有効化\{#disable-or-enable-an-alert}

構成を失うことなくアクティブ監視を制御します。

- **無効なアラート：** 通知の送信を停止しますが、すべての設定を保持します

- **有効なアラート：** クラスターをアクティブに監視し、しきい値が超過されたときに通知を送信します

### アラートを編集\{#edit-an-alert}

監視要件が変わるときにアラート構成を更新します。

以下の任意のアラートパラメータを変更できます：

- しきい値と比較演算子

- ターゲットクラスターとメトリクスタイプ

- 通知チャネル、受信者、およびアラート間隔

- 重要度レベルと期間設定

### アラートを複製\{#clone-an-alert}

最小限のセットアップ努力で類似のアラートを作成します。複製はすべての既存設定をコピーし、以下を可能にします：

- 異なるクラスターエンヴィロンメント用にバリアントを作成する

- 他のパラメータを維持しながらしきい値を調整する

- 複数のプロジェクトにわたって監視をスケールする

### アラートを削除\{#delete-an-alert}

古くなったまたは冗長な監視ルールを削除します。

<Admonition type="danger" icon="🚧" title="警告">

<p>アラートの削除は恒久的で元に戻すことはできません。先に進む前にアラートが不要であることを確認してください。</p>

</Admonition>

## アラート受信者設定を構成\{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を設定し、チーム全体で一貫した監視プラクティスを確保します。

<Supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - アラート受信者設定を構成デモ" />

設定を構成するとき、以下の概念が表示されます：

- **送信先：** 新しいアラートに自動的に選択されるデフォルト通知チャネル（メール、Slack、ウェブフック）。アラート作成を合理化するために最もよく使用されるチャネルを構成します。

- **アラート解決通知：** 有効にすると、アラートが解決されたときに通知を受け取ります。

- **既存のアラートに設定を適用：** 新しいデフォルト設定で既存のすべてのアラートを更新するかどうかを選択します。

## よくある質問\{#faq}

### アラートがトリガーされたとき、どのくらいの頻度でアラート通知を受け取りますか？\{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います：

- **最初の通知：** アラートしきい値が超過されたときに即座に送信されます

- **2回目の通知：** 条件が継続している場合、1時間後に送信されます

- **その後の通知：** アラート条件がアクティブな間、1日1回送信されます

通知が頻繁すぎると感じる場合は、以下ができます：

- [アラートを編集](./manage-project-alerts#edit-an-alert)して、条件しきい値または期間要件を調整する

- [アラートを無効化](./manage-project-alerts#disable-or-enable-an-alert)して、構成を保持しながらすべての通知を一時的に停止する
