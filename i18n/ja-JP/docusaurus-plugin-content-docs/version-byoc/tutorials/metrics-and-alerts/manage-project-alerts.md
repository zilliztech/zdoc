---
title: "プロジェクトのアラートを管理する | BYOC"
slug: /manage-project-alerts
sidebar_label: "プロジェクトのアラートを管理する"
beta: FALSE
notebook: FALSE
description: "プロジェクトアラートは、指定された条件が満たされたときに通知を送信することで、Zilliz Cloudクラスタのプロアクティブなモニタリングを可能にします。プロジェクトアラートを構成して、CU容量、クエリパフォーマンスなどのクラスタメトリクスを監視し、注意が必要な潜在的な問題をすぐに通知できるようにします。 | BYOC"
type: origin
token: NvDLw4kFji0xeWkc4Hpc9wUfnRh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - project
  - alerts
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';


# プロジェクトのアラートを管理する

プロジェクトアラートは、指定された条件が満たされたときに通知を送信することで、Zilliz Cloudクラスタのプロアクティブなモニタリングを可能にします。プロジェクトアラートを構成して、CU容量、クエリパフォーマンスなどのクラスタメトリクスを監視し、注意が必要な潜在的な問題をすぐに通知できるようにします。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、StandardプランとEnterpriseプランのクラスターでのみ利用できます。詳細については、「<a href="./select-zilliz-cloud-service-plans">詳細なプラン比較</a>」を参照してください。</p>

</Admonition>

</exclude>

## 始める前に{#before-you-start}

プロジェクトアラートを作成または管理する前に、次のことを確認してください:

- **組織オーナー**または**プロジェクト管理者**の役割へのアクセス

## プロジェクトのアラートを表示する{#view-project-alerts}

左サイドバーの**プロジェクトアラート**に移動して、プロジェクトアラートダッシュボードにアクセスしてください。

<supademo id="cmb5xa9pg39f6ppkpjwalrmro" title="Zilliz Cloud - View Project Alerts Demo"></supademo>

### アラート履歴{#alert-history}

過去のイベントを調査したり、アラートパターンを理解したり、システムの信頼性を示す必要がある場合は、**履歴**タブを使用してください。

### アラート設定{#alert-settings}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

[設定]タブを使用して、設定されたすべてのアラートとその現在のステータスを確認します。これにより、監視範囲を一元的に表示できます。

アラートを表示すると、次の設定項目が表示されます。

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>お名前</p></td>
     <td><p>アラートの記述的な識別子(例:「高いCU使用率-専用クラスタ」、「P 99クエリレイテンシ」)</p></td>
   </tr>
   <tr>
     <td><p>ステータス</p></td>
     <td><p>現在のアラート状態を表示するトグルスイッチ:有効(アクティブモニタリング)または無効(通知なし)</p></td>
   </tr>
   <tr>
     <td><p>ターゲット</p></td>
     <td><p>監視されるクラスタ-特定のクラスタ（例:「Dedicated-02、Dedicated-01」）またはすべてのDedicatedクラスタ（後で作成するクラスタを含む）</p></td>
   </tr>
   <tr>
     <td><p>メートルと条件</p></td>
     <td><p>監視パラメータとトリガー設定の組み合わせ表示（例:「CU Capacity&gt;80%、Duration&gt;=10 min」、「Query Latency(P 99)&gt;1000 ms、Duration&gt;=10 min」）</p></td>
   </tr>
   <tr>
     <td><p>深刻度レベル</p></td>
     <td><p>インパクト分類</p><ul><li><p><strong>警告:</strong>限界に近づいています</p></li><li><p><strong>重要:</strong>即時の注意が必要です</p></li></ul></td>
   </tr>
   <tr>
     <td><p>レシーバー</p></td>
     <td><p>設定されたメールアドレスと通知チャンネルを含む通知受信者。</p><p>使用可能な通知チャンネルの一覧については、<a href="./manage-notification-channels">通知チャンネルの管理</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>アクション</p></td>
     <td><p>使用可能な管理オプション:編集、クローン、削除</p></td>
   </tr>
</table>

<tabitem value="Bash"></tabitem>

特定のプロジェクトに対して作成されたアラート一覧を閲覧可能です。パラメータの詳細については、[リストアラートルール](/reference/restful/list-alert-rules-v2)を参照してください。

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

## プロジェクトのアラートを作成する{#create-a-project-alert}

<tabs groupid="cluster" defaultvalue="Cloud Console" values="{[{&#34;label&#34;:&#34;Cloud" console","value":"cloud="" console"},{"label":"bash","value":"bash"}]}=""></tabs>

<tabitem value="Cloud Console"></tabitem>

新しいアラートを設定して、さまざまな側面からクラスターのパフォーマンスと健康状態を監視します。

<supademo id="cmb5w29ip399appkp45y9k3u2" title="Zilliz Cloud - Create Project Alerts Demo"></supademo>

<tabitem value="Bash"></tabitem>

特定またはすべての専用クラスタに対してアラートを作成できます。パラメータの詳細については、[アラートルールの作成](/reference/restful/create-alert-rule-v2)を参照してください。

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

## プロジェクトのアラートを管理する{#manage-project-alerts}

既存のアラートを変更、整理、維持して、監視を関連性が高く効果的に保ちます。

<supademo id="cmb5ywkim01nozo0iqfsmhy3q" title="Manage Project Alerts" isshowcase="true"></supademo>

<Admonition type="info" icon="📘" title="ノート">

<p>RESTful APIを使用してプロジェクトのアラートを管理することもできます。詳細については、<a href="/reference/restful/update-alert-rule-v2">アップデートアラートルール</a>と<a href="/reference/restful/delete-alert-rule-v2">削除アラートルール</a>を参照してください。</p>

</Admonition>

### アラートを無効または有効にする{#disable-or-enable-an-alert}

構成を失うことなくアクティブモニタリングを制御します。

- **無効なアラート:**通知の送信を停止しますが、すべての設定を保持します

- **有効なアラート:**クラスターを積極的に監視し、閾値を超えた場合に通知を送信します

### アラートを編集する{#edit-an-alert}

監視要件が変更された場合にアラート設定を更新します。

任意のアラートパラメータを変更します:

- しきい値と比較演算子

- ターゲットクラスタとメトリックタイプ

- 通知の受信者とチャネル

- 重大度レベルと期間の設定

### アラートをクローンする{#clone-an-alert}

最小限のセットアップ作業で同様のアラートを作成します。クローンは既存のすべての設定をコピーし、次のことができます。

- 異なるクラスタ環境用のバリアントを作成する

- 他のパラメータを保持しながら閾値を調整する

- 複数のプロジェクトにわたるスケールモニタリング

### アラートを削除する{#delete-an-alert}

古いまたは冗長な監視ルールを削除します。

<Admonition type="danger" icon="🚧" title="警告">

<p>アラートの削除は永久的で元に戻すことはできません。続行する前に、アラートが不要になったことを確認してください。</p>

</Admonition>

## アラート受信の設定を行う{#configure-alert-receiver-settings}

プロジェクト全体のデフォルト通知設定を設定し、チーム全体で一貫したモニタリングプラクティスを確保します。

<supademo id="cmb5zptc03acdppkpy0vk18f9" title="Zilliz Cloud - Configure Alert Receiver Settings Demo"></supademo>

設定を構成する際には、以下の概念が発生します:

- **送信先**:新しいアラートのために自動的に選択されるデフォルトの通知チャンネル（メール、Slack、Webhook）。アラート作成を効率化するために、最も一般的に使用されるチャンネルを設定してください。

- **Alert Resolution Notification**:有効にすると、アラートが解決されたときに通知を受け取ります。

- **既存のアラートに設定を適用**:すべての既存のアラートを新しいデフォルト設定で更新するかどうかを選択します。

## よくある質問(FAQ){#faq}

### アラートがトリガーされたときにアラート通知を受け取る頻度はどのくらいですか?{#how-often-will-i-receive-alert-notifications-when-an-alert-is-triggered}

アラート通知は自動的な頻度パターンに従います。

- **最初の通知**:アラートの閾値を超えた場合にすぐに送信されます

- **2回目の通知**:状態が続く場合は1時間後に送信されます

- **後続の通知**:アラート条件が有効な間、1日1回送信されます

通知が頻繁すぎる場合は、次のことができます:

- 条件の閾値または期間要件を調整するには、[アラートを編集する](./manage-project-alerts#edit-an-alert)を使用してください

- [アラートを無効にする](./manage-project-alerts#disable-or-enable-an-alert)は、設定を保持しながらすべての通知を一時的に停止します

