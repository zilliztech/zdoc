---
title: "スイッチオーバーとフェイルオーバー | BYOC"
slug: /switchover-and-failover
sidebar_label: "スイッチオーバーとフェイルオーバー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のグローバルクラスターは、どのリージョンがプライマリクラスターをホストするかを変更する 2 つの操作をサポートしています | BYOC"
type: origin
token: D7F1wYcfVinn92kK0l5cTZDLnLf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# スイッチオーバーとフェイルオーバー

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、以下の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

Zilliz Cloud のグローバルクラスターは、どのリージョンがプライマリクラスターをホストするかを変更する 2 つの操作をサポートしています。

- **スイッチオーバー**: 同期済みのセカンダリクラスターをプライマリに昇格させる、計画的でデータ損失のない操作です。

- **フェイルオーバー**: プライマリリージョンで障害が発生した後、セカンダリクラスターをプライマリに昇格させる緊急復旧操作です。

このページでは、それぞれの操作をいつ使用するか、実行方法、実行中および実行後に何が起こるかを説明します。

## 概要\{#overview}

### スイッチオーバーとフェイルオーバーの比較\{#switchover-vs-failover}

以下の表は、2 つの操作を比較したものです。

<table>
   <tr>
     <th></th>
     <th><p><strong>スイッチオーバー</strong></p></th>
     <th><p><strong>フェイルオーバー</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>使用するタイミング</strong></p></td>
     <td><p>計画的な操作: リージョンローテーション、コンプライアンス要件、データ所在地の変更。</p></td>
     <td><p>プライマリリージョンで予期しない停止または障害が発生した場合。</p></td>
   </tr>
   <tr>
     <td><p><strong>トリガー</strong></p></td>
     <td><p>すべてのプライマリクラスターとセカンダリクラスターが実行中のときに手動で開始します。</p></td>
     <td><p>プライマリクラスターが異常状態になった際の復旧アクションとして手動で開始します</p></td>
   </tr>
   <tr>
     <td><p><strong>データ損失 (RPO)</strong></p></td>
     <td><p>0 — データ損失はありません。完全なデータ同期の後にのみ昇格が行われます。</p></td>
     <td><p>フェイルオーバー時点の同期遅延に等しくなります。</p></td>
   </tr>
   <tr>
     <td><p><strong>ダウンタイム (RTO)</strong></p></td>
     <td><p>ほぼゼロです。グローバルエンドポイントが自動的に再ルーティングします。</p></td>
     <td><p>通常は数分程度です。</p></td>
   </tr>
   <tr>
     <td><p><strong>前提条件</strong></p></td>
     <td><ul><li><p>すべてのクラスターが RUNNING 状態である必要があります。</p></li><li><p>同期遅延は 30 秒以下である必要があります。遅延がこのしきい値を超える場合、スイッチオーバーは拒否されます。</p></li></ul></td>
     <td><ul><li><p>いつでもトリガーできます（高リスクな操作）。</p></li><li><p>少なくとも 1 つのセカンダリクラスターに到達可能である必要があります。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>旧プライマリクラスターの扱い</strong></p></td>
     <td><p>セカンダリクラスターに降格されます。</p></td>
     <td><p>破棄され、<a href="./use-recycle-bin">ごみ箱</a> に移動されます。新しいセカンダリが自動的に作成されます。</p></td>
   </tr>
   <tr>
     <td><p><strong>アプリケーション変更</strong></p></td>
     <td><p>グローバルエンドポイントを使用している場合は不要です。ルーティングは自動的に更新されます。詳細については、<a href="./connect-to-global-cluster">グローバルクラスターへの接続</a> を参照してください</p></td>
     <td><p>グローバルエンドポイントを使用している場合は不要です。ルーティングは自動的に更新されます。詳細については、<a href="./connect-to-global-cluster">グローバルクラスターへの接続</a> を参照してください</p></td>
   </tr>
</table>

### クラスターステータスの遷移\{#cluster-status-transitions}

以下の図は、スイッチオーバー、フェイルオーバー、自動復旧の各操作中にクラスターのステータスがどのように変化するかを示しています。

![JO4VwcCq5hlf7Qb6khwcmdDKnJf](https://zdoc-images.s3.us-west-2.amazonaws.com/JO4VwcCq5hlf7Qb6khwcmdDKnJf.png)

- **スイッチオーバー:**

    - スイッチオーバーでは、ターゲットのセカンダリが現在のプライマリと同期している間、クラスターは **RUNNING** から **SWITCHING** に遷移します。同期が完了すると、ターゲットのセカンダリが新しいプライマリに昇格し、元のプライマリはセカンダリに降格されます。両方のクラスターは、新しい役割で **RUNNING** に戻ります。

    - タイムアウト期間内に同期が完了しない場合、スイッチオーバーはロールバックされます。両方のクラスターは、元の役割を維持したまま **RUNNING** に戻ります。

- **フェイルオーバー**:

    - 障害または停止によりプライマリクラスターが **ABNORMAL** 状態になった場合、フェイルオーバーをトリガーできます。ターゲットのセカンダリは新しいプライマリに昇格し、旧プライマリは破棄されてごみ箱に移動されます。

    - フェイルオーバーが完了すると、Zilliz Cloud は完全なトポロジーを復元するために新しいセカンダリクラスターを自動的に作成します。新しいセカンダリと残りのすべてのセカンダリクラスターは **CREATING** 状態で開始され、プロビジョニングとデータ同期が完了すると **RUNNING** に遷移します。作成に失敗した場合、クラスターは **REBUILD_FAILED** 状態になります。再構築を再試行するか、サポートについては [お問い合わせ](http://support.zilliz.com) ください。

    - フェイルオーバー自体が失敗した場合、クラスターは **ABNORMAL** 状態のままになります。フェイルオーバーを再試行するか、サポートについては [お問い合わせ](http://support.zilliz.com) ください。

- **自動復旧**:

    プライマリクラスターの問題が自然に解消された場合、手動介入なしでクラスターは **ABNORMAL** から **RUNNING** に戻ります。この場合、フェイルオーバーは不要です。

## スイッチオーバーを実行する\{#perform-a-switchover}

計画的なリージョンローテーションでは、セカンダリクラスターをプライマリの役割に昇格させるためにスイッチオーバーを実行できます。

### 開始前に\{#before-you-start}

- グローバルクラスター内のすべてのクラスターが **RUNNING** 状態である必要があります。

- 同期遅延は 30 秒以下である必要があります。遅延がこのしきい値を超える場合、スイッチオーバーは拒否されます。遅延は [グローバルトポロジー](./monitor-global-cluster#global-topology) タブで確認してください。

- Query CU または Replica の [スケーリング](./scale-global-cluster) 操作が進行中でないこと。

### 手順\{#procedures}

- **Web コンソール経由**

    以下のデモは、スイッチオーバーの実行方法を示しています。

    <Supademo id="cmnpic07n84n2aburnc12drnr" title=""  />

    <Procedures>

    1. **Global Cluster** ページに移動します。

    1. **Switchover or Failover** をクリックします。

    1. 昇格するターゲットのセカンダリクラスターを選択します。

    1. Switchover を選択します。

    1. ダイアログで操作を確認します。

    </Procedures>

    スイッチオーバーを開始すると、Zilliz Cloud はターゲットのセカンダリが現在のプライマリと完全に同期するのを待ってから、そのセカンダリを新しいプライマリに昇格させます。 

- **RESTful API 経由**

    以下の例では、クラスター `in01-secondary` が新しいプライマリクラスターになるようにスイッチオーバーを実行します。API の詳細については、[グローバルクラスターのスイッチオーバー](/reference/restful/switchover-global-cluster-v2) を参照してください。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/globalClusters/${globalClusterId}/switchover" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "newPrimaryClusterId": "in01-secondary"
    }'
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "oldPrimaryClusterId": "in01-primary",
        "newPrimaryClusterId": "in01-secondary",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

### スイッチオーバー後\{#after-the-switchover}

- 元のプライマリはセカンダリクラスターになり、新しいプライマリから複製データを受信し始めます。

- グローバルエンドポイントのルーティングは自動的に更新され、書き込み先が新しいプライマリに変更されます。

- 新しい **Global Topology** ビューで確認できます。すべてのクラスターは RUNNING 状態に戻るはずです。

- 新しいプライマリクラスターでバックアップポリシーを再設定してください。バックアップポリシーは新しいプライマリに自動的には引き継がれません。

## フェイルオーバーを実行する\{#perform-a-failover}

プライマリリージョンで停止が発生し、プライマリクラスターが ABNORMAL 状態になっている場合は、フェイルオーバーを使用します。

フェイルオーバーは緊急操作です。スイッチオーバーとは異なり、完全なデータ同期を待ちません。プライマリでコミット済みでも、ターゲットのセカンダリにまだ複製されていない書き込みは失われます。データ損失量は、フェイルオーバー時点の同期遅延に等しくなります。

### 開始前に\{#before-you-start}

- プライマリクラスターに到達できず、ABNORMAL 状態であることを確認してください。

- 昇格するセカンダリクラスターを特定してください。複数のセカンダリが利用可能な場合は、同期遅延が最も小さいもの（プライマリの最新状態に最も近いもの）を選択してください。

### 手順\{#procedures}

- **Web コンソール経由**

    以下のデモは、フェイルオーバーの実行方法を示しています。

    <Supademo id="cmnpile4s01nlzz0j6ryixd11" title=""  />

    <Procedures>

    1. **Global Cluster** ページに移動します。

    1. **Switchover or Failover** をクリックします。

    1. 昇格するターゲットのセカンダリクラスターを選択します。

    1. Failover を選択します。

    1. ダイアログで操作を確認します。

    </Procedures>

    <Admonition type="info" icon="📘" title="Notes">

    フェイルオーバーが失敗した場合、クラスターは ABNORMAL 状態のままになります。フェイルオーバー操作を再試行するか、[サポートチケットを作成](http://support.zilliz.com) してください。

    </Admonition>

- **RESTful API 経由** 

    以下の例では、クラスター `in01-secondary` が強制的にプライマリに昇格されるようフェイルオーバーを実行します。API の詳細については、[グローバルクラスターのフェイルオーバー](/reference/restful/failover-global-cluster-v2) を参照してください。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/failover" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "newPrimaryClusterId": "in01-secondary"
      }'
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "oldPrimaryClusterId": "in01-primary",
        "newPrimaryClusterId": "in01-secondary",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

### フェイルオーバー後\{#after-the-failover}

- 元のプライマリは破棄され、ごみ箱に移動されます。**Global Topology** ビューには表示されなくなります。

- 完全なグローバルトポロジーを復元するために、新しいセカンダリクラスターが自動的に作成されます。新しいセカンダリのプロビジョニング中は、グローバルトポロジーからは見えません。代わりに、グローバルクラスターのページに次のバナーが表示されます: *"A new secondary cluster will be created and become available shortly."*

- 残りのセカンダリクラスターも再構築のために CREATING 状態に遷移し、再構築が完了すると RUNNING になります。

- グローバルエンドポイントは更新され、書き込み先が新しいプライマリになります。

- 新しいプライマリクラスターでバックアップポリシーを再設定してください。バックアップポリシーは新しいプライマリに自動的には引き継がれません。

## ルーティング動作\{#routing-behavior}

以下の表は、各操作の実行中および完了後に、グローバルエンドポイントとパブリックエンドポイントがどのように動作するかをまとめたものです。

<table>
   <tr>
     <th><p><strong>エンドポイント種別</strong></p></th>
     <th><p><strong>スイッチオーバー中</strong></p></th>
     <th><p><strong>フェイルオーバー中</strong></p></th>
     <th><p><strong>完了後</strong></p></th>
   </tr>
   <tr>
     <td><p>グローバルエンドポイント</p></td>
     <td><ul><li><p>書き込みは短時間停止し、その後新しいプライマリにルーティングされます。</p></li><li><p>読み取りは継続します。</p></li></ul></td>
     <td><ul><li><p>新しいプライマリが昇格されるまで書き込みは利用できません。</p></li><li><p>読み取りはセカンダリで利用できます。</p></li></ul></td>
     <td><ul><li><p>書き込みと読み取りは、新しいプライマリおよびセカンダリに自動的にルーティングされます。</p></li><li><p>コード変更は不要です。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>パブリックエンドポイント</p></td>
     <td><ul><li><p>各クラスターのパブリックエンドポイントは変更されません。</p></li><li><p>旧プライマリはセカンダリになります。</p></li></ul></td>
     <td><ul><li><p>旧プライマリは破棄されます。</p></li><li><p>新しいプライマリのパブリックエンドポイントが書き込みを受け付けます。</p></li></ul></td>
     <td><ul><li>書き込みに新しいプライマリのパブリックエンドポイントを使用するよう、アプリケーションを更新してください。</li></ul></td>
   </tr>
</table>

## 進行中タスクへの影響\{#impact-on-in-progress-tasks}

以下の表は、進行中のタスクがスイッチオーバーおよびフェイルオーバー中にどのように処理されるかをまとめたものです。

| **タスク** | **スイッチオーバー中** | **フェイルオーバー中** |
| --- | --- | --- |
| Backup | タスクは失敗します。スイッチオーバー完了後、新しいプライマリで自動的に再試行されます。 | タスクは失敗します。フェイルオーバー完了後、新しいプライマリで自動的に再試行されます。 |
| Query CU scaling | スケーリングの進行中はスイッチオーバーはブロックされます。 | タスクは失敗します。フェイルオーバー完了後に再試行されます。 |
| Replica scaling | スケーリングの進行中はスイッチオーバーはブロックされます。 | タスクは失敗します。フェイルオーバー完了後に再試行されます。 |
